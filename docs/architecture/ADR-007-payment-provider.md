# ADR-007 — Payment provider boundary

Status: Accepted (mock + Mercado Pago sandbox offline)  
Date: 2026-09-21 · updated 2026-09-22

## Decision

Payments are an adapter behind `PaymentProvider`. Vintage owns order state transitions; the PSP never becomes source of truth for catalog or delivery rules.

PSP inicial: **Mercado Pago** (sandbox Gate E).

## Defaults

- `PAYMENTS_LIVE_ENABLED=false`
- `MERCADOPAGO_LIVE_ENABLED=false`
- Mock + MP sandbox offline until credentials
- No live PSP until Gate H with explicit approval

## Code

- Contract + mock: `apps/commerce/src/domain/payments/provider.ts`
- Mercado Pago sandbox: `apps/commerce/src/domain/payments/mercadopago-sandbox.ts`
- Tests: `apps/commerce/tests/payments-telemetry-anomaly.test.cjs`

## Pending

| Item | Status |
| --- | --- |
| Sandbox credentials / webhook secret | PENDENTE |
| Pix / card methods | PENDENTE |
| Pay-on-delivery | PENDENTE |
| HTTP client against MP API | PENDENTE (Gate E) |
