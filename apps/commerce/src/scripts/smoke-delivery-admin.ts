import assert from "node:assert/strict"
import { createHmac, randomUUID } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import type { ExecArgs, IFulfillmentModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createCartWorkflow, addShippingMethodToCartWorkflow } from "@medusajs/medusa/core-flows"
import type VintageDeliveryService from "../modules/vintage-delivery/service"
import { readCart } from "../application/cart"
import { addComboToCart } from "../application/add-combo-to-cart"
import { medusaToMinor } from "../domain/money"
import { parseDeliveryPolicy } from "../domain/delivery-policy"

type Db = { raw(sql: string): PromiseLike<unknown> }
const baseUrl = "http://localhost:9000"
function jwt(actorId: string) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url")
  const now = Math.floor(Date.now() / 1000)
  const content = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ actor_id: actorId, actor_type: "user", auth_identity_id: "authid_synthetic_ci", iat: now, exp: now + 600 })}`
  return `${content}.${createHmac("sha256", process.env.JWT_SECRET!).update(content).digest("base64url")}`
}
export default async function smokeDeliveryAdmin({ container }: ExecArgs) {
  const url = new URL(process.env.DATABASE_URL || "invalid:")
  if (process.env.APP_ENV !== "test" || url.pathname !== "/vintage_ci" || !["localhost", "127.0.0.1", "postgres"].includes(url.hostname)) throw new Error("Admin smoke is restricted to disposable CI")
  const ids: Record<string, string> = JSON.parse(readFileSync(".cache/admin-identities.json", "utf8"))
  const previous = JSON.parse(readFileSync(".cache/commerce-slice-report.json", "utf8"))
  const checks: string[] = []
  const pass = (name: string) => { checks.push(name); console.log(`DELIVERY_ADMIN_PASS: ${name}`) }
  const service = container.resolve<VintageDeliveryService>("vintageDelivery")
  const fulfillment = container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const db = container.resolve<Db>(ContainerRegistrationKeys.PG_CONNECTION)
  const [option] = await fulfillment.listShippingOptions({ provider_id: "vintage_vintage" })
  if (!option || !option.name.startsWith("QA_")) throw new Error("Expected synthetic shipping fixture")
  const bootstrap = parseDeliveryPolicy(option.data?.vintage_policy)
  const path = `/admin/vintage-delivery/${option.id}`
  async function api(role: string | null, method: string, route: string, body?: unknown, origin = baseUrl) {
    const headers: Record<string, string> = { "content-type": "application/json", origin }
    if (role) headers.authorization = `Bearer ${jwt(ids[role])}`
    const response = await fetch(`${baseUrl}${route}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) })
    return { status: response.status, body: await response.json() as Record<string, any> }
  }
  const draftBody = { request_id: randomUUID(), expected_generation: 0, reason: "QA ajuste de limite para 25 reais", changes: { threshold_minor: 2500 } }
  assert.equal((await api(null, "GET", path)).status, 401)
  assert.equal((await api("outsider", "GET", path)).status, 403)
  assert.equal((await api("viewer", "GET", path)).status, 200)
  assert.equal((await api("viewer", "POST", `${path}/draft`, draftBody)).status, 403)
  pass("authentication_and_deny_by_default_permissions")
  assert.equal((await api("editor", "POST", `${path}/draft`, { ...draftBody, changes: { threshold_minor: 0 } })).status, 400)
  assert.equal((await api("editor", "POST", `${path}/draft`, { ...draftBody, actor_id: ids.publisher })).status, 400)
  assert.equal((await api("editor", "POST", `${path}/draft`, draftBody, "https://untrusted.example")).status, 403)
  pass("invalid_policy_actor_spoof_and_cross_origin_write_rejected")
  const draft = await api("editor", "POST", `${path}/draft`, draftBody)
  assert.equal(draft.status, 200, JSON.stringify(draft.body))
  const ruleId = draft.body.rule_id as string
  const replay = await api("editor", "POST", `${path}/draft`, draftBody)
  assert.equal(replay.status, 200); assert.equal(replay.body.rule_id, ruleId); assert.equal(replay.body.replayed, true)
  assert.equal((await api("editor", "POST", `${path}/draft`, { ...draftBody, reason: "QA changed under same key" })).status, 409)
  let state = (await api("viewer", "GET", path)).body
  assert.equal(state.generation, 0); assert.equal(state.active_policy.threshold_minor, 3000); assert.equal(state.revisions.length, 1); assert.equal(state.audit.length, 1)
  pass("immutable_draft_persistence_and_idempotent_retry_without_publication")
  const preview = await api("viewer", "POST", `${path}/preview`, { changes: { threshold_minor: 2500 }, subtotal_minor: 2500, postal_code: "00000001" })
  assert.equal(preview.status, 200); assert.equal(preview.body.simulation_only, true); assert.equal(preview.body.result.finalFeeMinor, 0)
  assert.equal((await api("viewer", "GET", path)).body.audit.length, 1)
  pass("preview_changes_neither_active_rule_nor_audit")
  const publication = { request_id: randomUUID(), expected_generation: 0, reason: "QA publicação autorizada", rule_id: ruleId }
  assert.equal((await api("editor", "POST", `${path}/publish`, publication)).status, 403)
  assert.equal((await api("viewer", "POST", `${path}/publish`, publication)).status, 403)
  assert.equal((await api("publisher", "POST", `/admin/shipping-options/${option.id}`, { name: "QA bypass" })).status, 403)
  pass("publisher_only_and_native_shipping_editor_bypass_blocked")
  // Fault injection exists only in this disposable database, never in application code.
  await db.raw("create function qa_delivery_audit_fail() returns trigger language plpgsql as $$ begin if new.reason = 'QA_FORCE_AUDIT_FAILURE' then raise exception 'Injected audit failure'; end if; return new; end; $$")
  await db.raw("create trigger qa_delivery_audit_fail before insert on vintage_delivery_audit for each row execute function qa_delivery_audit_fail()")
  const injected = { ...publication, request_id: randomUUID(), reason: "QA_FORCE_AUDIT_FAILURE" }
  try {
    assert.equal((await api("publisher", "POST", `${path}/publish`, injected)).status, 500)
    state = (await api("viewer", "GET", path)).body
    assert.equal(state.generation, 0); assert.equal(state.active_rule_id, null); assert.equal(state.audit.length, 1)
  } finally {
    await db.raw("drop trigger qa_delivery_audit_fail on vintage_delivery_audit")
    await db.raw("drop function qa_delivery_audit_fail()")
  }
  pass("audit_failure_rolls_back_active_pointer_and_generation_atomically")
  const published = await api("publisher", "POST", `${path}/publish`, injected)
  assert.equal(published.status, 200, JSON.stringify(published.body)); assert.equal(published.body.generation, 1)
  assert.equal((await api("publisher", "POST", `${path}/publish`, injected)).body.replayed, true)
  assert.equal((await api("publisher", "POST", `${path}/publish`, publication)).status, 409)
  state = (await api("viewer", "GET", path)).body
  assert.equal(state.audit.length, 2); assert.equal(state.active_policy.threshold_minor, 2500)
  pass("publication_and_retry_commit_one_audit_with_optimistic_generation")
  const originalCart = await readCart(container, previous.cart_id)
  const comboItems = originalCart.items.filter((item) => item.metadata?.vintage_combo_id)
  const comboId = String(comboItems[0].metadata!.vintage_combo_id)
  const address = { first_name: "QA", last_name: "Admin", address_1: "Synthetic fixture", country_code: "br", city: "QA", postal_code: "00000001" }
  const { result: cart } = await createCartWorkflow(container).run({ input: { region_id: bootstrap.region_id, sales_channel_id: bootstrap.sales_channel_id, currency_code: "brl", email: "qa-admin-cart@example.invalid", shipping_address: address, billing_address: address } })
  await addComboToCart(container, { cartId: cart.id, comboId, requestId: "qa_admin_cart_command", selections: comboItems.map((item) => ({ slot_id: item.metadata!.vintage_slot_id, variant_id: item.variant_id, quantity: item.quantity })) })
  await addShippingMethodToCartWorkflow(container).run({ input: { cart_id: cart.id, options: [{ id: option.id }] } })
  assert.equal(medusaToMinor((await readCart(container, cart.id)).shipping_total), 0)
  assert.deepEqual((await fulfillment.retrieveShippingOption(option.id)).data?.vintage_policy, bootstrap)
  pass("native_cart_uses_published_policy_without_mutating_shipping_option_or_deploy")
  const second = await api("editor", "POST", `${path}/draft`, { ...draftBody, request_id: randomUUID(), expected_generation: 1, changes: { threshold_minor: 5000, base_fee_minor: 1100 } })
  const third = await api("editor", "POST", `${path}/draft`, { ...draftBody, request_id: randomUUID(), expected_generation: 1, changes: { threshold_minor: 5000, base_fee_minor: 800 } })
  assert.equal(second.status, 200); assert.equal(third.status, 200)
  const competing = await Promise.all([second, third].map((candidate) => api("publisher", "POST", `${path}/publish`, { request_id: randomUUID(), expected_generation: 1, reason: "QA publicações concorrentes", rule_id: candidate.body.rule_id })))
  assert.deepEqual(competing.map((r) => r.status).sort(), [200, 409])
  assert.equal((await api("viewer", "GET", path)).body.generation, 2)
  pass("concurrent_publications_have_exactly_one_winner")
  const rollback = await api("publisher", "POST", `${path}/rollback`, { request_id: randomUUID(), expected_generation: 2, reason: "QA retorno à revisão publicada", rule_id: ruleId })
  assert.equal(rollback.status, 200); assert.equal(rollback.body.generation, 3)
  const baseline = await api("publisher", "POST", `${path}/rollback`, { request_id: randomUUID(), expected_generation: 3, reason: "QA restaurar configuração inicial", rule_id: null })
  assert.equal(baseline.status, 200); assert.equal(baseline.body.generation, 4)
  await addShippingMethodToCartWorkflow(container).run({ input: { cart_id: cart.id, options: [{ id: option.id }] } })
  assert.equal(medusaToMinor((await readCart(container, cart.id)).shipping_total), 900)
  assert.equal(medusaToMinor((await readCart(container, previous.cart_id)).total), 3000)
  pass("rollback_is_new_audited_generation_and_does_not_rewrite_completed_order")
  await assert.rejects(() => service.updateDeliveryRules({ id: ruleId, policy: { ...bootstrap, threshold_minor: 1 } }))
  const audit = (await service.listDeliveryAudits({ option_id: option.id }))[0]
  await assert.rejects(() => service.updateDeliveryAudits({ id: audit.id, reason: "QA attempt to edit history" }))
  assert.equal((await service.retrieveDeliveryRule(ruleId)).policy.threshold_minor, 2500)
  pass("database_rejects_managed_revision_and_audit_mutation")
  writeFileSync(".cache/delivery-admin-report.json", JSON.stringify({ scope: "isolated_admin_api_and_native_cart", option_id: option.id, generation: 4, checks, synthetic_only: true }, null, 2) + "\n")
  console.log(`DELIVERY_ADMIN_SMOKE_PASS: ${checks.length} checks; no real user granted access`)
}
