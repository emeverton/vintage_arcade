import { createHash } from "node:crypto"
import type { MedusaContainer } from "@medusajs/framework/types"
import type VintageTelemetryService from "../modules/vintage-telemetry/service"
import { medusaToMinor } from "../domain/money"
import { sliceEnabled } from "../domain/slice-guard"

export async function recordOrderCreated(container: MedusaContainer, orderId: string) {
  if (!sliceEnabled(process.env)) return
  const eventId = createHash("sha256").update(`order_created:v1:${orderId}`).digest("hex")
  const telemetry = container.resolve<VintageTelemetryService>("vintageTelemetry")
  const [existing] = await telemetry.listCommerceEvents({ event_id: eventId })
  if (existing) return existing
  const { data } = await container.resolve("query").graph({ entity: "order", fields: ["id", "currency_code", "total"], filters: { id: orderId } })
  const order = data[0]
  if (!order || order.currency_code !== "brl") throw new Error("Order event cannot be reconciled")
  const payload = { event_version: 1, environment: process.env.APP_ENV, currency: "BRL", value_minor: medusaToMinor(order.total), payment_verification: "not_asserted" }
  try {
    return await telemetry.createCommerceEvents({ event_id: eventId, event_name: "order_created", order_id: orderId, payload })
  } catch (error) {
    // Unique key handles concurrent at-least-once delivery; do not swallow other failures.
    const [winner] = await telemetry.listCommerceEvents({ event_id: eventId })
    if (!winner) throw error
    return winner
  }
}
