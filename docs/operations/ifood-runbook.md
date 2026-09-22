# Runbook — iFood channel (mocks / future live)

## Defaults

`IFOOD_ENABLED=false`. Never enable without Gate F approval.

## Local / CI verification

```bash
cd apps/commerce && npm run test:unit
# includes ifood-adapter.test.cjs
```

## Ingest outcomes

| status | meaning | action |
| --- | --- | --- |
| accepted | mapped & sequenced | continue |
| duplicate | same event_id | no-op |
| rejected | bad signature / merchant | investigate client |
| retry | transient timeout | backoff |
| dead_letter | OOS / unmapped / timeout exhausted | recover via DLQ tool (future) |

## Recovery (future live)

1. Pull DLQ by correlation_id  
2. Fix mapping or sequence  
3. Reprocess with same event_id (idempotent)  
4. Polling fallback only if webhook lag confirmed  

## Secrets

Rotate client_secret; never log tokens. Use `sanitizeLogFields`.
