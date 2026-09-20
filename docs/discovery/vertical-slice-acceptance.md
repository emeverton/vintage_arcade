# F1 Vertical Slice — Acceptance Criteria

Target flow:

1 real product
→ real modifiers
→ 1 real combo
→ cart
→ free-shipping threshold
→ delivery quote
→ sandbox checkout/payment
→ canonical order
→ canonical events
→ funnel dashboard
→ iFood mapper

## PASS criteria
- Product and modifier configuration require no storefront deploy.
- Combo supports explicit min/max slot rules.
- Cart recalculates price and delivery incentives deterministically.
- Free-shipping threshold exposes the remaining gap.
- Canonical order is persisted once for a logical checkout.
- Critical writes are idempotent.
- Events reconstruct add_to_cart → begin_checkout → purchase.
- iFood mapping never becomes the internal primary key.
- Integration failure is observable and retryable.
- No production traffic is changed by the slice.
