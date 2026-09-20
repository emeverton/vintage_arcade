import { MedusaService } from "@medusajs/framework/utils"
import { DeliveryRule } from "./models/delivery-rule"
import { quoteDeliveryIncentive, type DeliveryIncentiveInput } from "../../domain/delivery-incentive"

export default class VintageDeliveryService extends MedusaService({ DeliveryRule }) {
  quote(input: DeliveryIncentiveInput) { return quoteDeliveryIncentive(input) }
}
