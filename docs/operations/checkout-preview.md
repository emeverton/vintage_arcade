# Checkout de teste da Vintage

Escopo: teste local/CI, sem venda real. Este guia não autoriza alterar main, domínio, ambiente de produção, conta iFood ou PSP.

## Rotas

A página relativa /pedido-teste utiliza o BFF /api/vintage-test/*. O BFF chama as rotas privadas /vintage-preview/* do Medusa. Em configuração normal, a página e o BFF retornam 404.

A prévia é um incremento isolado do storefront, não substituição da homepage. Catálogo e preço vêm do backend; o preço do combo ainda é a soma dos componentes.

## Ativação em infraestrutura descartável

O CI gera a credencial interna e provisiona fixtures sintéticas após a regressão de commerce. Configura APP_ENV=test, VINTAGE_SLICE_ENABLED=true e VINTAGE_CHECKOUT_PREVIEW_ENABLED=true. VINTAGE_PREVIEW_SERVICE_SECRET é um valor aleatório de 32 bytes em hex, compartilhado somente entre os processos backend e BFF. Não usar variável NEXT_PUBLIC para essa credencial.

VINTAGE_PREVIEW_ORIGIN aponta para o endereço loopback do Next.js. VINTAGE_PREVIEW_BACKEND_URL aponta para o Medusa em loopback. VINTAGE_PREVIEW_FIXTURE_FILE é caminho absoluto para o arquivo sintético no backend. O script seed-checkout-preview.ts recusa banco diferente de vintage_ci, host não local e dados sem identificação sintética.

Os exemplos de ambiente existentes não ativam esta prévia. Concessão a cliente, staging e produção exigem nova etapa, novas credenciais, TLS, gates comerciais e revisão de segurança.

## Fluxo

Escolher os componentes, adicionar o combo, conferir diferença para o benefício de frete, adicionar ou remover sobremesa, testar CEP permitido, recalcular, confirmar explicitamente que não há cobrança e concluir. Recarregar a página recupera a mesma sessão. Outra sessão de navegador não recebe acesso ao primeiro carrinho.

Depois da conclusão, os valores são lidos do pedido registrado. Iniciar outra simulação encerra o cookie do navegador; o registro anterior permanece no banco de teste até descarte do ambiente. Não implementa exclusão de dados comerciais.

## Limites

Uma sessão mantém um combo e um extra avulso. Não há editor completo de carrinho, cadastro de cliente, pagamento real, operação de cozinha, delivery, iFood ou exportação de conversões. A sessão expira em 24 horas; a cotação, em cinco minutos. Publicação que precede a confirmação invalida a cotação. Concorrência global de publicação versus fechamento e falhas entre módulos exigem hardening adicional.

A Store API nativa é bloqueada enquanto a prévia está ativa para que nenhum endpoint alternativo contorne o ownership. Desativar a prévia restaura o comportamento anterior da API. Não habilitar essa configuração em ambientes com outros storefronts.
