import assert from "node:assert/strict"
import { randomBytes, createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import Redis from "ioredis"
import type { ExecArgs, IFulfillmentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createApiKeysWorkflow, linkSalesChannelsToApiKeyWorkflow } from "@medusajs/medusa/core-flows"
import type VintageCheckoutService from "../modules/vintage-checkout/service"
import type VintageDeliveryService from "../modules/vintage-delivery/service"
import { readPreviewFixture } from "../application/checkout-preview-fixture"

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  assert.ok(value !== null && typeof value === "object" && !Array.isArray(value), `${label} must be a JSON object`)
}

export default async function smokeCheckoutPreview({ container }: ExecArgs) {
  const db = new URL(process.env.DATABASE_URL || "invalid:")
  if (process.env.APP_ENV !== "test" || db.pathname !== "/vintage_ci" || !["localhost", "127.0.0.1", "postgres"].includes(db.hostname)) throw new Error("Preview smoke requires disposable CI")
  const f = readPreviewFixture(), checks: string[] = []
  const pass = (name: string) => { checks.push(name); console.log("CHECKOUT_API_PASS:", name) }
  const base = "http://localhost:9000"
  const secret = process.env.VINTAGE_PREVIEW_SERVICE_SECRET!
  const tokenA = randomBytes(32).toString("hex"), tokenB = randomBytes(32).toString("hex")
  let sequence = 0
  const api = async (action: string, token?: string, body?: unknown, extra: Record<string, string> = {}) => {
    const request = ++sequence, started = Date.now()
    console.log("CHECKOUT_REQUEST_START", request, action.split("?")[0])
    try {
      const response = await fetch(`${base}/vintage-preview/${action}`, { signal: AbortSignal.timeout(15000), method: body === undefined ? "GET" : "POST", headers: { "Content-Type":"application/json", "x-vintage-preview-service": secret, ...(token ? { "x-vintage-preview-session":token } : {}), ...extra }, ...(body === undefined ? {} : { body:JSON.stringify(body) }) })
      const value = await response.json()
      console.log("CHECKOUT_REQUEST_END", request, response.status, Date.now()-started, typeof value.code === "string" ? value.code : "OK")
      return {status:response.status, body:value}
    } catch (error) {
      console.error("CHECKOUT_REQUEST_FAILURE", request, action.split("?")[0], Date.now()-started, error instanceof Error ? error.name : "Unknown")
      throw error
    }
  }
  const unauthorized = await fetch(`${base}/vintage-preview/catalog`, { signal: AbortSignal.timeout(15000) })
  assert.equal(unauthorized.status,401); await unauthorized.arrayBuffer()
  assert.equal((await api("catalog",undefined,undefined,{"x-vintage-preview-service":"0".repeat(64)})).status,401)
  assert.equal((await api("catalog",undefined,undefined,{Origin:"https://example.invalid"})).status,403)
  pass("private_service_authentication_and_browser_origin_rejection")
  const catalog = await api("catalog"); assert.equal(catalog.status,200)
  const selections = catalog.body.slots.filter((s: {min:number})=>s.min>0).map((s: {id:string;options:{variant_id:string}[]})=>({slot_id:s.id,variant_id:s.options[0].variant_id,quantity:1}))
  assert.equal((await api("extra",tokenB,{enabled:true})).status,403)
  assert.equal((await api("start",tokenA,{})).status,200)
  assert.equal((await api("start",tokenB,{})).status,200)
  let a = await api("combo",tokenA,{selections}); assert.equal(a.status,200); assert.equal(a.body.total_minor,3400)
  assert.equal((await api("state",tokenB)).body.items.length,0)
  const checkout = container.resolve<VintageCheckoutService>("vintageCheckout")
  const [sa] = await checkout.listPreviewSessions({token_hash:createHash("sha256").update(tokenA).digest("hex")})
  const [sb] = await checkout.listPreviewSessions({token_hash:createHash("sha256").update(tokenB).digest("hex")})
  assert.ok(sa.cart_id !== sb.cart_id,"Sessions must own different carts")
  assert.ok(!JSON.stringify(sa).includes(tokenA),"Raw capability must not be persisted")
  pass("persisted_guest_sessions_are_isolated_and_tokens_hashed")
  assert.equal((await api("extra",tokenB,{enabled:true,cart_id:sa.cart_id})).status,400)
  assert.equal((await api("combo",tokenA,{selections:[{...selections[0],unit_price:0},...selections.slice(1)]})).status,400)
  assert.equal((await api("quote",tokenA,{postal_code:f.postal_code,total:0})).status,400)
  assert.equal((await api("state?cart_id=foreign",tokenB)).status,400)
  pass("foreign_cart_ids_price_injection_and_extra_fields_rejected")
  const replays = await Promise.all([api("combo",tokenA,{selections}),api("combo",tokenA,{selections})]); assert.ok(replays.every((r)=>r.status===200))
  a = await api("state",tokenA); assert.equal(a.body.items.length,2)
  const extras = await Promise.all([api("extra",tokenA,{enabled:true}),api("extra",tokenA,{enabled:true})]); assert.ok(extras.every((r)=>r.status===200))
  a = await api("state",tokenA); assert.equal(a.body.items.length,3); assert.equal(a.body.total_minor,3000); assert.equal(a.body.shipping_minor,0)
  a = await api("extra",tokenA,{enabled:false}); assert.equal(a.body.items.length,2); assert.equal(a.body.total_minor,3400)
  pass("repeated_commands_and_absolute_extra_state_do_not_duplicate_items")
  assert.equal((await api("quote",tokenA,{postal_code:"99999999"})).status,422)
  a = await api("quote",tokenA,{postal_code:f.postal_code}); assert.equal(a.status,200)
  const saved = (await checkout.retrievePreviewSession(sa.id)).quote!
  await checkout.updatePreviewSessions({id:sa.id,quote:{...saved,expires_at:Date.now()-1}})
  assert.equal((await api("complete",tokenA,{quote_id:a.body.quote.id,acknowledge_simulation:true})).status,409)
  assert.equal((await api("state",tokenA)).body.needs_quote,true)
  pass("invalid_postcode_and_expired_quote_block_completion")
  a = await api("quote",tokenA,{postal_code:f.postal_code})
  const delivery = container.resolve<VintageDeliveryService>("vintageDelivery")
  const option = await container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT).retrieveShippingOption(f.shipping_option_id)
  const before = await delivery.publicationState(f.shipping_option_id)
  const policy = await delivery.resolvePublishedPolicy(option.data?.vintage_policy)
  const publisher = process.env.VINTAGE_DELIVERY_PUBLISHER_IDS!
  const draft = await delivery.changePublication(publisher,f.shipping_option_id,option.data?.vintage_policy,"draft",{request_id:"preview_policy_draft",expected_generation:before.control?.generation || 0,reason:"QA quote invalidation test",changes:{base_fee_minor:policy.base_fee_minor+100}})
  const published = await delivery.changePublication(publisher,f.shipping_option_id,option.data?.vintage_policy,"publish",{request_id:"preview_policy_publish",expected_generation:draft.generation,reason:"QA quote invalidation test",rule_id:draft.rule_id})
  try { assert.equal((await api("complete",tokenA,{quote_id:a.body.quote.id,acknowledge_simulation:true})).status,409) } finally {
    await delivery.changePublication(publisher,f.shipping_option_id,option.data?.vintage_policy,"rollback",{request_id:"preview_policy_restore",expected_generation:published.generation,reason:"Restore synthetic baseline after QA",rule_id:before.control?.active_rule_id || null})
  }
  pass("publication_after_quote_requires_explicit_requote")
  const { result:[key] } = await createApiKeysWorkflow(container).run({input:{api_keys:[{title:"QA preview bypass check",type:"publishable",created_by:""}]}})
  await linkSalesChannelsToApiKeyWorkflow(container).run({input:{id:key.id,add:[f.channel_id]}})
  for (const path of [`/store/carts/${sa.cart_id}`,`/store/shipping-options?cart_id=${sa.cart_id}`]) {
    const result = await fetch(base+path,{signal:AbortSignal.timeout(15000),headers:{"x-publishable-api-key":key.token}})
    assert.equal(result.status,403); await result.arrayBuffer()
  }
  pass("native_store_routes_cannot_bypass_session_gateway_even_with_valid_key")
  a = await api("extra",tokenA,{enabled:true}); assert.equal(a.status,200)
  const completion = {quote_id:a.body.quote.id,acknowledge_simulation:true}
  const results = await Promise.all([api("complete",tokenA,completion),api("complete",tokenA,completion)])
  assert.ok(results.every((r)=>r.status===200),"Both serialized completion calls must succeed")
  assert.equal(results[0].body.order_reference,results[1].body.order_reference)
  assert.equal(results[0].body.total_minor,3000)
  const {data:[order]} = await container.resolve("query").graph({entity:"order",fields:["id","metadata","total"],filters:{id:results[0].body.order_reference}})
  assert.ok(order, "Completed preview order must exist")
  const snapshot = order.metadata?.vintage_preview_quote
  assertRecord(snapshot, "Persisted preview quote")
  const snapshotPolicy = snapshot.policy
  assertRecord(snapshotPolicy, "Persisted preview policy")
  assert.equal(snapshot.simulated,true)
  assert.equal(snapshot.total_minor,3000)
  assert.equal(snapshotPolicy.rule_id,policy.rule_id)
  assert.equal((await api("state",tokenB)).body.items.length,0)
  assert.equal((await api("extra",tokenA,{enabled:false})).status,409)
  pass("simulated_order_is_idempotent_owned_and_carries_quote_policy_snapshot")
  await checkout.updatePreviewSessions({id:sb.id,expires_at:new Date(Date.now()-1000)})
  assert.equal((await api("state",tokenB)).status,410)
  pass("expired_session_cannot_access_its_cart")
  const tokenC=randomBytes(32).toString("hex"), redis=new Redis(process.env.REDIS_URL!,{commandTimeout:2000})
  try {
    await redis.set(`vintage-preview:rate:${createHash("sha256").update(tokenC).digest("hex")}`,90,"EX",60)
    assert.equal((await api("state",tokenC)).status,429)
  } finally { await redis.quit() }
  pass("redis_rate_limit_blocks_excess_requests")
  writeFileSync(".cache/checkout-api-report.json",JSON.stringify({scope:"synthetic_private_gateway",checks,order_id:order.id,no_real_payment:true},null,2))
}
