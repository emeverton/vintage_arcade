# ADR-008 — Anomaly detection v1 (deterministic)

Status: Accepted  
Date: 2026-09-21

## Decision

Anomaly detection v1 uses **deterministic funnel rules** only: baseline by channel × device × daypart × campaign × stage, minimum sample ≥ 30, required persistence ≥ 2 windows, and an explicit relative drop against baseline. No arbitrary “10% = anomaly”, no ML in this phase.

## Code

- `apps/commerce/src/domain/anomaly/rules.ts`

## Non-goals

- Python/FastAPI intelligence services
- Streaming Kafka pipelines
- Auto-pausing ads without human gate
