/**
 * Commerce analytics event names.
 * `order_created` is internal. `purchase` only after payment confirmation.
 */

export const COMMERCE_EVENTS = [
  "view_item",
  "add_to_cart",
  "remove_from_cart",
  "view_cart",
  "begin_checkout",
  "add_payment_info",
  "purchase",
  "order_created",
  "delivery_threshold_seen",
  "delivery_threshold_reached",
  "coupon_applied",
  "checkout_error",
] as const

export type CommerceEventName = (typeof COMMERCE_EVENTS)[number]

export interface CommerceEventEnvelope {
  name: CommerceEventName
  event_id: string
  occurred_at: string
  session_id?: string
  cart_id?: string
  order_id?: string
  channel?: string
  correlation_id?: string
  payment_confirmed?: boolean
}

export function assertAdsExportDisabled(env: Record<string, string | undefined>): void {
  if (env.ADS_EXPORT_ENABLED && env.ADS_EXPORT_ENABLED !== "false") {
    throw new Error("ADS_EXPORT_ENABLED must remain false while synthetic/staging")
  }
}

/** purchase requires payment_confirmed; order_created must never be aliased as purchase. */
export function validateCommerceEvent(event: CommerceEventEnvelope): void {
  if (!COMMERCE_EVENTS.includes(event.name)) throw new Error(`Unknown event ${event.name}`)
  if (!event.event_id || event.event_id.length < 8) throw new Error("event_id required")
  if (event.name === "purchase" && event.payment_confirmed !== true) {
    throw new Error("purchase requires payment_confirmed=true")
  }
  if (event.name === "order_created" && event.payment_confirmed === true) {
    // Allowed but still not a purchase export signal.
  }
}

export function isAdsExportable(event: CommerceEventEnvelope, adsEnabled: boolean): boolean {
  if (!adsEnabled) return false
  return event.name === "purchase" && event.payment_confirmed === true
}
