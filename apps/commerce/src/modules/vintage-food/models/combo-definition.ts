import { model } from "@medusajs/framework/utils"
export const ComboDefinition = model.define("vintage_combo_definition", {
  id: model.id().primaryKey(), revision_key: model.text().unique(), name: model.text(), definition: model.json(),
})
