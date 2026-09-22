/**
 * Structured observability fields for commerce channel ops.
 * Never log secrets, full tokens, card data, or unnecessary PII.
 */

export interface CommerceLogContext {
  correlation_id?: string
  order_id?: string
  cart_id?: string
  channel?: string
  session_id?: string
  webhook_id?: string
  retry_count?: number
  latency_ms?: number
  /** Coarse class only — e.g. 2xx / 4xx / 5xx / timeout — never raw body */
  provider_response_class?: string
}

const FORBIDDEN_KEYS = new Set([
  "password",
  "secret",
  "token",
  "authorization",
  "card",
  "cvv",
  "pan",
  "client_secret",
  "access_token",
  "cookie",
])

export function sanitizeLogFields(
  ctx: CommerceLogContext | Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(ctx as Record<string, unknown>)) {
    const lower = key.toLowerCase()
    if (FORBIDDEN_KEYS.has(lower) || lower.includes("secret") || lower.includes("token")) {
      continue
    }
    if (typeof value === "string" && value.length > 500) {
      out[key] = value.slice(0, 500) + "…"
      continue
    }
    out[key] = value
  }
  return out
}

export function formatCommerceLog(
  level: "info" | "warn" | "error",
  message: string,
  ctx: CommerceLogContext
): string {
  return JSON.stringify({
    level,
    message,
    ts: new Date().toISOString(),
    ...sanitizeLogFields(ctx),
  })
}
