import assert from "node:assert/strict"
import type { ExecArgs, ISalesChannelModuleService, ILockingModule } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import type VintageDeliveryService from "../modules/vintage-delivery/service"

export default async function smokeModules({ container }: ExecArgs) {
  if (process.env.APP_ENV !== "test" || !process.env.DATABASE_URL?.endsWith("/vintage_ci")) {
    throw new Error("Smoke writes are restricted to APP_ENV=test and the vintage_ci database")
  }
  const channels = container.resolve<ISalesChannelModuleService>(Modules.SALES_CHANNEL)
  const name = "SYNTHETIC_FOUNDATION_SMOKE"
  const existing = await channels.listSalesChannels({ name })
  const channel = existing[0] || await channels.createSalesChannels({ name, description: "CI fixture, not a real sales channel" })
  assert.equal((await channels.retrieveSalesChannel(channel.id)).name, name)
  const locking = container.resolve<ILockingModule>(Modules.LOCKING)
  await locking.execute("foundation-smoke", async () => {
    const service = container.resolve<VintageDeliveryService>("vintageDelivery")
    const result = service.quote({ eligibleSubtotalMinor: 4500, quotedFeeMinor: 900, thresholdMinor: 4500, subsidyCapMinor: 900, zoneEligible: true, promotionActive: true })
    assert.equal(result.status, "free_shipping")
  })
  await channels.deleteSalesChannels(channel.id)
  console.log("FOUNDATION_MODULE_SMOKE_PASS: PostgreSQL persistence, Redis lock, Vintage delivery module")
}
