/** Payment provider boundary — Vintage owns order state; PSP is an adapter. */

export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "timed_out"
  | "cancelled"
  | "refunded"

export interface PaymentSession {
  id: string
  order_ref: string
  amount_minor: number
  currency: "brl"
  status: PaymentStatus
  provider: string
  idempotency_key: string
}

export interface PaymentProvider {
  createSession(input: {
    order_ref: string
    amount_minor: number
    idempotency_key: string
  }): PaymentSession
  authorize(session_id: string): PaymentSession
  capture(session_id: string): PaymentSession
  cancel(session_id: string): PaymentSession
  refund(session_id: string, amount_minor?: number): PaymentSession
  applyWebhook(payload: { session_id: string; status: PaymentStatus; event_id: string }): PaymentSession
}

export class PaymentAdapterError extends Error {
  constructor(readonly code: string, message: string) {
    super(message)
    this.name = "PaymentAdapterError"
  }
}

export function assertPaymentsLiveDisabled(env: Record<string, string | undefined>): void {
  if (env.PAYMENTS_LIVE_ENABLED && env.PAYMENTS_LIVE_ENABLED !== "false") {
    throw new PaymentAdapterError("PAYMENTS_LIVE_FORBIDDEN", "PAYMENTS_LIVE_ENABLED must remain false")
  }
}

/** In-memory mock PSP for unit tests and synthetic checkout. */
export function createMockPaymentProvider(): PaymentProvider {
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
      if (!Number.isSafeInteger(input.amount_minor) || input.amount_minor < 1) {
        throw new PaymentAdapterError("INVALID_AMOUNT", "amount_minor invalid")
      }
      for (const existing of sessions.values()) {
        if (existing.idempotency_key === input.idempotency_key) return { ...existing }
      }
      seq += 1
      const session: PaymentSession = {
        id: `pay_mock_${seq}`,
        order_ref: input.order_ref,
        amount_minor: input.amount_minor,
        currency: "brl",
        status: "created",
        provider: "mock",
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
    refund(session_id, amount_minor) {
      const s = get(session_id)
      if (s.status !== "captured" && s.status !== "refunded") {
        throw new PaymentAdapterError("INVALID_TRANSITION", s.status)
      }
      if (amount_minor !== undefined && amount_minor !== s.amount_minor) {
        throw new PaymentAdapterError("PARTIAL_REFUND_UNSUPPORTED", "Mock PSP is full refund only")
      }
      s.status = "refunded"
      return { ...s }
    },
    applyWebhook(payload) {
      if (webhookSeen.has(payload.event_id)) return { ...get(payload.session_id) }
      webhookSeen.add(payload.event_id)
      const s = get(payload.session_id)
      if (payload.status === "timed_out" || payload.status === "failed") {
        s.status = payload.status
      } else if (payload.status === "authorized" || payload.status === "captured") {
        s.status = payload.status
      } else {
        throw new PaymentAdapterError("UNSUPPORTED_WEBHOOK", payload.status)
      }
      return { ...s }
    },
  }
}
