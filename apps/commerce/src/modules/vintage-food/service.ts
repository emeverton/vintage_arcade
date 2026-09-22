import { MedusaService } from "@medusajs/framework/utils"
import { ComboDefinition } from "./models/combo-definition"
import { ComboCommand } from "./models/combo-command"
export default class VintageFoodService extends MedusaService({ ComboDefinition, ComboCommand }) {}
