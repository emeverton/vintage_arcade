import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import Redis from "ioredis"

type DatabaseProbe = { raw(sql: string): { timeout(ms: number, options: { cancel: boolean }): PromiseLike<unknown> } }

/** Readiness checks both stores, unlike Medusa's built-in /health liveness endpoint. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  const redis = new Redis(process.env.REDIS_URL!, {
    lazyConnect: true, enableOfflineQueue: false, maxRetriesPerRequest: 1,
    connectTimeout: 1200, commandTimeout: 1200, retryStrategy: () => null,
  })
  // Never emit connection URLs or credentials in a public health response.
  redis.on("error", () => {})
  try {
    const db = req.scope.resolve<DatabaseProbe>(ContainerRegistrationKeys.PG_CONNECTION)
    await Promise.all([
      db.raw("SELECT 1").timeout(1500, { cancel: true }),
      redis.connect().then(() => redis.ping()).then((reply) => { if (reply !== "PONG") throw new Error("Redis probe failed") }),
    ])
    return res.status(200).json({ status: "ready", checks: { postgres: "ok", redis: "ok" } })
  } catch {
    return res.status(503).json({ status: "not_ready" })
  } finally {
    redis.disconnect()
  }
}
