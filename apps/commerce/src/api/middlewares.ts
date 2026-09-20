import { authenticate, defineMiddlewares, type MedusaRequest, type MedusaResponse, type MedusaNextFunction } from "@medusajs/framework/http"
import { sliceEnabled } from "../domain/slice-guard"
import { checkoutPreviewEnabled } from "../domain/checkout-preview"
import { privatePreviewAccess } from "../application/checkout-preview-http"

export default defineMiddlewares({ routes: [
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
