import { model } from "@medusajs/framework/utils"
export const DeliveryAudit = model.define("vintage_delivery_audit", {
  id: model.id().primaryKey(), request_key: model.text().unique(), request_hash: model.text(), actor_id: model.text(), action: model.text(), option_id: model.text(), rule_id: model.text().nullable(), generation: model.number(), reason: model.text(), payload: model.json(),
})
