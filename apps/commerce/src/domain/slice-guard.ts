export function sliceEnabled(env: Record<string, string | undefined>): boolean {
  const flag = env.VINTAGE_SLICE_ENABLED
  if (flag !== undefined && flag !== "true" && flag !== "false") throw new Error("Invalid VINTAGE_SLICE_ENABLED")
  if (flag !== "true") return false
  if (env.APP_ENV === "production") throw new Error("Vintage slice is not approved for production")
  if (env.APP_ENV !== "test" && env.APP_ENV !== "local" && env.APP_ENV !== "staging") {
    throw new Error("Vintage slice is not approved for this environment")
  }
  return true
}
