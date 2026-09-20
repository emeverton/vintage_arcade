import { createHash, timingSafeEqual } from "node:crypto"
import Redis from "ioredis"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import { checkoutPreviewEnabled, validSessionToken, PreviewError } from "../domain/checkout-preview"

export function privatePreviewAccess(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  res.setHeader("Cache-Control", "private, no-store")
  res.setHeader("X-Robots-Tag", "noindex, nofollow")
  try {
    if (!checkoutPreviewEnabled(process.env)) { res.status(404).json({ code: "PREVIEW_DISABLED" }); return }
    const token = req.headers["x-vintage-preview-service"]
    const expected = process.env.VINTAGE_PREVIEW_SERVICE_SECRET!
    if (!validSessionToken(token) || !timingSafeEqual(Buffer.from(token), Buffer.from(expected))) { res.status(401).json({ code: "UNAUTHORIZED" }); return }
    if (req.headers.origin) { res.status(403).json({ code: "PRIVATE_ENDPOINT" }); return }
    // Reject query strings before framework query normalization can reinterpret input.
    if (req.originalUrl.includes("?")) { res.status(400).json({ code: "UNEXPECTED_QUERY", message: "Não envie parâmetros de consulta." }); return }
  } catch { res.status(503).json({ code: "PREVIEW_CONFIGURATION" }); return }
  next()
}

export async function limitPreviewRequests(session: string | undefined) {
  const redis = new Redis(process.env.REDIS_URL!, { lazyConnect: true, enableOfflineQueue: false, maxRetriesPerRequest: 1, connectTimeout: 1500, commandTimeout: 2000, retryStrategy: () => null })
  redis.on("error", () => {})
  try {
    await redis.connect()
    const key = createHash("sha256").update(session || "catalog").digest("hex")
    const script = "local a=redis.call('INCR',KEYS[1]); if a==1 then redis.call('PEXPIRE',KEYS[1],60000) end; local b=redis.call('INCR',KEYS[2]); if b==1 then redis.call('PEXPIRE',KEYS[2],60000) end; return {a,b}"
    const counts = await redis.eval(script, 2, `vintage-preview:rate:${key}`, "vintage-preview:rate:global") as number[]
    if (counts[0] > 90 || counts[1] > 1200) throw new PreviewError(429, "RATE_LIMITED", "Aguarde um minuto antes de continuar.")
  } catch (error) {
    if (error instanceof PreviewError) throw error
    throw new PreviewError(503, "PREVIEW_UNAVAILABLE", "Serviço temporariamente indisponível.")
  } finally { redis.disconnect() }
}
