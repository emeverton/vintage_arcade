const { test } = require('node:test')
const assert = require('node:assert/strict')
const { isolatedCiCookieOptions } = require('../.test-build/domain/ci-cookie-options')
const ci = {APP_ENV:'test',GITHUB_ACTIONS:'true',DATABASE_URL:'postgres://qa:qa@localhost:5432/vintage_ci'}
test('native HTTP session override only on disposable local CI',()=>assert.deepEqual(isolatedCiCookieOptions(ci),{sameSite:'lax',secure:false,httpOnly:true}))
for(const patch of [{APP_ENV:'production'},{APP_ENV:'staging'},{APP_ENV:'local'},{APP_ENV:undefined},{GITHUB_ACTIONS:undefined},{GITHUB_ACTIONS:'false'},{DATABASE_URL:'postgres://remote.example/vintage_ci'},{DATABASE_URL:'postgres://localhost/vintage_production'},{DATABASE_URL:'invalid'}]) test(`retain secure cookie defaults ${JSON.stringify(patch)}`,()=>assert.equal(isolatedCiCookieOptions({...ci,...patch}),undefined))
