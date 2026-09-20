import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IFulfillmentModuleService, IUserModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import type VintageDeliveryService from "../modules/vintage-delivery/service"
import { DeliveryAdminError, requireDeliveryRole, type DeliveryAction, type DeliveryRole } from "../domain/delivery-admin"
import { sliceEnabled } from "../domain/slice-guard"
import { parseDeliveryPolicy } from "../domain/delivery-policy"

export function deliveryService(req: AuthenticatedMedusaRequest) { return req.scope.resolve<VintageDeliveryService>("vintageDelivery") }
export async function optionForAdmin(req: AuthenticatedMedusaRequest) {
  if (!/^so_[A-Za-z0-9_-]{1,100}$/.test(req.params.option_id || "")) throw new DeliveryAdminError(400, "INVALID_OPTION", "Opção inválida.")
  const service = req.scope.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const option = await service.retrieveShippingOption(req.params.option_id)
  if (option.provider_id !== "vintage_vintage") throw new DeliveryAdminError(404, "NOT_VINTAGE", "Entrega não gerenciada pela Vintage.")
  return { option, bootstrap: parseDeliveryPolicy(option.data?.vintage_policy) }
}
export async function deliveryAdminRequest(req: AuthenticatedMedusaRequest, res: MedusaResponse, action: DeliveryAction, run: (actorId: string, role: DeliveryRole) => Promise<unknown>) {
  res.setHeader("Cache-Control", "no-store")
  try {
    if (!sliceEnabled(process.env)) throw new DeliveryAdminError(403, "SLICE_DISABLED", "Backoffice de homologação desativado.")
    const actorId = req.auth_context?.actor_type === "user" ? req.auth_context.actor_id : undefined
    const role = requireDeliveryRole(actorId, action, process.env)
    const users = req.scope.resolve<IUserModuleService>(Modules.USER)
    try { await users.retrieveUser(actorId!) } catch { throw new DeliveryAdminError(401, "USER_UNAVAILABLE", "Usuário indisponível.") }
    if (req.method !== "GET") {
      if (!req.get("content-type")?.toLowerCase().startsWith("application/json")) throw new DeliveryAdminError(415, "JSON_REQUIRED", "Envie application/json.")
      const origin = req.get("origin")
      const allowed = (process.env.ADMIN_CORS || "").split(",").map((v) => v.trim())
      if ((origin && !allowed.includes(origin)) || (!origin && !req.get("authorization")?.startsWith("Bearer "))) throw new DeliveryAdminError(403, "ORIGIN_REJECTED", "Origem da alteração não autorizada.")
    }
    const data = await run(actorId!, role)
    return res.status(200).json(data)
  } catch (error) {
    if (error instanceof DeliveryAdminError) return res.status(error.status).json({ code: error.code, message: error.message })
    // Policy validation is an input failure; infrastructure failures do not expose internals.
    if (error instanceof Error && /^(Invalid |Only BRL|Reversed postcode|Missing delivery policy|Address outside|Minimum order|Delivery is disabled|Delivery policy scope|Sub-cent|thresholdMinor|Missing monetary)/.test(error.message)) return res.status(400).json({ code: "INVALID_POLICY", message: "Regra ou simulação inválida. Confira valores, período e área de entrega." })
    console.error("VINTAGE_DELIVERY_ADMIN_FAILED", { action, error_type: error instanceof Error ? error.name : "unknown" })
    return res.status(500).json({ code: "DELIVERY_OPERATION_FAILED", message: "A operação não foi confirmada. Atualize a tela ou repita com o mesmo identificador." })
  }
}
