# ADR-007 — Payment provider boundary

Status: Accepted (mock adapter)  
Date: 2026-09-21

## Decision

Payments are an adapter behind `PaymentProvider`. Vintage owns order state transitions; the PSP never becomes source of truth for catalog or delivery rules.

## Defaults

- `PAYMENTS_LIVE_ENABLED=false`
- Mock provider: create → authorize → capture; cancel; refund; webhook with event idempotency
- Partial refund unsupported in mock
- No live PSP until Gate E (sandbox) / Gate H (live) with explicit approval

## Code

- `apps/commerce/src/domain/payments/provider.ts`
- Tests: `apps/commerce/tests/payments-telemetry-anomaly.test.cjs`

## Pending commercial choice

| Item | Status |
| --- | --- |
| PSP vendor | PENDENTE |
| Pix / card methods | PENDENTE |
| Pay-on-delivery | PENDENTE |
| Sandbox credentials | PENDENTE |
