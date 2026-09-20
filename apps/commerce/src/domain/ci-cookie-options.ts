/** Keep Medusa's secure defaults everywhere except the disposable loopback CI runner. */
export function isolatedCiCookieOptions(env: Record<string, string | undefined>) {
  if (env.APP_ENV !== "test" || env.GITHUB_ACTIONS !== "true") return undefined
  let database: URL
  try { database = new URL(env.DATABASE_URL || "") } catch { return undefined }
  if (!["localhost", "127.0.0.1", "postgres"].includes(database.hostname) || database.pathname !== "/vintage_ci") return undefined
  // Compiled Medusa on HTTP localhost otherwise cannot establish its native admin session.
  // This does not disable authentication, user existence checks or role authorization.
  return { sameSite: "lax" as const, secure: false, httpOnly: true }
}
