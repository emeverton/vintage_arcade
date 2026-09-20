export function sliceEnabled(env: Record<string, string | undefined>): boolean {
  const flag = env.VINTAGE_SLICE_ENABLED
  if (flag !== undefined && flag !== "true" && flag !== "false") throw new Error("Invalid VINTAGE_SLICE_ENABLED")
  if (flag !== "true") return false
  if (env.APP_ENV !== "test" && env.APP_ENV !== "local") throw new Error("Vintage slice is not approved for staging or production")
  return true
}
