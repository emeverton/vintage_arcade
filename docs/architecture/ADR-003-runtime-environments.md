# ADR-003: Runtime, isolation and infrastructure

Status: Accepted for the foundation branch. Staging and production releases remain gated.
Date: 2026-09-20

## Decision

Keep the current Next.js landing page at the repository root. Add an independently installed Medusa 2.21.0 application in `apps/commerce`; do not migrate the landing page or introduce a workspace migration in this step. Root TypeScript excludes that directory so backend source cannot contaminate the landing-page build. Its package manifest and lockfile are unchanged.

Use Node.js 22 LTS, PostgreSQL 17 and Redis 7.2 for this bootstrap. Medusa packages are aligned to the verified v2.21.0 release. The first successful CI run freezes the backend dependency graph in its own lockfile, on this branch only. Later installs use `npm ci`.

## Correction to the previous Redis deferral

Redis is not merely a future optimization in the chosen Medusa setup. It is configured for sessions, event delivery, workflow orchestration, caching and locks. PostgreSQL remains the transactional system of record. Queue persistence is not a substitute for a transactional outbox, inbox, idempotency or reconciliation, which remain gates for external-order processing.

Local development and disposable CI run a shared process. Persistent deployment must evaluate separate server/worker processes using the same release artifact and dedicated stores per environment. Backend hosting must support persistent Node.js processes; do not deploy it as a Next.js route or a request-limited function.

## Environment boundaries

- Local: loopback-only database ports, generated unique secrets, synthetic data.
- CI: ephemeral PostgreSQL/Redis; tests may write only to `vintage_ci`; no merchant credentials.
- Staging: separate database, Redis, secrets and restricted domain, to be provisioned after host/access confirmation.
- Production: separate stores, secret manager, HTTPS ingress, backup/restore, approved PSP/iFood capabilities, release and operational acceptance.

Do not point local or CI configuration to another client, shared production database or existing n8n instance. No cloud resources, DNS, billing or production deployments are authorized by the CI configuration.

## Commercial boundaries

The internal delivery module is an initial pure calculation, not a completed fulfillment provider. Inputs must come from trusted, server-recomputed eligible subtotal and validated delivery quote. Amounts in this module are BRL integer cents; Medusa money amounts require an explicit tested conversion at the integration boundary. No browser-supplied subtotal is authoritative.

Marketplace orders preserve their original monetary snapshot. Vintage promotions must not reprice an iFood order. iFood integration, live PSP transactions and advertising exports fail closed in this bootstrap.

## Verification gates

Unit/type checks; repeatable migrations; DB persistence and Redis lock; backend/admin build; liveness and readiness; Redis outage returns 503; isolated restore check; existing landing-page build. None of these proves a real customer checkout, iFood homologation or production readiness.

## Sources consulted

- https://docs.medusajs.com/learn/installation
- https://docs.medusajs.com/learn/deployment/general
- https://docs.medusajs.com/resources/infrastructure-modules/event/redis
- https://docs.medusajs.com/resources/infrastructure-modules/workflow-engine/redis
- https://docs.medusajs.com/resources/infrastructure-modules/locking/redis
- https://docs.medusajs.com/resources/infrastructure-modules/caching/providers/redis
- https://github.com/medusajs/medusa/releases/tag/v2.21.0
