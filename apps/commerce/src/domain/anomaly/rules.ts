/**
 * Deterministic anomaly rules v1 — no ML, no arbitrary 10% thresholds.
 * Requires explicit baseline, minimum sample, persistence window, and severity.
 */

export type AnomalySeverity = "info" | "warning" | "critical"

export interface FunnelBaseline {
  channel: string
  device: string
  daypart: "morning" | "afternoon" | "evening" | "night"
  campaign: string
  stage: string
  /** Successful conversions in baseline window */
  successes: number
  /** Attempts in baseline window */
  attempts: number
  /** Minimum attempts before evaluation */
  min_sample: number
}

export interface FunnelObservation {
  successes: number
  attempts: number
  /** Consecutive evaluation windows below threshold */
  persistence_windows: number
  /** Required consecutive windows below threshold */
  required_persistence: number
}

export interface AnomalyVerdict {
  anomalous: boolean
  severity: AnomalySeverity | null
  reason: string
  baseline_rate: number | null
  observed_rate: number | null
}

function rate(successes: number, attempts: number): number {
  if (!Number.isSafeInteger(successes) || !Number.isSafeInteger(attempts) || successes < 0 || attempts < 0) {
    throw new Error("Invalid counts")
  }
  if (attempts === 0) return 0
  if (successes > attempts) throw new Error("successes > attempts")
  return successes / attempts
}

/**
 * Flag when observed rate falls by at least `relative_drop` of baseline
 * AND sample floors are met AND persistence requirement is met.
 * relative_drop is a fraction of baseline (e.g. 0.5 = half the baseline rate).
 */
export function evaluateFunnelDrop(
  baseline: FunnelBaseline,
  observation: FunnelObservation,
  relative_drop: number
): AnomalyVerdict {
  if (!(relative_drop > 0 && relative_drop < 1)) throw new Error("relative_drop must be in (0,1)")
  if (baseline.min_sample < 30) throw new Error("min_sample must be >= 30")
  if (observation.required_persistence < 2) throw new Error("required_persistence must be >= 2")

  if (baseline.attempts < baseline.min_sample || observation.attempts < baseline.min_sample) {
    return {
      anomalous: false,
      severity: null,
      reason: "insufficient_sample",
      baseline_rate: null,
      observed_rate: null,
    }
  }

  const baseline_rate = rate(baseline.successes, baseline.attempts)
  const observed_rate = rate(observation.successes, observation.attempts)
  if (baseline_rate === 0) {
    return { anomalous: false, severity: null, reason: "zero_baseline", baseline_rate, observed_rate }
  }

  const floor = baseline_rate * (1 - relative_drop)
  const below = observed_rate <= floor
  if (!below) {
    return { anomalous: false, severity: null, reason: "within_band", baseline_rate, observed_rate }
  }
  if (observation.persistence_windows < observation.required_persistence) {
    return {
      anomalous: false,
      severity: null,
      reason: "not_persistent",
      baseline_rate,
      observed_rate,
    }
  }

  const dropRatio = 1 - observed_rate / baseline_rate
  const severity: AnomalySeverity = dropRatio >= 0.75 ? "critical" : dropRatio >= 0.5 ? "warning" : "info"
  return {
    anomalous: true,
    severity,
    reason: "persistent_funnel_drop",
    baseline_rate,
    observed_rate,
  }
}
