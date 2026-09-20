import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import type { IFulfillmentModuleService, IPaymentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { evaluateDeliveryPolicy, type PricingCart } from "../../domain/delivery-policy"
import { medusaToMinor } from "../../domain/money"
import { sliceEnabled } from "../../domain/slice-guard"
import type VintageFoodService from "../../modules/vintage-food/service"
import type { ComboSelection } from "../../domain/combo"
import type { CartItemSnapshot } from "../../application/cart"

/** Validation only. Never mutate the cart inside completeCartWorkflow hooks. */
completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  if (!sliceEnabled(process.env)) return
  const fulfillment = container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  // Native completion selects region.*, whereas pricing selects region_id explicitly.
  const snapshot = cart as unknown as PricingCart & { region?: { id?: string } }
  const pricingCart: PricingCart = { ...snapshot, region_id: snapshot.region_id ?? snapshot.region?.id }
  for (const method of cart.shipping_methods || []) {
    if (!method.shipping_option_id) continue
    const option = await fulfillment.retrieveShippingOption(method.shipping_option_id)
    if (option.provider_id !== "vintage_vintage") continue
    const quote = evaluateDeliveryPolicy(option.data?.vintage_policy, pricingCart)
    if (medusaToMinor(method.amount) !== quote.finalFeeMinor) throw new Error("Stale delivery quote; recalculate before payment")
  }
  const food = container.resolve<VintageFoodService>("vintageFood")
  const commands = await food.listComboCommands({ cart_id: cart.id, completed: true })
  const allItems = (cart.items || []) as CartItemSnapshot[]
  for (const command of commands) {
    const items = allItems.filter((i) => i.metadata?.vintage_command_id === command.id)
    if (!items.length) continue
    const expected = command.selection.choices as unknown as ComboSelection[]
    if (items.length !== expected.length || expected.some((choice) => !items.some((i) => i.variant_id === choice.variant_id && Number(i.quantity) === choice.quantity && i.metadata?.vintage_slot_id === choice.slot_id))) throw new Error("Incomplete or modified combo; rebuild its selection")
  }
  const cartWithPayment = cart as unknown as { total: unknown; payment_collection?: { id: string } }
  if (cartWithPayment.payment_collection?.id) {
    const payments = container.resolve<IPaymentModuleService>(Modules.PAYMENT)
    const collection = await payments.retrievePaymentCollection(cartWithPayment.payment_collection.id, { relations: ["payment_sessions"] })
    const total = medusaToMinor(cartWithPayment.total)
    if (medusaToMinor(collection.amount) !== total) throw new Error("Stale payment collection; refresh payment before completion")
    for (const session of collection.payment_sessions || []) {
      if (["pending", "authorized", "captured", "requires_more", "pending_authorization"].includes(session.status) && medusaToMinor(session.amount) !== total) throw new Error("Payment session amount does not match cart")
    }
  }
})
