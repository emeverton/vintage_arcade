/** iFood channel contracts — Vintage owns commerce; iFood only distributes. Live off by default. */

export type IfoodChannelId = "ifood"

export interface IfoodCredentials {
  client_id: string
  client_secret: string
  merchant_id: string
}

export interface CatalogMapEntry {
  internal_variant_id: string
  ifood_item_id: string
  sku: string
  combo_v2?: boolean
}

export interface ComboV2MapEntry {
  internal_combo_id: string
  ifood_item_id: string
  slot_map: Record<string, string> // internal_slot_id -> ifood_option_group_id
}

export type IfoodOrderEventType =
  | "PLC" // placed
  | "CFM" // confirmed
  | "RTP" // ready to pickup
  | "DSP" // dispatched
  | "CON" // concluded
  | "CAN" // cancelled

export interface IfoodWebhookEnvelope {
  id: string
  code: IfoodOrderEventType
  orderId: string
  createdAt: string
  merchantId: string
  rawBody: string
  signatureHeader: string
}

export interface MappedOrderLine {
  internal_variant_id: string
  quantity: number
  ifood_item_id: string
}

export interface MappedOrder {
  channel: IfoodChannelId
  external_order_id: string
  merchant_id: string
  event_code: IfoodOrderEventType
  event_id: string
  event_created_at: string
  lines: MappedOrderLine[]
  notes?: string
}

export type IngestResultStatus =
  | "accepted"
  | "duplicate"
  | "rejected"
  | "dead_letter"
  | "retry"

export interface IngestResult {
  status: IngestResultStatus
  reason?: string
  correlation_id: string
  retry_count: number
}

export class IfoodAdapterError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly retryable = false
  ) {
    super(message)
    this.name = "IfoodAdapterError"
  }
}
