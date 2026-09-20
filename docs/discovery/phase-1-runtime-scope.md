# Phase 1: executable infrastructure baseline

Baseline: foundation/vintage-commerce-v1, 2026-09-20.

## Scope of this increment

Independent Medusa backend; PostgreSQL/Redis local provisioning recipe; explicit environment validation; shared runtime; infrastructure providers; internal delivery module; liveness/readiness probes; CI and technical evidence. The current landing page remains at the root.

## Acceptance states

- Technical bootstrap: PASS in CI run 35533165487 at source commit 1491ef4ac2832ca33029f0707da4223c160a8294.
- Unit tests: 34 passed, zero failed and zero skipped.
- Full backend TypeScript, repeatable migrations, DB persistence, Redis lock, backend/admin build, HTTP checks, Redis outage, isolated restore and existing LP build: PASS.
- Backend dependency graph: frozen from the successful CI artifact, verified by blob hash.
- Persistent staging: not provisioned.
- Production: no merge, provisioning or release performed.
- Complete business vertical slice: not passed.
- Security gate: one remaining UUID advisory propagates to five moderate runtime-audit entries; zero high or critical entries in this audit only.

See phase-1-verification.md for exact commits, artifact hashes and limitations. Technical success is not proof of a real checkout or iFood homologation.

## Business inputs still required

Real product and modifier exports; approved combo definitions; delivery zones/costs and subsidy budget; actual eligible subtotal policy; PSP selection and sandbox credentials; iFood application/merchant permissions and supported modules; existing conversion baselines and consent policy.

## Next acceptance slice

One real catalog item and combo, persisted delivery/promotion configuration, server-recomputed cart totals, PSP sandbox order, durable events and iFood mapping fixture. No launch until approved business inputs, security gates and connector capabilities are verified.
