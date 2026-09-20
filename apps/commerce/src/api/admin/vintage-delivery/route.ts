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
    const [options, count] = await fulfillment.listAndCountShippingOptions({ provider_id: "vintage_vintage" }, { take: 50, skip: offset })
    return { role, options: options.map((option) => ({ id: option.id, name: option.name })), count, offset, limit: 50, environment: process.env.APP_ENV }
  })
}
