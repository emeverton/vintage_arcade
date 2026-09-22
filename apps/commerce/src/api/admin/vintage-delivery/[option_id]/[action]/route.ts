import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { deliveryAdminRequest, deliveryService, optionForAdmin } from "../../../../delivery-admin-http"
import { DeliveryAdminError, exactFields, record, editablePolicyFields, type DeliveryAction } from "../../../../../domain/delivery-admin"
import { evaluateDeliveryPolicy, parseDeliveryPolicy } from "../../../../../domain/delivery-policy"
import { assertMinor, minorToMedusa } from "../../../../../domain/money"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const action = req.params.action as DeliveryAction
  if (!["draft", "preview", "publish", "rollback"].includes(action)) return res.status(404).json({ message: "Operação inexistente." })
  return deliveryAdminRequest(req, res, action, async (actor) => {
    const { option, bootstrap } = await optionForAdmin(req)
    const service = deliveryService(req)
    if (action === "preview") {
      const body = record(req.body)
      exactFields(body, ["changes", "subtotal_minor", "postal_code"])
      const changes = record(body.changes); exactFields(changes, editablePolicyFields)
      assertMinor(body.subtotal_minor)
      if (typeof body.postal_code !== "string" || !/^\d{5}-?\d{3}$/.test(body.postal_code)) throw new DeliveryAdminError(400, "INVALID_POSTCODE", "CEP inválido.")
      const active = await service.resolvePublishedPolicy(bootstrap)
      const policy = parseDeliveryPolicy({ ...active, ...changes })
      const result = evaluateDeliveryPolicy(policy, { currency_code: "brl", sales_channel_id: policy.sales_channel_id, region_id: policy.region_id, item_total: minorToMedusa(body.subtotal_minor), shipping_address: { country_code: "br", postal_code: body.postal_code } })
      return { simulation_only: true, result }
    }
    return service.changePublication(actor, option.id, bootstrap, action as "draft" | "publish" | "rollback", req.body)
  })
}
