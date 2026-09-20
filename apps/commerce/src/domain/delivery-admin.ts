export class DeliveryAdminError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message) }
}
export type DeliveryRole = "viewer" | "editor" | "publisher"
export type DeliveryAction = "read" | "preview" | "draft" | "publish" | "rollback"
export const editablePolicyFields = ["postal_code_from", "postal_code_to", "minimum_order_minor", "base_fee_minor", "threshold_minor", "subsidy_cap_minor", "enabled", "promotion_active", "starts_at", "ends_at"] as const
export function requireDeliveryRole(actorId: string | undefined, action: DeliveryAction, env: Record<string, string | undefined>): DeliveryRole {
  if (!actorId) throw new DeliveryAdminError(401, "AUTH_REQUIRED", "Autenticação necessária.")
  let role: DeliveryRole | undefined
  for (const item of ["viewer", "editor", "publisher"] as const) {
    const entries = (env[`VINTAGE_DELIVERY_${item.toUpperCase()}_IDS`] || "").split(",").map((s) => s.trim()).filter(Boolean)
    if (entries.some((id) => !/^user_[A-Za-z0-9_-]{1,100}$/.test(id))) throw new Error("Invalid server-side delivery permission configuration")
    if (entries.includes(actorId)) role = item
  }
  if (!role || ((action === "publish" || action === "rollback") && role !== "publisher") || (action === "draft" && role === "viewer")) throw new DeliveryAdminError(403, "DELIVERY_FORBIDDEN", "Sem permissão para esta operação de entrega.")
  return role
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new DeliveryAdminError(400, "INVALID_BODY", "Corpo da requisição inválido.")
  return value as Record<string, unknown>
}
export function exactFields(value: Record<string, unknown>, allowed: readonly string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw new DeliveryAdminError(400, "UNKNOWN_FIELD", "Campo não permitido.")
}
export interface DeliveryCommand {
  request_id: string
  expected_generation: number
  reason: string
  changes?: Record<string, unknown>
  rule_id?: string | null
}
export function parseDeliveryCommand(value: unknown, action: "draft" | "publish" | "rollback"): DeliveryCommand {
  const body = record(value)
  exactFields(body, ["request_id", "expected_generation", "reason", ...(action === "draft" ? ["changes"] : ["rule_id"])])
  if (typeof body.request_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(body.request_id)) throw new DeliveryAdminError(400, "INVALID_REQUEST_ID", "Identificador da operação inválido.")
  if (!Number.isSafeInteger(body.expected_generation) || Number(body.expected_generation) < 0) throw new DeliveryAdminError(400, "INVALID_GENERATION", "Geração inválida.")
  if (typeof body.reason !== "string" || body.reason.trim().length < 5 || body.reason.length > 500) throw new DeliveryAdminError(400, "REASON_REQUIRED", "Descreva o motivo em 5 a 500 caracteres.")
  if (action === "draft") {
    const changes = record(body.changes)
    exactFields(changes, editablePolicyFields)
    if (!Object.keys(changes).length) throw new DeliveryAdminError(400, "EMPTY_DRAFT", "Informe ao menos uma alteração.")
  } else if (!(typeof body.rule_id === "string" && /^vdr_[A-Za-z0-9_-]{1,100}$/.test(body.rule_id)) && !(action === "rollback" && body.rule_id === null)) {
    throw new DeliveryAdminError(400, "INVALID_REVISION", "Revisão inválida.")
  }
  return { ...body, reason: body.reason.trim() } as unknown as DeliveryCommand
}
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`
  return JSON.stringify(value)
}
