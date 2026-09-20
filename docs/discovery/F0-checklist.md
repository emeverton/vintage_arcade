# F0 — Discovery & Foundation Checklist

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

## Foundation
- [x] ADR-001 stack
- [x] ADR-002 modular monolith/adapters
- [x] Canonical domain draft
- [x] Event contract draft
- [ ] Environment strategy
- [ ] CI/CD strategy
- [ ] Secrets strategy
- [ ] Database provisioning
- [ ] Medusa bootstrap
- [ ] Vertical-slice acceptance criteria

## Gate
F0 passes only when unknown external capabilities and business rules are explicitly resolved or isolated behind feature flags.
