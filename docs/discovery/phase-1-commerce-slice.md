# Incremento 1B: regras persistidas e vertical slice de backend

Data: 20/09/2026. Status inicial: implementacao candidata, resultados dependem do CI do commit.

## Escopo autorizado

Manter main e a LP existentes. Desenvolver somente na branch foundation/vintage-commerce-v1. Nenhuma ativacao de iFood, PSP real, Ads, DNS ou staging permanente.

## Implementacao

- DeliveryRule persistida em PostgreSQL. revision_key identifica uma revisao; policy contem valores em centavos BRL e escopo por canal, regiao e intervalo de CEP.
- ShippingOption.data recebe uma projecao validada da revisao. O provider de frete calcula usando essa projecao do servidor e o item_total do carrinho Medusa, nao valores enviados pelo comprador.
- Elegibilidade: total dos itens apos descontos e incluindo tributos dos itens, sem frete. Janela UTC de inicio inclusivo e fim exclusivo. Teto de subsidio por pedido. Nao e um calculo automatico de margem.
- Money boundary: Medusa v2 trabalha com unidades monetarias principais; politicas Vintage usam centavos. Conversao explicita com teste contra erro de 100x.
- ComboDefinition persistida com slots min/max e variantes elegiveis. Primeiro modo: soma dos precos dos componentes. Nao inclui ainda desconto de combo a preco fixo, estoque de ingredientes ou modificadores culinarios complexos.
- Comando interno de combo consulta precos pelo workflow nativo, preserva a composicao em metadata e persiste chave de idempotencia. Nenhum endpoint publico de mutacao customizado foi exposto neste incremento.
- Hook de conclusao valida frete, integridade da composicao e valores da colecao/sessao de pagamento. Nao muda carrinho dentro do hook de completeCartWorkflow.
- Subscriber order.placed persiste order_created com chave unica. Order created nao e purchase pago. Nao exportar essas fixtures para plataformas de analytics ou anuncios.

## Isolamento

VINTAGE_SLICE_ENABLED e desligado por padrao. Somente local/test permitem ativacao. Staging/production com a flag ligada falham na configuracao. O smoke completo exige APP_ENV=test, banco vintage_ci e host local/CI. Todas as ofertas, produtos, enderecos e valores do smoke sao sinteticos e nao constituem aprovacao comercial.

O provider pp_system_default apenas simula o ciclo de pagamento no Medusa. Nao e homologacao em sandbox de adquirente, Pix ou PSP. Nenhum dinheiro e cobrado, e nenhum entregador e acionado.

## Validacao pretendida

Testes de centavos, escopos, horarios, zonas, limites de combo e protecoes de ambiente; migrations duas vezes; produto e combo persistidos; carrinho e calculo nativo de frete; replay idempotente; tentativa de injetar preco; conclusao de pedido repetida sem duplicar; evento nativo consumido e deduplicado; falha/recovery Redis; restauracao dos registros de dominio; build da LP preservado.

## Gates ainda abertos

Catalogo aprovado, precos e regras reais de entrega; PSP e iFood autorizados; interface do operador; endpoints de cliente com ownership, autorizacao e rate limiting; publicacao atomica de revisoes e auditoria de regras; testes de estoque real, concorrencia adversarial e falhas entre servicos; funil first-party completo e purchase confirmado pelo PSP; storefront/PWA; staging persistente; producao.

## Referencias de implementacao

- https://docs.medusajs.com/learn/fundamentals/data-models
- https://docs.medusajs.com/learn/fundamentals/modules/isolation
- https://github.com/medusajs/medusa/blob/v2.21.0/packages/core/core-flows/src/cart/workflows/add-to-cart.ts
- https://github.com/medusajs/medusa/blob/v2.21.0/packages/core/core-flows/src/cart/workflows/add-shipping-method-to-cart.ts
- https://github.com/medusajs/medusa/blob/v2.21.0/packages/core/core-flows/src/cart/workflows/complete-cart.ts
