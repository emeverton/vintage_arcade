import { randomBytes } from 'node:crypto'
import { writeFileSync } from 'node:fs'
const postgres = randomBytes(24).toString('hex')
const redis = randomBytes(24).toString('hex')
const lines = [
  'APP_ENV=local', 'NODE_ENV=development', 'PORT=9000', 'MEDUSA_WORKER_MODE=shared',
  'DISABLE_MEDUSA_ADMIN=false', 'MEDUSA_BACKEND_URL=http://localhost:9000',
  `POSTGRES_PASSWORD=${postgres}`, `REDIS_PASSWORD=${redis}`,
  `DATABASE_URL=postgresql://vintage:${postgres}@127.0.0.1:55432/vintage_local`,
  `REDIS_URL=redis://:${redis}@127.0.0.1:56379/0`,
  `JWT_SECRET=${randomBytes(32).toString('hex')}`, `COOKIE_SECRET=${randomBytes(32).toString('hex')}`,
  'STORE_CORS=http://localhost:3000', 'ADMIN_CORS=http://localhost:9000',
  'AUTH_CORS=http://localhost:3000,http://localhost:9000',
  'IFOOD_ENABLED=false', 'PAYMENTS_LIVE_ENABLED=false', 'ADS_EXPORT_ENABLED=false',
]
try { writeFileSync('.env', lines.join('\n') + '\n', { flag: 'wx', mode: 0o600 }) }
catch (error) { if (error.code === 'EEXIST') throw new Error('.env already exists; refusing to overwrite it'); throw error }
console.log('Created local .env without printing credentials. Do not reuse it in staging or production.')
