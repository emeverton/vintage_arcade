# Vintage commerce foundation

This is an isolated Medusa backend, not a replacement for the live landing page. It includes an internal delivery-incentive calculation, not a completed customer checkout. No real catalog, PSP, iFood or Ads credentials are included.

## Local setup

Requirements: Node.js 22 LTS, npm, Docker Engine with Compose.

From the repository root:

```bash
cd apps/commerce
npm run env:init
cd ../..
docker compose --env-file apps/commerce/.env -f compose.foundation.yml up -d --wait
cd apps/commerce
# The initial CI freezes package-lock.json. Use npm install only before that commit exists.
npm ci
npm run test:unit
npm run typecheck
npm run db:migrate
npm run dev
```

`env:init` creates random development credentials and refuses to overwrite an existing `.env`. The root `.env.example` from the earlier documentation is not the backend configuration; use this application's template/generator.

Liveness: `http://localhost:9000/health`.
Readiness: `http://localhost:9000/health/ready`, checks PostgreSQL and Redis, returns 503 on failure.
Admin: `http://localhost:9000/app`, no default administrator is created. Create a local-only user using the Medusa CLI with a unique password; do not commit the credentials.

Stop infrastructure from the repository root:

```bash
docker compose --env-file apps/commerce/.env -f compose.foundation.yml down
```

Named local volumes are preserved. Removing volumes destroys local data and is intentionally not part of the standard stop command.

## Builds and migrations

`npm run build` writes `.medusa/server`. The production working directory is `.medusa/server`, with its own installed production dependencies and runtime environment. Run migrations once as a release job, not concurrently in each replica. Starting production is not automated by this branch.

## Tests

`test:unit` compiles the pure delivery/environment code and runs Node's test runner. Fixtures are synthetic, not Vintage commercial settings.
`smoke:modules` writes a synthetic sales channel only with `APP_ENV=test` and database `vintage_ci`, verifies retrieval/Redis locking and removes the fixture.
`smoke:http` is restricted to localhost. CI additionally tests Redis outage handling and a PostgreSQL restore in a second disposable database.

CI has no deployment step. An isolated follow-up job can commit only the initial tested backend lockfile to the foundation branch; it refuses concurrent branch changes and runs no npm scripts with its write token.

## Not implemented yet

Rule persistence beyond the delivery backoffice, food modifiers beyond the synthetic combo, real checkout/PSP, transactional outbox/inbox, iFood adapter, analytics export and production release. Staging persistent hosting is implemented in code on this branch and provisioned only after CI on the deployable SHA.

## Staging bootstrap

Requires `APP_ENV=staging`, database name `vintage_staging`, homologator Basic Auth credentials and persistent `VINTAGE_PREVIEW_FIXTURE_JSON`. After migrations:

```bash
npm run staging:bootstrap
```

The command is idempotent, refuses `vintage_ci` and GitHub Actions, and prints `STAGING_FIXTURE_JSON=...` for the Railway variable. Do not run CI-only seeds against staging.
