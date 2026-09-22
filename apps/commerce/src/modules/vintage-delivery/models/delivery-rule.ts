import { model } from "@medusajs/framework/utils"
export const DeliveryRule = model.define("vintage_delivery_rule", {
  id: model.id().primaryKey(),
  revision_key: model.text().unique(),
  policy: model.json(),
})
