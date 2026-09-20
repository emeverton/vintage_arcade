export type RuntimeEnvironment = Record<string, string | undefined>

export interface ValidatedEnvironment {
  appEnv: string
  databaseUrl: string
  redisUrl: string
  storeCors: string
  adminCors: string
  authCors: string
  jwtSecret: string
  cookieSecret: string
  workerMode: "shared" | "server" | "worker"
  adminDisabled: boolean
}

export function readEnvironment(env: RuntimeEnvironment): ValidatedEnvironment {
  const appEnv = env.APP_ENV || "local"
  if (!["local", "test", "staging", "production"].includes(appEnv)) throw new Error("Invalid APP_ENV")
  const remote = appEnv === "staging" || appEnv === "production"
  function required(name: string): string {
    const value = env[name]?.trim()
    if (!value) throw new Error(`Missing ${name}`)
    return value
  }
  function serviceUrl(name: string, schemes: string[]): string {
    const value = required(name)
    let url: URL
    try { url = new URL(value) } catch { throw new Error(`Invalid ${name}`) }
    if (!schemes.includes(url.protocol) || !url.hostname) throw new Error(`Invalid ${name}`)
    return value
  }
  function secret(name: string): string {
    const value = required(name)
    if (value.length < 32 || /change.?me|supersecret|example/i.test(value)) throw new Error(`Unsafe ${name}`)
    return value
  }
  function origins(name: string): string {
    const value = required(name)
    for (const entry of value.split(",")) {
      let url: URL
      try { url = new URL(entry.trim()) } catch { throw new Error(`Invalid ${name}`) }
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/" || entry.includes("*")) throw new Error(`Invalid ${name}`)
      if (remote && url.protocol !== "https:") throw new Error(`HTTPS required for ${name}`)
    }
    return value.split(",").map((entry) => entry.trim()).join(",")
  }
  const workerMode = env.MEDUSA_WORKER_MODE || "shared"
  if (workerMode !== "shared" && workerMode !== "server" && workerMode !== "worker") throw new Error("Invalid MEDUSA_WORKER_MODE")
  for (const flag of ["IFOOD_ENABLED", "PAYMENTS_LIVE_ENABLED", "ADS_EXPORT_ENABLED"] as const) {
    if (env[flag] && env[flag] !== "false") throw new Error(`${flag} is not implemented in this bootstrap`)
  }
  const jwtSecret = secret("JWT_SECRET")
  const cookieSecret = secret("COOKIE_SECRET")
  if (jwtSecret === cookieSecret) throw new Error("JWT_SECRET and COOKIE_SECRET must differ")
  return {
    appEnv,
    databaseUrl: serviceUrl("DATABASE_URL", ["postgres:", "postgresql:"]),
    redisUrl: serviceUrl("REDIS_URL", ["redis:", "rediss:"]),
    storeCors: origins("STORE_CORS"), adminCors: origins("ADMIN_CORS"), authCors: origins("AUTH_CORS"),
    jwtSecret, cookieSecret, workerMode,
    adminDisabled: workerMode === "worker" || env.DISABLE_MEDUSA_ADMIN === "true",
  }
}
