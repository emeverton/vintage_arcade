import { randomBytes } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { previewServerConfig } from "../../../../lib/vintage-preview-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const COOKIE = "vintage_preview_session"
const tokenPattern = /^[a-f0-9]{64}$/
const readActions = ["catalog", "state"]
const writeActions = ["start", "combo", "extra", "quote", "complete", "reset"]
const headers = { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" }
const error = (status: number, code: string, message: string) => NextResponse.json({ code, message }, { status, headers })

async function readBoundedJson(req: NextRequest): Promise<unknown> {
  if (Number(req.headers.get("content-length") || 0) > 16384) throw new Error("BODY_TOO_LARGE")
  const reader = req.body?.getReader()
  if (!reader) return {}
  const decoder = new TextDecoder(); let text = "", bytes = 0
  for (;;) {
    const part = await reader.read()
    if (part.done) break
    bytes += part.value.byteLength
    if (bytes > 16384) { await reader.cancel(); throw new Error("BODY_TOO_LARGE") }
    text += decoder.decode(part.value, { stream: true })
  }
  text += decoder.decode()
  return JSON.parse(text || "{}")
}

async function handle(req: NextRequest, context: { params: Promise<{ action: string }> }) {
  const config = previewServerConfig()
  if (!config) return error(404, "PREVIEW_DISABLED", "Prévia indisponível.")
  const { action } = await context.params
  if (!readActions.includes(action) && !writeActions.includes(action)) return error(404, "NOT_FOUND", "Ação inexistente.")
  if ((readActions.includes(action) && req.method !== "GET") || (writeActions.includes(action) && req.method !== "POST")) return error(405, "METHOD_NOT_ALLOWED", "Método inválido.")
  if (req.nextUrl.search) return error(400, "UNEXPECTED_QUERY", "Não envie parâmetros adicionais.")
  if (req.headers.get("host") !== new URL(config.origin).host || req.headers.get("sec-fetch-site") === "cross-site") return error(403, "ORIGIN_DENIED", "Origem não autorizada.")
  let body: unknown = {}
  if (req.method === "POST") {
    if (req.headers.get("origin") !== config.origin || req.headers.get("x-vintage-preview") !== "1") return error(403, "ORIGIN_DENIED", "Origem não autorizada.")
    if (req.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return error(415, "JSON_REQUIRED", "Envie JSON.")
    try { body = await readBoundedJson(req) } catch (e) { return error(e instanceof Error && e.message === "BODY_TOO_LARGE" ? 413 : 400, "INVALID_BODY", "Corpo JSON inválido ou muito grande.") }
  }
  const raw = req.cookies.get(COOKIE)?.value
  let token = raw && tokenPattern.test(raw) ? raw : undefined
  let newlyCreated = false
  if (action === "reset") {
    const response = NextResponse.json({ synthetic: true, status: "empty", items: [] }, { headers })
    response.cookies.set(COOKIE, "", { httpOnly: true, sameSite: "strict", secure: config.secure, path: "/api/vintage-test", maxAge: 0 })
    return response
  }
  if (!token && action === "start") { token = randomBytes(32).toString("hex"); newlyCreated = true }
  if (!token && action === "state") return NextResponse.json({ synthetic: true, status: "empty", items: [], quote: null, needs_quote: true }, { headers })
  if (!token && action !== "catalog") return error(401, "SESSION_REQUIRED", "Inicie uma sessão de teste.")
  let response: NextResponse
  try {
    const upstream = await fetch(`${config.backend}/vintage-preview/${action}`, {
      method: req.method, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20000),
      headers: { "Content-Type": "application/json", "x-vintage-preview-service": config.secret, ...(token ? { "x-vintage-preview-session": token } : {}) },
      ...(req.method === "POST" ? { body: JSON.stringify(body) } : {}),
    })
    response = NextResponse.json(await upstream.json(), { status: upstream.status, headers })
    if (upstream.status === 429) response.headers.set("Retry-After", "60")
    if (upstream.status === 410) response.cookies.set(COOKIE, "", { httpOnly: true, sameSite: "strict", secure: config.secure, path: "/api/vintage-test", maxAge: 0 })
  } catch { response = error(502, "BACKEND_UNAVAILABLE", "O serviço não respondeu. Recarregue o carrinho antes de repetir a operação.") }
  // Preserve the capability even after an ambiguous timeout so a retry uses the same owned session.
  if (newlyCreated && token) response.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "strict", secure: config.secure, path: "/api/vintage-test", maxAge: 86400 })
  return response
}
export const GET = handle
export const POST = handle
