import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { deliveryAdminRequest, deliveryService, optionForAdmin } from "../../../delivery-admin-http"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return deliveryAdminRequest(req, res, "read", async (_actor, role) => {
    const { option, bootstrap } = await optionForAdmin(req)
    const state = await deliveryService(req).publicationState(option.id)
    return { ...state, option: { id: option.id, name: option.name }, role, active_policy: state.control?.active_policy || bootstrap, bootstrap_policy: state.control?.bootstrap_policy || bootstrap, generation: state.control?.generation || 0, active_rule_id: state.control?.active_rule_id || null }
  })
}
