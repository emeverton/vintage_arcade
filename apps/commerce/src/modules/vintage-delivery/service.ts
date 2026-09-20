import { randomUUID, createHash } from "node:crypto"
import { MedusaService, InjectManager, InjectTransactionManager, MedusaContext } from "@medusajs/framework/utils"
import type { Context } from "@medusajs/framework/types"
import type { EntityManager } from "@medusajs/framework/mikro-orm/knex"
import { DeliveryRule } from "./models/delivery-rule"
import { DeliveryControl } from "./models/delivery-control"
import { DeliveryAudit } from "./models/delivery-audit"
import { quoteDeliveryIncentive, type DeliveryIncentiveInput } from "../../domain/delivery-incentive"
import { parseDeliveryPolicy, type DeliveryPolicy } from "../../domain/delivery-policy"
import { sliceEnabled } from "../../domain/slice-guard"
import { DeliveryAdminError, canonicalJson, parseDeliveryCommand, requireDeliveryRole, type DeliveryCommand } from "../../domain/delivery-admin"

interface CommandResult { rule_id: string | null; generation: number; active_rule_id: string | null; replayed: boolean }
interface ControlRow { id: string; anchor_key: string; generation: number; revision_counter: number; active_rule_id: string | null; active_policy: DeliveryPolicy; bootstrap_policy: DeliveryPolicy }
const digest = (text: string) => createHash("sha256").update(text).digest("hex")

export default class VintageDeliveryService extends MedusaService({ DeliveryRule, DeliveryControl, DeliveryAudit }) {
  quote(input: DeliveryIncentiveInput) { return quoteDeliveryIncentive(input) }

  /** Reader is also used in native cart pricing/completion. Never swallow database errors. */
  async resolvePublishedPolicy(bootstrap: unknown): Promise<DeliveryPolicy> {
    const original = parseDeliveryPolicy(bootstrap)
    const [control] = await this.listDeliveryControls({ anchor_key: original.rule_id })
    return control ? parseDeliveryPolicy(control.active_policy) : original
  }

  @InjectManager()
  async publicationState(optionId: string, @MedusaContext() context?: Context<EntityManager>) {
    const manager = context?.manager
    if (!manager) throw new Error("Missing delivery database manager")
    const controls = await manager.execute<ControlRow[]>("select * from vintage_delivery_control where id = ? and deleted_at is null", [optionId])
    const revisions = await manager.execute("select id, revision_key, policy, created_at from vintage_delivery_rule where revision_key like ? and deleted_at is null order by created_at desc limit 101", [`admin:${optionId}:%`])
    const audits = await manager.execute("select id, actor_id, action, rule_id, generation, reason, payload, created_at from vintage_delivery_audit where option_id = ? order by created_at desc limit 101", [optionId])
    return { control: controls[0] || null, revisions: revisions.slice(0, 100), audit: audits.slice(0, 100), revisions_truncated: revisions.length > 100, audit_truncated: audits.length > 100 }
  }

  @InjectManager()
  async changePublication(actorId: string, optionId: string, bootstrapValue: unknown, action: "draft" | "publish" | "rollback", raw: unknown, @MedusaContext() context?: Context<EntityManager>): Promise<CommandResult> {
    if (!sliceEnabled(process.env)) throw new DeliveryAdminError(403, "SLICE_DISABLED", "Backoffice de homologação desativado.")
    requireDeliveryRole(actorId, action, process.env)
    if (!/^so_[A-Za-z0-9_-]{1,100}$/.test(optionId)) throw new DeliveryAdminError(400, "INVALID_OPTION", "Opção de entrega inválida.")
    const bootstrap = parseDeliveryPolicy(bootstrapValue)
    const command = parseDeliveryCommand(raw, action)
    return this.changePublication_(actorId, optionId, bootstrap, action, command, context)
  }

