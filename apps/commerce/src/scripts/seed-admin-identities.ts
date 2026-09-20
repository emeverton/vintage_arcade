import { appendFileSync, mkdirSync, writeFileSync } from "node:fs"
import type { ExecArgs, IUserModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/** Creates QA actors only. No real user receives permissions. */
export default async function seedAdminIdentities({ container }: ExecArgs) {
  const db = new URL(process.env.DATABASE_URL || "invalid:")
  if (process.env.APP_ENV !== "test" || db.pathname !== "/vintage_ci" || !["localhost", "127.0.0.1", "postgres"].includes(db.hostname) || !process.env.GITHUB_ENV) throw new Error("QA identity provisioning is restricted to disposable CI")
  const users = container.resolve<IUserModuleService>(Modules.USER)
  const ids: Record<string, string> = {}
  for (const role of ["viewer", "editor", "publisher", "outsider"]) {
    const user = await users.createUsers({ email: `qa-delivery-${role}@example.invalid`, first_name: "QA", last_name: role })
    ids[role] = user.id
    if (role !== "outsider") appendFileSync(process.env.GITHUB_ENV, `VINTAGE_DELIVERY_${role.toUpperCase()}_IDS=${user.id}\n`)
  }
  mkdirSync(".cache", { recursive: true })
  writeFileSync(".cache/admin-identities.json", JSON.stringify(ids), { mode: 0o600 })
  console.log("QA_DELIVERY_IDENTITIES_CREATED: viewer, editor, publisher and unprivileged actor")
}
