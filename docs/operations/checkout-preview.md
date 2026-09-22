# Checkout de teste da Vintage

Escopo: teste local/CI e homologação staging protegida. Sem venda real. Não autoriza alterar main, domínio de produção, Vercel, iFood ou PSP.

## Rotas

A página `/pedido-teste` utiliza o BFF `/api/vintage-test/*`. O BFF chama as rotas privadas `/vintage-preview/*` do Medusa. Com a prévia desligada, página e BFF retornam 404.

A prévia é um incremento isolado do storefront, não substituição da homepage.

## Ativação local/CI (descartável)

O CI gera a credencial interna e provisiona fixtures sintéticas após a regressão de commerce. Configura `APP_ENV=test`, `VINTAGE_SLICE_ENABLED=true` e `VINTAGE_CHECKOUT_PREVIEW_ENABLED=true`. `VINTAGE_PREVIEW_SERVICE_SECRET` é aleatório de 32 bytes em hex, compartilhado somente entre backend e BFF.

`VINTAGE_PREVIEW_ORIGIN` e `VINTAGE_PREVIEW_BACKEND_URL` apontam para loopback. `VINTAGE_PREVIEW_FIXTURE_FILE` é caminho absoluto efêmero. O script `seed-checkout-preview.ts` recusa banco diferente de `vintage_ci`.

## Ativação staging (persistente)

Usar `APP_ENV=staging` — nunca `APP_ENV=test` em infraestrutura pública. Exigências:

- Origem HTTPS pública do storefront
- Backend privado `*.railway.internal` (ou HTTPS)
- Cookies Secure + HttpOnly + SameSite=strict no BFF
- Basic Auth de homologadores no storefront e no admin Medusa
- Segredo BFF/backend exclusivo
- Fixture persistente em `VINTAGE_PREVIEW_FIXTURE_JSON` (sem arquivo de CI)
- Banco `vintage_staging` exclusivo
- Bootstrap idempotente: `npm run staging:bootstrap`

Gate de homologadores: middleware Next.js e middleware Medusa exigem Basic Auth antes de expor a aplicação (health/readiness e `/vintage-preview` no backend ficam isentos do Basic Auth; a prévia continua protegida pelo segredo de serviço).

## Fluxo

Escolher componentes, adicionar combo, conferir incentivo de frete, adicionar/remover sobremesa, cotar CEP, confirmar simulação e concluir. Recarregar recupera a sessão. Outra sessão de navegador não acessa o primeiro carrinho.

`pp_system_default` é simulador interno. `order_created` não significa pagamento confirmado.

## Limites

Sem cadastro real de cliente, pagamento live, cozinha, delivery, iFood ou exportação de conversões. Cotação expira em cinco minutos. Store API nativa bloqueada enquanto a prévia está ativa.
