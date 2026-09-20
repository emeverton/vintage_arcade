import type { MedusaContainer } from "@medusajs/framework/types"

export async function readCart(container: MedusaContainer, id: string) {
  const query = container.resolve("query")
  const { data } = await query.graph({
    entity: "cart", filters: { id },
    fields: ["id", "completed_at", "currency_code", "sales_channel_id", "region_id", "item_total", "total", "shipping_total", "shipping_subtotal", "shipping_address.*", "items.id", "items.variant_id", "items.quantity", "items.metadata", "items.unit_price", "shipping_methods.id", "shipping_methods.shipping_option_id", "shipping_methods.amount", "shipping_methods.data", "payment_collection.id"],
  })
  if (!data[0]) throw new Error("Cart not found")
  return data[0]
}
