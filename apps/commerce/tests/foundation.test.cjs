const { test } = require('node:test')
const assert = require('node:assert/strict')
const { quoteDeliveryIncentive: quote } = require('../.test-build/domain/delivery-incentive.js')
const { readEnvironment } = require('../.test-build/config/environment.js')
const base = { eligibleSubtotalMinor: 1700, quotedFeeMinor: 900, thresholdMinor: 4500, subsidyCapMinor: 900, zoneEligible: true, promotionActive: true }
const env = { APP_ENV: 'test', DATABASE_URL: 'postgres://test:test@localhost:5432/vintage_ci', REDIS_URL: 'redis://localhost:6379', JWT_SECRET: 'a'.repeat(64), COOKIE_SECRET: 'b'.repeat(64), STORE_CORS: 'http://localhost:3000', ADMIN_CORS: 'http://localhost:9000', AUTH_CORS: 'http://localhost:3000,http://localhost:9000' }

test('shows exact gap without prematurely subsidizing delivery', () => assert.deepEqual(quote(base), { status: 'progress', gapMinor: 2800, subsidyMinor: 0, finalFeeMinor: 900 }))
test('threshold is inclusive', () => assert.deepEqual(quote({ ...base, eligibleSubtotalMinor: 4500 }), { status: 'free_shipping', gapMinor: 0, subsidyMinor: 900, finalFeeMinor: 0 }))
test('one cent below threshold does not qualify', () => assert.equal(quote({ ...base, eligibleSubtotalMinor: 4499 }).gapMinor, 1))
test('above threshold qualifies', () => assert.equal(quote({ ...base, eligibleSubtotalMinor: 5000 }).finalFeeMinor, 0))
test('subsidy cap produces reduced freight, not false free freight', () => assert.deepEqual(quote({ ...base, eligibleSubtotalMinor: 4500, subsidyCapMinor: 500 }), { status: 'discounted', gapMinor: 0, subsidyMinor: 500, finalFeeMinor: 400 }))
test('subsidy never exceeds quoted fee', () => assert.equal(quote({ ...base, eligibleSubtotalMinor: 4500, subsidyCapMinor: 5000 }).subsidyMinor, 900))
for (const [name, changes] of [['ineligible zone', { zoneEligible: false }], ['inactive promotion', { promotionActive: false }], ['empty cart', { eligibleSubtotalMinor: 0 }], ['zero budget', { subsidyCapMinor: 0 }], ['already free', { quotedFeeMinor: 0 }]]) {
  test(name + ' does not advertise an incentive', () => assert.equal(quote({ ...base, ...changes }).status, 'unavailable'))
}
for (const [name, changes] of [['negative amount', { quotedFeeMinor: -1 }], ['fractional minor amount', { eligibleSubtotalMinor: 17.97 }], ['NaN', { quotedFeeMinor: NaN }], ['infinity', { subsidyCapMinor: Infinity }], ['unsafe integer', { thresholdMinor: Number.MAX_SAFE_INTEGER + 1 }], ['zero threshold', { thresholdMinor: 0 }], ['string flag', { promotionActive: 'true' }]]) {
  test(name + ' is rejected', () => assert.throws(() => quote({ ...base, ...changes })))
}
test('quote does not mutate input', () => { const frozen = Object.freeze({ ...base }); quote(frozen); assert.deepEqual(frozen, base) })
test('configuration accepts isolated test environment', () => assert.equal(readEnvironment(env).workerMode, 'shared'))
for (const [name, changes] of [['missing database', { DATABASE_URL: '' }], ['missing Redis', { REDIS_URL: '' }], ['wrong database scheme', { DATABASE_URL: 'https://localhost' }], ['short secret', { JWT_SECRET: 'short' }], ['same secrets', { COOKIE_SECRET: env.JWT_SECRET }], ['wildcard CORS', { STORE_CORS: '*' }], ['path in CORS', { STORE_CORS: 'http://localhost/shop' }], ['unsafe remote origin', { APP_ENV: 'staging' }], ['invalid worker', { MEDUSA_WORKER_MODE: 'invalid' }], ['iFood enabled prematurely', { IFOOD_ENABLED: 'true' }], ['live payments enabled', { PAYMENTS_LIVE_ENABLED: 'true' }], ['ads enabled', { ADS_EXPORT_ENABLED: 'true' }], ['test on railway', { APP_ENV: 'test', RAILWAY_ENVIRONMENT: 'production' }]]) {
  test(name + ' fails closed', () => assert.throws(() => readEnvironment({ ...env, ...changes })))
}
test('worker always disables admin', () => assert.equal(readEnvironment({ ...env, MEDUSA_WORKER_MODE: 'worker' }).adminDisabled, true))
test('staging accepts explicit HTTPS origins and vintage_staging database', () => assert.equal(readEnvironment({
  ...env,
  APP_ENV: 'staging',
  DATABASE_URL: 'postgres://test:test@private.railway.internal:5432/vintage_staging',
  STORE_CORS: 'https://shop.test',
  ADMIN_CORS: 'https://admin.test',
  AUTH_CORS: 'https://shop.test,https://admin.test',
  VINTAGE_STAGING_BASIC_USER: 'homolog',
  VINTAGE_STAGING_BASIC_PASSWORD: 's'.repeat(16),
}).appEnv, 'staging'))
test('staging rejects wrong database name', () => assert.throws(() => readEnvironment({
  ...env,
  APP_ENV: 'staging',
  DATABASE_URL: 'postgres://test:test@private.railway.internal:5432/railway',
  STORE_CORS: 'https://shop.test',
  ADMIN_CORS: 'https://admin.test',
  AUTH_CORS: 'https://shop.test,https://admin.test',
  VINTAGE_STAGING_BASIC_USER: 'homolog',
  VINTAGE_STAGING_BASIC_PASSWORD: 's'.repeat(16),
})))
