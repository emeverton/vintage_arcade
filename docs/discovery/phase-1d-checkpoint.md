# Fase 1D: verificação do checkout isolado

Data: 20/09/2026.
Status: PASS TÉCNICO NO AMBIENTE SINTÉTICO DE CI.
Status de produção: NÃO PUBLICADO. HOMOLOGAÇÃO COMERCIAL NÃO LIBERADA.

Este resultado aprova os cenários automatizados executados, não representa ausência universal de defeitos, auditoria completa de segurança ou aprovação de uma operação comercial.

## Proveniência verificável

Repositório: emeverton/vintage_arcade.
Branch: foundation/vintage-commerce-v1.
SHA do código efetivamente aprovado: 90fcf9c11a4fc92f3aee5af923db105bda0a27b4.
CI: https://github.com/emeverton/vintage_arcade/actions/runs/35542756634
Job: https://github.com/emeverton/vintage_arcade/actions/runs/35542756634/job/106163276252
Conclusão do job: completed/success, em 20/09/2026 às 22:51:27 UTC.
Artefato: foundation-evidence, ID 10614849050, 20 arquivos.
SHA256 do ZIP baixado e conferido: 9c6397da56f2576b7d48f27c0f10e6366b6833f5dc995897d7f74ec4f1877522.
Retenção informada pelo GitHub: até 27/09/2026 às 22:51:23 UTC.

Este registro documental não modifica o código aprovado e não substitui uma nova execução após futuras alterações de código, dependências ou infraestrutura.

## Correções que encerraram o bloqueio

O build anterior falhava nas asserções de smoke-checkout-preview.ts porque order.metadata podia ser nulo e vintage_preview_quote era unknown. O commit 454370787d709a59bca33933c422ac4aeeb927c4 adicionou verificações de existência e de objeto JSON antes das asserções. Não houve desativação do TypeScript nem supressão das verificações.

A execução seguinte, 35542439200, passou pelo build, regressões de commerce e backoffice, mas falhou na preparação do cenário de invalidação de cotação: o teste enviava identificadores textuais onde o contrato de publicação exige UUID. O commit 90fcf9c11a4fc92f3aee5af923db105bda0a27b4 passou a gerar UUIDs para draft, publish e rollback. A validação de entrada do serviço foi preservada.

A execução 35542756634 aprovou o pipeline completo. O FAIL anterior permanece como histórico, não como estado corrente deste SHA.

## Validações executadas

| Grupo | Evidência e resultado |
| --- | --- |
| Testes unitários | 155 testes, 155 aprovados, zero falhas, zero ignorados |
| TypeScript e builds | PASS no TypeScript, backend/admin Medusa e build Next.js |
| Banco e infraestrutura | PASS em migrations duas vezes, persistência PostgreSQL, lock Redis e módulo customizado |
| Regressão de commerce | PASS em combo, carrinho, preços do servidor, frete e pedido simulado |
| Regressão de backoffice | PASS em permissões, rascunho, publicação, concorrência, rollback e auditoria atômica; fluxo de navegador também aprovado |
| API privada do checkout | 10 cenários agrupados aprovados no relatório checkout-api-report.json |
| Checkout no navegador | 7 cenários agrupados aprovados no relatório checkout-ui-report.json, zero page_errors |
| Preservação da homepage | PASS na comparação de app/page.tsx com origin/main e na resposta HTTP da homepage no CI |
| Feature flag desligada | PASS: página e API de prévia retornam 404 na instância de controle |
| Falha e recuperação Redis | PASS no teste de readiness durante indisponibilidade e após recuperação |
| Restauração PostgreSQL | PASS na restauração do backup em banco isolado e comparação das contagens previstas no workflow |

A restauração com comparação de contagens não equivale a um ensaio completo de recuperação de produção, reconciliação financeira ou prova de RPO/RTO.

## Cobertura do checkout

