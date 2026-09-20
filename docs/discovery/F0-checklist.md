# F0: Discovery and Foundation Checklist

Scope note: the technical bootstrap is separate from the complete business vertical slice. See phase-1-verification.md for evidence and release limits.

## Current operation
- [ ] Export current menu/catalog
- [ ] Identify current ordering provider and contract constraints
- [ ] Map categories, products and variants
- [ ] Map modifier groups and options
- [ ] Map all active combos
- [ ] Map availability windows
- [ ] Map current promotions
- [ ] Map delivery zones, fees, minimums and ETA logic
- [ ] Map pickup flow
- [ ] Map payment methods and PSP
- [ ] Map cancellation/refund flow

## iFood capability matrix
- [ ] Application/merchant access
- [ ] OAuth credentials
- [ ] Catalog module availability
- [ ] Order module availability
- [ ] Events consumption mode
- [ ] Webhook capability
- [ ] Catalog write capability
- [ ] COMBO_V2 capability
- [ ] Order actions capability
- [ ] Rate limits and operational constraints
- [ ] Reconciliation strategy

## Measurement baseline
- [ ] Current GA4/GTM state
- [ ] Meta Pixel/CAPI state
- [ ] Google Ads conversion state
- [ ] Current funnel events
- [ ] Current source/UTM persistence
- [ ] Current add-to-cart, checkout and purchase baseline
- [ ] Delivery fee distribution
- [ ] AOV baseline
- [ ] Payment failure baseline

## Technical foundation
- [x] ADR-001 stack
- [x] ADR-002 modular monolith/adapters
- [x] Canonical domain draft, not final persistence schema
- [x] Event contract draft, not live telemetry
- [x] Environment strategy, ADR-003
- [x] Local/CI secrets generation and validation
- [x] CI validation workflow, no deployment pipeline enabled
- [x] PostgreSQL and Redis provisioning in disposable CI
- [x] Local Compose recipe, not executed against a developer's computer
- [x] Medusa backend bootstrap with infrastructure providers
- [x] Internal delivery-incentive calculation with unit tests
- [x] Vertical-slice acceptance criteria documented
- [ ] Persistent staging database/runtime and production secret manager
- [ ] Remaining moderate dependency advisory resolved or security disposition approved
- [ ] Complete commerce vertical slice executed with approved business inputs
- [ ] PSP sandbox and iFood capabilities verified
- [ ] Transactional outbox/inbox and external-order reconciliation implemented
- [ ] Production backup, restore, deployment and rollback operational acceptance

## Gate

The bootstrap does not close Discovery. Unknown business rules and external capabilities remain explicit and live integrations remain disabled. No complete business-slice, iFood, staging or production acceptance is implied by successful CI.
