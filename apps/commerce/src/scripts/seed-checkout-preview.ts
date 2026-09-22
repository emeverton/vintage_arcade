import { readFileSync, writeFileSync } from "node:fs"
import type { ExecArgs, ICartModuleService, ISalesChannelModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { readCart } from "../application/cart"
import { checkoutPreviewEnabled } from "../domain/checkout-preview"

export default async function seedCheckoutPreview({ container }: ExecArgs) {
  const db = new URL(process.env.DATABASE_URL || "invalid:")
  if (!checkoutPreviewEnabled(process.env) || process.env.APP_ENV !== "test" || db.pathname !== "/vintage_ci" || !["localhost", "127.0.0.1", "postgres"].includes(db.hostname)) throw new Error("Preview fixture discovery is CI-only")
  const baseline = JSON.parse(readFileSync(".cache/commerce-slice-report.json", "utf8"))
  const cart = await readCart(container, baseline.cart_id)
  const native = await container.resolve<ICartModuleService>(Modules.CART).retrieveCart(cart.id)
  if (native.metadata?.synthetic !== true) throw new Error("Not a synthetic cart")
  const channel = await container.resolve<ISalesChannelModuleService>(Modules.SALES_CHANNEL).retrieveSalesChannel(cart.sales_channel_id!)
  if (!channel.name.startsWith("QA_ONLY_")) throw new Error("Not a synthetic channel")
  const combo = cart.items.find((i) => i.metadata?.vintage_combo_id)
  const extra = cart.items.find((i) => !i.metadata?.vintage_combo_id)
  if (!combo || !extra || !cart.shipping_methods[0]?.shipping_option_id) throw new Error("Synthetic fixture is incomplete")
  const fixture = { synthetic: true, channel_id: cart.sales_channel_id, region_id: cart.region_id, combo_id: combo.metadata!.vintage_combo_id, shipping_option_id: cart.shipping_methods[0].shipping_option_id, extra_variant_id: extra.variant_id, postal_code: cart.shipping_address?.postal_code }
  const path = process.env.VINTAGE_PREVIEW_FIXTURE_FILE
  if (!path) throw new Error("Fixture path must be explicit")
  writeFileSync(path, JSON.stringify(fixture, null, 2), { mode: 0o600 })
  console.log("SYNTHETIC_CHECKOUT_FIXTURE_READY")
}
