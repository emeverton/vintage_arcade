# Fase 1F: configuração segura de staging — evidência de execução

Data: 21/09/2026.
Agente executor único nesta sessão.

## Auditoria inicial

| Item | Valor verificado |
| --- | --- |
| Pasta | `/Users/veltrus/vintage_arcade` (não o monorepo Veltrus aberto no Cursor) |
| Remote | `https://github.com/emeverton/vintage_arcade.git` |
| Branch | `foundation/vintage-commerce-v1` |
| HEAD handoff | `78afb130dca5f88bd1831a0a40a62ce11442f0da` |
| Código aprovado Fase 1E | `46d5365b9cc124dcae109e5ccf12c793eb91c42b` |
| CI Fase 1E | `35544281439` success |
| Main preservada | `2646129d3a944b3ae27346af7b2ab54312cf3115` |
| GitHub CLI | `emeverton` autenticado |
| Railway CLI | `emeverton@yahoo.com.br` autenticado |
| Workspace Railway | `emeverton's Projects` (`01e17121-f121-4d02-be57-57d6e9fba4d2`) |
| Projetos pré-existentes | `valutin-backend`, `profound-playfulness` (não alterados) |
| `AGENTS.md` | ausente neste repositório |

## Código implementado

SHA: `12d82c7fa5cf493c67c312291f672fe18e2f9957`

- `APP_ENV=staging` habilitado com HTTPS, Basic Auth, fixture JSON persistente e banco `vintage_staging`
- `APP_ENV=test` bloqueado em marcadores Railway/Vercel/Render/Fly
- Bootstrap idempotente `npm run staging:bootstrap`
- Seeds CI continuam restritos a `vintage_ci`
- Integrações reais permanecem `false`

## Verificações

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Unitários | PASS | 172/172 local; CI job foundation |
| TypeScript commerce | PASS | local + CI |
| Build Medusa | PASS | local + CI |
| Build Next.js / homepage | PASS | local + CI |
| Migrations / Redis / commerce / backoffice / checkout | PASS | CI `35588512290` |
| Prévia desligada 404 | PASS | CI browser checkout control |
| Backup restore isolado | PASS | CI restore step |
| Docker local descartável | NÃO EXECUTADO | Docker Engine indisponível nesta máquina; baseline reproduzida no CI |
| Provisionamento Railway | BLOQUEADO | Trial expirado ao criar `vintage-arcade-staging` |
| Aceite HTTP/staging URL | NÃO EXECUTADO | depende do provisionamento |
| Main / Vercel / outros projetos | PRESERVADOS | main SHA inalterado; projetos Railway pré-existentes intactos |

CI implantável: https://github.com/emeverton/vintage_arcade/actions/runs/35588512290

## Bloqueio Railway

Mensagem CLI ao `railway init --name vintage-arcade-staging`:

> Your trial has expired. Please select a plan to continue using Railway.

Nenhum projeto `vintage-arcade-staging` foi criado. Nenhum serviço pago Vintage foi ligado. Hard limit global de workspace não foi configurado.

Orçamento Vintage já aprovado: até US$ 40/mês. O plano Hobby (mínimo ~US$ 5) cabe no orçamento, mas a ativação de plano exige ação do titular na conta Railway — o agente não pode fazer upgrade automaticamente.

Ação necessária do titular:
1. Abrir https://railway.com/account/billing e selecionar Hobby (ou Pro, se preferir), dentro do orçamento.
2. Confirmar ao agente para retomar somente o provisionamento Vintage (4 serviços) no SHA `12d82c7`.

## Rollback restrito à Vintage

Se o projeto existir no futuro: pausar/remover somente serviços do projeto `vintage-arcade-staging`. Não tocar em `valutin-backend`, `profound-playfulness`, main ou Vercel.
