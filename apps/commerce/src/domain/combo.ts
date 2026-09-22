export interface ComboSlot { id: string; min: number; max: number; options: { variant_id: string; max_quantity: number }[] }
export interface ComboSpec { version: number; sales_channel_id: string; slots: ComboSlot[] }
export interface ComboSelection { slot_id: string; variant_id: string; quantity: number }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected object")
  return value as Record<string, unknown>
}
function text(value: unknown): asserts value is string {
  if (typeof value !== "string" || !value || value.length > 200) throw new Error("Invalid identifier")
}
function integer(value: unknown, min: number, max: number) {
  if (!Number.isSafeInteger(value) || Number(value) < min || Number(value) > max) throw new Error("Invalid quantity or limit")
}
export function parseComboSpec(value: unknown): ComboSpec {
  const p = object(value)
  integer(p.version, 1, 1000000); text(p.sales_channel_id)
  if (!Array.isArray(p.slots) || p.slots.length < 1 || p.slots.length > 20) throw new Error("Invalid slots")
  const ids = new Set<string>()
  for (const raw of p.slots) {
    const slot = object(raw); text(slot.id)
    if (ids.has(slot.id)) throw new Error("Duplicate slot")
    ids.add(slot.id); integer(slot.min, 0, 20); integer(slot.max, 1, 20)
    if (Number(slot.min) > Number(slot.max)) throw new Error("Reversed slot limits")
    if (!Array.isArray(slot.options) || slot.options.length < 1 || slot.options.length > 100) throw new Error("Invalid options")
    const variants = new Set<string>()
    let capacity = 0
    for (const rawOption of slot.options) {
      const option = object(rawOption); text(option.variant_id); integer(option.max_quantity, 1, 20)
      if (variants.has(option.variant_id)) throw new Error("Duplicate option")
      variants.add(option.variant_id); capacity += Number(option.max_quantity)
    }
    if (capacity < Number(slot.min)) throw new Error("Unsatisfiable slot")
  }
  return p as unknown as ComboSpec
}

/** Component-sum pricing only in this increment. Prices are always resolved by Medusa. */
export function expandCombo(value: unknown, input: unknown, salesChannelId: string): ComboSelection[] {
  const spec = parseComboSpec(value)
  if (spec.sales_channel_id !== salesChannelId) throw new Error("Combo channel mismatch")
  if (!Array.isArray(input) || input.length > 50) throw new Error("Invalid selections")
  const selections: ComboSelection[] = []
  const seen = new Set<string>()
  for (const raw of input) {
    const choice = object(raw)
    if (Object.keys(choice).some((k) => !["slot_id", "variant_id", "quantity"].includes(k))) throw new Error("Unsupported selection fields, prices cannot be supplied")
    text(choice.slot_id); text(choice.variant_id); integer(choice.quantity, 1, 20)
    const slot = spec.slots.find((s) => s.id === choice.slot_id)
    const option = slot?.options.find((o) => o.variant_id === choice.variant_id)
    if (!slot || !option || Number(choice.quantity) > option.max_quantity) throw new Error("Ineligible choice")
    const key = JSON.stringify([choice.slot_id, choice.variant_id])
    if (seen.has(key)) throw new Error("Duplicate choice")
    seen.add(key)
    selections.push({ slot_id: choice.slot_id, variant_id: choice.variant_id, quantity: Number(choice.quantity) })
  }
  for (const slot of spec.slots) {
    const total = selections.filter((s) => s.slot_id === slot.id).reduce((n, s) => n + s.quantity, 0)
    if (total < slot.min || total > slot.max) throw new Error(`Slot ${slot.id} limits not met`)
  }
  return selections.sort((a, b) => a.slot_id.localeCompare(b.slot_id) || a.variant_id.localeCompare(b.variant_id))
}
