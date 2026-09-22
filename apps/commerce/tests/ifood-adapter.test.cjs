'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  signIfoodPayload,
  verifyIfoodSignature,
  indexCatalogMap,
  mapIfoodItem,
  mapComboV2,
  createPipelineState,
  ingestIfoodWebhook,
  reprocessIfoodWebhook,
  assertIfoodDisabled,
  createMockCredentials,
  createMockOAuthClient,
  createFixturePoller,
  sortEventsForReplay,
} = require('../.test-build/domain/channels/ifood/index.js')

const creds = createMockCredentials()
const catalog = [
  { internal_variant_id: 'var_burger', ifood_item_id: 'ifo_burger', sku: 'B1' },
  { internal_variant_id: 'var_drink', ifood_item_id: 'ifo_drink', sku: 'D1' },
  { internal_variant_id: 'var_combo_shell', ifood_item_id: 'ifo_combo', sku: 'C1', combo_v2: true },
]
const combos = [
  {
    internal_combo_id: 'combo_1',
    ifood_item_id: 'ifo_combo',
    slot_map: { main: 'grp_main', drink: 'grp_drink' },
  },
]

function envelope(overrides = {}) {
  const body = overrides.rawBody ?? JSON.stringify({
    items: [{ id: 'ifo_burger', quantity: 1 }, { id: 'ifo_drink', quantity: 1 }],
  })
  const id = overrides.id || 'evt_1'
  const code = overrides.code || 'PLC'
  const orderId = overrides.orderId || 'ord_1'
  const signatureHeader = overrides.signatureHeader ?? signIfoodPayload(body, creds.client_secret)
  return {
    id,
    code,
    orderId,
    createdAt: overrides.createdAt || '2026-09-21T12:00:00.000Z',
    merchantId: overrides.merchantId || creds.merchant_id,
    rawBody: body,
    signatureHeader,
  }
}

function ctx(extra = {}) {
  return {
    clientSecret: creds.client_secret,
    merchantId: creds.merchant_id,
    catalog,
    combos,
    state: createPipelineState(),
    maxRetries: 2,
    ...extra,
  }
}

test('rejects invalid webhook signature', () => {
  const c = ctx()
  const result = ingestIfoodWebhook(envelope({ signatureHeader: 'deadbeef' }), c)
  assert.equal(result.status, 'rejected')
  assert.match(result.reason, /signature|mismatch|Missing/i)
})

test('verifyIfoodSignature throws on tamper', () => {
  const body = '{"items":[]}'
  const sig = signIfoodPayload(body, creds.client_secret)
  assert.throws(() => verifyIfoodSignature(body + ' ', creds.client_secret, sig))
})

test('duplicate event is idempotent', () => {
  const c = ctx()
  const e = envelope()
  assert.equal(ingestIfoodWebhook(e, c).status, 'accepted')
  const dup = ingestIfoodWebhook(e, c)
  assert.equal(dup.status, 'duplicate')
  assert.equal(c.state.seen_event_ids.size, 1)
})

test('out-of-sequence event goes to dead letter', () => {
  const c = ctx()
  assert.equal(ingestIfoodWebhook(envelope({ id: 'evt_plc', code: 'PLC' }), c).status, 'accepted')
  const bad = ingestIfoodWebhook(envelope({
    id: 'evt_dsp',
    code: 'DSP',
    rawBody: '{}',
    signatureHeader: signIfoodPayload('{}', creds.client_secret),
  }), c)
  assert.equal(bad.status, 'dead_letter')
  assert.match(bad.reason, /OUT_OF_SEQUENCE/)
  assert.equal(c.state.dead_letters.length, 1)
})

test('happy path sequence PLC->CFM', () => {
  const c = ctx()
  assert.equal(ingestIfoodWebhook(envelope({ id: 'a', code: 'PLC' }), c).status, 'accepted')
  const cfmBody = '{}'
  assert.equal(ingestIfoodWebhook(envelope({
    id: 'b',
    code: 'CFM',
    rawBody: cfmBody,
    signatureHeader: signIfoodPayload(cfmBody, creds.client_secret),
  }), c).status, 'accepted')
  assert.equal(c.state.last_event, 'CFM')
})

