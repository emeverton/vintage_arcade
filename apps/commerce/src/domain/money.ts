/** BRL boundary: Medusa v2 uses major units; Vintage policies use integer cents. */
export function assertMinor(value: unknown): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > 1_000_000_000) {
    throw new Error("Invalid non-negative BRL minor amount")
  }
}

export function medusaToMinor(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") {
    if (!value || typeof value !== "object" || !("toString" in value)) throw new Error("Missing monetary amount")
    value = String(value)
  }
  if (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value)) throw new Error("Invalid monetary decimal")
  const scaled = Number(value) * 100
  const minor = Math.round(scaled)
  if (!Number.isFinite(scaled) || Math.abs(scaled - minor) > 0.000001) throw new Error("Sub-cent amount requires explicit rounding policy")
  assertMinor(minor)
  return minor
}

export function minorToMedusa(value: number): number {
  assertMinor(value)
  return value / 100
}
