# Observability — commerce

## Required context fields

| Field | Uso |
| --- | --- |
| correlation_id | Cruza webhook → ingest → order |
| order_id / cart_id / session_id | Jornada |
| channel | site / ifood / whatsapp / … |
| webhook_id | Dedup / auditoria |
| retry_count | Retries / DLQ |
| latency_ms | SLI |
| provider_response_class | 2xx / 4xx / 5xx / timeout (nunca body) |

## Implementation

- `apps/commerce/src/domain/observability/log-context.ts` — sanitize + JSON line
- iFood pipeline gera `correlation_id` por evento

## Proibido em logs

secrets · token completo · cartão · CVV · PII desnecessária · `client_secret`

## Sentry

Preparar DSN por ambiente no Gate D/E. Não ativar em produção LP sem decisão. Tags mínimas: `channel`, `app_env`, `correlation_id`.
