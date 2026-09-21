import type { ExecArgs, IFulfillmentModuleService, ISalesChannelModuleService, IStoreModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createSalesChannelsWorkflow,
  createRegionsWorkflow,
  createStockLocationsWorkflow,
  createShippingProfilesWorkflow,
  createShippingOptionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import type VintageDeliveryService from "../modules/vintage-delivery/service"
import type VintageFoodService from "../modules/vintage-food/service"
import { parseDeliveryPolicy } from "../domain/delivery-policy"
import { parseComboSpec } from "../domain/combo"
import { sliceEnabled } from "../domain/slice-guard"

const FIXTURE_VERSION = "staging_synthetic_v1"
const POSTAL = "00000001"

/**
 * Idempotent synthetic bootstrap for APP_ENV=staging only.
 * Never runs against vintage_ci and never writes ephemeral CI fixture files.
 */
export default async function bootstrapStagingFixtures({ container }: ExecArgs) {
  const db = new URL(process.env.DATABASE_URL || "invalid:")
  if (process.env.APP_ENV !== "staging" || !sliceEnabled(process.env) || db.pathname !== "/vintage_staging") {
    throw new Error("Staging fixture bootstrap requires APP_ENV=staging and database vintage_staging")
  }
  if (process.env.GITHUB_ACTIONS === "true") throw new Error("Staging bootstrap must not run inside CI Actions")
  if (["localhost", "127.0.0.1", "postgres"].includes(db.hostname) && process.env.VINTAGE_ALLOW_LOCAL_STAGING_BOOTSTRAP !== "true") {
    throw new Error("Refusing local hostname unless VINTAGE_ALLOW_LOCAL_STAGING_BOOTSTRAP=true")
  }

  const delivery = container.resolve<VintageDeliveryService>("vintageDelivery")
  const food = container.resolve<VintageFoodService>("vintageFood")
  const fulfillment = container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
  const stores = container.resolve<IStoreModuleService>(Modules.STORE)
  const channels = container.resolve<ISalesChannelModuleService>(Modules.SALES_CHANNEL)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve("query")

  const existingCombos = await food.listComboDefinitions({ revision_key: `${FIXTURE_VERSION}:combo` })
  if (existingCombos.length) {
    const combo = existingCombos[0]
    const definition = parseComboSpec(combo.definition)
    const { data: options } = await query.graph({
      entity: "shipping_option",
      fields: ["id", "name", "data"],
      filters: { name: `${FIXTURE_VERSION}_freight` },
    })
    const shipping = options[0]
    if (!shipping) throw new Error("Staging freight option missing for existing fixture")
    const channelId = definition.sales_channel_id
    const regionId = (shipping.data as { vintage_policy?: { region_id?: string } } | null)?.vintage_policy?.region_id
    const dessert = definition.slots.find((s) => s.id === "extra")?.options[0]?.variant_id
    if (!regionId || !dessert) throw new Error("Existing staging fixture is incomplete")
    const fixture = {
      synthetic: true as const,
      fixture_version: FIXTURE_VERSION,
      channel_id: channelId,
      region_id: regionId,
      combo_id: combo.id,
      shipping_option_id: shipping.id,
      extra_variant_id: dessert,
      postal_code: POSTAL,
    }
    console.log("STAGING_FIXTURE_JSON=" + JSON.stringify(fixture))
    console.log("STAGING_FIXTURE_BOOTSTRAP_REUSED")
    return
  }

  const { result: [channel] } = await createSalesChannelsWorkflow(container).run({
    input: { salesChannelsData: [{ name: `STAGING_SYNTHETIC_${FIXTURE_VERSION}` }] },
  })
  const [existingStore] = await stores.listStores()
  if (!existingStore) {
    await stores.createStores({ name: "STAGING_SYNTHETIC_STORE", supported_currencies: [{ currency_code: "brl", is_default: true }] })
  }
  const { result: [region] } = await createRegionsWorkflow(container).run({
    input: { regions: [{ name: `STAGING_BR_${FIXTURE_VERSION}`, currency_code: "brl", countries: ["br"], automatic_taxes: false, payment_providers: ["pp_system_default"] }] },
  })
  const { result: [location] } = await createStockLocationsWorkflow(container).run({
    input: { locations: [{ name: `STAGING_KITCHEN_${FIXTURE_VERSION}`, address: { city: "QA", country_code: "br", address_1: "Synthetic staging fixture" } }] },
  })
  const { result: [profile] } = await createShippingProfilesWorkflow(container).run({
    input: { data: [{ name: `STAGING_FOOD_${FIXTURE_VERSION}`, type: "default" }] },
  })
  const set = await fulfillment.createFulfillmentSets({
    name: `STAGING_DELIVERY_${FIXTURE_VERSION}`,
    type: "shipping",
    service_zones: [{ name: `STAGING_ZONE_${FIXTURE_VERSION}`, geo_zones: [{ type: "country", country_code: "br" }] }],
  })
  await link.create({ [Modules.STOCK_LOCATION]: { stock_location_id: location.id }, [Modules.FULFILLMENT]: { fulfillment_provider_id: "vintage_vintage" } })
  await link.create({ [Modules.STOCK_LOCATION]: { stock_location_id: location.id }, [Modules.FULFILLMENT]: { fulfillment_set_id: set.id } })
  await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: location.id, add: [channel.id] } })

  const policy = parseDeliveryPolicy({
    rule_id: `vdr_${FIXTURE_VERSION}`,
    version: 1,
    currency_code: "brl",
    sales_channel_id: channel.id,
    region_id: region.id,
    postal_code_from: "00000000",
    postal_code_to: "00000099",
    minimum_order_minor: 1000,
    base_fee_minor: 900,
    threshold_minor: 3000,
    subsidy_cap_minor: 900,
    enabled: true,
    promotion_active: true,
    starts_at: null,
    ends_at: null,
  })
  await delivery.createDeliveryRules({ id: policy.rule_id, revision_key: `${FIXTURE_VERSION}:delivery`, policy: policy as unknown as Record<string, unknown> })
  const { result: [shipping] } = await createShippingOptionsWorkflow(container).run({
    input: [{
      name: `${FIXTURE_VERSION}_freight`,
      price_type: "calculated",
      provider_id: "vintage_vintage",
      service_zone_id: set.service_zones[0].id,
      shipping_profile_id: profile.id,
      type: { label: "Staging delivery", description: "Synthetic only", code: FIXTURE_VERSION },
      data: { vintage_policy: policy as unknown as Record<string, unknown> },
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" },
      ],
    }],
  })

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [
        { title: "Staging burger", handle: `${FIXTURE_VERSION}-burger`, status: ProductStatus.PUBLISHED, shipping_profile_id: profile.id, options: [{ title: "Size", values: ["Single"] }], variants: [{ title: "Burger", sku: `${FIXTURE_VERSION}-B`, manage_inventory: false, options: { Size: "Single" }, prices: [{ currency_code: "brl", amount: 19.9 }] }], sales_channels: [{ id: channel.id }] },
        { title: "Staging drink", handle: `${FIXTURE_VERSION}-drink`, status: ProductStatus.PUBLISHED, shipping_profile_id: profile.id, options: [{ title: "Size", values: ["Single"] }], variants: [{ title: "Drink", sku: `${FIXTURE_VERSION}-D`, manage_inventory: false, options: { Size: "Single" }, prices: [{ currency_code: "brl", amount: 5.1 }] }], sales_channels: [{ id: channel.id }] },
        { title: "Staging dessert", handle: `${FIXTURE_VERSION}-dessert`, status: ProductStatus.PUBLISHED, shipping_profile_id: profile.id, options: [{ title: "Size", values: ["Single"] }], variants: [{ title: "Dessert", sku: `${FIXTURE_VERSION}-E`, manage_inventory: false, options: { Size: "Single" }, prices: [{ currency_code: "brl", amount: 5 }] }], sales_channels: [{ id: channel.id }] },
      ],
    },
  })
  const burger = products[0].variants![0].id!
  const drink = products[1].variants![0].id!
  const dessert = products[2].variants![0].id!
  const spec = parseComboSpec({
    version: 1,
    sales_channel_id: channel.id,
    slots: [
      { id: "main", min: 1, max: 1, options: [{ variant_id: burger, max_quantity: 1 }] },
      { id: "drink", min: 1, max: 1, options: [{ variant_id: drink, max_quantity: 1 }] },
      { id: "extra", min: 0, max: 1, options: [{ variant_id: dessert, max_quantity: 1 }] },
    ],
  })
  const combo = await food.createComboDefinitions({
    revision_key: `${FIXTURE_VERSION}:combo`,
    name: "Staging synthetic combo",
    definition: spec as unknown as Record<string, unknown>,
  })

  // Ensure channel lookup remains valid for operators inspecting admin.
  await channels.retrieveSalesChannel(channel.id)

  const fixture = {
    synthetic: true as const,
    fixture_version: FIXTURE_VERSION,
    channel_id: channel.id,
    region_id: region.id,
    combo_id: combo.id,
    shipping_option_id: shipping.id,
    extra_variant_id: dessert,
    postal_code: POSTAL,
  }
  console.log("STAGING_FIXTURE_JSON=" + JSON.stringify(fixture))
  console.log("STAGING_FIXTURE_BOOTSTRAP_CREATED")
}
