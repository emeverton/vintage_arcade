import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { mkdirSync, writeFileSync } from "node:fs"
import type { ExecArgs, IFulfillmentModuleService, IPaymentModuleService, ICartModuleService, IStoreModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createSalesChannelsWorkflow, createRegionsWorkflow, createStockLocationsWorkflow, createShippingProfilesWorkflow, createShippingOptionsWorkflow, linkSalesChannelsToStockLocationWorkflow, createProductsWorkflow, createCartWorkflow, addToCartWorkflow, addShippingMethodToCartWorkflow, createPaymentCollectionForCartWorkflow, completeCartWorkflow } from "@medusajs/medusa/core-flows"
import type VintageDeliveryService from "../modules/vintage-delivery/service"
import type VintageFoodService from "../modules/vintage-food/service"
import type VintageTelemetryService from "../modules/vintage-telemetry/service"
import { parseDeliveryPolicy, evaluateDeliveryPolicy } from "../domain/delivery-policy"
import { parseComboSpec } from "../domain/combo"
import { medusaToMinor } from "../domain/money"
import { sliceEnabled } from "../domain/slice-guard"
import { addComboToCart } from "../application/add-combo-to-cart"
import { readCart, type CartItemSnapshot } from "../application/cart"
import { recordOrderCreated } from "../application/order-created"

// Medusa may serialize workflow errors as plain objects rather than Error instances.
function workflowErrorText(error: unknown, depth = 0): string {
  if (depth > 8) return ""
  if (typeof error === "string") return error
  if (Array.isArray(error)) return error.map((e) => workflowErrorText(e, depth + 1)).join(" ")
  if (!error || typeof error !== "object") return ""
  const value = error as Record<string, unknown>
  return ["message", "error", "errors", "cause"].map((key) => workflowErrorText(value[key], depth + 1)).join(" ")
}

