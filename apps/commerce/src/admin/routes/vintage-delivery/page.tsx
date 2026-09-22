import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Input, Label, Badge } from "@medusajs/ui"
import Medusa from "@medusajs/js-sdk"
import { useEffect, useState, type FormEvent } from "react"
import type { DeliveryPolicy } from "../../../domain/delivery-policy"

const sdk = new Medusa({ baseUrl: __BACKEND_URL__ || "/", auth: { type: "session" } })
type Role = "viewer" | "editor" | "publisher"
type Audit = { id: string; actor_id: string; action: string; rule_id: string | null; generation: number; reason: string; created_at: string }
type Revision = { id: string; policy: DeliveryPolicy }
type State = { role: Role; generation: number; active_rule_id: string | null; active_policy: DeliveryPolicy; bootstrap_policy: DeliveryPolicy; revisions: Revision[]; audit: Audit[]; revisions_truncated: boolean; audit_truncated: boolean }
type Form = { minimum: string; fee: string; threshold: string; cap: string; from: string; to: string; enabled: boolean; promotion: boolean; starts: string; ends: string }
const money = (minor: number) => (minor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const decimal = (minor: number) => (minor / 100).toFixed(2)
const toMinor = (text: string) => {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(text.trim())) throw new Error("Use valores positivos em reais, com até duas casas decimais.")
  const [whole, fraction = ""] = text.trim().replace(",", ".").split(".")
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"))
}
const toForm = (p: DeliveryPolicy): Form => ({ minimum: decimal(p.minimum_order_minor), fee: decimal(p.base_fee_minor), threshold: decimal(p.threshold_minor), cap: decimal(p.subsidy_cap_minor), from: p.postal_code_from, to: p.postal_code_to, enabled: p.enabled, promotion: p.promotion_active, starts: p.starts_at || "", ends: p.ends_at || "" })
const messageOf = (error: unknown) => error instanceof Error ? error.message : "Não foi possível concluir a operação."
const selectStyle = { width: "100%", minHeight: 36, border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 10px", background: "var(--bg-base, white)", color: "inherit" }

export default function VintageDeliveryPage() {
  const [options, setOptions] = useState<{ id: string; name: string }[]>([])
  const [optionId, setOptionId] = useState("")
  const [state, setState] = useState<State | null>(null)
  const [form, setForm] = useState<Form | null>(null)
  const [revisionId, setRevisionId] = useState("")
  const [reason, setReason] = useState("")
  const [subtotal, setSubtotal] = useState("25.00")
  const [postcode, setPostcode] = useState("")
  const [preview, setPreview] = useState("")
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"publish" | "rollback" | null>(null)
  const [moreOptions, setMoreOptions] = useState(false)
  const base = `/admin/vintage-delivery/${encodeURIComponent(optionId)}`
  async function loadOptions(offset = 0) {
    const data = await sdk.client.fetch<{ options: { id: string; name: string }[]; count: number }>(`/admin/vintage-delivery?offset=${offset}`)
    setOptions((old) => offset ? [...old, ...data.options] : data.options)
    setMoreOptions(offset + data.options.length < data.count)
    if (!optionId && data.options[0]) setOptionId(data.options[0].id)
  }
  async function reload(keepRevision?: string) {
    const next = await sdk.client.fetch<State>(base)
    setState(next)
    const picked = keepRevision ? next.revisions.find((r) => r.id === keepRevision) : undefined
    setForm(toForm(picked?.policy || next.active_policy))
    setRevisionId(keepRevision || next.active_rule_id || "baseline")
    setPostcode((old) => old || next.active_policy.postal_code_from)
    return next
  }
  useEffect(() => { loadOptions().catch((e) => setError(messageOf(e))) }, [])
  useEffect(() => {
    if (!optionId) return
    let cancelled = false
    setState(null); setForm(null); setError(""); setPreview(""); setConfirmAction(null)
    sdk.client.fetch<State>(`/admin/vintage-delivery/${encodeURIComponent(optionId)}`).then((next) => {
      if (cancelled) return
      setState(next); setForm(toForm(next.active_policy)); setRevisionId(next.active_rule_id || "baseline"); setPostcode(next.active_policy.postal_code_from)
    }).catch((e) => { if (!cancelled) setError(messageOf(e)) })
    return () => { cancelled = true }
  }, [optionId])
  const changes = () => {
    if (!form) throw new Error("Selecione uma entrega.")
    return { minimum_order_minor: toMinor(form.minimum), base_fee_minor: toMinor(form.fee), threshold_minor: toMinor(form.threshold), subsidy_cap_minor: toMinor(form.cap), postal_code_from: form.from.replace(/-/g, ""), postal_code_to: form.to.replace(/-/g, ""), enabled: form.enabled, promotion_active: form.promotion, starts_at: form.starts.trim() || null, ends_at: form.ends.trim() || null }
  }
  const change = (key: keyof Form, value: string | boolean) => { setForm((old) => old ? { ...old, [key]: value } : old); setPreview(""); setConfirmAction(null) }
  async function run(action: "draft" | "preview" | "publish" | "rollback") {
    if (!state || busy) return
    setBusy(true); setError(""); setNotice("")
    try {
      if (action === "preview") {
        const response = await sdk.client.fetch<{ result: { finalFeeMinor: number; subsidyMinor: number; gapMinor: number | null } }>(`${base}/preview`, { method: "POST", body: { changes: changes(), subtotal_minor: toMinor(subtotal), postal_code: postcode } })
        const result = response.result
        setPreview(`Frete final: ${money(result.finalFeeMinor)}. Subsídio: ${money(result.subsidyMinor)}.${result.gapMinor !== null ? ` Faltam ${money(result.gapMinor)} para o benefício.` : " Sem incentivo ativo neste cenário."}`)
      } else {
        const body = { request_id: crypto.randomUUID(), expected_generation: state.generation, reason, ...(action === "draft" ? { changes: changes() } : { rule_id: revisionId === "baseline" ? null : revisionId }) }
        const response = await sdk.client.fetch<{ rule_id: string | null }>(`${base}/${action}`, { method: "POST", body })
        await reload(action === "draft" ? response.rule_id || undefined : undefined)
        setNotice(action === "draft" ? "Rascunho salvo. A regra ativa não foi alterada." : action === "publish" ? "Publicação confirmada e auditada." : "Reversão confirmada como uma nova publicação.")
        setConfirmAction(null)
      }
    } catch (e) { setError(messageOf(e)); setConfirmAction(null) } finally { setBusy(false) }
  }
  function chooseRevision(id: string) {
    setRevisionId(id); setConfirmAction(null); setPreview("")
    if (state) setForm(toForm(id === "baseline" ? state.bootstrap_policy : state.revisions.find((r) => r.id === id)?.policy || state.active_policy))
  }
  const selectedWasPublished = revisionId === "baseline" || state?.audit.some((a) => a.rule_id === revisionId && a.action !== "draft")
  return <div className="flex flex-col gap-y-4">
    <Container>
      <div className="flex flex-wrap items-center justify-between gap-3"><Heading level="h1">Regras de entrega</Heading><Badge color="orange">Homologação, sem produção</Badge></div>
      <Text className="mt-2 text-ui-fg-subtle">Configure rascunhos, simule o carrinho e publique apenas após conferir o impacto. iFood e pagamentos reais permanecem desativados.</Text>
      <div className="mt-4"><Label htmlFor="delivery-option">Opção de entrega</Label><select id="delivery-option" style={selectStyle} value={optionId} disabled={busy} onChange={(e) => setOptionId(e.target.value)}><option value="">Selecione</option>{options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
      {moreOptions && <Button variant="secondary" className="mt-2" onClick={() => loadOptions(options.length).catch((e) => setError(messageOf(e)))}>Carregar mais entregas</Button>}
      {!options.length && !error && <Text className="mt-3">Nenhuma entrega provisionada. O cadastro inicial depende do catálogo e da área de atendimento aprovados.</Text>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-ui-bg-error p-3 text-ui-fg-error">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-lg bg-ui-bg-subtle p-3">{notice}</p>}
    </Container>
    {state && form && <>
      <Container>
        <div className="flex flex-wrap justify-between gap-3"><Heading level="h2">Configuração e versões</Heading><Badge>{state.role}</Badge></div>
        <Text data-testid="active-revision" className="mt-2">Regra ativa: versão {state.active_policy.version}, geração de publicação {state.generation}. Frete {money(state.active_policy.base_fee_minor)}, benefício a partir de {money(state.active_policy.threshold_minor)}.</Text>
        <Label htmlFor="delivery-revision" className="mt-4 block">Revisão para consultar, publicar ou reverter</Label>
        <select id="delivery-revision" style={selectStyle} value={revisionId} disabled={busy} onChange={(e) => chooseRevision(e.target.value)}><option value="baseline">Configuração inicial</option>{state.revisions.map((r) => <option key={r.id} value={r.id}>Versão {r.policy.version}{r.id === state.active_rule_id ? " (ativa)" : ""}</option>)}</select>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); run("draft") }} className="mt-4">
          <fieldset disabled={busy || state.role === "viewer"} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {([['minimum','Pedido mínimo (R$)'],['fee','Frete base (R$)'],['threshold','Limite para benefício (R$)'],['cap','Subsídio máximo por pedido (R$)'],['from','CEP inicial'],['to','CEP final'],['starts','Início em UTC, opcional'],['ends','Fim em UTC, opcional']] as [keyof Form,string][]).map(([key,label]) => <div key={key}><Label htmlFor={`delivery-${key}`}>{label}</Label><Input id={`delivery-${key}`} value={String(form[key])} placeholder={key === 'starts' || key === 'ends' ? '2026-09-22T20:00:00Z' : undefined} onChange={(e) => change(key,e.target.value)} /></div>)}
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.enabled} onChange={(e) => change("enabled", e.target.checked)} /> Entrega habilitada</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.promotion} onChange={(e) => change("promotion", e.target.checked)} /> Incentivo de frete ativo</label>
            <div className="sm:col-span-2"><Label htmlFor="delivery-reason">Motivo da alteração</Label><Input id="delivery-reason" value={reason} maxLength={500} placeholder="Descreva a decisão comercial, sem dados pessoais" onChange={(e) => { setReason(e.target.value); setConfirmAction(null) }} /></div>
          </fieldset>
          <div className="mt-4 flex flex-wrap gap-2"><Button type="submit" disabled={busy || state.role === "viewer"}>Salvar rascunho</Button><Button type="button" variant="secondary" disabled={busy} onClick={() => reload().catch((e) => setError(messageOf(e)))}>Atualizar estado</Button></div>
        </form>
        {state.role === "publisher" && <div className="mt-4 border-t border-ui-border-base pt-4">
          <Text>Publicar utiliza a revisão salva selecionada, não alterações ainda não salvas no formulário. Nenhuma condição é copiada para o iFood.</Text>
          <div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" disabled={busy || revisionId === "baseline" || revisionId === state.active_rule_id} onClick={() => setConfirmAction("publish")}>Publicar revisão</Button><Button variant="secondary" disabled={busy || !selectedWasPublished || (revisionId === "baseline" ? state.active_rule_id === null : revisionId === state.active_rule_id)} onClick={() => setConfirmAction("rollback")}>Reverter para revisão</Button></div>
          {confirmAction && <div role="dialog" aria-label="Confirmar alteração de frete" className="mt-3 rounded-lg border border-ui-border-base p-4"><Text>A alteração muda o cálculo dos próximos recálculos de carrinho neste ambiente. Pedidos concluídos não serão alterados.</Text><div className="mt-3 flex gap-2"><Button disabled={busy || reason.trim().length < 5} onClick={() => run(confirmAction)}>Confirmar {confirmAction === "publish" ? "publicação" : "reversão"}</Button><Button variant="secondary" onClick={() => setConfirmAction(null)}>Cancelar</Button></div></div>}
        </div>}
      </Container>
      <Container><Heading level="h2">Simulação do rascunho em edição</Heading><Text className="mt-1 text-ui-fg-subtle">A simulação não publica regras e não cria pedidos. Considera itens após descontos, incluindo tributos dos itens, sem frete.</Text><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"><div><Label htmlFor="preview-subtotal">Total de itens elegíveis (R$)</Label><Input id="preview-subtotal" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} /></div><div><Label htmlFor="preview-postcode">CEP da simulação</Label><Input id="preview-postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} /></div></div><Button variant="secondary" className="mt-3" disabled={busy} onClick={() => run("preview")}>Simular frete</Button>{preview && <p role="status" data-testid="delivery-preview" className="mt-3 rounded-lg bg-ui-bg-subtle p-3">{preview}</p>}</Container>
      <Container><Heading level="h2">Histórico de auditoria</Heading><Text className="mt-1 text-ui-fg-subtle">Registro de autor, motivo, revisão e momento. Sem edição ou exclusão pela aplicação.</Text>{(state.audit_truncated || state.revisions_truncated) && <Text>Exibindo os 100 registros mais recentes. O histórico completo permanece no banco.</Text>}<div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Ação</th><th className="p-2">Geração</th><th className="p-2">Autor</th><th className="p-2">Motivo</th><th className="p-2">Data</th></tr></thead><tbody>{state.audit.map((a) => <tr key={a.id} className="border-t border-ui-border-base"><td className="p-2">{a.action}</td><td className="p-2">{a.generation}</td><td className="p-2 break-all">{a.actor_id}</td><td className="p-2">{a.reason}</td><td className="p-2 whitespace-nowrap">{new Date(a.created_at).toLocaleString("pt-BR")}</td></tr>)}</tbody></table></div></Container>
    </>}
  </div>
}
export const config = defineRouteConfig({ label: "Regras de entrega" })
