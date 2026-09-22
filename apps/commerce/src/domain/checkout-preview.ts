import { assertStagingDatabase, assertStagingHomologatorGate, isIsolatedPreviewEnv, rejectTestEnvOnHostedInfrastructure, validatePreviewBackendUrl, validatePreviewOriginUrl } from "./staging-runtime"

/** Synthetic checkout only. Production remains blocked. Staging requires explicit HTTPS + homologator gate. */
export function checkoutPreviewEnabled(env: Record<string, string | undefined>): boolean {
  const flag = env.VINTAGE_CHECKOUT_PREVIEW_ENABLED
  if (flag !== undefined && flag !== "true" && flag !== "false") throw new Error("Invalid checkout preview flag")
  if (flag !== "true") return false
  rejectTestEnvOnHostedInfrastructure(env)
  if (!isIsolatedPreviewEnv(env.APP_ENV) || env.VINTAGE_SLICE_ENABLED !== "true") {
    throw new Error("Checkout preview requires isolated local/test/staging slice")
  }
  if (env.APP_ENV === "production") throw new Error("Checkout preview is not approved for production")
  if (!/^[a-f0-9]{64}$/.test(env.VINTAGE_PREVIEW_SERVICE_SECRET || "")) throw new Error("Missing private preview service credential")
  if (env.APP_ENV === "staging") {
    assertStagingDatabase(env)
    assertStagingHomologatorGate(env)
    if (!env.VINTAGE_PREVIEW_FIXTURE_JSON?.trim()) throw new Error("Staging requires persistent VINTAGE_PREVIEW_FIXTURE_JSON")
    if (env.VINTAGE_PREVIEW_FIXTURE_FILE) throw new Error("Staging must not depend on ephemeral fixture files")
    try {
      validatePreviewOriginUrl(new URL(env.VINTAGE_PREVIEW_ORIGIN || ""), "staging")
      validatePreviewBackendUrl(new URL(env.VINTAGE_PREVIEW_BACKEND_URL || ""), "staging")
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Invalid staging preview URLs")
    }
  }
  return true
}

export class PreviewError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message) }
}
export const previewActions = ["catalog", "state", "start", "combo", "extra", "quote", "complete"] as const
export type PreviewAction = typeof previewActions[number]
export function parsePreviewAction(value: string): PreviewAction {
  if (!(previewActions as readonly string[]).includes(value)) throw new PreviewError(404, "NOT_FOUND", "Ação indisponível.")
  return value as PreviewAction
}
export function previewBody(action: PreviewAction, input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new PreviewError(400, "INVALID_BODY", "Corpo JSON inválido.")
  const body = input as Record<string, unknown>
  const fields: Record<PreviewAction, string[]> = { catalog: [], state: [], start: [], combo: ["selections"], extra: ["enabled"], quote: ["postal_code"], complete: ["quote_id", "acknowledge_simulation"] }
  if (Object.keys(body).some((key) => !fields[action].includes(key))) throw new PreviewError(400, "UNEXPECTED_FIELD", "Não envie preços, totais, identificadores de carrinho ou campos adicionais.")
  if (action === "combo" && !Array.isArray(body.selections)) throw new PreviewError(400, "INVALID_SELECTIONS", "Selecione os componentes do combo.")
  if (action === "extra" && typeof body.enabled !== "boolean") throw new PreviewError(400, "INVALID_EXTRA", "Estado do adicional inválido.")
  if (action === "quote" && (typeof body.postal_code !== "string" || !/^\d{5}-?\d{3}$/.test(body.postal_code))) throw new PreviewError(400, "INVALID_POSTCODE", "Informe um CEP válido de teste.")
  if (action === "complete" && (typeof body.quote_id !== "string" || !/^[a-f0-9]{32}$/.test(body.quote_id) || body.acknowledge_simulation !== true)) throw new PreviewError(400, "SIMULATION_CONFIRMATION", "Confirme a simulação e atualize a cotação.")
  return body
}
export function validSessionToken(value: unknown): value is string { return typeof value === "string" && /^[a-f0-9]{64}$/.test(value) }
export function requireFreshQuote(quote: { id: string; fingerprint: string; expires_at: number } | null | undefined, id: string, fingerprint: string, now = Date.now()) {
  if (!quote || quote.id !== id || !Number.isSafeInteger(quote.expires_at) || quote.expires_at <= now || quote.fingerprint !== fingerprint) throw new PreviewError(409, "QUOTE_CHANGED", "O carrinho ou a regra mudou, ou a cotação expirou. Atualize o frete antes de confirmar.")
}
