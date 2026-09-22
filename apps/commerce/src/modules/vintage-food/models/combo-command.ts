import { model } from "@medusajs/framework/utils"
export const ComboCommand = model.define("vintage_combo_command", {
  id: model.id().primaryKey(), replay_key: model.text().unique(), request_hash: model.text(), cart_id: model.text(), combo_id: model.text(), completed: model.boolean().default(false), selection: model.json(),
})
