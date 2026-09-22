import { authorizeStagingBasic, isIsolatedPreviewEnv, validatePreviewBackendUrl, validatePreviewOriginUrl } from "./staging-runtime"

/** Server-only configuration. Never import from a Client Component. */
export function previewServerConfig() {
  if (process.env.VINTAGE_CHECKOUT_PREVIEW_ENABLED !== "true") return null
  if (!isIsolatedPreviewEnv(process.env.APP_ENV) || process.env.VINTAGE_SLICE_ENABLED !== "true") return null
  if (process.env.APP_ENV === "production") return null
  const secret = process.env.VINTAGE_PREVIEW_SERVICE_SECRET || ""
  if (!/^[a-f0-9]{64}$/.test(secret)) return null
  if (process.env.APP_ENV === "staging") {
    const user = process.env.VINTAGE_STAGING_BASIC_USER || ""
    const password = process.env.VINTAGE_STAGING_BASIC_PASSWORD || ""
    if (user.length < 3 || password.length < 16) return null
    if (!process.env.VINTAGE_PREVIEW_FIXTURE_JSON?.trim()) return null
  }
  try {
    const appEnv = process.env.APP_ENV || "local"
    const origin = new URL(process.env.VINTAGE_PREVIEW_ORIGIN || "")
    const backend = new URL(process.env.VINTAGE_PREVIEW_BACKEND_URL || "")
    validatePreviewOriginUrl(origin, appEnv)
    validatePreviewBackendUrl(backend, appEnv)
    return { origin: origin.origin, backend: backend.origin, secret, secure: origin.protocol === "https:" || appEnv === "staging" }
  } catch { return null }
}

export { authorizeStagingBasic }
