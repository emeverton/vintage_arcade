import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { recordOrderCreated } from "../application/order-created"
export default async function orderCreated({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  await recordOrderCreated(container, data.id)
}
export const config: SubscriberConfig = { event: "order.placed", context: { subscriberId: "vintage-order-created-v1" } }
