# ADR-002 — Modular Monolith and Channel Adapters

Status: Accepted
Date: 2026-09-20

## Decision
Start as a modular monolith. External systems are isolated through adapters/anti-corruption layers.

## Initial boundaries
- Catalog & Modifiers
- Combo Engine
- Promotion Engine
- Cart Incentive Engine
- Delivery Engine
- Order Orchestration
- Channel Mapping
- Telemetry

## iFood
iFood is P0 but is never source of truth. Internal IDs remain canonical. Capabilities must be validated before bidirectional synchronization is enabled.

## Extraction rule
A module becomes an independent service only when measured requirements justify independent scaling, failure isolation, ownership, throughput or release cadence.
