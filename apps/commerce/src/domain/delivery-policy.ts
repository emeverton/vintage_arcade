import { assertMinor, medusaToMinor } from "./money"
import { quoteDeliveryIncentive } from "./delivery-incentive"

export interface DeliveryPolicy {
  rule_id: string
  version: number
  currency_code: "brl"
  sales_channel_id: string
  region_id: string
  postal_code_from: string
  postal_code_to: string
  minimum_order_minor: number
  base_fee_minor: number
  threshold_minor: number
  subsidy_cap_minor: number
  enabled: boolean
  promotion_active: boolean
  starts_at: string | null
  ends_at: string | null
}
export interface PricingCart {
  currency_code?: string
  sales_channel_id?: string
  region_id?: string
  item_total?: unknown
  shipping_address?: { country_code?: string; postal_code?: string } | null
}

export function parseDeliveryPolicy(value: unknown): DeliveryPolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Missing delivery policy")
  const p = value as Record<string, unknown>
  for (const k of ["rule_id", "sales_channel_id", "region_id"] as const) {
    if (typeof p[k] !== "string" || !p[k] || (p[k] as string).length > 200) throw new Error(`Invalid ${k}`)
  }
  if (!Number.isSafeInteger(p.version) || Number(p.version) < 1) throw new Error("Invalid rule version")
  if (p.currency_code !== "brl") throw new Error("Only BRL policies are supported")
  for (const k of ["postal_code_from", "postal_code_to"] as const) {
    if (typeof p[k] !== "string" || !/^\d{8}$/.test(p[k] as string)) throw new Error(`Invalid ${k}`)
  }
  if (String(p.postal_code_from) > String(p.postal_code_to)) throw new Error("Reversed postcode interval")
  for (const k of ["minimum_order_minor", "base_fee_minor", "threshold_minor", "subsidy_cap_minor"] as const) assertMinor(p[k])
  if (Number(p.threshold_minor) === 0 || Number(p.threshold_minor) < Number(p.minimum_order_minor)) throw new Error("Invalid threshold/minimum")
  if (typeof p.enabled !== "boolean" || typeof p.promotion_active !== "boolean") throw new Error("Invalid policy flags")
  for (const k of ["starts_at", "ends_at"] as const) {
    if (p[k] !== null && (typeof p[k] !== "string" || !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(p[k] as string) || !Number.isFinite(Date.parse(p[k] as string)))) throw new Error(`Invalid UTC ${k}`)
  }
  if (p.starts_at && p.ends_at && Date.parse(String(p.starts_at)) >= Date.parse(String(p.ends_at))) throw new Error("Invalid promotion window")
  return p as unknown as DeliveryPolicy
}

/** Context must come from the stored Medusa cart, never from request data. */
export function evaluateDeliveryPolicy(value: unknown, cart: PricingCart, now = Date.now()) {
  const p = parseDeliveryPolicy(value)
  if (!Number.isFinite(now)) throw new Error("Invalid evaluation time")
  if (!p.enabled) throw new Error("Delivery is disabled")
  if (cart.currency_code?.toLowerCase() !== p.currency_code || cart.sales_channel_id !== p.sales_channel_id || cart.region_id !== p.region_id) throw new Error("Delivery policy scope mismatch")
  const postcode = cart.shipping_address?.postal_code?.replace(/-/g, "")
  if (cart.shipping_address?.country_code?.toLowerCase() !== "br" || !postcode || !/^\d{8}$/.test(postcode) || postcode < p.postal_code_from || postcode > p.postal_code_to) throw new Error("Address outside delivery area")
  // item_total includes item taxes and item discounts, but not freight.
  const subtotalMinor = medusaToMinor(cart.item_total)
  if (subtotalMinor < p.minimum_order_minor) throw new Error("Minimum order not reached")
  const active = p.promotion_active && (!p.starts_at || now >= Date.parse(p.starts_at)) && (!p.ends_at || now < Date.parse(p.ends_at))
  return {
    ruleId: p.rule_id,
    ruleVersion: p.version,
    eligibleSubtotalMinor: subtotalMinor,
    baseFeeMinor: p.base_fee_minor,
    ...quoteDeliveryIncentive({ eligibleSubtotalMinor: subtotalMinor, quotedFeeMinor: p.base_fee_minor, thresholdMinor: p.threshold_minor, subsidyCapMinor: p.subsidy_cap_minor, zoneEligible: true, promotionActive: active }),
  }
}
