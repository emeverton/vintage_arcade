/** OAuth abstraction for iFood — no live HTTP until Gate F credentials exist. */

import { IfoodAdapterError, IfoodCredentials } from "./types"

export interface IfoodAccessToken {
  access_token: string
  token_type: "Bearer"
  expires_at: string
  scope: string
}

export interface IfoodOAuthClient {
  /** Exchange client credentials for access token (mock or real). */
  fetchToken(credentials: IfoodCredentials): Promise<IfoodAccessToken>
  /** True when token is usable (not expired with 60s skew). */
  isTokenValid(token: IfoodAccessToken, now?: Date): boolean
}

export function createMockOAuthClient(options?: { fail?: boolean; ttlSeconds?: number }): IfoodOAuthClient {
  return {
    async fetchToken(credentials) {
      if (options?.fail) {
        throw new IfoodAdapterError("OAUTH_FAILED", "Mock OAuth failure", true)
      }
      if (!credentials.client_id || !credentials.client_secret || credentials.client_secret.length < 16) {
        throw new IfoodAdapterError("OAUTH_INVALID_CREDENTIALS", "Incomplete credentials")
      }
      const ttl = options?.ttlSeconds ?? 3600
      return {
        access_token: `mock_token_${credentials.merchant_id}`,
        token_type: "Bearer",
        expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
        scope: "merchant",
      }
    },
    isTokenValid(token, now = new Date()) {
      const expires = Date.parse(token.expires_at)
      if (Number.isNaN(expires)) return false
      return expires - now.getTime() > 60_000
    },
  }
}
