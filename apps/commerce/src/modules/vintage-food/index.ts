import { Module } from "@medusajs/framework/utils"
import VintageFoodService from "./service"
export default Module("vintageFood", { service: VintageFoodService })
