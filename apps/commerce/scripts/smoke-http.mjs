import assert from 'node:assert/strict'
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:9000'
const mode = process.argv[2] || 'ready'
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new Error('Bootstrap smoke is restricted to loopback')
async function request(path) { return fetch(base + path, { signal: AbortSignal.timeout(5000), redirect: 'manual' }) }
if (mode === 'unready') {
  const response = await request('/health/ready')
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { status: 'not_ready' })
} else {
  let ready = false
  for (let i = 0; i < 60; i++) {
    try { if ((await request('/health')).status === 200) { ready = true; break } } catch {}
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  assert.equal(ready, true, 'Medusa failed to become live')
  const response = await request('/health/ready')
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: 'ready', checks: { postgres: 'ok', redis: 'ok' } })
  assert.equal((await request('/admin/users/me')).status, 401, 'Admin must reject anonymous requests')
}
console.log(`FOUNDATION_HTTP_SMOKE_PASS: ${mode}`)
