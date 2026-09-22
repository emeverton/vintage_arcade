# Canonical Domain Model — Draft v0.1

This is the discovery baseline, not a final database schema.

## Product
- id
- name
- description
- status
- category_id
- variants
- availability
- channel_mappings

## ModifierGroup
- id
- name
- min
- max
- required
- options

## ModifierOption
- id
- name
- price_delta
- availability

## Combo
- id
- name
- base_price
- slots
- availability
- channels

## ComboSlot
- id
- min
- max
- eligible_products
- surcharge_rules

## Cart
- id
- session/customer
- items
- subtotal
- discounts
- delivery_quote
- incentives
- total

## DeliveryRule
- id
- zone/criteria
- minimum_order
- base_fee
- free_shipping_threshold
- discount/subsidy
- availability_window

## Order
- id
- source_channel
- external_order_id
- customer
- items/modifiers
- discounts
- delivery
- payment
- totals
- attribution_context
- status
- timestamps

## ChannelMapping
- internal_entity_id
- channel
- external_id
- sync_version
- last_synced_at
- sync_status
