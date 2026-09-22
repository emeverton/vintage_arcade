import { createHash } from "node:crypto"
import {
  IfoodAdapterError,
  IfoodOrderEventType,
  IfoodWebhookEnvelope,
  IngestResult,
  MappedOrder,
} from "./types"
import { verifyIfoodSignature } from "./signature"
import { indexCatalogMap, mapComboV2, mapIfoodItem } from "./catalog-mapping"
import type { CatalogMapEntry, ComboV2MapEntry } from "./types"

const EVENT_ORDER: IfoodOrderEventType[] = ["PLC", "CFM", "RTP", "DSP", "CON"]

export interface OrderPipelineState {
  last_event?: IfoodOrderEventType
  seen_event_ids: Set<string>
  dead_letters: Array<{ event_id: string; reason: string; payload: string }>
  retry_counts: Map<string, number>
}

export function createPipelineState(): OrderPipelineState {
  return {
    seen_event_ids: new Set(),
    dead_letters: [],
    retry_counts: new Map(),
  }
}

export function correlationIdFor(eventId: string, orderId: string): string {
  return createHash("sha256").update(`${eventId}|${orderId}`).digest("hex").slice(0, 24)
}

function assertEventSequence(prev: IfoodOrderEventType | undefined, next: IfoodOrderEventType): void {
  if (next === "CAN") return // cancel can arrive from several states
  if (!prev) {
    if (next !== "PLC") throw new IfoodAdapterError("OUT_OF_SEQUENCE", `First event must be PLC, got ${next}`)
    return
  }
  if (prev === "CON" || prev === "CAN") {
    throw new IfoodAdapterError("OUT_OF_SEQUENCE", `Order already terminal at ${prev}`)
  }
  const pi = EVENT_ORDER.indexOf(prev)
  const ni = EVENT_ORDER.indexOf(next)
  if (ni < 0) throw new IfoodAdapterError("UNKNOWN_EVENT", `Unknown event ${next}`)
  if (ni !== pi + 1 && next !== prev) {
    throw new IfoodAdapterError("OUT_OF_SEQUENCE", `Expected after ${prev}, got ${next}`)
  }
}

export interface IngestContext {
  clientSecret: string
  merchantId: string
  catalog: CatalogMapEntry[]
  combos: ComboV2MapEntry[]
  state: OrderPipelineState
  /** Simulate provider timeout / transient failure for a given event id */
  forceTimeoutEventIds?: Set<string>
  maxRetries?: number
}

interface ParsedPayload {
  items: Array<{ id: string; quantity: number; comboOptions?: Record<string, string> }>
  notes?: string
}

function parsePayload(rawBody: string): ParsedPayload {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    throw new IfoodAdapterError("INVALID_PAYLOAD", "Body is not JSON")
  }
  if (!parsed || typeof parsed !== "object") throw new IfoodAdapterError("INVALID_PAYLOAD", "Body must be object")
  const body = parsed as Record<string, unknown>
  const items = body.items
  if (!Array.isArray(items)) throw new IfoodAdapterError("INVALID_PAYLOAD", "items required")
  return {
    items: items.map((row) => {
      if (!row || typeof row !== "object") throw new IfoodAdapterError("INVALID_PAYLOAD", "bad item")
      const r = row as Record<string, unknown>
      return {
        id: String(r.id || ""),
        quantity: Number(r.quantity),
        comboOptions: r.comboOptions && typeof r.comboOptions === "object"
          ? Object.fromEntries(Object.entries(r.comboOptions as Record<string, unknown>).map(([k, v]) => [k, String(v)]))
          : undefined,
      }
    }),
    notes: typeof body.notes === "string" ? body.notes : undefined,
  }
}

