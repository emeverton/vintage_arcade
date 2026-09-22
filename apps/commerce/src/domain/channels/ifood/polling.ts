/**
 * Polling fallback when webhooks are delayed/missing.
 * Contract only — live HTTP client stays off until Gate F.
 */

import { IfoodAdapterError, IfoodOrderEventType, IfoodWebhookEnvelope } from "./types"

export interface PollCursor {
  merchant_id: string
  since: string
  page_token?: string
}

export interface PollPage {
  events: IfoodWebhookEnvelope[]
  next_page_token?: string
  fetched_at: string
}

export interface IfoodEventPoller {
  poll(cursor: PollCursor): Promise<PollPage>
}

/** In-memory poller fed by fixtures — used in unit tests. */
export function createFixturePoller(pages: PollPage[]): IfoodEventPoller {
  let idx = 0
  return {
    async poll(cursor) {
      if (!cursor.merchant_id) throw new IfoodAdapterError("POLL_INVALID", "merchant_id required")
      if (idx >= pages.length) {
        return { events: [], fetched_at: new Date().toISOString() }
      }
      const page = pages[idx++]
      return page
    },
  }
}

/**
 * Merge polled events into ingest pipeline order by createdAt ascending.
 * Does not call live APIs.
 */
export function sortEventsForReplay(events: IfoodWebhookEnvelope[]): IfoodWebhookEnvelope[] {
  return [...events].sort((a, b) => {
    const ta = Date.parse(a.createdAt)
    const tb = Date.parse(b.createdAt)
    if (ta !== tb) return ta - tb
    const order: IfoodOrderEventType[] = ["PLC", "CFM", "RTP", "DSP", "CON", "CAN"]
    return order.indexOf(a.code) - order.indexOf(b.code)
  })
}