test('retry then dead-letter on timeout exhaustion', () => {
  const force = new Set(['evt_timeout'])
  const c = ctx({ forceTimeoutEventIds: force })
  const e = envelope({ id: 'evt_timeout' })
  assert.equal(ingestIfoodWebhook(e, c).status, 'retry')
  assert.equal(ingestIfoodWebhook(e, c).status, 'retry')
  const dead = ingestIfoodWebhook(e, c)
  assert.equal(dead.status, 'dead_letter')
  assert.equal(dead.reason, 'timeout_exhausted')
})

test('unmapped product dead-letters', () => {
  const c = ctx()
  const body = JSON.stringify({ items: [{ id: 'ifo_unknown', quantity: 1 }] })
  const result = ingestIfoodWebhook(envelope({
    id: 'evt_unmap',
    rawBody: body,
    signatureHeader: signIfoodPayload(body, creds.client_secret),
  }), c)
  assert.equal(result.status, 'dead_letter')
  assert.match(result.reason, /UNMAPPED_PRODUCT/)
})

test('COMBO_V2 maps slots; missing option incompatible', () => {
  const index = indexCatalogMap(catalog)
  const ok = mapComboV2('ifo_combo', { grp_main: 'ifo_burger', grp_drink: 'ifo_drink' }, combos, index)
  assert.equal(ok.combo_id, 'combo_1')
  assert.equal(ok.lines.length, 2)
  assert.throws(() => mapComboV2('ifo_combo', { grp_main: 'ifo_burger' }, combos, index))
})

test('combo shell cannot use simple item mapper', () => {
  const index = indexCatalogMap(catalog)
  assert.throws(() => mapIfoodItem('ifo_combo', 1, index))
})

test('partial status update without items accepted after PLC', () => {
  const c = ctx()
  assert.equal(ingestIfoodWebhook(envelope({ id: 'p1', code: 'PLC' }), c).status, 'accepted')
  const body = '{}'
  assert.equal(ingestIfoodWebhook(envelope({
    id: 'p2',
    code: 'CFM',
    rawBody: body,
    signatureHeader: signIfoodPayload(body, creds.client_secret),
  }), c).status, 'accepted')
})

test('reprocess remains idempotent', () => {
  const c = ctx()
  const e = envelope({ id: 'r1' })
  assert.equal(ingestIfoodWebhook(e, c).status, 'accepted')
  assert.equal(reprocessIfoodWebhook(e, c).status, 'duplicate')
})

test('IFOOD live flag stays forbidden helper', () => {
  assert.throws(() => assertIfoodDisabled({ IFOOD_ENABLED: 'true' }))
  assert.doesNotThrow(() => assertIfoodDisabled({ IFOOD_ENABLED: 'false' }))
})

test('duplicate catalog map rejected', () => {
  assert.throws(() => indexCatalogMap([
    { internal_variant_id: 'a', ifood_item_id: 'x', sku: '1' },
    { internal_variant_id: 'b', ifood_item_id: 'x', sku: '2' },
  ]))
})

test('mock OAuth issues token and validates expiry', async () => {
  const oauth = createMockOAuthClient({ ttlSeconds: 3600 })
  const token = await oauth.fetchToken(creds)
  assert.equal(token.token_type, 'Bearer')
  assert.equal(oauth.isTokenValid(token), true)
  assert.equal(oauth.isTokenValid({
    ...token,
    expires_at: new Date(Date.now() + 10_000).toISOString(),
  }), false)
})

test('polling fixture sorts and feeds ingest', async () => {
  const body = JSON.stringify({ items: [{ id: 'ifo_burger', quantity: 1 }] })
  const sig = signIfoodPayload(body, creds.client_secret)
  const empty = '{}'
  const emptySig = signIfoodPayload(empty, creds.client_secret)
  const poller = createFixturePoller([{
    events: [
      envelope({ id: 'poll_cfm', code: 'CFM', rawBody: empty, signatureHeader: emptySig, createdAt: '2026-09-21T12:01:00.000Z' }),
      envelope({ id: 'poll_plc', code: 'PLC', rawBody: body, signatureHeader: sig, createdAt: '2026-09-21T12:00:00.000Z' }),
    ],
    fetched_at: '2026-09-21T12:02:00.000Z',
  }])
  const page = await poller.poll({ merchant_id: creds.merchant_id, since: '2026-09-21T00:00:00.000Z' })
  const ordered = sortEventsForReplay(page.events)
  assert.equal(ordered[0].code, 'PLC')
  const c = ctx()
  for (const ev of ordered) {
    assert.equal(ingestIfoodWebhook(ev, c).status, 'accepted')
  }
})
