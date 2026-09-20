# Fase 1D: checkpoint do checkout isolado

Data: 20/09/2026.
Status: IMPLEMENTAÇÃO CANDIDATA. VALIDAÇÃO COMPLETA REPROVADA.
Não realizar merge, deploy ou homologação comercial com base neste incremento.

## Proveniência

Repositório: emeverton/vintage_arcade.
Branch: foundation/vintage-commerce-v1.
Código da última execução: ff90a01d877d81d3f13816072e1b3cb6f584e7c4.
CI: https://github.com/emeverton/vintage_arcade/actions/runs/35541593427
Job: 106160137065, completed/failure.

A consulta final aos steps confirmou sucesso em instalação de dependências, testes unitários e TypeScript, migrations repetidas e integração dos módulos de infraestrutura. O step Build backend and admin falhou. As etapas seguintes, inclusive API e navegador do checkout, foram ignoradas nessa execução. Portanto não existe PASS fim a fim para o código acima. A causa exata da última falha ainda precisa ser confirmada; não inferir que é idêntica à de uma execução anterior.

Este commit documental não altera o código testado e não executa nova validação.

## Código adicionado neste incremento

- Página Next.js isolada em /pedido-teste, sem substituir a homepage.
- BFF /api/vintage-test/* e gateway privado /vintage-preview/*.
- Sessões persistidas com hash de capacidade aleatória e associação ao carrinho nativo.
- Cookie HttpOnly e SameSite Strict, segredo de serviço restrito ao servidor, checagem de origem, limites de corpo JSON e rate limiting Redis.
- Comandos de combo e extra com preços calculados no backend.
- Cotação com validade e impressão do carrinho/política, indicação de diferença para benefício de frete e confirmação explícita de simulação.
- Snapshot da política no pedido simulado e testes candidatos de isolamento de sessões, recálculo e repetição de comandos.
- ADR-005 e guia operacional em docs/operations/checkout-preview.md.

Esses itens descrevem código versionado, não validação integral de funcionamento. As novas proteções precisam passar pelos testes de API e navegador antes de serem consideradas aceitas.

## Base anterior

A Fase 1C, anterior a estas alterações, possuía CI aprovado. Ver docs/discovery/phase-1c-verification.md. Seu PASS não deve ser transferido automaticamente para o código atual. O backoffice e os fluxos anteriores devem ser retestados depois da correção do build.

## Isolamento e preservação

A configuração candidata exige local/test e flags explícitas. A rota de teste foi desenhada para retornar 404 por padrão. Nenhuma URL pública de backend ou storefront de teste foi provisionada nesta etapa. Não houve merge, alteração de DNS, ativação de iFood, PSP real ou exportação para Ads. O pagamento previsto continua sendo pp_system_default, simulador interno e não sandbox de um PSP.

Main foi relida em 2646129d3a944b3ae27346af7b2ab54312cf3115, preservada. A confirmação de main não representa auditoria de toda a infraestrutura externa.

## Próximo gate técnico obrigatório

1. Obter diagnóstico delimitado do build do commit ff90a01d877d81d3f13816072e1b3cb6f584e7c4 e corrigir a causa sem desabilitar checagens.
2. Executar novamente o pipeline completo: backend/admin, regressões 1B/1C, API privada e navegador desktop/mobile.
3. Revisar screenshots e evidência de sessão isolada, preços/frete, cotação vencida e pedido simulado idempotente.
4. Registrar o SHA realmente aprovado antes de marcar este incremento como PASS.

Não avançar com novas funcionalidades nem publicar o checkout enquanto este gate estiver reprovado. Catálogo e regras reais, PSP, iFood, segurança de produção, recuperação entre módulos e staging persistente continuam gates separados.
