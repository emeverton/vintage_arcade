# F0: Discovery and Foundation Checklist

Scope note: technical bootstrap, synthetic commerce and delivery backoffice acceptance are separate from commercial launch. See phase-1-verification.md, phase-1b-verification.md and phase-1c-verification.md for tested SHAs and evidence.

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
- [x] Event contract draft, not complete live telemetry
- [x] Environment strategy, ADR-003
- [x] Local/CI secrets generation and validation
- [x] CI validation workflow, no deployment pipeline enabled
- [x] PostgreSQL and Redis provisioning in disposable CI
- [x] Local Compose recipe, not executed on the operator's computer
- [x] Medusa backend bootstrap with infrastructure providers
- [x] Internal delivery-incentive calculation with unit tests
- [x] Vertical-slice acceptance criteria documented

## Synthetic backend slice, Phase 1B
- [x] Clean npm ci installation with repaired and frozen lockfile
- [x] Delivery policy revisions persisted and tested
- [x] Scoped native calculated shipping provider
- [x] Component-sum combo definitions persisted and validated
- [x] Internal combo command with persisted idempotency
- [x] BRL major/minor amount conversion tested
- [x] Native cart, freight incentive and order workflow tested
- [x] System payment simulator, not an external PSP sandbox
- [x] Native order event consumed, persisted and deduplicated
- [x] Stale freight completion rejected in integration test
- [x] Historical 1B baseline: 88 unit tests and 11 commerce scenarios
- [x] Domain data backup/restore comparison in disposable CI
- [ ] Storefront integration and customer endpoint ownership controls
- [ ] Fixed-price combo discounts and complex food modifiers

## Delivery backoffice, Phase 1C
- [x] ADR-004: canonical active policy and transactional publication
- [x] Portuguese admin screen for existing Vintage shipping options
- [x] Rule draft, preview, explicit publication and rollback confirmation
- [x] Authenticated existing users and explicit module-level roles
- [x] Deny-by-default real-user grants, synthetic CI accounts only
- [x] Atomic active-policy/generation/audit transaction
- [x] Concurrent publication conflict and idempotent request replay
- [x] Audit-insert fault injection with complete publication rollback
- [x] Database rejects destructive managed-revision and audit changes
- [x] Native cart uses published policy without storefront deployment
- [x] Native browser session and publisher/viewer UI flows verified
- [x] Current suite: 127 unit tests, 11 commerce scenarios, 11 admin scenarios and 7 browser checks
- [x] Six custom tables restored and record hashes compared in CI
- [x] Operator guide and verification report versioned
- [ ] Initial shipping-option provisioning UI
- [ ] Dynamic grant management and global admin RBAC
- [ ] Quote validity, order policy snapshot and publication/checkout race acceptance
- [ ] All alternate shipping quotation endpoints and browser/device coverage
- [ ] Persistent client-side recovery of pending admin actions across page reloads

## Commercial and production gates
- [ ] Persistent staging database/runtime and production secret manager
- [ ] Remaining moderate dependency advisory resolved or security disposition approved
- [ ] Complete commerce vertical slice executed with approved business inputs
- [ ] PSP sandbox and iFood capabilities verified
- [ ] Transactional outbox/inbox and external-order reconciliation implemented
- [ ] Production backup, restore, deployment and rollback operational acceptance

## Gate

Technical PASS does not close Discovery. Unknown commercial rules and external capabilities remain explicit and live integrations remain disabled. No storefront, complete business-slice, iFood, permanent staging or production acceptance is implied by successful CI.
