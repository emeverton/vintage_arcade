import { readFileSync } from "node:fs"
import { checkoutPreviewEnabled, PreviewError } from "../domain/checkout-preview"
export interface PreviewFixture { synthetic: true; channel_id: string; region_id: string; combo_id: string; shipping_option_id: string; extra_variant_id: string; postal_code: string; fixture_version?: string }

function parseFixture(raw: unknown): PreviewFixture {
  const f = raw as PreviewFixture
  if (!f || f.synthetic !== true || !/^\d{8}$/.test(f.postal_code)) throw new Error("Only synthetic preview fixtures are permitted")
  for (const key of ["channel_id", "region_id", "combo_id", "shipping_option_id", "extra_variant_id"] as const) {
    if (typeof f[key] !== "string" || !/^[A-Za-z0-9_-]{3,150}$/.test(f[key])) throw new Error("Invalid preview fixture")
  }
  return f
}

export function readPreviewFixture(): PreviewFixture {
  if (!checkoutPreviewEnabled(process.env)) throw new PreviewError(404, "PREVIEW_DISABLED", "Prévia desativada.")
  if (process.env.APP_ENV === "staging") {
    const encoded = process.env.VINTAGE_PREVIEW_FIXTURE_JSON
    if (!encoded?.trim()) throw new PreviewError(503, "FIXTURE_MISSING", "Dados sintéticos persistentes não provisionados.")
    try { return parseFixture(JSON.parse(encoded)) } catch { throw new PreviewError(503, "FIXTURE_INVALID", "Fixture sintética de staging inválida.") }
  }
  const path = process.env.VINTAGE_PREVIEW_FIXTURE_FILE
  if (!path) throw new PreviewError(503, "FIXTURE_MISSING", "Dados sintéticos não provisionados.")
  return parseFixture(JSON.parse(readFileSync(path, "utf8")))
}
