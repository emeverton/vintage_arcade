'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  createMockPaymentProvider,
  assertPaymentsLiveDisabled,
} = require('../.test-build/domain/payments/provider.js')
const {
  validateCommerceEvent,
  isAdsExportable,
  assertAdsExportDisabled,
} = require('../.test-build/domain/telemetry/commerce-events.js')
const { evaluateFunnelDrop } = require('../.test-build/domain/anomaly/rules.js')

test('mock PSP create/authorize/capture + idempotent session', () => {
  const psp = createMockPaymentProvider()
  const a = psp.createSession({ order_ref: 'o1', amount_minor: 2500, idempotency_key: 'k1' })
  const b = psp.createSession({ order_ref: 'o1', amount_minor: 2500, idempotency_key: 'k1' })
  assert.equal(a.id, b.id)
  assert.equal(psp.authorize(a.id).status, 'authorized')
  assert.equal(psp.capture(a.id).status, 'captured')
})

test('failed payment and timeout via webhook', () => {
  const psp = createMockPaymentProvider()
  const s = psp.createSession({ order_ref: 'o2', amount_minor: 1000, idempotency_key: 'k2' })
  assert.equal(psp.applyWebhook({ session_id: s.id, status: 'failed', event_id: 'wh1' }).status, 'failed')
  const s2 = psp.createSession({ order_ref: 'o3', amount_minor: 1000, idempotency_key: 'k3' })
  assert.equal(psp.applyWebhook({ session_id: s2.id, status: 'timed_out', event_id: 'wh2' }).status, 'timed_out')
  // idempotent webhook
  assert.equal(psp.applyWebhook({ session_id: s2.id, status: 'timed_out', event_id: 'wh2' }).status, 'timed_out')
})

test('observability sanitizer drops secrets', () => {
  const { sanitizeLogFields, formatCommerceLog } = require('../.test-build/domain/observability/log-context.js')
  const cleaned = sanitizeLogFields({
    correlation_id: 'abc',
    client_secret: 'should_not_appear',
    access_token: 'tok',
    retry_count: 2,
  })
  assert.equal(cleaned.correlation_id, 'abc')
  assert.equal(cleaned.retry_count, 2)
  assert.equal(cleaned.client_secret, undefined)
  assert.equal(cleaned.access_token, undefined)
  const line = formatCommerceLog('info', 'ingest', { webhook_id: 'w1', channel: 'ifood' })
  assert.match(line, /"webhook_id":"w1"/)
  assert.doesNotMatch(line, /secret/)
})

test('cancel and refund transitions', () => {
  const psp = createMockPaymentProvider()
  const s = psp.createSession({ order_ref: 'o4', amount_minor: 500, idempotency_key: 'k4' })
  assert.equal(psp.cancel(s.id).status, 'cancelled')
  const s2 = psp.createSession({ order_ref: 'o5', amount_minor: 500, idempotency_key: 'k5' })
  psp.authorize(s2.id)
  psp.capture(s2.id)
  assert.equal(psp.refund(s2.id).status, 'refunded')
})

test('PAYMENTS_LIVE stays disabled', () => {
  assert.throws(() => assertPaymentsLiveDisabled({ PAYMENTS_LIVE_ENABLED: 'true' }))
})

test('purchase requires payment_confirmed; order_created is not purchase', () => {
  assert.throws(() => validateCommerceEvent({
    name: 'purchase',
    event_id: 'evt_purchase_1',
    occurred_at: new Date().toISOString(),
  }))
  assert.doesNotThrow(() => validateCommerceEvent({
    name: 'purchase',
    event_id: 'evt_purchase_1',
    occurred_at: new Date().toISOString(),
    payment_confirmed: true,
  }))
  assert.equal(isAdsExportable({
    name: 'order_created',
    event_id: 'evt_order_1',
    occurred_at: new Date().toISOString(),
  }, true), false)
  assert.equal(isAdsExportable({
    name: 'purchase',
    event_id: 'evt_purchase_2',
    occurred_at: new Date().toISOString(),
    payment_confirmed: true,
  }, false), false)
})

test('ADS export flag helper', () => {
  assert.throws(() => assertAdsExportDisabled({ ADS_EXPORT_ENABLED: 'true' }))
})

test('anomaly requires sample + persistence; no arbitrary early flag', () => {
  const baseline = {
    channel: 'site', device: 'mobile', daypart: 'evening', campaign: 'none', stage: 'begin_checkout',
    successes: 40, attempts: 100, min_sample: 30,
  }
  const early = evaluateFunnelDrop(baseline, {
    successes: 5, attempts: 100, persistence_windows: 1, required_persistence: 2,
  }, 0.5)
  assert.equal(early.anomalous, false)
  assert.equal(early.reason, 'not_persistent')

  const flagged = evaluateFunnelDrop(baseline, {
    successes: 10, attempts: 100, persistence_windows: 2, required_persistence: 2,
  }, 0.5)
  assert.equal(flagged.anomalous, true)
  assert.ok(flagged.severity)
})

test('anomaly rejects tiny min_sample policy', () => {
  assert.throws(() => evaluateFunnelDrop({
    channel: 'site', device: 'mobile', daypart: 'evening', campaign: 'none', stage: 'purchase',
    successes: 5, attempts: 10, min_sample: 5,
  }, { successes: 1, attempts: 10, persistence_windows: 3, required_persistence: 2 }, 0.5))
})

test('Mercado Pago sandbox offline provider', () => {
  const {
    createMercadoPagoSandboxProvider,
    assertMercadoPagoSandboxOnly,
  } = require('../.test-build/domain/payments/mercadopago-sandbox.js')
  assert.throws(() => assertMercadoPagoSandboxOnly({ MERCADOPAGO_LIVE_ENABLED: 'true' }))
  assert.throws(() => createMercadoPagoSandboxProvider({
    access_token: 'TEST-xxxx', webhook_secret: 'whsec', offline: false,
  }))
  const mp = createMercadoPagoSandboxProvider({
    access_token: 'TEST-sandbox-token', webhook_secret: 'whsec', offline: true,
  })
  const s = mp.createSession({ order_ref: 'o_mp', amount_minor: 1990, idempotency_key: 'mp1' })
  assert.equal(s.provider, 'mercadopago_sandbox')
  assert.equal(mp.authorize(s.id).status, 'authorized')
  assert.equal(mp.capture(s.id).status, 'captured')
})
