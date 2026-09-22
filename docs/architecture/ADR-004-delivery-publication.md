# ADR-004: publicação controlada de regras de entrega

Data: 20/09/2026. Escopo: incremento 1C em local/test.
Status: decisão implementada e validada no CI 35536948325, código 2442a0ca1868a7f6a8e55abde06ccddbb31397fb. Não constitui aceite de produção.

## Decisão

A política ativa de uma entrega gerenciada é um snapshot canônico no módulo Vintage Delivery. Uma publicação altera o ponteiro/snapshot, a geração e o registro de auditoria na mesma transação PostgreSQL, sem editar o módulo Fulfillment. A ShippingOption mantém a configuração inicial e sua chave de vínculo.

O hook setCalculatedShippingPricingContext injeta as políticas publicadas no contexto do workflow nativo de cálculo. O provider ignora dados de preço do cliente. O hook de conclusão consulta a mesma fonte antes de validar o frete e o pagamento. Uma entrega ainda não gerenciada utiliza a configuração inicial, preservando o incremento 1B.

Isso substitui a premissa de atualizar ShippingOption.data a cada publicação. Evita uma falsa promessa de transação atômica entre módulos. Não há escrita em iFood, PSP ou canais externos.

## Revisões e concorrência

Rascunhos são novas revisões, não alterações destrutivas. Salvar um rascunho não muda a regra ativa. A publicação exige expected_generation e usa bloqueio de linha no PostgreSQL. Publicações concorrentes na mesma geração têm um vencedor; a outra operação recebe conflito. request_id, ator e payload identificam repetições, sem duplicar revisão ou auditoria.

Reverter é uma nova publicação de uma revisão anteriormente ativa ou da configuração inicial. Não modifica pedidos já concluídos. Auditoria e revisões gerenciadas possuem proteção de imutabilidade por trigger no PostgreSQL. Essa proteção não pretende resistir a um superusuário do banco; backups e controles de infraestrutura continuam necessários.

## Permissões

A API exige usuário Medusa autenticado e existente, além de uma permissão explícita do servidor. viewer consulta e simula; editor também salva rascunhos; publisher também publica e reverte. As permissões ficam no backend, vazias por padrão. Nenhum usuário real recebe acesso automaticamente. A gestão dinâmica dessas permissões e o RBAC integral do admin permanecem fora deste incremento.

As mutações verificam Content-Type e Origin. O corpo tem limite de 16 KB. Durante a homologação, mutações nas rotas nativas de ShippingOption são bloqueadas para preservar o fluxo auditado. Provisionamento inicial continua por workflow interno.

## Backoffice

Rota do admin: /app/vintage-delivery, considerando o prefixo padrão /app. Interface em português para mínimo, frete base, limite do benefício, teto de subsídio, CEP, período UTC e ativação. Exige motivo e confirmação explícita para publicar ou reverter. Simulação é separada de publicação. Não cria pedidos.

## Limites

VINTAGE_SLICE_ENABLED continua bloqueado em staging/production. Cadastro inicial da opção de entrega, catálogo e condições reais exigem aprovação. Não foi entregue storefront de cliente neste incremento.

O carregamento de políticas é limitado a 500 vínculos neste estágio de loja única e falha explicitamente acima disso. A descoberta inicial também é limitada a 500 opções de entrega no total; a listagem Vintage é paginada em grupos de 50. O histórico sinaliza truncamento após 100 revisões ou registros de auditoria. Escalonamento exige consultas por escopo e paginação completa, não leitura ilimitada.

A validação de conclusão usa a política lida naquele momento. Política de reserva/validade da cotação, snapshot por pedido, ordenação estrita entre publicação e checkout e todos os endpoints alternativos de cotação devem ser tratados antes do lançamento. Não há promessa de melhoria de conversão ou margem pelos testes sintéticos.

## Referências

- ../discovery/phase-1c-verification.md
- ../operations/delivery-backoffice.md
- https://docs.medusajs.com/learn/fundamentals/modules/db-operations
- https://docs.medusajs.com/learn/fundamentals/api-routes/protected-routes
- https://docs.medusajs.com/learn/fundamentals/admin/ui-routes
- https://docs.medusajs.com/learn/fundamentals/admin/tips
- https://github.com/medusajs/medusa/blob/v2.21.0/packages/core/core-flows/src/cart/workflows/list-shipping-options-for-cart-with-pricing.ts
- https://github.com/medusajs/medusa/blob/v2.21.0/packages/core/core-flows/src/cart/workflows/refresh-cart-shipping-methods.ts
