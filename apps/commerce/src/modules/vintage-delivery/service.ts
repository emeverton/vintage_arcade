import { quoteDeliveryIncentive, type DeliveryIncentiveInput } from "../../domain/delivery-incentive"

/** Internal only. Rule storage and cart/fulfillment workflows belong to the next slice. */
export default class VintageDeliveryService {
  quote(input: DeliveryIncentiveInput) {
    return quoteDeliveryIncentive(input)
  }
}
