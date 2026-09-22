# Fase 1C: backoffice de regras de entrega

Data: 20/09/2026.
Veredito: PASS no escopo de homologação técnica isolada. Não é liberação para produção.
Repositório: emeverton/vintage_arcade.
Branch: foundation/vintage-commerce-v1.

## Evidências e proveniência

- Código efetivamente testado: 2442a0ca1868a7f6a8e55abde06ccddbb31397fb.
- Pipeline: https://github.com/emeverton/vintage_arcade/actions/runs/35536948325
- Job foundation: 106147562504, concluído com sucesso.
- Artefato foundation-evidence: 10613133312, 301594 bytes.
- SHA-256 do ZIP conferido após download: cd7c717b9a6bb514665b310d93c6cb65196f98f51b8facc3897da13e8a00ed27.
- SHA-256 do lockfile: 26c234605f8a0d85e4350a0eb6c54b5bb415a9aaacf3c8e801c4a1040bd57b19, igual ao incremento 1B.
- Testes unitários: 127 aprovados, zero falhas e zero ignorados.
- Regressão transacional de commerce: 11 cenários aprovados.
- API administrativa e publicação: 11 cenários aprovados.
- Fluxo de navegador Chromium: 7 verificações aprovadas, sem erros JavaScript de página registrados.

As alterações exclusivamente documentais posteriores não representam um novo build testado. O SHA acima identifica o código validado. O GitHub mantém os artefatos por sete dias; uma cópia do ZIP foi entregue na conversa.

## Entrega funcional

Foi adicionada a tela Regras de entrega ao painel Medusa, na rota relativa /app/vintage-delivery. A interface está em português e atua sobre opções Vintage já provisionadas no ambiente.

O operador pode consultar versões, editar mínimo do pedido, frete base, limite para obter o benefício, teto de subsídio, intervalo de CEP, janela UTC e flags de ativação. Pode simular a regra com um subtotal e um CEP, salvar um rascunho e, quando autorizado, publicar ou reverter uma revisão. Salvar rascunho e simular não alteram a regra ativa.

A tela diferencia a configuração em edição da revisão salva que será publicada. A publicação exige motivo e confirmação explícita. O histórico informa ação, geração, autor, motivo e data.

## Permissões e integridade

| Perfil | Capacidades |
| --- | --- |
| Consulta, viewer | Consultar e simular |
| Edição, editor | Consultar, simular e criar rascunhos |
| Publicação, publisher | Capacidades anteriores, publicar e reverter |

A API exige usuário autenticado e existente, além da permissão explícita no servidor. Um usuário sem concessão não recebe acesso por estar autenticado. As concessões reais continuam vazias; somente contas sintéticas descartáveis receberam os perfis durante o CI. Isso é autorização deste módulo, não implementação de RBAC completo em todas as telas do Medusa.

As mutações validam origem, formato JSON e campos permitidos. O corpo é limitado a 16 KB. Durante este slice de homologação, a edição nativa de ShippingOption fica bloqueada para impedir alterações fora do fluxo auditado; provisionamento inicial permanece interno.

## Publicação atômica

A configuração inicial permanece na ShippingOption. Revisões, política ativa e auditoria pertencem ao módulo Vintage Delivery. Publicar atualiza política ativa, geração e auditoria na mesma transação PostgreSQL. O cálculo nativo do carrinho recebe a política publicada por contexto controlado pelo servidor, sem aceitar preços enviados pelo comprador.

O teste de falha de auditoria confirmou que a política ativa e a geração permanecem inalteradas quando a gravação não termina. O teste concorrente confirmou um único vencedor entre duas publicações na mesma geração; a outra recebeu conflito. Repetir uma operação confirmada com a mesma chave e conteúdo não duplicou a alteração ou a auditoria.

Reverter produz nova geração auditada e não reescreve pedidos concluídos. Revisões gerenciadas e registros de auditoria rejeitaram tentativas de alteração pela aplicação. Isso não é uma garantia contra um administrador com poder de modificar o próprio banco.

## Cenários administrativos executados

