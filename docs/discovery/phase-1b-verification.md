# Fase 1B: verificação do fluxo transacional de backend

Data: 20/09/2026.
Veredito: PASS no escopo isolado descrito abaixo. Não é aceite de produção, storefront ou PSP.
Repositório: emeverton/vintage_arcade.
Branch: foundation/vintage-commerce-v1.

## Evidência executada

- Código testado: b679c786a796d6e3f7d72ad029da466e45311f38.
- CI completo: https://github.com/emeverton/vintage_arcade/actions/runs/35535063633
- Job foundation: 106142494011, completed/success.
- Artefato: foundation-evidence, ID 10612850443.
- SHA-256 do ZIP, conferido após download: 8ea06d591a4c96a2d122ef818ecc0f3cc4f1b4a80e3fe3d56d4e5d33e9f365c3.
- SHA-256 do lockfile instalado: 26c234605f8a0d85e4350a0eb6c54b5bb415a9aaacf3c8e801c4a1040bd57b19.
- Testes unitários: 88 aprovados, zero falhas, zero ignorados.
- Cenários do smoke de commerce: 11 aprovados.

Este relatório e as atualizações documentais posteriores não alteram o SHA de código que foi efetivamente testado. Os artefatos no GitHub expiram em sete dias; o ZIP foi também entregue na conversa.

## Incremento implementado

1. Regras de entrega persistidas em PostgreSQL, identificadas por revisão e com política validada.
2. Projeção da política na ShippingOption nativa. O provider próprio calcula o frete com dados do servidor e ignora valores de preço ou subtotal enviados pelo comprador.
3. Definições de combos persistidas, com slots obrigatórios/opcionais, limites de quantidade e variantes elegíveis.
4. Comando interno que adiciona os componentes ao carrinho nativo, consulta os preços pelo workflow Medusa, mantém metadata de composição e registra idempotência.
5. Conversão explícita entre valores do Medusa em reais e regras Vintage em centavos inteiros, evitando erro de escala de 100 vezes.
6. Validação antes de concluir o carrinho: cotação de frete, integridade da composição e valores de pagamento. O hook não altera o carrinho durante a conclusão.
7. Consumo de order.placed e gravação de order_created em registro próprio com chave única para deduplicação.

## Fluxo comprovado com fixtures sintéticas

Burger de teste: R$ 19,90. Bebida de teste: R$ 5,10. Combo com soma de componentes: R$ 25,00. Regra de teste: frete R$ 9,00, benefício integral a partir de R$ 30,00 em itens elegíveis.

O primeiro carrinho apresentou R$ 25,00 em itens e R$ 9,00 de frete, total R$ 34,00. A diferença para alcançar o benefício foi R$ 5,00. Após adicionar uma sobremesa sintética de R$ 5,00 e recalcular a entrega, o carrinho passou a R$ 30,00 em itens e frete zero. Um pedido nativo foi criado com esse total e sua repetição retornou o mesmo ID, sem criar outro pedido.

Todos esses valores, produtos e endereços são testes, não uma tabela comercial da Vintage. O teste demonstra execução das regras; não demonstra uplift de conversão, ticket ou margem.

## Cenários de integração aprovados

| Cenário | Resultado |
| --- | --- |
| Persistir e reler a regra de entrega | PASS |
| Conferir projeção da revisão na ShippingOption | PASS |
| Persistir e reler definição de combo | PASS |
| Adicionar combo com preços do servidor e repetir o comando | PASS |
| Rejeitar mudança de seleção sob a mesma chave e injeção de preço | PASS |
| Ignorar valor de frete forjado no payload | PASS |
| Recalcular para frete zero ao atingir o limite | PASS |
| Criar sessão de pagamento simulado com valor do carrinho | PASS |
| Concluir pedido nativo e repetir sem duplicação | PASS |
| Consumir evento nativo, persistir e deduplicar reentrega | PASS |
| Rejeitar conclusão com frete desatualizado e manter carrinho não concluído | PASS |

Além desses cenários, passaram: TypeScript; migrations executadas duas vezes; integração dos módulos; build do backend e admin; smoke HTTP; indisponibilidade e recuperação do Redis; backup/restore com comparação dos registros completos das quatro tabelas próprias; build da LP original; encerramento dos processos e containers de CI.

O restore compara hashes dos registros nas tabelas vintage_delivery_rule, vintage_combo_definition, vintage_combo_command e vintage_commerce_event. Não constitui validação integral de DR, RPO/RTO ou backup de produção.

## Correções encontradas pelo duplo cheque

- O lockfile da fase anterior não passava em instalação limpa com npm ci por resolução inconsistente de ajv-formats/picomatch. Foi normalizado, verificado com npm ci e retestado pelo pipeline completo. Os pins Medusa 2.21.0 foram mantidos.
- A normalização usou um workflow temporário com escrita restrita à branch aprovada e somente ao lockfile. Esse workflow foi removido depois da execução.
- Corrigidos tipos explícitos dos snapshots e contrato de atualização dos métodos de frete, sem desabilitar a checagem estrita.
- O teste negativo foi adaptado ao erro estruturado retornado pelo workflow Medusa, mantendo a exigência da mensagem Stale delivery quote. Não foi removida nem flexibilizada a proteção.

## Segurança e escopo operacional

A auditoria de dependências de runtime neste CI reportou zero entradas críticas, zero altas e cinco moderadas. A aprovação de segurança para produção continua aberta; não foi aplicado downgrade nem override major não testado. O pipeline agora falha em achados altos/críticos ou em resultado de auditoria indisponível.

VINTAGE_SLICE_ENABLED permanece false no exemplo de ambiente. A ativação é admitida apenas em local/test; staging/production com a flag ligada são rejeitados. IFOOD_ENABLED, PAYMENTS_LIVE_ENABLED e ADS_EXPORT_ENABLED continuam false.

O pagamento usa pp_system_default: simulador interno do Medusa, não sandbox homologado de adquirente, Pix ou PSP. Nenhum valor real foi cobrado e nenhum entregador foi acionado. order_created registra criação do pedido, não compra paga verificada. Não houve envio desses eventos para Ads ou analytics externos.

Main foi relida em 2646129d3a944b3ae27346af7b2ab54312cf3115, preservada. O diff desta fase não alterou app/, public/, package.json ou package-lock.json da LP, nem seu tsconfig. Não houve merge, mudança de DNS, infraestrutura permanente ou deploy de produção.

## Limites explícitos e próximo gate

O fluxo executado é de backend e workflows, não uma jornada de navegador. Não foram entregues storefront integrado, endpoints customizados de cliente com ownership/rate limiting, interface administrativa de publicação de regras ou staging permanente.

O combo implementado usa soma dos preços dos componentes. Desconto por preço fixo, adicionais culinários complexos, estoque de ingredientes, regras recorrentes por dia/horário e governança concorrente de publicação de revisões ainda precisam de implementação e testes próprios. A política atual oferece janela UTC explícita, mínimo, intervalo de CEP, canal, região, limite de benefício e teto por pedido, não otimização automática de margem.

O ledger deduplica os eventos recebidos; não fecha a garantia de entrega fim a fim. Outbox, reconciliação de pedidos sem evento, alertas e recuperação adversarial entre sistemas continuam pendentes. Não há funil completo first-party nem atribuição comercial validada.

Próximo incremento recomendado: publicação controlada de regras no backoffice e integração autorizada da experiência de carrinho. Para homologação comercial, obter catálogo e composição aprovados, regras de frete e subsídio reais, PSP escolhido e permissões iFood. O PASS técnico não fecha Discovery nem autoriza go-live.
