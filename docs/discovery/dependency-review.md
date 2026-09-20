# Dependency review, foundation increment

Date: 2026-09-20.
Status: not production security acceptance.

## Verified graph

The patched graph, audited with npm audit --omit=dev, reports zero critical, zero high and five moderate affected package entries. These five entries propagate from one UUID advisory; they are not five independent confirmed exploitable flaws in Vintage.

Affected chain: @medusajs/medusa -> Redis event/workflow providers -> bullmq -> uuid.
Root advisory: GHSA-w5hq-g745-h8pq, missing output-buffer bounds checks in the v3/v5/v6 APIs. Reachability and the upgrade path remain a release gate. This bootstrap's integration tests do not establish whether the vulnerable path can be reached through future business features.

The initial template graph reported 75 affected package entries (68 high, 7 moderate, zero critical). Counts include dependency propagation, not independently established application vulnerabilities.

## Targeted changes applied

- Align direct Vite to 7.3.6, also used by Medusa 2.21's admin bundler, instead of the starter's legacy Vite 5.
- Override Lodash to 4.18.1, above the advisory fix in 4.18.0.
- Override Ajv to 8.18.0 within the same major line.

Do not run npm audit fix --force: the suggested Medusa 1 downgrade does not preserve the approved v2 architecture. Do not force a major UUID or queue-engine override without integration coverage. Remaining findings must be resolved or receive documented, evidence-backed security disposition before production.

Review overrides at every Medusa upgrade and remove them when upstream constraints naturally resolve patched versions. Audit counts are time-sensitive; the CI artifact is the source for the evaluated graph. No clean-runtime-audit claim is made for build-only dependencies, the root landing page or the eventual production image.

## Evidence

See phase-1-verification.md and the runtime-audit.json artifact from the linked workflow. No merchant credentials or customer data were used.

## References

- https://github.com/advisories/GHSA-w5hq-g745-h8pq
- https://github.com/advisories/GHSA-r5fr-rjxr-66jc
- https://github.com/advisories/GHSA-f23m-r3pf-42rh
- https://github.com/advisories/GHSA-2g4f-4pwh-qvx6
