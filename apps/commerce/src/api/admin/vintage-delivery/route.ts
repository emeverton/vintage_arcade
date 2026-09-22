import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IFulfillmentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { deliveryAdminRequest } from "../../delivery-admin-http"
import { DeliveryAdminError } from "../../../domain/delivery-admin"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return deliveryAdminRequest(req, res, "read", async (_actor, role) => {
    const offset = Number(req.query.offset || 0)
    if (!Number.isSafeInteger(offset) || offset < 0) throw new DeliveryAdminError(400, "INVALID_OFFSET", "Página inválida.")
    const fulfillment = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
    // The module's public filter contract does not include provider_id in this pinned release.
    // Single-store bounded discovery, with explicit failure instead of incomplete pagination.
    const [all, total] = await fulfillment.listAndCountShippingOptions({}, { take: 501, order: { id: "ASC" } })
    if (total > 500) throw new DeliveryAdminError(503, "OPTION_CAPACITY", "A consulta de entregas requer particionamento antes de exceder 500 opções.")
    const eligible = all.filter((option) => option.provider_id === "vintage_vintage")
    return { role, options: eligible.slice(offset, offset + 50).map((option) => ({ id: option.id, name: option.name })), count: eligible.length, offset, limit: 50, environment: process.env.APP_ENV }
  })
}
