import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import VintageFulfillmentProvider from "./service"
export default ModuleProvider(Modules.FULFILLMENT, { services: [VintageFulfillmentProvider] })
