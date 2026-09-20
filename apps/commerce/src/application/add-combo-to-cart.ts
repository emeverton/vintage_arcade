import { createHash } from "node:crypto"
import type { MedusaContainer, ILockingModule } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import type VintageFoodService from "../modules/vintage-food/service"
import { expandCombo, parseComboSpec } from "../domain/combo"
import { sliceEnabled } from "../domain/slice-guard"
import { readCart } from "./cart"

export interface AddComboInput { cartId: string; comboId: string; requestId: string; selections: unknown }
const hash = (s: string) => createHash("sha256").update(s).digest("hex")

/** Internal application command, not an unprotected Store API endpoint. */
export async function addComboToCart(container: MedusaContainer, input: AddComboInput) {
  if (!sliceEnabled(process.env)) throw new Error("Commerce slice is disabled")
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(input.requestId)) throw new Error("Invalid request ID")
  const food = container.resolve<VintageFoodService>("vintageFood")
  const definition = await food.retrieveComboDefinition(input.comboId)
  const spec = parseComboSpec(definition.definition)
  const choices = expandCombo(spec, input.selections, spec.sales_channel_id)
  const requestHash = hash(JSON.stringify([input.comboId, spec.version, choices]))
  const replayKey = hash(JSON.stringify([input.cartId, input.requestId]))
  const locking = container.resolve<ILockingModule>(Modules.LOCKING)
  return locking.execute(`vintage-combo:${input.cartId}`, async () => {
    let [command] = await food.listComboCommands({ replay_key: replayKey })
    if (command && command.request_hash !== requestHash) throw new Error("Idempotency key reused with a different selection")
    if (command?.completed) return { commandId: command.id, replayed: true }
    const cart = await readCart(container, input.cartId)
    if (cart.completed_at || cart.sales_channel_id !== spec.sales_channel_id || cart.currency_code !== "brl") throw new Error("Cart is completed or outside the combo scope")
    if (!command) command = await food.createComboCommands({ replay_key: replayKey, request_hash: requestHash, cart_id: cart.id, combo_id: input.comboId, selection: { choices, version: spec.version } })
    // Recovery after cart commit but before command acknowledgement.
    const existing = (cart.items || []).filter((item) => item.metadata?.vintage_command_id === command.id)
    if (existing.length && (existing.length !== choices.length || existing.some((item) => item.metadata?.vintage_request_hash !== requestHash))) throw new Error("Incomplete combo command requires reconciliation")
    if (!existing.length) {
      await addToCartWorkflow(container).run({ input: { cart_id: cart.id, items: choices.map((choice) => ({
        variant_id: choice.variant_id, quantity: choice.quantity,
        metadata: { vintage_command_id: command.id, vintage_request_hash: requestHash, vintage_combo_id: definition.id, vintage_combo_version: spec.version, vintage_slot_id: choice.slot_id },
      })) } })
    }
    await food.updateComboCommands({ id: command.id, completed: true })
    return { commandId: command.id, replayed: existing.length > 0 }
  })
}
