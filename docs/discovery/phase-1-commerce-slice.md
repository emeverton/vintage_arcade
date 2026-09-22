# Incremento 1B: regras persistidas e vertical slice de backend

Data: 20/09/2026. Status: fluxo isolado validado no CI 35535063633, código b679c786a796d6e3f7d72ad029da466e45311f38. Ver phase-1b-verification.md. Não é aceite de produção.

## Escopo autorizado

Manter main e a LP existentes. Desenvolver somente na branch foundation/vintage-commerce-v1. Nenhuma ativação de iFood, PSP real, Ads, DNS ou staging permanente.

## Implementação

- DeliveryRule persistida em PostgreSQL. revision_key identifica uma revisão; policy contém valores em centavos BRL e escopo por canal, região e intervalo de CEP.
- ShippingOption.data recebe uma projeção validada da revisão. O provider de frete calcula usando essa projeção do servidor e o item_total do carrinho Medusa, não valores enviados pelo comprador.
- Elegibilidade: total dos itens após descontos e incluindo tributos dos itens, sem frete. Janela UTC de início inclusivo e fim exclusivo. Teto de subsídio por pedido. Não é cálculo automático de margem.
- Money boundary: Medusa v2 trabalha com unidades monetárias principais; políticas Vintage usam centavos. Conversão explícita com teste contra erro de 100 vezes.
- ComboDefinition persistida com slots min/max e variantes elegíveis. Primeiro modo: soma dos preços dos componentes. Não inclui desconto de combo a preço fixo, estoque de ingredientes ou modificadores culinários complexos.
- Comando interno de combo consulta preços pelo workflow nativo, preserva composição em metadata e persiste chave de idempotência. Nenhum endpoint público de mutação customizado foi exposto neste incremento.
- Hook de conclusão valida frete, integridade da composição e valores da coleção/sessão de pagamento. Não muda carrinho dentro do hook de completeCartWorkflow.
- Subscriber order.placed persiste order_created com chave única. Order created não é purchase pago. Não exportar fixtures para analytics ou anúncios.

## Isolamento

VINTAGE_SLICE_ENABLED é desligado por padrão. Somente local/test permitem ativação. Staging/production com a flag ligada falham na configuração. O smoke completo exige APP_ENV=test, banco vintage_ci e host local/CI. Todas as ofertas, produtos, endereços e valores do smoke são sintéticos e não constituem aprovação comercial.

O provider pp_system_default apenas simula o ciclo de pagamento no Medusa. Não é homologação em sandbox de adquirente, Pix ou PSP. Nenhum dinheiro é cobrado e nenhum entregador é acionado.

## Validação executada

88 testes unitários; 11 cenários do smoke de commerce; TypeScript; migrations duas vezes; integração dos módulos; build backend/admin; HTTP; falha e recuperação Redis; restauração dos registros das quatro tabelas próprias; build da LP preservado. O relatório de verificação registra limites e proveniência.

## Gates ainda abertos

Catálogo aprovado, preços e regras reais de entrega; PSP e iFood autorizados; interface do operador; endpoints de cliente com ownership, autorização e rate limiting; publicação atômica de revisões e auditoria; testes de estoque real, concorrência adversarial e falhas entre sistemas; funil first-party e purchase confirmado; storefront/PWA; staging persistente; produção.

## Referências de implementação

- https://docs.medusajs.com/learn/fundamentals/data-models
- https://docs.medusajs.com/learn/fundamentals/modules/isolation
- https://github.com/medusajs/medusa/blob/v2.21.0/packages/core/core-flows/src/cart/workflows/add-to-cart.ts
- https://github.com/medusajs/medusa/blob/v2.21.0/packages/core/core-flows/src/cart/workflows/add-shipping-method-to-cart.ts
- https://github.com/medusajs/medusa/blob/v2.21.0/packages/core/core-flows/src/cart/workflows/complete-cart.ts