export function mapEnvelopeToOrder(
  envelope: IfoodWebhookEnvelope,
  catalog: CatalogMapEntry[],
  combos: ComboV2MapEntry[]
): MappedOrder {
  if (envelope.merchantId !== envelope.merchantId.trim()) {
    throw new IfoodAdapterError("INVALID_MERCHANT", "merchantId malformed")
  }
  const catalogIndex = indexCatalogMap(catalog)
  const payload = parsePayload(envelope.rawBody)
  const lines = []
  for (const item of payload.items) {
    if (item.comboOptions) {
      const mapped = mapComboV2(item.id, item.comboOptions, combos, catalogIndex)
      lines.push(...mapped.lines)
    } else {
      lines.push(mapIfoodItem(item.id, item.quantity, catalogIndex))
    }
  }
  return {
    channel: "ifood",
    external_order_id: envelope.orderId,
    merchant_id: envelope.merchantId,
    event_code: envelope.code,
    event_id: envelope.id,
    event_created_at: envelope.createdAt,
    lines,
    notes: payload.notes,
  }
}

export function ingestIfoodWebhook(envelope: IfoodWebhookEnvelope, ctx: IngestContext): IngestResult {
  const correlation_id = correlationIdFor(envelope.id, envelope.orderId)
  const maxRetries = ctx.maxRetries ?? 3

  try {
    verifyIfoodSignature(envelope.rawBody, ctx.clientSecret, envelope.signatureHeader)
  } catch (err) {
    const message = err instanceof Error ? err.message : "signature failed"
    return { status: "rejected", reason: message, correlation_id, retry_count: 0 }
  }

  if (envelope.merchantId !== ctx.merchantId) {
    return { status: "rejected", reason: "merchant mismatch", correlation_id, retry_count: 0 }
  }

  if (ctx.state.seen_event_ids.has(envelope.id)) {
    return { status: "duplicate", reason: "event already processed", correlation_id, retry_count: 0 }
  }

  if (ctx.forceTimeoutEventIds?.has(envelope.id)) {
    const retries = (ctx.state.retry_counts.get(envelope.id) || 0) + 1
    ctx.state.retry_counts.set(envelope.id, retries)
    if (retries > maxRetries) {
      ctx.state.dead_letters.push({ event_id: envelope.id, reason: "timeout_exhausted", payload: envelope.rawBody })
      return { status: "dead_letter", reason: "timeout_exhausted", correlation_id, retry_count: retries }
    }
    return { status: "retry", reason: "provider_timeout", correlation_id, retry_count: retries }
  }

  try {
    assertEventSequence(ctx.state.last_event, envelope.code)
    // Partial updates (CFM+) may omit items; only PLC requires lines.
    if (envelope.code === "PLC") {
      mapEnvelopeToOrder(envelope, ctx.catalog, ctx.combos)
    } else if (envelope.rawBody.trim() && envelope.rawBody.trim() !== "{}") {
      // Allow empty body for status-only events; reject malformed partials that claim items without mapping.
      const parsed = JSON.parse(envelope.rawBody) as { items?: unknown }
      if (Array.isArray(parsed.items) && parsed.items.length) {
        mapEnvelopeToOrder(envelope, ctx.catalog, ctx.combos)
      }
    }
  } catch (err) {
    const code = err instanceof IfoodAdapterError ? err.code : "INGEST_ERROR"
    const message = err instanceof Error ? err.message : "ingest failed"
    if (code === "OUT_OF_SEQUENCE" || code === "UNMAPPED_PRODUCT" || code === "COMBO_INCOMPATIBLE" || code === "UNMAPPED_COMBO") {
      ctx.state.dead_letters.push({ event_id: envelope.id, reason: `${code}:${message}`, payload: envelope.rawBody })
      return { status: "dead_letter", reason: `${code}:${message}`, correlation_id, retry_count: 0 }
    }
    return { status: "rejected", reason: `${code}:${message}`, correlation_id, retry_count: 0 }
  }

  ctx.state.seen_event_ids.add(envelope.id)
  if (envelope.code !== "CAN" || !ctx.state.last_event) {
    ctx.state.last_event = envelope.code
  } else {
    ctx.state.last_event = "CAN"
  }
  return { status: "accepted", correlation_id, retry_count: ctx.state.retry_counts.get(envelope.id) || 0 }
}

/** Idempotent reprocess: same event id returns duplicate without side effects. */
export function reprocessIfoodWebhook(envelope: IfoodWebhookEnvelope, ctx: IngestContext): IngestResult {
  return ingestIfoodWebhook(envelope, ctx)
}
