import { authenticate, defineMiddlewares, type MedusaRequest, type MedusaResponse, type MedusaNextFunction } from "@medusajs/framework/http"
import { sliceEnabled } from "../domain/slice-guard"

export default defineMiddlewares({ routes: [
  { matcher: "/admin/vintage-delivery*", middlewares: [authenticate("user", ["session", "bearer"])], bodyParser: { sizeLimit: "16kb" } },
  { matcher: "/admin/shipping-options*", method: ["POST", "DELETE"], middlewares: [
    // Avoid bypassing revision/audit controls through the native shipping editor in this isolated slice.
    (_req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
      if (sliceEnabled(process.env)) { res.status(403).json({ code: "USE_VINTAGE_DELIVERY_ADMIN", message: "Na homologação, altere frete pelo backoffice Vintage. Provisionamento é interno." }); return }
      next()
    },
  ] },
] })
