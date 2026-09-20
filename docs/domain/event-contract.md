# Canonical Event Contract — v0.1

## Required envelope
- event_id
- event_name
- event_version
- occurred_at
- session_id
- anonymous_id
- customer_id (optional)
- cart_id (optional)
- order_id (optional)
- channel
- source
- campaign_id (optional)
- attribution context
- value
- currency
- consent_state

## P0 events
- session_started
- menu_view
- product_view
- modifier_selected
- add_to_cart
- remove_from_cart
- cart_view
- incentive_shown
- incentive_accepted
- begin_checkout
- delivery_quote_requested
- delivery_quote_selected
- payment_attempt
- payment_failed
- purchase
- order_cancelled
- order_completed

## Rules
- event_id must be stable for browser/server deduplication.
- event_version is mandatory.
- click IDs and UTMs are preserved only when present and valid.
- purchase must correlate to canonical order_id.
- PII must be minimized.
