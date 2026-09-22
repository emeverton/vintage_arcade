const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  isIsolatedPreviewEnv,
  rejectTestEnvOnHostedInfrastructure,
  assertStagingDatabase,
  assertStagingHomologatorGate,
  validatePreviewOriginUrl,
  validatePreviewBackendUrl,
  authorizeStagingBasic,
} = require('../.test-build/domain/staging-runtime')

test('isolated preview envs', () => {
  assert.equal(isIsolatedPreviewEnv('local'), true)
  assert.equal(isIsolatedPreviewEnv('test'), true)
  assert.equal(isIsolatedPreviewEnv('staging'), true)
  assert.equal(isIsolatedPreviewEnv('production'), false)
})

test('test env blocked on Railway markers', () => {
  assert.throws(() => rejectTestEnvOnHostedInfrastructure({ APP_ENV: 'test', RAILWAY_ENVIRONMENT: 'staging' }))
  assert.doesNotThrow(() => rejectTestEnvOnHostedInfrastructure({ APP_ENV: 'test' }))
  assert.doesNotThrow(() => rejectTestEnvOnHostedInfrastructure({ APP_ENV: 'staging', RAILWAY_ENVIRONMENT: 'staging' }))
})

test('staging database name enforced', () => {
  assert.throws(() => assertStagingDatabase({ APP_ENV: 'staging', DATABASE_URL: 'postgres://u:p@host/railway' }))
  assert.doesNotThrow(() => assertStagingDatabase({ APP_ENV: 'staging', DATABASE_URL: 'postgres://u:p@host/vintage_staging' }))
  assert.doesNotThrow(() => assertStagingDatabase({ APP_ENV: 'local', DATABASE_URL: 'postgres://u:p@localhost/vintage_local' }))
})

test('homologator credentials required on staging', () => {
  assert.throws(() => assertStagingHomologatorGate({ APP_ENV: 'staging', VINTAGE_STAGING_BASIC_USER: 'qa', VINTAGE_STAGING_BASIC_PASSWORD: 'short' }))
  assert.throws(() => assertStagingHomologatorGate({ APP_ENV: 'staging', VINTAGE_STAGING_BASIC_USER: 'qa', VINTAGE_STAGING_BASIC_PASSWORD: 'passwordpassword' }))
  assert.doesNotThrow(() => assertStagingHomologatorGate({ APP_ENV: 'staging', VINTAGE_STAGING_BASIC_USER: 'homolog', VINTAGE_STAGING_BASIC_PASSWORD: 'x'.repeat(16) }))
})

test('staging origin must be https non-loopback', () => {
  assert.throws(() => validatePreviewOriginUrl(new URL('http://localhost:3000/'), 'staging'))
  assert.throws(() => validatePreviewOriginUrl(new URL('https://127.0.0.1/'), 'staging'))
  assert.doesNotThrow(() => validatePreviewOriginUrl(new URL('https://storefront-staging.up.railway.app/'), 'staging'))
})

test('staging backend accepts private railway http', () => {
  assert.doesNotThrow(() => validatePreviewBackendUrl(new URL('http://commerce-staging.railway.internal:9000/'), 'staging'))
  assert.doesNotThrow(() => validatePreviewBackendUrl(new URL('https://commerce-staging.up.railway.app/'), 'staging'))
  assert.throws(() => validatePreviewBackendUrl(new URL('http://example.com/'), 'staging'))
  assert.throws(() => validatePreviewBackendUrl(new URL('http://localhost:9000/'), 'staging'))
})

test('basic auth gate compares credentials safely', () => {
  const env = { VINTAGE_STAGING_BASIC_USER: 'homolog', VINTAGE_STAGING_BASIC_PASSWORD: 'x'.repeat(16) }
  const ok = 'Basic ' + Buffer.from('homolog:' + 'x'.repeat(16)).toString('base64')
  const bad = 'Basic ' + Buffer.from('homolog:yyyyyyyyyyyyyyyy').toString('base64')
  assert.equal(authorizeStagingBasic(ok, env), true)
  assert.equal(authorizeStagingBasic(bad, env), false)
  assert.equal(authorizeStagingBasic(null, env), false)
})
