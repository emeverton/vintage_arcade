import { defineConfig, loadEnv } from "@medusajs/framework/utils"
import { readEnvironment } from "./src/config/environment"

loadEnv(process.env.NODE_ENV || "development", process.cwd())
const env = readEnvironment(process.env)

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: env.databaseUrl,
    redisUrl: env.redisUrl,
    workerMode: env.workerMode,
    http: {
      storeCors: env.storeCors, adminCors: env.adminCors, authCors: env.authCors,
      jwtSecret: env.jwtSecret, cookieSecret: env.cookieSecret,
    },
  },
  admin: { disable: env.adminDisabled, backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000" },
  modules: [
    { resolve: "@medusajs/medusa/event-bus-redis", options: {
      redisUrl: env.redisUrl, queueName: "vintage-events",
      jobOptions: { attempts: 5, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: { age: 3600, count: 1000 }, removeOnFail: { age: 604800, count: 10000 } },
    } },
    { resolve: "@medusajs/medusa/workflow-engine-redis", options: { redis: { redisUrl: env.redisUrl } } },
    { resolve: "@medusajs/medusa/locking", options: { providers: [{ resolve: "@medusajs/medusa/locking-redis", id: "locking-redis", is_default: true, options: { redisUrl: env.redisUrl } }] } },
    { resolve: "@medusajs/medusa/caching", options: { providers: [{ resolve: "@medusajs/caching-redis", id: "caching-redis", is_default: true, options: { redisUrl: env.redisUrl } }] } },
    { resolve: "./src/modules/vintage-delivery" },
  ],
})
