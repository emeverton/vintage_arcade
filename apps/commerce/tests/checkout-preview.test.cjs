const { test } = require('node:test')
const assert = require('node:assert/strict')
const { checkoutPreviewEnabled, previewBody, validSessionToken, requireFreshQuote, parsePreviewAction } = require('../.test-build/domain/checkout-preview')
const config = { APP_ENV:'test',VINTAGE_SLICE_ENABLED:'true',VINTAGE_CHECKOUT_PREVIEW_ENABLED:'true',VINTAGE_PREVIEW_SERVICE_SECRET:'a'.repeat(64) }
const staging = {
  APP_ENV:'staging',
  VINTAGE_SLICE_ENABLED:'true',
  VINTAGE_CHECKOUT_PREVIEW_ENABLED:'true',
  VINTAGE_PREVIEW_SERVICE_SECRET:'a'.repeat(64),
  DATABASE_URL:'postgres://u:p@private.railway.internal:5432/vintage_staging',
  VINTAGE_STAGING_BASIC_USER:'homolog',
  VINTAGE_STAGING_BASIC_PASSWORD:'s'.repeat(16),
  VINTAGE_PREVIEW_ORIGIN:'https://storefront-staging.up.railway.app',
  VINTAGE_PREVIEW_BACKEND_URL:'http://commerce-staging.railway.internal:9000',
  VINTAGE_PREVIEW_FIXTURE_JSON: JSON.stringify({
    synthetic:true,
    channel_id:'sc_123',
    region_id:'reg_123',
    combo_id:'combo_123',
    shipping_option_id:'so_123',
    extra_variant_id:'variant_123',
    postal_code:'00000001',
  }),
}
test('preview defaults off',()=>assert.equal(checkoutPreviewEnabled({}),false))
test('preview requires explicit isolated configuration',()=>assert.equal(checkoutPreviewEnabled(config),true))
test('staging preview accepted with persistent fixture and https origin',()=>assert.equal(checkoutPreviewEnabled(staging),true))
for(const patch of [{APP_ENV:'production'},{APP_ENV:undefined},{VINTAGE_SLICE_ENABLED:'false'},{VINTAGE_PREVIEW_SERVICE_SECRET:''},{VINTAGE_PREVIEW_SERVICE_SECRET:'short'},{VINTAGE_CHECKOUT_PREVIEW_ENABLED:'yes'}]) test('preview rejects '+JSON.stringify(patch),()=>assert.throws(()=>checkoutPreviewEnabled({...config,...patch})))
for(const patch of [
  {DATABASE_URL:'postgres://u:p@host/railway'},
  {VINTAGE_PREVIEW_ORIGIN:'http://localhost:3000'},
  {VINTAGE_PREVIEW_BACKEND_URL:'http://localhost:9000'},
  {VINTAGE_PREVIEW_FIXTURE_JSON:''},
  {VINTAGE_PREVIEW_FIXTURE_FILE:'/tmp/checkout-fixture.json'},
  {VINTAGE_STAGING_BASIC_PASSWORD:'short'},
  {APP_ENV:'test',RAILWAY_ENVIRONMENT:'staging'},
]) test('staging preview rejects '+JSON.stringify(patch),()=>assert.throws(()=>checkoutPreviewEnabled({...staging,...patch})))
for(const [action,body] of [['start',{cart_id:'foreign'}],['extra',{enabled:true,price:0}],['extra',{enabled:'true'}],['quote',{postal_code:'000'}],['quote',{postal_code:'00000001',total:0}],['combo',{selections:[],unit_price:0}],['complete',{quote_id:'a'.repeat(32),acknowledge_simulation:false}],['complete',{quote_id:'invalid',acknowledge_simulation:true}],['state',{customer_id:'another'}]]) test('rejects preview payload '+action+JSON.stringify(body),()=>assert.throws(()=>previewBody(action,body)))
test('valid quote payload accepted',()=>assert.equal(previewBody('quote',{postal_code:'00000-001'}).postal_code,'00000-001'))
test('explicit simulation acknowledgement accepted',()=>assert.equal(previewBody('complete',{quote_id:'a'.repeat(32),acknowledge_simulation:true}).acknowledge_simulation,true))
test('unknown action rejected',()=>assert.throws(()=>parsePreviewAction('refund')))
test('session capability format is exact',()=>{assert.equal(validSessionToken('a'.repeat(64)),true);for(const v of [null,[],123,'a'.repeat(63),'A'.repeat(64),'a'.repeat(65)])assert.equal(validSessionToken(v),false)})
const quote = {id:'quote1',fingerprint:'same',expires_at:2000}
test('fresh matching quote accepted',()=>assert.doesNotThrow(()=>requireFreshQuote(quote,'quote1','same',1000)))
for(const [q,id,fp,now] of [[quote,'other','same',1000],[quote,'quote1','changed',1000],[quote,'quote1','same',2000],[null,'quote1','same',1000],[{...quote,expires_at:NaN},'quote1','same',1000]])test('rejects stale or mismatched quote '+JSON.stringify([q,id,fp,now]),()=>assert.throws(()=>requireFreshQuote(q,id,fp,now)))
