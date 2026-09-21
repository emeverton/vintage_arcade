# Fase 1F: configuração segura de staging

Data: 21/09/2026.
Escopo: implementar `APP_ENV=staging` protegido, fixtures persistentes e gates de homologação. Provisionamento Railway ocorre somente após CI verde no SHA implantável.

## Alterações

- Slice e checkout preview aceitam `staging`; `production` permanece bloqueado.
- `APP_ENV=test` é rejeitado em marcadores de hospedagem (Railway/Vercel/Render/Fly).
- Storefront: middleware Basic Auth, origem HTTPS, cookies Secure, backend privado Railway.
- Backend: Basic Auth no admin, health isento, `/vintage-preview` autenticado só pelo segredo de serviço.
- Fixture staging via `VINTAGE_PREVIEW_FIXTURE_JSON`; bootstrap idempotente `staging:bootstrap`.
- Seeds/smokes de CI continuam restritos a `vintage_ci`.

## Validações locais nesta sessão

| Grupo | Resultado |
| --- | --- |
| Unitários | 172 pass / 0 fail |
| TypeScript commerce | PASS |
| Build Next.js | PASS |
| Build Medusa backend/admin | PASS |
| CI no SHA implantável | pendente após push |
| Provisionamento Railway | pendente após CI |

## Preservação

Main, Vercel LP, DNS, iFood, PSP live e Ads permanecem intocados. Orçamento Vintage aprovado: até US$ 40/mês de consumo adicional.
