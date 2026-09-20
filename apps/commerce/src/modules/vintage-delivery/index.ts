import { Module } from "@medusajs/framework/utils"
import VintageDeliveryService from "./service"

export const VINTAGE_DELIVERY_MODULE = "vintageDelivery"
export default Module(VINTAGE_DELIVERY_MODULE, { service: VintageDeliveryService })
