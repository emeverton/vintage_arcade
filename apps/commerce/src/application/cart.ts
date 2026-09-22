import type { MedusaContainer } from "@medusajs/framework/types"
import type { PricingCart } from "../domain/delivery-policy"

export interface CartItemSnapshot {
  id: string
  variant_id?: string | null
  quantity: number
  metadata?: Record<string, unknown> | null
  unit_price?: unknown
}
export interface CartSnapshot extends PricingCart {
  id: string
  completed_at?: string | Date | null
  items: CartItemSnapshot[]
  total: unknown
  shipping_total: unknown
  shipping_subtotal: unknown
  shipping_methods: { id: string; shipping_option_id?: string | null; amount: unknown; data?: Record<string, unknown> | null }[]
  payment_collection?: { id: string } | null
}

export async function readCart(container: MedusaContainer, id: string): Promise<CartSnapshot> {
  const query = container.resolve("query")
  const { data } = await query.graph({
    entity: "cart", filters: { id },
    fields: ["id", "completed_at", "currency_code", "sales_channel_id", "region_id", "item_total", "total", "shipping_total", "shipping_subtotal", "shipping_address.*", "items.id", "items.variant_id", "items.quantity", "items.metadata", "items.unit_price", "shipping_methods.id", "shipping_methods.shipping_option_id", "shipping_methods.amount", "shipping_methods.data", "payment_collection.id"],
  })
  if (!data[0]) throw new Error("Cart not found")
  return data[0] as CartSnapshot
}
