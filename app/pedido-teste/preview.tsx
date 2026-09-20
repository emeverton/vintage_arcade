"use client"
import { useEffect, useState } from "react"
import styles from "./preview.module.css"

type Option = { variant_id: string; name: string; amount_minor: number }
type Catalog = { name: string; postal_code: string; slots: { id: string; min: number; max: number; options: Option[] }[]; extra: Option }
type Quote = { id: string; expires_at: number; gap_minor: number | null; status: string; threshold_minor: number; final_fee_minor: number; full_subsidy: boolean }
type Cart = { status: string; order_reference?: string; combo_added?: boolean; extra_enabled?: boolean; items: { name: string; quantity: number; amount_minor: number }[]; subtotal_minor?: number; shipping_minor?: number; total_minor?: number; quote?: Quote | null; needs_quote?: boolean }
const money = (minor = 0) => (minor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

async function api(action: string, body?: unknown) {
  const response = await fetch(`/api/vintage-test/${action}`, { method: body === undefined ? "GET" : "POST", cache: "no-store", headers: { "Content-Type": "application/json", "x-vintage-preview": "1" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  const value = await response.json()
  if (!response.ok) throw new Error(value.message || "Operação indisponível.")
  return value
}

export default function CheckoutPreview() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [cart, setCart] = useState<Cart>({ status: "empty", items: [] })
  const [selection, setSelection] = useState<Record<string, string>>({})
  const [postcode, setPostcode] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    let current = true
    Promise.all([api("catalog"), api("state")]).then(([c, state]) => {
      if (!current) return
      setCatalog(c); setCart(state); setPostcode(c.postal_code)
      setSelection(Object.fromEntries((c as Catalog).slots.map((s) => [s.id, s.min > 0 ? s.options[0]?.variant_id || "" : ""])))
    }).catch((e) => { if (current) setMessage(e.message) })
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => { current = false; clearInterval(timer) }
  }, [])
  async function run(action: string, body: unknown = {}) {
    if (busy) return
    setBusy(true); setMessage(""); setConfirmed(false)
    try {
      if (action === "combo" && cart.status === "empty") await api("start", {})
      setCart(await api(action, body))
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível continuar.")
      try { setCart(await api("state")) } catch { /* Keep the last visible snapshot; confirmation remains disabled. */ }
    } finally { setBusy(false) }
  }
  const quote = cart.quote
  const valid = !!quote && quote.expires_at > now && !cart.needs_quote
  const completed = cart.status === "completed"
  const gap = valid ? quote.gap_minor : null
  return <main className={styles.screen}>
    <div className={styles.wrap}>
      <header className={styles.header}>
        <img src="/images/vintage-arcade-logo.webp" width="76" height="76" alt="Vintage Arcade" />
        <div><span className={styles.eyebrow}>VINTAGE COMMERCE / HOMOLOGAÇÃO</span><h1>Monte seu pedido de teste</h1><p>Escolhas, carrinho e frete conectados ao backend.</p></div>
      </header>
      <aside className={styles.notice}><strong>Simulação, sem venda real.</strong> Produtos e valores sintéticos. Não há cobrança, envio à cozinha ou acionamento de entregador. O catálogo comercial ainda será aprovado.</aside>
      {message && <div role="alert" className={styles.error}>{message}</div>}
      {!catalog ? <p aria-live="polite">Carregando catálogo de teste…</p> : <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="combo-title">
          <span className={styles.eyebrow}>01 / ESCOLHA OS COMPONENTES</span><h2 id="combo-title">Combo de demonstração</h2>
          <p className={styles.muted}>O preço deste protótipo é a soma dos componentes. Todas as quantias são consultadas no servidor.</p>
          {catalog.slots.map((slot, index) => <div className={styles.field} key={slot.id}>
            <label htmlFor={`slot-${slot.id}`}>{slot.id === "main" ? "Lanche" : slot.id === "drink" ? "Bebida" : "Complemento opcional"} <small>{slot.min ? "Obrigatório" : "Opcional"}</small></label>
            <select id={`slot-${slot.id}`} value={selection[slot.id] || ""} disabled={busy || !!cart.combo_added || completed} onChange={(e) => setSelection({ ...selection, [slot.id]: e.target.value })}>
              {!slot.min && <option value="">Sem complemento</option>}
              {slot.options.map((o) => <option key={o.variant_id} value={o.variant_id}>{o.name} · {money(o.amount_minor)}</option>)}
            </select>
          </div>)}
          <button className={styles.primary} disabled={busy || !!cart.combo_added || completed} onClick={() => run("combo", { selections: catalog.slots.filter((s) => selection[s.id]).map((s) => ({ slot_id: s.id, variant_id: selection[s.id], quantity: 1 })) })}>{busy ? "Processando…" : cart.combo_added ? "Combo adicionado" : "Adicionar combo de teste"}</button>
          <div className={styles.extra}><span className={styles.eyebrow}>COMPLETE A EXPERIÊNCIA</span><h3>Uma sobremesa a mais?</h3><p>{catalog.extra.name} · {money(catalog.extra.amount_minor)}</p><button className={styles.secondary} disabled={busy || !cart.combo_added || completed} onClick={() => run("extra", { enabled: !cart.extra_enabled })}>{cart.extra_enabled ? "Remover sobremesa extra" : "Adicionar sobremesa extra"}</button></div>
        </section>
        <section className={styles.panel} aria-labelledby="cart-title">
          <span className={styles.eyebrow}>02 / CONFIRA O CARRINHO</span><h2 id="cart-title">{completed ? "Simulação concluída" : "Seu carrinho de teste"}</h2>
          {!cart.items.length && <p className={styles.muted}>Adicione o combo para visualizar os valores e calcular o frete.</p>}
          <div className={styles.items}>{cart.items.map((item, i) => <div className={styles.item} key={i}><span>{item.quantity} × {item.name}</span><strong>{money(item.amount_minor * item.quantity)}</strong></div>)}</div>
          {valid && !completed && <div className={styles.incentive} aria-live="polite">
            {quote.status === "free_shipping" ? <strong>Frete grátis aplicado nesta simulação.</strong> : quote.status === "discounted" ? <strong>Frete reduzido: {money(quote.final_fee_minor)}.</strong> : gap !== null && gap > 0 ? <><strong>Faltam {money(gap)} para {quote.full_subsidy ? "frete grátis" : "reduzir o frete"}.</strong><progress aria-label="Progresso para benefício de frete" max={quote.threshold_minor} value={Math.min(cart.subtotal_minor || 0, quote.threshold_minor)} /></> : <strong>Sem incentivo ativo para este carrinho.</strong>}
          </div>}
          {cart.items.length > 0 && <>
            <div className={styles.totals}><div><span>Produtos</span><strong data-testid="subtotal">{money(cart.subtotal_minor)}</strong></div><div><span>{valid || completed ? "Frete" : "Última cotação de frete"}</span><strong data-testid="shipping">{money(cart.shipping_minor)}</strong></div><div className={styles.total}><span>Total {completed ? "simulado" : "do teste"}</span><strong data-testid="total">{money(cart.total_minor)}</strong></div></div>
            {!completed ? <>
              <div className={styles.field}><label htmlFor="postal-code">CEP de teste</label><div className={styles.postal}><input id="postal-code" inputMode="numeric" autoComplete="off" maxLength={9} value={postcode} onChange={(e) => setPostcode(e.target.value)} /><button className={styles.secondary} disabled={busy} onClick={() => run("quote", { postal_code: postcode })}>Recalcular frete</button></div></div>
              <p className={styles.muted}>{valid ? "Cotação válida por até cinco minutos, sujeita à revalidação da regra antes da confirmação." : "Atualize o frete para conferir os valores antes de continuar."}</p>
              <label className={styles.confirm}><input type="checkbox" checked={confirmed} disabled={busy || !valid} onChange={(e) => setConfirmed(e.target.checked)} /><span>Entendo que este pedido é apenas uma simulação e não será cobrado nem entregue.</span></label>
              <button className={styles.primary} disabled={busy || !valid || !confirmed} onClick={() => run("complete", { quote_id: quote?.id, acknowledge_simulation: true })}>{busy ? "Processando…" : "Concluir pedido simulado"}</button>
            </> : <div className={styles.success} role="status"><strong>Pedido de teste registrado.</strong><p>Nenhum valor foi cobrado.</p><p className={styles.reference}>{cart.order_reference}</p><button className={styles.secondary} onClick={() => run("reset")}>Iniciar outra simulação</button></div>}
          </>}
        </section>
      </div>}
      <footer className={styles.footer}>Homologação técnica isolada. iFood, pagamentos reais e exportação para mídia estão desativados.</footer>
    </div>
  </main>
}
