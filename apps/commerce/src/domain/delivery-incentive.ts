/** Internal BRL minor-unit calculation. Never trust totals supplied by a browser. */
export interface DeliveryIncentiveInput {
  eligibleSubtotalMinor: number
  quotedFeeMinor: number
  thresholdMinor: number
  subsidyCapMinor: number
  zoneEligible: boolean
  promotionActive: boolean
}

export interface DeliveryIncentiveResult {
  status: "unavailable" | "progress" | "discounted" | "free_shipping"
  gapMinor: number | null
  subsidyMinor: number
  finalFeeMinor: number
}

export function quoteDeliveryIncentive(input: DeliveryIncentiveInput): DeliveryIncentiveResult {
  for (const field of ["eligibleSubtotalMinor", "quotedFeeMinor", "thresholdMinor", "subsidyCapMinor"] as const) {
    if (!Number.isSafeInteger(input[field]) || input[field] < 0) {
      throw new Error(`${field} must be a non-negative safe integer`)
    }
  }
  if (input.thresholdMinor === 0) throw new Error("thresholdMinor must be positive")
  if (typeof input.zoneEligible !== "boolean" || typeof input.promotionActive !== "boolean") {
    throw new Error("Eligibility flags must be booleans")
  }
  const unavailable: DeliveryIncentiveResult = {
    status: "unavailable", gapMinor: null, subsidyMinor: 0, finalFeeMinor: input.quotedFeeMinor,
  }
  if (!input.promotionActive || !input.zoneEligible || input.eligibleSubtotalMinor === 0 || input.subsidyCapMinor === 0 || input.quotedFeeMinor === 0) {
    return unavailable
  }
  const gapMinor = Math.max(0, input.thresholdMinor - input.eligibleSubtotalMinor)
  if (gapMinor > 0) return { ...unavailable, status: "progress", gapMinor }
  const subsidyMinor = Math.min(input.subsidyCapMinor, input.quotedFeeMinor)
  const finalFeeMinor = input.quotedFeeMinor - subsidyMinor
  return { status: finalFeeMinor === 0 ? "free_shipping" : "discounted", gapMinor: 0, subsidyMinor, finalFeeMinor }
}
