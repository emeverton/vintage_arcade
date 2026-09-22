import { IfoodAdapterError, IfoodCredentials } from "./types"
import { signIfoodPayload, verifyIfoodSignature } from "./signature"
import { indexCatalogMap, mapComboV2, mapIfoodItem } from "./catalog-mapping"
import {
  createPipelineState,
  ingestIfoodWebhook,
  mapEnvelopeToOrder,
  reprocessIfoodWebhook,
} from "./order-pipeline"
import { createMockOAuthClient } from "./oauth"
import { createFixturePoller, sortEventsForReplay } from "./polling"

export * from "./types"
export {
  signIfoodPayload,
  verifyIfoodSignature,
  indexCatalogMap,
  mapComboV2,
  mapIfoodItem,
  createPipelineState,
  ingestIfoodWebhook,
  mapEnvelopeToOrder,
  reprocessIfoodWebhook,
  createMockOAuthClient,
  createFixturePoller,
  sortEventsForReplay,
}

/** Live iFood stays off until explicit homologation. Env gate lives in readEnvironment. */
export function assertIfoodDisabled(env: Record<string, string | undefined>): void {
  if (env.IFOOD_ENABLED && env.IFOOD_ENABLED !== "false") {
    throw new IfoodAdapterError("IFOOD_LIVE_FORBIDDEN", "IFOOD_ENABLED must remain false until Gate F")
  }
}

export function createMockCredentials(): IfoodCredentials {
  return {
    client_id: "mock_client",
    client_secret: "mock_secret_value_16+",
    merchant_id: "merchant_mock_001",
  }
}