A API confirmou autenticação privada do serviço, rejeição de Origin indevido, sessões persistidas separadas, capacidade armazenada como hash, rejeição de cart_id e preços injetados, comandos concorrentes sem duplicação, CEP não atendido, cotação vencida, necessidade de nova cotação após publicação de regra, bloqueio dos acessos nativos testados com chave publicável válida, conclusão simulada idempotente, snapshot da política no pedido, expiração de sessão e rate limiting Redis.

O navegador confirmou funcionamento da homepage e 404 com a prévia desligada, bloqueios de origem e de corpo excessivo no BFF, preços consultados no backend, cookie HttpOnly/SameSite Strict, restauração do carrinho ao recarregar, isolamento entre contextos, recálculo ao adicionar e remover sobremesa, confirmação explícita de simulação, persistência do pedido ao recarregar e renderização mobile sem overflow horizontal ou erros de página.

Escopo de navegador: Chromium, viewport desktop 1380 x 1000 e viewport mobile 390 x 844. Não houve validação em Safari, Firefox ou dispositivos físicos nesta execução.

## Cenário monetário sintético conferido

Combo: R$ 25,00. Frete abaixo do limite: R$ 9,00. Total: R$ 34,00.
Adicional de sobremesa: R$ 5,00. Produtos passam a R$ 30,00, o frete fica em R$ 0,00 e o total simulado fica em R$ 30,00.
Ao remover o adicional, o frete retorna a R$ 9,00 e o total a R$ 34,00.

Esses valores são fixtures de teste, não preços ou política comercial aprovados pela Vintage Arcade. O provedor pp_system_default é um simulador interno, não um sandbox homologado de PSP nem evidência de pagamento real. Pedido criado não equivale a purchase pago.

## Inspeção das evidências e pendências

Os relatórios JSON, o resumo unitário e as capturas vintage-checkout-desktop.png e vintage-checkout-mobile.png do artefato aprovado foram conferidos. Os valores, avisos de simulação e organização responsiva aparecem nas capturas. O logo do cabeçalho não aparece nessas capturas, embora o asset exista no repositório; a investigação e o aceite da identidade visual permanecem pendentes. Não foi atribuído aceite visual comercial.

O npm audit das dependências de runtime do backend registrou zero vulnerabilidades high, zero critical e cinco moderate. As moderadas continuam pendentes de triagem. O PASS do gate high/critical não significa auditoria sem alertas e não cobre automaticamente todas as dependências do storefront.

Relatórios do slice anterior mantêm seu escopo histórico. Seus campos known_limits não substituem este registro integrado da Fase 1D.

## Isolamento e preservação

A prévia utiliza /pedido-teste, BFF /api/vintage-test/* e gateway privado /vintage-preview/*. A configuração exige local/test e flags explícitas. Não foi criada URL pública persistente de homologação. Os processos, banco e Redis do CI foram encerrados ao final.

Main foi relida em 2646129d3a944b3ae27346af7b2ab54312cf3115 e permanece preservada. Não houve merge, deploy de produção, mudança de DNS, ativação de iFood, pagamentos reais, acionamento de cozinha/entregador ou exportação para Ads nesta intervenção. A consulta de main não é uma auditoria de toda a infraestrutura externa.

## Próximo gate de liberação

O bloqueio de build e validação automatizada da Fase 1D está encerrado para o SHA acima. A próxima liberação exige definição e aprovação de um ambiente persistente de homologação, isolamento de dados e credenciais, revisão das dependências, aceite visual e aprovação do catálogo e das regras reais.

PSP e webhooks, integração iFood, operação de cozinha e entrega, segurança de produção, reconciliação entre módulos, recuperação operacional e exportação de eventos pagos continuam gates separados. Não habilitar flags de integração, promover a branch ou substituir a homepage com base apenas neste PASS de CI.

Referências: docs/operations/checkout-preview.md e docs/discovery/phase-1c-verification.md.
