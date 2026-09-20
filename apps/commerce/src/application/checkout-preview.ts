import { createHash, randomBytes } from "node:crypto"
import type { MedusaContainer, ILockingModule, IFulfillmentModuleService, ICartModuleService, IPaymentModuleService } from "@medusajs/framework/types"
import { Modules, QueryContext } from "@medusajs/framework/utils"
import { createCartWorkflow, addToCartWorkflow, deleteLineItemsWorkflow, updateCartWorkflow, addShippingMethodToCartWorkflow, createPaymentCollectionForCartWorkflow, refreshPaymentCollectionForCartWorkflow, completeCartWorkflow } from "@medusajs/medusa/core-flows"
import type VintageCheckoutService from "../modules/vintage-checkout/service"
import type VintageFoodService from "../modules/vintage-food/service"
import type VintageDeliveryService from "../modules/vintage-delivery/service"
import { readPreviewFixture, type PreviewFixture } from "./checkout-preview-fixture"
import { readCart, type CartSnapshot, type CartItemSnapshot } from "./cart"
import { addComboToCart } from "./add-combo-to-cart"
import { parseComboSpec, expandCombo } from "../domain/combo"
import { evaluateDeliveryPolicy, type DeliveryPolicy } from "../domain/delivery-policy"
import { canonicalJson } from "../domain/delivery-admin"
import { medusaToMinor } from "../domain/money"
import { PreviewError, requireFreshQuote, type PreviewAction } from "../domain/checkout-preview"

interface SavedQuote { id: string; fingerprint: string; expires_at: number; policy: DeliveryPolicy }
interface Session { id: string; token_hash: string; cart_id: string | null; order_id: string | null; expires_at: Date; quote: Record<string, unknown> | null }
interface Variant { id: string; title: string; product: { title: string; status: string; sales_channels: { id: string }[] }; calculated_price: { calculated_amount: unknown } | null }
const hash = (text: string) => createHash("sha256").update(text).digest("hex")

async function publishedPolicy(container: MedusaContainer, f: PreviewFixture) {
  const fulfillment = container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const option = await fulfillment.retrieveShippingOption(f.shipping_option_id)
  if (option.provider_id !== "vintage_vintage") throw new PreviewError(409, "WRONG_PROVIDER", "Entrega de teste indisponível.")
  return container.resolve<VintageDeliveryService>("vintageDelivery").resolvePublishedPolicy(option.data?.vintage_policy)
}
function fingerprint(cart: CartSnapshot, policy: DeliveryPolicy): string {
  return hash(canonicalJson({ currency: cart.currency_code, channel: cart.sales_channel_id, region: cart.region_id, postal: cart.shipping_address?.postal_code, items: cart.items.map((i) => ({ id: i.id, variant: i.variant_id, quantity: Number(i.quantity), price: medusaToMinor(i.unit_price) })).sort((a, b) => a.id.localeCompare(b.id)), subtotal: medusaToMinor(cart.item_total), shipping: medusaToMinor(cart.shipping_total), total: medusaToMinor(cart.total), policy }))
}

export async function previewCatalog(container: MedusaContainer) {
  const f = readPreviewFixture()
  const combo = await container.resolve<VintageFoodService>("vintageFood").retrieveComboDefinition(f.combo_id)
  const spec = parseComboSpec(combo.definition)
  if (spec.sales_channel_id !== f.channel_id) throw new Error("Preview combo is outside configured channel")
  const ids = [...new Set([...spec.slots.flatMap((s) => s.options.map((o) => o.variant_id)), f.extra_variant_id])]
  const { data } = await container.resolve("query").graph({ entity: "product_variant", fields: ["id", "title", "product.title", "product.status", "product.sales_channels.id", "calculated_price.*"], filters: { id: ids }, context: { calculated_price: QueryContext({ currency_code: "brl", region_id: f.region_id }) } })
  const variants = data as unknown as Variant[]
  const option = (id: string) => {
    const variant = variants.find((v) => v.id === id)
    if (!variant || variant.product?.status !== "published" || !variant.product.sales_channels.some((c) => c.id === f.channel_id) || !variant.calculated_price) throw new PreviewError(409, "CATALOG_CHANGED", "Catálogo sintético indisponível.")
    return { variant_id: id, name: variant.product.title, amount_minor: medusaToMinor(variant.calculated_price.calculated_amount) }
  }
  return { synthetic: true, name: combo.name, slots: spec.slots.map((s) => ({ id: s.id, min: s.min, max: s.max, options: s.options.map((o) => ({ ...option(o.variant_id), max_quantity: o.max_quantity })) })), extra: option(f.extra_variant_id), postal_code: f.postal_code }
}

async function orderView(container: MedusaContainer, orderId: string) {
  const { data: [order] } = await container.resolve("query").graph({ entity: "order", fields: ["id", "total", "item_total", "shipping_total", "items.*", "metadata"], filters: { id: orderId } })
  if (!order) throw new Error("Owned preview order missing")
  return { synthetic: true, status: "completed", order_reference: order.id, items: (order.items as CartItemSnapshot[]).map((i) => ({ name: (i as CartItemSnapshot & { title?: string }).title || "Item de teste", quantity: Number(i.quantity), amount_minor: medusaToMinor(i.unit_price) })), subtotal_minor: medusaToMinor(order.item_total), shipping_minor: medusaToMinor(order.shipping_total), total_minor: medusaToMinor(order.total), quote: null, needs_quote: false, payment: "simulated_not_charged" }
}

