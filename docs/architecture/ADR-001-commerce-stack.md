# ADR-001 — Vintage Commerce Stack

Status: Accepted
Date: 2026-09-20

## Decision
Vintage Commerce v1 uses a TypeScript-first modular monolith:
- Storefront: Next.js
- Commerce kernel: Medusa v2
- Vintage food domain: custom TypeScript modules/workflows
- Transactional database: PostgreSQL
- External channels: adapters, iFood first
- Product analytics: PostHog
- Marketing measurement: GA4/GTM, Meta CAPI and Google Ads where applicable
- Automation: n8n only for peripheral orchestration
- Edge/security: Cloudflare
- Observability: Sentry, structured logs and health metrics
- Future intelligence: Python/FastAPI only when data/workload justify it

## Architecture rule
Vintage owns the commerce logic. Channels distribute it. Data measures it. Intelligence optimizes it.

## Constraints
No Kubernetes, Kafka, microservices, multi-tenant SaaS, native app, advanced ML or custom payment vault in P0.

## Why not Django in the transactional core
Django is capable, but would require implementing and maintaining commerce primitives already provided by Medusa. Python remains reserved for future analytics and intelligence workloads.

## Change policy
This ADR is changed only by a new ADR with explicit technical or business evidence.
