# Phase 1: executable infrastructure baseline

Baseline: foundation/vintage-commerce-v1, 2026-09-20.

## Scope of this increment

Independent Medusa backend; PostgreSQL/Redis local provisioning recipe; explicit environment validation; shared runtime; infrastructure providers; internal delivery module; liveness/readiness probes; CI and technical evidence. The current landing page remains at the root.

## Acceptance states

- Pure delivery/environment unit tests: executed locally, 34 passed, zero failed.
- Backend dependency install, full TypeScript, build, migrations, HTTP checks, Redis outage, isolated restore and existing LP build: must be evaluated from the linked CI run, not inferred from file creation.
- Persistent staging: not provisioned.
- Production: not changed by this increment.
- Complete business vertical slice: not passed.

## Business inputs still required

Real product and modifier exports; approved combo definitions; delivery zones/costs and subsidy budget; actual eligible subtotal policy; PSP selection and sandbox credentials; iFood application/merchant permissions and supported modules; existing conversion baselines and consent policy.

## Next acceptance slice

One real catalog item and combo, persisted delivery/promotion configuration, server-recomputed cart totals, PSP sandbox order, durable events and iFood mapping fixture. No launch until approved business inputs and connector capabilities are verified.
