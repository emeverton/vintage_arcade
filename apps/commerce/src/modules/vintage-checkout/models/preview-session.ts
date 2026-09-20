import { model } from "@medusajs/framework/utils"
export const PreviewSession = model.define("vintage_preview_session", {
  id: model.id().primaryKey(),
  token_hash: model.text().unique(),
  cart_id: model.text().nullable(),
  order_id: model.text().nullable(),
  expires_at: model.dateTime(),
  quote: model.json().nullable(),
})
