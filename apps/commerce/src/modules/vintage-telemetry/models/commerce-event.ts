import { model } from "@medusajs/framework/utils"
export const CommerceEvent = model.define("vintage_commerce_event", {
  id: model.id().primaryKey(), event_id: model.text().unique(), event_name: model.text(), order_id: model.text(), payload: model.json(),
})
