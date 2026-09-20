import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { executePreview, previewCatalog } from "../../../application/checkout-preview"
import { limitPreviewRequests } from "../../../application/checkout-preview-http"
import { parsePreviewAction, previewBody, validSessionToken, PreviewError } from "../../../domain/checkout-preview"

async function handle(req: MedusaRequest, res: MedusaResponse) {
  try {
    const action = parsePreviewAction(req.params.action)
    const reads = action === "catalog" || action === "state"
    if ((reads && req.method !== "GET") || (!reads && req.method !== "POST")) { res.status(405).json({ code: "METHOD_NOT_ALLOWED" }); return }
    const token = req.headers["x-vintage-preview-session"]
    if (action !== "catalog" && !validSessionToken(token)) throw new PreviewError(401, "SESSION_REQUIRED", "Sessão de teste necessária.")
    await limitPreviewRequests(typeof token === "string" ? token : undefined)
    if (Object.keys(req.query).length) throw new PreviewError(400, "UNEXPECTED_QUERY", "Não envie parâmetros de consulta.")
    if (!reads && !req.is("application/json")) throw new PreviewError(415, "JSON_REQUIRED", "Envie JSON.")
    const body = previewBody(action, reads ? {} : req.body)
    const result = action === "catalog" ? await previewCatalog(req.scope) : await executePreview(req.scope, token as string, action, body)
    res.json(result)
  } catch (error) {
    if (error instanceof PreviewError) { if (error.status === 429) res.setHeader("Retry-After", "60"); res.status(error.status).json({ code: error.code, message: error.message }); return }
    console.error("VINTAGE_PREVIEW_REQUEST_FAILED", req.params.action, error instanceof Error ? error.name : "WorkflowError")
    res.status(503).json({ code: "PREVIEW_UNAVAILABLE", message: "Não foi possível concluir. Recarregue o estado antes de tentar novamente." })
  }
}
export const GET = handle
export const POST = handle
