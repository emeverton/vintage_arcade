import { model } from "@medusajs/framework/utils"
export const DeliveryControl = model.define("vintage_delivery_control", {
  id: model.id().primaryKey(),
  anchor_key: model.text().unique(),
  generation: model.number().default(0),
  revision_counter: model.number(),
  active_rule_id: model.text().nullable(),
  active_policy: model.json(),
  bootstrap_policy: model.json(),
})