  @InjectTransactionManager()
  protected async changePublication_(actorId: string, optionId: string, bootstrap: DeliveryPolicy, action: "draft" | "publish" | "rollback", command: DeliveryCommand, @MedusaContext() context?: Context<EntityManager>): Promise<CommandResult> {
    const manager = context?.transactionManager
    if (!manager) throw new Error("Missing delivery transaction")
    // Only this module's tables are modified. Policy pointer + revision + audit commit together.
    await manager.execute("insert into vintage_delivery_control (id, anchor_key, revision_counter, active_policy, bootstrap_policy) values (?, ?, ?, ?::jsonb, ?::jsonb) on conflict (id) do nothing", [optionId, bootstrap.rule_id, bootstrap.version, JSON.stringify(bootstrap), JSON.stringify(bootstrap)])
    const [control] = await manager.execute<ControlRow[]>("select * from vintage_delivery_control where id = ? and deleted_at is null for update", [optionId])
    if (!control || control.anchor_key !== bootstrap.rule_id || control.bootstrap_policy.sales_channel_id !== bootstrap.sales_channel_id || control.bootstrap_policy.region_id !== bootstrap.region_id) throw new DeliveryAdminError(409, "BINDING_CHANGED", "Vínculo de entrega alterado. Requer reconciliação.")
    const requestKey = digest(`${optionId}:${actorId}:${command.request_id}`)
    const requestHash = digest(canonicalJson({ action, command }))
    const [existing] = await manager.execute("select request_hash, payload from vintage_delivery_audit where request_key = ?", [requestKey])
    if (existing) {
      if (existing.request_hash !== requestHash) throw new DeliveryAdminError(409, "IDEMPOTENCY_CONFLICT", "A mesma operação foi reutilizada com dados diferentes.")
      return { ...existing.payload.result, replayed: true }
    }
    if (control.generation !== command.expected_generation) throw new DeliveryAdminError(409, "STALE_GENERATION", "Outra publicação ocorreu. Atualize a tela antes de continuar.")
    let ruleId: string | null = command.rule_id ?? null
    let policy = control.bootstrap_policy
    if (action === "draft") {
      ruleId = `vdr_${randomUUID().replace(/-/g, "")}`
      policy = parseDeliveryPolicy({ ...control.active_policy, ...command.changes, rule_id: ruleId, version: control.revision_counter + 1 })
      await manager.execute("insert into vintage_delivery_rule (id, revision_key, policy) values (?, ?, ?::jsonb)", [ruleId, `admin:${optionId}:${policy.version}`, JSON.stringify(policy)])
      await manager.execute("update vintage_delivery_control set revision_counter = ?, updated_at = now() where id = ?", [policy.version, optionId])
    } else {
      if (ruleId) {
        const [revision] = await manager.execute("select policy from vintage_delivery_rule where id = ? and revision_key like ? and deleted_at is null", [ruleId, `admin:${optionId}:%`])
        if (!revision) throw new DeliveryAdminError(404, "REVISION_NOT_FOUND", "Revisão não pertence a esta entrega.")
        policy = parseDeliveryPolicy(revision.policy)
      }
      if (action === "rollback" && ruleId) {
        const [published] = await manager.execute("select id from vintage_delivery_audit where option_id = ? and rule_id = ? and action in ('publish','rollback') limit 1", [optionId, ruleId])
        if (!published) throw new DeliveryAdminError(409, "NOT_PREVIOUSLY_PUBLISHED", "Reversão exige uma revisão anteriormente publicada.")
      }
      if (control.active_rule_id === ruleId) throw new DeliveryAdminError(409, "ALREADY_ACTIVE", "Esta revisão já está ativa.")
      await manager.execute("update vintage_delivery_control set active_rule_id = ?, active_policy = ?::jsonb, generation = generation + 1, updated_at = now() where id = ?", [ruleId, JSON.stringify(policy), optionId])
    }
    const result: CommandResult = { rule_id: ruleId, generation: control.generation + (action === "draft" ? 0 : 1), active_rule_id: action === "draft" ? control.active_rule_id : ruleId, replayed: false }
    const payload = { before: control.active_policy, after: policy, result }
    await manager.execute("insert into vintage_delivery_audit (id, request_key, request_hash, actor_id, action, option_id, rule_id, generation, reason, payload) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb)", [`vda_${randomUUID().replace(/-/g, "")}`, requestKey, requestHash, actorId, action, optionId, ruleId, result.generation, command.reason, JSON.stringify(payload)])
    return result
  }
}
