# Phase 1 technical bootstrap: verification report

Date: 2026-09-20.
Verdict: PASS for the isolated technical bootstrap. NOT production or complete business-slice acceptance.
Repository: emeverton/vintage_arcade.
Branch: foundation/vintage-commerce-v1.

## Evidence and provenance

- Successful CI run: https://github.com/emeverton/vintage_arcade/actions/runs/35533165487
- Tested source commit: 1491ef4ac2832ca33029f0707da4223c160a8294.
- Foundation job: 106137389474, completed successfully.
- Initial lockfile-freeze job: 106137824666, completed successfully.
- Lockfile commit: 1892897dce9d1f7dc9b0d6dcfc8c629326b957ff.
- Verified lockfile blob SHA: 63708e8b9e17f7509710ebbfe4a912ca46429672.
- Verified lockfile SHA-256: 88b82b269102d996f961998836b570cf282027da3688b149731aa098122920ca.
- CI artifact: foundation-evidence, ID 10612127050.
- Downloaded artifact SHA-256: 88453f53b7802a96056b3630d8d12a8c60c18a57827071def4bd0c3cb6d5d2da.

The frozen lockfile is byte-identical to the graph installed by the successful run. This report and subsequent documentation do not imply that a later source commit has been retested. The exact tested SHA is recorded above. CI artifacts have a seven-day retention policy; this report preserves the outcome and hashes, not the complete logs.

## Implementation

An independent Medusa 2.21.0 backend now exists at apps/commerce. Node.js 22, PostgreSQL 17 and Redis 7.2 are the selected runtime lines. Redis providers cover events, workflows, locks and caching, and the project Redis URL is configured for sessions.

The initial Vintage delivery module calculates incentive gaps and capped shipping subsidies using validated BRL integer cents. It is internal, not a public pricing endpoint and not integrated with the customer cart yet. Rule persistence, the operator UI, modifiers, combos, PSP and channel integrations remain future increments.

## Executed checks

| Check | Result | Scope |
| --- | --- | --- |
| Unit tests | PASS, 34 tests, zero failures, zero skipped | Delivery incentives and environment validation; synthetic fixtures |
| Backend TypeScript | PASS | Full backend configuration, module, scripts and readiness route |
| Database migrations | PASS | Applied twice to disposable PostgreSQL; repeatable migration execution |
| Module integration | PASS | Synthetic sales-channel create/read/delete, Redis lock and custom delivery service |
| Medusa build | PASS | Backend and admin frontend |
| HTTP smoke | PASS | Compiled backend liveness, PostgreSQL/Redis readiness and anonymous admin rejection |
| Redis outage | PASS | Readiness returns HTTP 503 when Redis is stopped |
| Backup/restore smoke | PASS | pg_dump/pg_restore into a second disposable database; nonzero public-table count matches |
| Existing landing-page build | PASS | Original root Next.js application still builds |
| Dependency freezing | PASS | Successful CI graph committed only to the foundation branch |
| Cleanup | PASS | CI processes and containers stopped |

The restore check verifies restoration and table-count parity in test infrastructure. It is not a row-by-row production restore, production disaster-recovery exercise or RPO/RTO guarantee. Starting the compiled backend in CI is not a production-container deployment test.

## Corrections made during validation

1. Added the explicit worker-mode union to the validated environment type after the first full TypeScript run failed.
2. Masked ephemeral CI secrets before placing them in the runner environment.
3. Patched the audited Lodash/Ajv graph and aligned the Vite version with the Medusa admin bundler.
4. Installed root build dependencies with npm ci --include=dev so NODE_ENV=production does not omit Tailwind. Root application code and its dependency manifests were not changed to solve the CI issue.
5. Recorded Redis as part of the foundation in ADR-003, superseding its previous deferral.

## Security status

The successful run's npm audit --omit=dev result is zero critical, zero high and five moderate affected package entries. These five entries propagate from one UUID advisory through BullMQ and Medusa's Redis providers. They are not five independent confirmed application exploits.

Production security acceptance is OPEN. See dependency-review.md. No forced Medusa downgrade or untested major dependency override was applied.

## Preservation and boundaries

Main was read back at 2646129d3a944b3ae27346af7b2ab54312cf3115, unchanged from the initial audit. No merge, DNS change, cloud provisioning or production release was performed by this increment. Existing app/, public/, root package.json and root package-lock.json were preserved. The feature branch has only the required root TypeScript exclusion and ignore-rule changes in addition to backend, CI and documentation files.

PostgreSQL/Redis were provisioned and exercised in disposable GitHub Actions infrastructure. The local Compose recipe was written but not executed on the operator's computer. No persistent staging backend or customer-accessible backend URL was provisioned.

IFOOD_ENABLED, PAYMENTS_LIVE_ENABLED and ADS_EXPORT_ENABLED remain false and fail closed if prematurely enabled. No real merchant, customer, campaign or payment credentials were used.

## Next gate

Continue with approved real catalog/modifier/combination inputs, persisted delivery rules, server-recomputed cart totals, explicit money conversion, PSP sandbox order and durable event handling. Validate iFood permissions independently before enabling any channel operation. The current technical PASS does not close Discovery, the complete commerce vertical slice or launch readiness.
