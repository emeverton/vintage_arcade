# Canonical Event Contract — v0.2

Aligned with `apps/commerce/src/domain/telemetry/commerce-events.ts`.

## Required envelope
- event_id (stable for browser/server dedup)
- name / event_name
- occurred_at
- session_id (optional)
- cart_id (optional)
- order_id (optional)
- channel (optional)
- correlation_id (optional)
- payment_confirmed (required **true** for `purchase`)

## P0 commerce events (implemented names)

| Event | Notes |
| --- | --- |
| view_item | |
| add_to_cart | |
| remove_from_cart | |
| view_cart | |
| begin_checkout | |
| add_payment_info | |
| purchase | **Only** after payment confirmed |
| order_created | **Internal** — never treat as purchase / Ads export |
| delivery_threshold_seen | |
| delivery_threshold_reached | |
| coupon_applied | |
| checkout_error | |

## Rules

- `order_created` ≠ `purchase`
- Ads export (`ADS_EXPORT_ENABLED`) only for `purchase` with `payment_confirmed=true`
- Default: `ADS_EXPORT_ENABLED=false` while synthetic/staging
- Minimize PII; never log secrets
- Prepare sinks: GA4, Meta CAPI, Google Ads enhanced/offline (when valid), PostHog

## Feature flags

```
ADS_EXPORT_ENABLED=false
```