async function sessionView(container: MedusaContainer, session: Session, f: PreviewFixture) {
  if (session.order_id) return orderView(container, session.order_id)
  if (!session.cart_id) return { synthetic: true, status: "empty", items: [], subtotal_minor: 0, shipping_minor: 0, total_minor: 0, quote: null, needs_quote: true }
  const cart = await readCart(container, session.cart_id)
  const catalog = await previewCatalog(container)
  const options = [...catalog.slots.flatMap((s) => s.options), catalog.extra]
  let quote: Record<string, unknown> | null = null
  const saved = session.quote as unknown as SavedQuote | null
  if (saved && cart.items.length) {
    try {
      const policy = await publishedPolicy(container, f)
      const q = evaluateDeliveryPolicy(policy, cart)
      requireFreshQuote(saved, saved.id, fingerprint(cart, policy))
      quote = { id: saved.id, expires_at: saved.expires_at, gap_minor: q.gapMinor, status: q.status, final_fee_minor: q.finalFeeMinor, threshold_minor: policy.threshold_minor, full_subsidy: policy.subsidy_cap_minor >= policy.base_fee_minor }
    } catch { quote = null }
  }
  return { synthetic: true, status: "cart", postal_code: cart.shipping_address?.postal_code, items: cart.items.map((i) => ({ name: options.find((v) => v.variant_id === i.variant_id)?.name || "Item de teste", quantity: Number(i.quantity), amount_minor: medusaToMinor(i.unit_price) })), subtotal_minor: medusaToMinor(cart.item_total), shipping_minor: medusaToMinor(cart.shipping_total), total_minor: medusaToMinor(cart.total), combo_added: cart.items.some((i) => i.metadata?.vintage_combo_id === f.combo_id), extra_enabled: cart.items.some((i) => i.metadata?.vintage_preview_extra === true), quote, needs_quote: !quote }
}

async function refreshQuote(container: MedusaContainer, session: Session, f: PreviewFixture, postcode?: string) {
  const checkout = container.resolve<VintageCheckoutService>("vintageCheckout")
  let cart = await readCart(container, session.cart_id!)
  if (!cart.items.length) throw new PreviewError(409, "EMPTY_CART", "Monte o combo antes de calcular o frete.")
  const policy = await publishedPolicy(container, f)
  const postal = (postcode || cart.shipping_address?.postal_code || f.postal_code).replace(/-/g, "")
  try { evaluateDeliveryPolicy(policy, { ...cart, shipping_address: { country_code: "br", postal_code: postal } }) } catch { throw new PreviewError(422, "DELIVERY_UNAVAILABLE", "CEP fora da área de teste, mínimo não atingido ou entrega desativada.") }
  await checkout.updatePreviewSessions({ id: session.id, quote: null })
  if (cart.shipping_address?.postal_code !== postal) await updateCartWorkflow(container).run({ input: { id: cart.id, shipping_address: { first_name: "QA", last_name: "Preview", address_1: "Synthetic fixture, no delivery", city: "QA", country_code: "br", postal_code: postal } } })
  await addShippingMethodToCartWorkflow(container).run({ input: { cart_id: cart.id, options: [{ id: f.shipping_option_id }] } })
  cart = await readCart(container, cart.id)
  const current = await publishedPolicy(container, f)
  const result = evaluateDeliveryPolicy(current, cart)
  if (medusaToMinor(cart.shipping_total) !== result.finalFeeMinor || canonicalJson(policy) !== canonicalJson(current)) throw new PreviewError(409, "QUOTE_CHANGED", "A regra de entrega mudou durante o cálculo. Tente novamente.")
  const quote: SavedQuote = { id: randomBytes(16).toString("hex"), fingerprint: fingerprint(cart, current), expires_at: Date.now() + 300000, policy: current }
  return await checkout.updatePreviewSessions({ id: session.id, quote: quote as unknown as Record<string, unknown> }) as Session
}

