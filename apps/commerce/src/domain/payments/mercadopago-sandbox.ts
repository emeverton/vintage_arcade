/** Mercado Pago sandbox adapter — PAYMENTS_LIVE_ENABLED must stay false. */

import {
  PaymentAdapterError,
  PaymentProvider,
  PaymentSession,
  PaymentStatus,
  assertPaymentsLiveDisabled,
} from "./provider"

export interface MercadoPagoSandboxConfig {
  access_token: string
  webhook_secret: string
  /** When true, no outbound HTTP — deterministic in-memory sandbox. */
  offline: boolean
}

export function assertMercadoPagoSandboxOnly(env: Record<string, string | undefined>): void {
  assertPaymentsLiveDisabled(env)
  if (env.MERCADOPAGO_LIVE_ENABLED && env.MERCADOPAGO_LIVE_ENABLED !== "false") {
    throw new PaymentAdapterError("MP_LIVE_FORBIDDEN", "MERCADOPAGO_LIVE_ENABLED must remain false")
  }
}

/**
 * Sandbox-shaped provider implementing PaymentProvider.
 * Offline mode is for unit tests until real sandbox credentials exist.
 */
export function createMercadoPagoSandboxProvider(config: MercadoPagoSandboxConfig): PaymentProvider {
  if (!config.offline) {
    throw new PaymentAdapterError(
      "MP_HTTP_NOT_WIRED",
      "Live HTTP Mercado Pago client is not wired; use offline:true until Gate E credentials"
    )
  }
  if (!config.access_token || config.access_token.length < 8) {
    throw new PaymentAdapterError("MP_TOKEN_REQUIRED", "sandbox access_token required")
  }

  const sessions = new Map<string, PaymentSession>()
  const webhookSeen = new Set<string>()
  let seq = 0

  function get(id: string): PaymentSession {
    const s = sessions.get(id)
    if (!s) throw new PaymentAdapterError("SESSION_NOT_FOUND", id)
    return s
  }

  return {
    createSession(input) {
      for (const existing of sessions.values()) {
        if (existing.idempotency_key === input.idempotency_key) return { ...existing }
      }
      if (!Number.isSafeInteger(input.amount_minor) || input.amount_minor < 1) {
        throw new PaymentAdapterError("INVALID_AMOUNT", "amount_minor invalid")
      }
      seq += 1
      const session: PaymentSession = {
        id: `mp_sbx_${seq}`,
        order_ref: input.order_ref,
        amount_minor: input.amount_minor,
        currency: "brl",
        status: "created",
        provider: "mercadopago_sandbox",
        idempotency_key: input.idempotency_key,
      }
      sessions.set(session.id, session)
      return { ...session }
    },
    authorize(session_id) {
      const s = get(session_id)
      if (s.status === "failed" || s.status === "timed_out" || s.status === "cancelled") {
        throw new PaymentAdapterError("INVALID_TRANSITION", s.status)
      }
      s.status = "authorized"
      return { ...s }
    },
    capture(session_id) {
      const s = get(session_id)
      if (s.status !== "authorized" && s.status !== "captured") {
        throw new PaymentAdapterError("INVALID_TRANSITION", s.status)
      }
      s.status = "captured"
      return { ...s }
    },
    cancel(session_id) {
      const s = get(session_id)
      if (s.status === "captured" || s.status === "refunded") {
        throw new PaymentAdapterError("INVALID_TRANSITION", s.status)
      }
      s.status = "cancelled"
      return { ...s }
    },
    refund(session_id) {
      const s = get(session_id)
      if (s.status !== "captured" && s.status !== "refunded") {
        throw new PaymentAdapterError("INVALID_TRANSITION", s.status)
      }
      s.status = "refunded"
      return { ...s }
    },
    applyWebhook(payload) {
      if (webhookSeen.has(payload.event_id)) return { ...get(payload.session_id) }
      webhookSeen.add(payload.event_id)
      const s = get(payload.session_id)
      const allowed: PaymentStatus[] = ["authorized", "captured", "failed", "timed_out"]
      if (!allowed.includes(payload.status)) {
        throw new PaymentAdapterError("UNSUPPORTED_WEBHOOK", payload.status)
      }
      s.status = payload.status
      return { ...s }
    },
  }
}
