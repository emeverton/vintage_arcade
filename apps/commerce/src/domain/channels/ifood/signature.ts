import { createHmac, timingSafeEqual } from "node:crypto"
import { IfoodAdapterError } from "./types"

/** HMAC-SHA256 hex of raw body with client_secret. Header: `X-IFood-Signature`. */
export function signIfoodPayload(rawBody: string, clientSecret: string): string {
  if (!clientSecret || clientSecret.length < 16) throw new IfoodAdapterError("WEAK_SECRET", "client_secret too short")
  return createHmac("sha256", clientSecret).update(rawBody, "utf8").digest("hex")
}

export function verifyIfoodSignature(rawBody: string, clientSecret: string, signatureHeader: string): void {
  if (!signatureHeader || typeof signatureHeader !== "string") {
    throw new IfoodAdapterError("INVALID_SIGNATURE", "Missing signature header")
  }
  const expected = signIfoodPayload(rawBody, clientSecret)
  const provided = signatureHeader.trim().toLowerCase().replace(/^sha256=/, "")
  const a = Buffer.from(expected, "utf8")
  const b = Buffer.from(provided, "utf8")
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new IfoodAdapterError("INVALID_SIGNATURE", "Webhook signature mismatch")
  }
}
