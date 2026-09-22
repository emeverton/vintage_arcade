import { listShippingOptionsForCartWithPricingWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import type VintageDeliveryService from "../../modules/vintage-delivery/service"
import { sliceEnabled } from "../../domain/slice-guard"
import { parseDeliveryPolicy, type DeliveryPolicy } from "../../domain/delivery-policy"

listShippingOptionsForCartWithPricingWorkflow.hooks.setCalculatedShippingPricingContext(async (_input, { container }) => {
  if (!sliceEnabled(process.env)) return new StepResponse({})
  const service = container.resolve<VintageDeliveryService>("vintageDelivery")
  // Single-merchant foundation. Bounded query fails closed rather than silently dropping rules.
  const controls = await service.listDeliveryControls({}, { take: 501 })
  if (controls.length > 500) throw new Error("Delivery publication capacity requires scoped lookup")
  const policies: Record<string, DeliveryPolicy> = {}
  for (const control of controls) policies[control.anchor_key] = parseDeliveryPolicy(control.active_policy)
  return new StepResponse({ vintage_published_policies: policies })
})
