import { authenticate, defineMiddlewares, type MedusaRequest, type MedusaResponse, type MedusaNextFunction } from "@medusajs/framework/http"
import { sliceEnabled } from "../domain/slice-guard"
import { checkoutPreviewEnabled } from "../domain/checkout-preview"
import { privatePreviewAccess } from "../application/checkout-preview-http"
import { authorizeStagingBasic } from "../domain/staging-runtime"

function stagingHomologatorGate(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  if (process.env.APP_ENV !== "staging") { next(); return }
  const path = req.originalUrl.split("?")[0]
  if (path === "/health" || path === "/health/ready") { next(); return }
  if (path.startsWith("/vintage-preview")) { next(); return }
  try {
    if (!authorizeStagingBasic(req.headers.authorization, process.env)) {
      res.setHeader("WWW-Authenticate", 'Basic realm="Vintage Arcade Staging Admin", charset="UTF-8"')
      res.status(401).json({ code: "STAGING_AUTH_REQUIRED" })
      return
    }
  } catch {
    res.status(503).json({ code: "STAGING_GATE_MISCONFIGURED" })
    return
  }
  next()
}

export default defineMiddlewares({ routes: [
  { matcher: "/*", middlewares: [stagingHomologatorGate] },
  { matcher: "/admin/vintage-delivery*", middlewares: [authenticate("user", ["session", "bearer"])], bodyParser: { sizeLimit: "16kb" } },
  { matcher: "/vintage-preview*", middlewares: [privatePreviewAccess], bodyParser: { sizeLimit: "16kb" } },
  { matcher: "/store*", middlewares: [(_req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    if (checkoutPreviewEnabled(process.env)) { res.status(403).json({ code: "USE_PRIVATE_PREVIEW_GATEWAY" }); return }
    next()
  }] },
  { matcher: "/admin/shipping-options*", method: ["POST", "DELETE"], middlewares: [
    (_req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
      if (sliceEnabled(process.env)) { res.status(403).json({ code: "USE_VINTAGE_DELIVERY_ADMIN", message: "Na homologação, altere frete pelo backoffice Vintage. Provisionamento é interno." }); return }
      next()
    },
  ] },
] })