1. Usuário ausente, usuário sem permissão, consulta permitida e gravação negada ao perfil de consulta.
2. Rejeição de política inválida, campo de autor fornecido pelo cliente e origem não autorizada.
3. Rascunho persistido, repetição idempotente e conflito de payload, sem publicação automática.
4. Simulação sem mudança da política ativa ou do histórico.
5. Publicação restrita ao perfil correto e edição alternativa de frete bloqueada.
6. Falha deliberada na auditoria com rollback integral da publicação.
7. Publicação e repetição com uma única auditoria, incluindo proteção contra geração desatualizada.
8. Carrinho nativo usando a nova política, sem alterar a ShippingOption ou realizar deploy.
9. Duas publicações concorrentes com exatamente um vencedor.
10. Reversão para versão publicada e configuração inicial, preservando o pedido concluído.
11. Rejeição de alterações destrutivas em revisão gerenciada e auditoria.

No navegador foram verificados sessão nativa e identidade de teste, simulação pelo formulário, criação de rascunho, confirmação de publicação, leitura da política efetivamente ativa, reversão e controles de consulta sem permissão de gravação.

## Demais verificações

Passaram instalação limpa com npm ci, TypeScript estrito, migrations aplicadas duas vezes, integração dos módulos, build do backend e admin, testes HTTP, indisponibilidade e recuperação do Redis, backup/restore e build da LP original.

O restore comparou os registros completos, por hashes, das seis tabelas próprias: vintage_delivery_rule, vintage_combo_definition, vintage_combo_command, vintage_commerce_event, vintage_delivery_control e vintage_delivery_audit. Não é teste de DR de produção, nem comprovação de RPO/RTO.

A auditoria de dependências de runtime registrou zero ocorrências críticas, zero altas e cinco entradas moderadas. A pendência moderada já documentada não foi considerada resolvida por este incremento.

## Capturas e limites da evidência visual

O ZIP contém capturas desktop e de viewport estreita, geradas pelo navegador durante o fluxo real. Elas mostram o trecho visível do painel com sua rolagem interna, não todas as seções em uma única imagem. Foram inspecionadas após o download. Não substituem testes de todos os dispositivos, navegadores ou acessibilidade.

O relatório commerce-slice-report.json é a regressão histórica do escopo 1B. A indicação antiga de interface administrativa pendente nesse relatório deve ser lida no escopo daquele teste. A entrega administrativa atual é demonstrada por delivery-admin-report.json, delivery-ui-report.json e este relatório.

## Correções durante a validação

A consulta administrativa foi ajustada ao contrato público de ShippingOptions da versão fixada, sem desativar TypeScript. A busca inicial é limitada a 500 opções e retorna falha explícita acima dessa capacidade; os resultados Vintage são paginados de 50 em 50.

A execução do build compilado em HTTP local exigiu tratamento de cookies exclusivo para o CI descartável. Os padrões seguros do framework permanecem sem alteração fora desse ambiente, inclusive em staging e produção, conforme os testes específicos. Nenhuma autenticação ou permissão de usuário real foi removida.

## Preservação de produção

Main foi relida em 2646129d3a944b3ae27346af7b2ab54312cf3115. O diff desta fase altera apenas apps/commerce, o workflow de testes e documentação. Não modifica app/, public/, dependências da LP, DNS ou produção. Não houve merge nem provisionamento permanente.

VINTAGE_SLICE_ENABLED continua desativado por padrão e bloqueado em staging/produção. iFood, pagamentos reais e exportação de eventos para Ads permanecem desligados. A regressão utiliza somente o simulador interno de pagamento, sem transação financeira real.

## Próximos gates

Ainda são necessários storefront conectado, controles de propriedade dos carrinhos, política de validade da cotação, snapshot de regra por pedido e testes adicionais de publicação concorrente com checkout. A criação inicial da opção de entrega, a gestão dinâmica de permissões e o RBAC global do admin não foram incluídos.

Persistem os gates comerciais: catálogo, combos e regras reais aprovados; PSP em sandbox; permissões e homologação iFood; baseline de tracking; staging permanente e aceite de produção. A aprovação técnica deste backoffice não autoriza operar vendas reais.

## Referências

- ADR-004-delivery-publication.md, decisão vigente para a política ativa.
- https://docs.medusajs.com/learn/fundamentals/modules/db-operations
- https://docs.medusajs.com/learn/fundamentals/admin/ui-routes
- https://docs.medusajs.com/learn/build
