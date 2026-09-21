# Release LP Vintage Arcade v1 (isolada do commerce)

Data: 21/09/2026.
Branch: `release/vintage-lp-v1`.
Base: `origin/main` @ `2646129d3a944b3ae27346af7b2ab54312cf3115`.
Origem visual/acabamento: `fe88efbfd838c21254e71ecdc6e66beddd25c93c` (somente arquivos da LP listados abaixo).

## Escopo transferido

| Arquivo | Origem |
| --- | --- |
| `app/page.tsx` | fe88efb |
| `app/layout.tsx` | fe88efb |
| `app/globals.css` | fe88efb |
| `app/components/BrandMark.tsx` | fe88efb (novo na main) |
| `app/components/ArcadeModeSelector.tsx` | fe88efb |

Não transferidos de propósito: `apps/commerce/`, `app/pedido-teste/`, `app/api/vintage-test/`, middleware de staging, helpers/fixtures/secrets do commerce, Railway, `commerce-foundation.yml`.

Manifestos da main preservados com uma exceção justificada de segurança:

- `package.json` / `package-lock.json`: bump mínimo de Next dentro de `^15.5.18` (15.5.25), `postcss` 8.5.28 e override `postcss@8.5.28` para eliminar critical/high herdados do lock da main.
- Sem `npm audit fix --force` e sem salto para Next 16.
- `npm audit --omit=dev` resultante: 0 high / 0 critical.

## Acabamento preservado

- Gabinete arcade.
- Wordmark textual provisório (`data-brand-status=text-fallback`).
- CTAs “Cardápio pelo WhatsApp”.
- “Consulte nossos horários pelo WhatsApp.”
- Links “Consultar evento” contextualizados.
- Destinos existentes WhatsApp / Instagram / Maps (ainda sujeitos a confirmação comercial; esta release não valida factualidade).

## CI

Workflow exclusivo: `.github/workflows/lp-release.yml` — sem Medusa, Postgres ou Redis; permissões `contents: read`; sem deploy de produção.

## Pendências

| Item | Status |
| --- | --- |
| Logo original íntegro | Pendente |
| Horários publicados | Pendente de aprovação comercial |
| Avaliações Google | Pendente |
| URL oficial cardápio/iFood | Pendente |
| Confirmação comercial de contato/endereço | Pendente |
| Merge / promote produção | Não autorizado nesta preparação |

`foundation/vintage-commerce-v1` permanece intacta e separada.
