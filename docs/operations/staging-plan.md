# Vintage Arcade: plano de homologação persistente

Status: ORÇAMENTO APROVADO ATÉ US$ 40/MÊS. CÓDIGO DE STAGING EM IMPLEMENTAÇÃO NESTA BRANCH. PROVISIONAMENTO CONDICIONADO AO CI DO SHA IMPLANTÁVEL.
Atualização: 21/09/2026. Orçamento operacional Vintage já autorizado pelo titular até US$ 40/mês de consumo adicional, antes de câmbio e tributos. Não configurar hard limit global de workspace.

## Decisão

Usar um projeto Railway exclusivo para homologação, com Next.js, Medusa, PostgreSQL e Redis no mesmo ambiente. Manter a LP de produção na Vercel sem alterações.

Nome do projeto: vintage-arcade-staging. Não reutilizar bancos, credenciais, volumes ou serviços de outros clientes (`valutin-backend`, `profound-playfulness`).

## Contas e isolamento

GitHub: emeverton/vintage_arcade, branch foundation/vintage-commerce-v1.
Railway: conta emeverton / emeverton@yahoo.com.br, workspace `emeverton's Projects` (id `01e17121-f121-4d02-be57-57d6e9fba4d2`).
Vercel/DNS/main: sem alteração autorizada por este plano.

## Serviços planejados

| Serviço | Origem | Configuração pretendida |
| --- | --- | --- |
| storefront-staging | Raiz do repositório | Next.js, npm ci --include=dev e npm run build, Basic Auth de homologadores, cookies Secure |
| commerce-staging | apps/commerce | Medusa 2.21.0, Node 22, shared worker, Basic Auth + Medusa auth no admin, preview só via segredo BFF |
| postgres-staging | PostgreSQL 17 | Banco `vintage_staging`, volume e backup, sem TCP público |
| redis-staging | Redis 7.2 | Credencial própria, rede privada, AOF, maxmemory-policy noeviction |

Uma réplica inicial. Sem autoscaling, Agent Railway, iFood, PSP live ou Ads.

## Configuração de staging no código

`APP_ENV=staging` é o único modo remoto autorizado para a prévia. `APP_ENV=test` é rejeitado em marcadores Railway/Vercel/Render/Fly.

Requisitos obrigatórios:
- `VINTAGE_SLICE_ENABLED=true` e `VINTAGE_CHECKOUT_PREVIEW_ENABLED=true`
- `VINTAGE_PREVIEW_SERVICE_SECRET` (64 hex) exclusivo BFF/backend, nunca `NEXT_PUBLIC`
- `VINTAGE_PREVIEW_ORIGIN` HTTPS público do storefront
- `VINTAGE_PREVIEW_BACKEND_URL` HTTP privado `*.railway.internal` ou HTTPS
- `VINTAGE_PREVIEW_FIXTURE_JSON` persistente (sem arquivo efêmero de CI)
- `VINTAGE_STAGING_BASIC_USER` / `VINTAGE_STAGING_BASIC_PASSWORD` (senha ≥ 16)
- `DATABASE_URL` com pathname `/vintage_staging`
- `IFOOD_ENABLED`, `PAYMENTS_LIVE_ENABLED`, `ADS_EXPORT_ENABLED` = false

Bootstrap idempotente: `npm run staging:bootstrap` em `apps/commerce` (recusa `vintage_ci` e Actions).

## Orçamento

Estimativa central ~US$ 24/mês; cenário superior ~US$ 38,50/mês. Orçamento aprovado: até US$ 40/mês de consumo adicional Vintage. Medir no ensaio inicial. Não aplicar hard limit de US$ 40 no workspace inteiro.

## Sequência de aceite

1. CI verde no SHA a implantar.
2. Criar projeto `vintage-arcade-staging` exclusivo.
3. Provisionar postgres/redis privados + criar DB `vintage_staging`.
4. Migrations controladas; bootstrap de fixtures; setar `VINTAGE_PREVIEW_FIXTURE_JSON`.
5. Publicar commerce (mínima exposição) e storefront com Basic Auth.
6. Validar health, 401 sem credencial, jornada simulada, reinício e restore em banco separado.
7. Entregar URL só após readback e screenshots.

Rollback: desligar/remover somente serviços do projeto Vintage; não tocar em outros projetos nem em main/Vercel.
