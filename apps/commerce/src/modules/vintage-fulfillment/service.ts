import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import type { CalculatedShippingOptionPrice, CalculateShippingOptionPriceContext, ValidateFulfillmentDataContext, CreateFulfillmentResult, FulfillmentOption } from "@medusajs/framework/types"
import { evaluateDeliveryPolicy, parseDeliveryPolicy, type PricingCart } from "../../domain/delivery-policy"
import { minorToMedusa } from "../../domain/money"
import { sliceEnabled } from "../../domain/slice-guard"

/** Policies are loaded by a server workflow hook, not from request/fulfillment data. */
export default class VintageFulfillmentProvider extends AbstractFulfillmentProviderService {
  static identifier = "vintage"
  constructor() { super() }
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> { return [{ id: "vintage-local-delivery" }] }
  async canCalculate(): Promise<boolean> { return sliceEnabled(process.env) }
  async validateOption(data: Record<string, unknown>): Promise<boolean> { parseDeliveryPolicy(data.vintage_policy); return sliceEnabled(process.env) }
  async calculatePrice(optionData: Record<string, unknown>, _untrusted: Record<string, unknown>, context: CalculateShippingOptionPriceContext): Promise<CalculatedShippingOptionPrice> {
    if (!sliceEnabled(process.env)) throw new Error("Vintage delivery slice is disabled")
    const original = parseDeliveryPolicy(optionData.vintage_policy)
    const serverContext = context as unknown as PricingCart & { vintage_published_policies?: Record<string, unknown> }
    if (!serverContext.vintage_published_policies) throw new Error("Trusted delivery publication context is missing")
    const policy = serverContext.vintage_published_policies[original.rule_id] ?? original
    const quote = evaluateDeliveryPolicy(policy, serverContext)
    return { calculated_amount: minorToMedusa(quote.finalFeeMinor), is_calculated_price_tax_inclusive: true }
  }
  async validateFulfillmentData(optionData: Record<string, unknown>, _untrusted: Record<string, unknown>, _context: ValidateFulfillmentDataContext): Promise<Record<string, unknown>> {
    if (!sliceEnabled(process.env)) throw new Error("Vintage delivery slice is disabled")
    // Pricing was validated in calculatePrice; persist an anchor, not a stale price/revision claim.
    return { vintage_policy_anchor: parseDeliveryPolicy(optionData.vintage_policy).rule_id }
  }
  async createFulfillment(): Promise<CreateFulfillmentResult> { throw new Error("Dispatch integration is not implemented; no delivery was booked") }
  async cancelFulfillment(): Promise<Record<string, unknown>> { throw new Error("Dispatch cancellation is not implemented") }
  async createReturnFulfillment(): Promise<CreateFulfillmentResult> { throw new Error("Return dispatch is not implemented") }
}
