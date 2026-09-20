/** Server-only configuration. Never import from a Client Component. */
export function previewServerConfig() {
  if (process.env.VINTAGE_CHECKOUT_PREVIEW_ENABLED !== "true") return null
  if (!["local", "test"].includes(process.env.APP_ENV || "") || process.env.VINTAGE_SLICE_ENABLED !== "true") return null
  const secret = process.env.VINTAGE_PREVIEW_SERVICE_SECRET || ""
  if (!/^[a-f0-9]{64}$/.test(secret)) return null
  try {
    const origin = new URL(process.env.VINTAGE_PREVIEW_ORIGIN || "")
    const backend = new URL(process.env.VINTAGE_PREVIEW_BACKEND_URL || "")
    for (const u of [origin, backend]) {
      if (!["localhost", "127.0.0.1", "[::1]"].includes(u.hostname) || !["http:", "https:"].includes(u.protocol) || u.username || u.password || u.search || u.hash || u.pathname !== "/") return null
    }
    return { origin: origin.origin, backend: backend.origin, secret, secure: origin.protocol === "https:" }
  } catch { return null }
}
