# ADR-006 — iFood Adapter (anti-corruption)

Status: Accepted (implementation: mocks + domain contracts)  
Date: 2026-09-21

## Decision

iFood is a **distribution channel**, never source of truth. Vintage catalog, pricing, combos, and order state remain canonical. An anti-corruption layer maps iFood payloads ↔ internal IDs.

## Defaults

- `IFOOD_ENABLED=false` (enforced by `readEnvironment` and adapter helpers)
- No live OAuth or merchant calls without Gate F homologation
- Webhooks validated with HMAC-SHA256 (`X-IFood-Signature`)
- Idempotency by event id; out-of-sequence and unmapped products → dead-letter
- Retries with bounded max; timeout exhaustion → dead-letter
- COMBO_V2 requires explicit slot_map; nested combos rejected

## Code

- `apps/commerce/src/domain/channels/ifood/*` (signature, catalog, COMBO_V2, pipeline, OAuth mock, polling fixture)
- Tests: `apps/commerce/tests/ifood-adapter.test.cjs`

## Still requires credentials / merchant homologation

| Item | Status |
| --- | --- |
| client_id / client_secret | PENDENTE |
| merchant_id real | PENDENTE |
| OAuth token lifecycle | PENDENTE (mock client ready) |
| Catalog sync bidirectional | PENDENTE (mapping only) |
| Polling fallback against live API | PENDENTE (fixture poller ready; HTTP client not live) |
| Production webhook endpoint | PENDENTE |

## Non-goals

- Enabling live orders
- Using iFood prices as authoritative
- Shipping Ads conversions from synthetic events
