/** Staging-only guards. Never treat APP_ENV=test as a public-hosting bypass. */

import { Buffer } from "node:buffer"

export function isIsolatedPreviewEnv(appEnv: string | undefined): boolean {
  return appEnv === "local" || appEnv === "test" || appEnv === "staging"
}

export function rejectTestEnvOnHostedInfrastructure(env: Record<string, string | undefined>): void {
  if (env.APP_ENV !== "test") return
  if (env.RAILWAY_ENVIRONMENT || env.RAILWAY_PROJECT_ID || env.RENDER || env.FLY_APP_NAME || env.VERCEL) {
    throw new Error("APP_ENV=test is forbidden on hosted infrastructure; use APP_ENV=staging")
  }
}

export function assertStagingDatabase(env: Record<string, string | undefined>): void {
  if (env.APP_ENV !== "staging") return
  let database: URL
  try { database = new URL(env.DATABASE_URL || "") } catch { throw new Error("Staging requires DATABASE_URL") }
  if (database.pathname !== "/vintage_staging") throw new Error("Staging database must be named vintage_staging")
}

export function assertStagingHomologatorGate(env: Record<string, string | undefined>): void {
  if (env.APP_ENV !== "staging") return
  const user = env.VINTAGE_STAGING_BASIC_USER || ""
  const password = env.VINTAGE_STAGING_BASIC_PASSWORD || ""
  if (user.length < 3 || password.length < 16) throw new Error("Staging requires homologator basic credentials")
  if (/change.?me|example|password|admin/i.test(password)) throw new Error("Unsafe staging homologator password")
}

export function isLoopbackHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
}

export function isPrivateRailwayHostname(hostname: string): boolean {
  return hostname.endsWith(".railway.internal")
}

export function validatePreviewOriginUrl(origin: URL, appEnv: string): void {
  if (origin.username || origin.password || origin.search || origin.hash || origin.pathname !== "/") {
    throw new Error("Invalid preview origin")
  }
  if (appEnv === "staging") {
    if (origin.protocol !== "https:") throw new Error("Staging preview origin must be HTTPS")
    if (isLoopbackHostname(origin.hostname)) throw new Error("Staging preview origin cannot be loopback")
    return
  }
  if (!["http:", "https:"].includes(origin.protocol) || !isLoopbackHostname(origin.hostname)) {
    throw new Error("Local/test preview origin must be loopback")
  }
}

export function validatePreviewBackendUrl(backend: URL, appEnv: string): void {
  if (backend.username || backend.password || backend.search || backend.hash || backend.pathname !== "/") {
    throw new Error("Invalid preview backend URL")
  }
  if (appEnv === "staging") {
    const privateHttp = backend.protocol === "http:" && isPrivateRailwayHostname(backend.hostname)
    const publicHttps = backend.protocol === "https:" && !isLoopbackHostname(backend.hostname)
    if (!privateHttp && !publicHttps) throw new Error("Staging backend must be private Railway HTTP or HTTPS")
    return
  }
  if (!["http:", "https:"].includes(backend.protocol) || !isLoopbackHostname(backend.hostname)) {
    throw new Error("Local/test preview backend must be loopback")
  }
}

export function timingSafeEqualText(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let i = 0; i < left.length; i++) mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i)
  return mismatch === 0
}

export function authorizeStagingBasic(header: string | null | undefined, env: Record<string, string | undefined>): boolean {
  assertStagingHomologatorGate(env)
  if (!header || !header.startsWith("Basic ")) return false
  let decoded = ""
  try { decoded = Buffer.from(header.slice(6), "base64").toString("utf8") } catch { return false }
  const separator = decoded.indexOf(":")
  if (separator < 1) return false
  const user = decoded.slice(0, separator)
  const password = decoded.slice(separator + 1)
  return timingSafeEqualText(user, env.VINTAGE_STAGING_BASIC_USER!) && timingSafeEqualText(password, env.VINTAGE_STAGING_BASIC_PASSWORD!)
}
