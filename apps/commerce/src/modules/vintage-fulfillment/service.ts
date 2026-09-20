import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import type { CalculatedShippingOptionPrice, CalculateShippingOptionPriceContext, ValidateFulfillmentDataContext, CreateFulfillmentResult, FulfillmentOption } from "@medusajs/framework/types"
import { evaluateDeliveryPolicy, parseDeliveryPolicy, type PricingCart } from "../../domain/delivery-policy"
import { minorToMedusa } from "../../domain/money"
import { sliceEnabled } from "../../domain/slice-guard"

/** Uses the server-published shipping-option projection, never browser data. */
export default class VintageFulfillmentProvider extends AbstractFulfillmentProviderService {
  static identifier = "vintage"
  constructor() { super() }
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> { return [{ id: "vintage-local-delivery" }] }
  async canCalculate(): Promise<boolean> { return sliceEnabled(process.env) }
  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    parseDeliveryPolicy(data.vintage_policy)
    return sliceEnabled(process.env)
  }
  private evaluate(optionData: Record<string, unknown>, context: unknown) {
    if (!sliceEnabled(process.env)) throw new Error("Vintage delivery slice is disabled")
    return evaluateDeliveryPolicy(optionData.vintage_policy, context as PricingCart)
  }
  async calculatePrice(optionData: Record<string, unknown>, _untrustedData: Record<string, unknown>, context: CalculateShippingOptionPriceContext): Promise<CalculatedShippingOptionPrice> {
    const quote = this.evaluate(optionData, context)
    return { calculated_amount: minorToMedusa(quote.finalFeeMinor), is_calculated_price_tax_inclusive: true }
  }
  async validateFulfillmentData(optionData: Record<string, unknown>, _untrustedData: Record<string, unknown>, context: ValidateFulfillmentDataContext): Promise<Record<string, unknown>> {
    const q = this.evaluate(optionData, context)
    return { rule_id: q.ruleId, rule_version: q.ruleVersion, quoted_fee_minor: q.finalFeeMinor }
  }
  async createFulfillment(): Promise<CreateFulfillmentResult> { throw new Error("Dispatch integration is not implemented; no delivery was booked") }
  async cancelFulfillment(): Promise<Record<string, unknown>> { throw new Error("Dispatch cancellation is not implemented") }
  async createReturnFulfillment(): Promise<CreateFulfillmentResult> { throw new Error("Return dispatch is not implemented") }
}