export async function executePreview(container: MedusaContainer, token: string, action: PreviewAction, body: Record<string, unknown>) {
  const f = readPreviewFixture()
  const checkout = container.resolve<VintageCheckoutService>("vintageCheckout")
  const locking = container.resolve<ILockingModule>(Modules.LOCKING)
  const tokenHash = hash(token)
  return locking.execute(`vintage-preview:${tokenHash}`, async () => {
    let [session] = await checkout.listPreviewSessions({ token_hash: tokenHash }) as Session[]
    if (!session && action === "state") return { synthetic: true, status: "empty", items: [], subtotal_minor: 0, shipping_minor: 0, total_minor: 0, quote: null, needs_quote: true }
    if (!session && action !== "start") throw new PreviewError(403, "SESSION_REQUIRED", "Inicie sua sessão de teste.")
    if (!session) session = await checkout.createPreviewSessions({ token_hash: tokenHash, expires_at: new Date(Date.now() + 86400000) }) as Session
    if (new Date(session.expires_at).getTime() <= Date.now()) throw new PreviewError(410, "SESSION_EXPIRED", "Sessão de teste expirada.")
    if (session.order_id) {
      if (action !== "state" && action !== "complete") throw new PreviewError(409, "ORDER_COMPLETED", "Este pedido de teste já foi concluído.")
      return orderView(container, session.order_id)
    }
    if (!session.cart_id) {
      const address = { first_name: "QA", last_name: "Preview", address_1: "Synthetic fixture, no delivery", city: "QA", country_code: "br", postal_code: f.postal_code }
      const { result } = await createCartWorkflow(container).run({ input: { region_id: f.region_id, sales_channel_id: f.channel_id, currency_code: "brl", email: "preview@example.invalid", shipping_address: address, billing_address: address, metadata: { synthetic: true, vintage_preview: true } } })
      session = await checkout.updatePreviewSessions({ id: session.id, cart_id: result.id }) as Session
    }
    const cart = await readCart(container, session.cart_id!)
    if (cart.sales_channel_id !== f.channel_id || cart.region_id !== f.region_id || cart.currency_code !== "brl") throw new PreviewError(409, "SCOPE_CHANGED", "Configuração de teste alterada.")
    if (cart.completed_at) {
      const { result } = await completeCartWorkflow(container).run({ input: { id: cart.id } })
      session = await checkout.updatePreviewSessions({ id: session.id, order_id: result.id }) as Session
      return orderView(container, result.id)
    }
    if (action === "combo") {
      const definition = await container.resolve<VintageFoodService>("vintageFood").retrieveComboDefinition(f.combo_id)
      try { expandCombo(definition.definition, body.selections, f.channel_id) } catch { throw new PreviewError(400, "INVALID_COMBO", "Seleção inválida. Preços e campos extras não são aceitos.") }
      await checkout.updatePreviewSessions({ id: session.id, quote: null })
      try { await addComboToCart(container, { cartId: cart.id, comboId: f.combo_id, requestId: "preview_initial_combo", selections: body.selections }) } catch { throw new PreviewError(409, "COMBO_CONFLICT", "O combo já foi montado com outra seleção, ou o catálogo mudou.") }
      session = await refreshQuote(container, session, f)
    } else if (action === "extra") {
      if (!cart.items.some((i) => i.metadata?.vintage_combo_id === f.combo_id)) throw new PreviewError(409, "COMBO_REQUIRED", "Monte o combo primeiro.")
      await checkout.updatePreviewSessions({ id: session.id, quote: null })
      const extras = cart.items.filter((i) => i.metadata?.vintage_preview_extra === true)
      if (body.enabled === true && !extras.length) await addToCartWorkflow(container).run({ input: { cart_id: cart.id, items: [{ variant_id: f.extra_variant_id, quantity: 1, metadata: { vintage_preview_extra: true } }] } })
      if (body.enabled === false && extras.length) await deleteLineItemsWorkflow(container).run({ input: { cart_id: cart.id, ids: extras.map((i) => i.id) } })
      session = await refreshQuote(container, session, f)
    } else if (action === "quote") {
      session = await refreshQuote(container, session, f, body.postal_code as string)
    } else if (action === "complete") {
      const policy = await publishedPolicy(container, f)
      const saved = session.quote as unknown as SavedQuote | null
      requireFreshQuote(saved, body.quote_id as string, fingerprint(cart, policy))
      const carts = container.resolve<ICartModuleService>(Modules.CART)
      const current = await carts.retrieveCart(cart.id)
      await carts.updateCarts([{ id: cart.id, metadata: { ...current.metadata, vintage_preview_quote: { id: saved!.id, expires_at: saved!.expires_at, policy: saved!.policy, total_minor: medusaToMinor(cart.total), simulated: true } } }])
      if (!cart.payment_collection?.id) await createPaymentCollectionForCartWorkflow(container).run({ input: { cart_id: cart.id } })
      else await refreshPaymentCollectionForCartWorkflow(container).run({ input: { cart_id: cart.id } })
      const payment = container.resolve<IPaymentModuleService>(Modules.PAYMENT)
      const refreshed = await readCart(container, cart.id)
      const collection = await payment.retrievePaymentCollection(refreshed.payment_collection!.id, { relations: ["payment_sessions"] })
      if (medusaToMinor(collection.amount) !== medusaToMinor(cart.total)) throw new PreviewError(409, "PAYMENT_CHANGED", "Atualize a cotação.")
      if (!(collection.payment_sessions || []).some((s) => ["pending", "authorized", "captured"].includes(s.status))) await payment.createPaymentSession(collection.id, { provider_id: "pp_system_default", currency_code: "brl", amount: collection.amount, data: { synthetic: true } })
      const { result } = await completeCartWorkflow(container).run({ input: { id: cart.id } })
      session = await checkout.updatePreviewSessions({ id: session.id, order_id: result.id }) as Session
    }
    return sessionView(container, session, f)
  })
}