/** Synthetic QA fixtures only. Not real menu prices, addresses or commercial rules. */
export default async function smokeCommerce({ container }: ExecArgs) {
  const db = new URL(process.env.DATABASE_URL || "invalid:")
  if (!sliceEnabled(process.env) || process.env.APP_ENV !== "test" || db.pathname !== "/vintage_ci" || !["localhost", "127.0.0.1", "postgres"].includes(db.hostname)) throw new Error("Commerce smoke is restricted to the disposable vintage_ci database")
  const run = randomUUID().slice(0, 8), checks: string[] = []
  const pass = (name: string) => { checks.push(name); console.log(`COMMERCE_CHECK_PASS: ${name}`) }
  const delivery = container.resolve<VintageDeliveryService>("vintageDelivery")
  const food = container.resolve<VintageFoodService>("vintageFood")
  const telemetry = container.resolve<VintageTelemetryService>("vintageTelemetry")
  const fulfillment = container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const payment = container.resolve<IPaymentModuleService>(Modules.PAYMENT)
  const carts = container.resolve<ICartModuleService>(Modules.CART)
  const stores = container.resolve<IStoreModuleService>(Modules.STORE)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve("query")
  const { result: [channel] } = await createSalesChannelsWorkflow(container).run({ input: { salesChannelsData: [{ name: `QA_ONLY_${run}` }] } })
  const [existingStore] = await stores.listStores()
  if (!existingStore) await stores.createStores({ name: "QA_ONLY_STORE", supported_currencies: [{ currency_code: "brl", is_default: true }] })
  const { result: [region] } = await createRegionsWorkflow(container).run({ input: { regions: [{ name: `QA_BR_${run}`, currency_code: "brl", countries: ["br"], automatic_taxes: false, payment_providers: ["pp_system_default"] }] } })
  const { result: [location] } = await createStockLocationsWorkflow(container).run({ input: { locations: [{ name: `QA_KITCHEN_${run}`, address: { city: "QA", country_code: "br", address_1: "Synthetic fixture" } }] } })
  const { result: [profile] } = await createShippingProfilesWorkflow(container).run({ input: { data: [{ name: `QA_FOOD_${run}`, type: "default" }] } })
  const set = await fulfillment.createFulfillmentSets({ name: `QA_DELIVERY_${run}`, type: "shipping", service_zones: [{ name: `QA_ZONE_${run}`, geo_zones: [{ type: "country", country_code: "br" }] }] })
  await link.create({ [Modules.STOCK_LOCATION]: { stock_location_id: location.id }, [Modules.FULFILLMENT]: { fulfillment_provider_id: "vintage_vintage" } })
  await link.create({ [Modules.STOCK_LOCATION]: { stock_location_id: location.id }, [Modules.FULFILLMENT]: { fulfillment_set_id: set.id } })
  await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: location.id, add: [channel.id] } })
  const policy = parseDeliveryPolicy({ rule_id: `vdr_qa_${run}`, version: 1, currency_code: "brl", sales_channel_id: channel.id, region_id: region.id, postal_code_from: "00000000", postal_code_to: "00000099", minimum_order_minor: 1000, base_fee_minor: 900, threshold_minor: 3000, subsidy_cap_minor: 900, enabled: true, promotion_active: true, starts_at: null, ends_at: null })
  const rule = await delivery.createDeliveryRules({ id: policy.rule_id, revision_key: `qa_delivery_${run}:v1`, policy: policy as unknown as Record<string, unknown> })
  assert.deepEqual((await delivery.retrieveDeliveryRule(rule.id)).policy, policy)
  pass("delivery_rule_persisted_and_read_back")
  const { result: [shipping] } = await createShippingOptionsWorkflow(container).run({ input: [{ name: `QA_DYNAMIC_FREIGHT_${run}`, price_type: "calculated", provider_id: "vintage_vintage", service_zone_id: set.service_zones[0].id, shipping_profile_id: profile.id, type: { label: "QA delivery", description: "No carrier booking", code: `qa_${run}` }, data: { vintage_policy: policy as unknown as Record<string, unknown> }, rules: [{ attribute: "enabled_in_store", value: "true", operator: "eq" }, { attribute: "is_return", value: "false", operator: "eq" }] }] })
  assert.deepEqual((await fulfillment.retrieveShippingOption(shipping.id)).data?.vintage_policy, policy)
  pass("published_shipping_projection_matches_rule_revision")
  const { result: products } = await createProductsWorkflow(container).run({ input: { products: [
    { title: `QA burger ${run}`, handle: `qa-burger-${run}`, status: ProductStatus.PUBLISHED, shipping_profile_id: profile.id, options: [{ title: "QA size", values: ["Single"] }], variants: [{ title: "QA burger", sku: `QA-B-${run}`, manage_inventory: false, options: { "QA size": "Single" }, prices: [{ currency_code: "brl", amount: 19.9 }] }], sales_channels: [{ id: channel.id }] },
    { title: `QA drink ${run}`, handle: `qa-drink-${run}`, status: ProductStatus.PUBLISHED, shipping_profile_id: profile.id, options: [{ title: "QA size", values: ["Single"] }], variants: [{ title: "QA drink", sku: `QA-D-${run}`, manage_inventory: false, options: { "QA size": "Single" }, prices: [{ currency_code: "brl", amount: 5.1 }] }], sales_channels: [{ id: channel.id }] },
    { title: `QA dessert ${run}`, handle: `qa-dessert-${run}`, status: ProductStatus.PUBLISHED, shipping_profile_id: profile.id, options: [{ title: "QA size", values: ["Single"] }], variants: [{ title: "QA dessert", sku: `QA-E-${run}`, manage_inventory: false, options: { "QA size": "Single" }, prices: [{ currency_code: "brl", amount: 5 }] }], sales_channels: [{ id: channel.id }] },
  ] } })
  const burger = products[0].variants![0].id!, drink = products[1].variants![0].id!, dessert = products[2].variants![0].id!
  const spec = parseComboSpec({ version: 1, sales_channel_id: channel.id, slots: [{ id: "main", min: 1, max: 1, options: [{ variant_id: burger, max_quantity: 1 }] }, { id: "drink", min: 1, max: 1, options: [{ variant_id: drink, max_quantity: 1 }] }, { id: "extra", min: 0, max: 1, options: [{ variant_id: dessert, max_quantity: 1 }] }] })
  const combo = await food.createComboDefinitions({ revision_key: `qa_combo_${run}:v1`, name: `QA combo ${run}`, definition: spec as unknown as Record<string, unknown> })
  assert.deepEqual((await food.retrieveComboDefinition(combo.id)).definition, spec)
  pass("combo_definition_persisted")
  const address = { first_name: "QA", last_name: "Fixture", address_1: "Synthetic fixture, not a real address", city: "QA", country_code: "br", postal_code: "00000001" }
  async function newCart() {
    const { result } = await createCartWorkflow(container).run({ input: { region_id: region.id, currency_code: "brl", sales_channel_id: channel.id, email: `qa-${run}@example.invalid`, shipping_address: address, billing_address: address, metadata: { synthetic: true, test_run: run } } })
    return result.id
  }
  const cartId = await newCart()
  const command = { cartId, comboId: combo.id, requestId: "qa_first_combo", selections: [{ slot_id: "main", variant_id: burger, quantity: 1 }, { slot_id: "drink", variant_id: drink, quantity: 1 }] }
  await addComboToCart(container, command)
  assert.equal((await addComboToCart(container, command)).replayed, true)
  await Promise.all([addComboToCart(container, command), addComboToCart(container, command)])
  let cart = await readCart(container, cartId)
  assert.equal(cart.items.length, 2); assert.equal(medusaToMinor(cart.item_total), 2500)
  pass("combo_to_native_cart_server_prices_and_idempotent_replay")
  await assert.rejects(() => addComboToCart(container, { ...command, selections: [...command.selections, { slot_id: "extra", variant_id: dessert, quantity: 1 }] }), /Idempotency/)
  await assert.rejects(() => addComboToCart(container, { ...command, requestId: "qa_bad_combo", selections: [{ slot_id: "main", variant_id: burger, quantity: 1, unit_price: 0 }] }), /prices cannot be supplied/)
  pass("changed_request_replay_and_client_price_injection_rejected")
  assert.equal(evaluateDeliveryPolicy(policy, cart).gapMinor, 500)
  await addShippingMethodToCartWorkflow(container).run({ input: { cart_id: cartId, options: [{ id: shipping.id, data: { amount: 0, eligibleSubtotalMinor: 99999999, vintage_policy: { base_fee_minor: 0 } } }] } })
  cart = await readCart(container, cartId)
  assert.equal(medusaToMinor(cart.shipping_total), 900); assert.equal(medusaToMinor(cart.total), 3400)
  pass("freight_ignores_untrusted_amounts_and_charges_nine_reais")
  await addToCartWorkflow(container).run({ input: { cart_id: cartId, items: [{ variant_id: dessert, quantity: 1 }] } })
  await addShippingMethodToCartWorkflow(container).run({ input: { cart_id: cartId, options: [{ id: shipping.id }] } })
  cart = await readCart(container, cartId)
  assert.equal(evaluateDeliveryPolicy(policy, cart).status, "free_shipping")
  assert.equal(medusaToMinor(cart.shipping_total), 0); assert.equal(medusaToMinor(cart.total), 3000)
  pass("cart_crosses_threshold_and_receives_free_shipping")
  const { result: collection } = await createPaymentCollectionForCartWorkflow(container).run({ input: { cart_id: cartId } })
  await payment.createPaymentSession(collection.id, { provider_id: "pp_system_default", currency_code: "brl", amount: collection.amount, data: { synthetic: true } })
  assert.equal(medusaToMinor(collection.amount), 3000)
  pass("simulated_system_payment_amount_matches_cart")
  const { result: placed } = await completeCartWorkflow(container).run({ input: { id: cartId } })
  const { result: retried } = await completeCartWorkflow(container).run({ input: { id: cartId } })
  assert.equal(placed.id, retried.id)
  const { data: [order] } = await query.graph({ entity: "order", fields: ["id", "currency_code", "total", "items.*", "shipping_total"], filters: { id: placed.id } })
  assert.equal(medusaToMinor(order.total), 3000); assert.equal(medusaToMinor(order.shipping_total), 0)
  const orderItems = order.items as CartItemSnapshot[]
  assert.equal(orderItems.length, 3); assert.equal(orderItems.filter((i) => i.metadata?.vintage_combo_id === combo.id).length, 2)
  pass("native_order_created_once_with_combo_snapshot_and_correct_total")
  let ledger = await telemetry.listCommerceEvents({ order_id: order.id })
  for (let attempt = 0; !ledger.length && attempt < 60; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 250)); ledger = await telemetry.listCommerceEvents({ order_id: order.id })
  }
  assert.equal(ledger.length, 1, "Native order.placed subscriber must persist the event")
  await Promise.all([recordOrderCreated(container, order.id), recordOrderCreated(container, order.id)])
  ledger = await telemetry.listCommerceEvents({ order_id: order.id })
  assert.equal(ledger.length, 1); assert.equal(ledger[0].event_name, "order_created"); assert.equal(ledger[0].payload.value_minor, 3000)
  pass("native_event_consumed_persisted_and_duplicate_delivery_deduplicated")
  // Deliberately corrupt a synthetic row, never a real customer shipping method.
  const staleCartId = await newCart()
  await addComboToCart(container, { ...command, cartId: staleCartId })
  await addShippingMethodToCartWorkflow(container).run({ input: { cart_id: staleCartId, options: [{ id: shipping.id }] } })
  const staleCart = await readCart(container, staleCartId)
  await carts.updateShippingMethods([{ id: staleCart.shipping_methods[0].id, amount: 0 }])
  const { result: staleCollection } = await createPaymentCollectionForCartWorkflow(container).run({ input: { cart_id: staleCartId } })
  await payment.createPaymentSession(staleCollection.id, { provider_id: "pp_system_default", currency_code: "brl", amount: staleCollection.amount, data: { synthetic: true } })
  await assert.rejects(() => completeCartWorkflow(container).run({ input: { id: staleCartId } }), (error: unknown) => {
    assert.match(workflowErrorText(error), /Stale delivery quote/)
    return true
  })
  assert.equal((await readCart(container, staleCartId)).completed_at, null)
  pass("completion_rejects_stale_freight_before_order_or_payment")
  const report = { scope: "isolated_backend_workflow_slice", test_data: "synthetic_only", payment_provider: "pp_system_default_simulated_not_PSP_sandbox", cart_id: cartId, order_id: order.id, total_minor: 3000, shipping_minor: 0, checks, known_limits: ["No storefront integration or customer API authorization was shipped", "Combo price equals component sum, fixed bundle discounts pending", "Rule publication UI and concurrent revision governance pending", "No real PSP, merchant, delivery booking, Ads export or iFood operation", "order_created is not verified paid purchase"] }
  mkdirSync(".cache", { recursive: true }); writeFileSync(".cache/commerce-slice-report.json", JSON.stringify(report, null, 2) + "\n")
  console.log(`COMMERCE_SLICE_PASS: ${checks.length} integration checks; synthetic order; no real payment`)
}
