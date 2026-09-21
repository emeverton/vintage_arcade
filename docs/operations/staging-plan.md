# Vintage Arcade: plano de homologação persistente

Status: CONEXÃO RAILWAY VERIFICADA. PREPARAÇÃO DE STAGING, SEM PROVISIONAMENTO.
Atualização: após a autorização da conexão Railway nesta conversa, em 20/09/2026 no contexto do projeto.
Nenhum ambiente, domínio, volume ou serviço pago foi criado por esta atualização.

## Decisão proposta

Usar um projeto Railway exclusivo para homologação, com Next.js, Medusa, PostgreSQL e Redis no mesmo ambiente. Manter a LP de produção na Vercel sem alterações. É uma recomendação de implantação de staging, não migração da produção nem autorização de compra.

Nome proposto do novo projeto: vintage-arcade-staging. O projeto ainda não existe na leitura realizada. Não reutilizar bancos, credenciais, volumes ou serviços de outros clientes.

A rede privada entre serviços e os volumes persistentes reduzem conexões públicas e evitam perda dos dados de homologação entre reinícios. Os limites, backups e faturamento do plano contratado devem ser conferidos antes da criação.

## Verificação read-only da conexão

Foram executadas as ações Railway whoami, list-workspaces e list-projects. A conexão respondeu com o usuário emeverton, status REGISTERED, e um workspace pessoal chamado emeverton's Projects. O e-mail da conta foi conferido na resposta da ferramenta e permanece no contexto privado da operação, não duplicado neste repositório público.

A listagem retornou dois projetos existentes. Um está identificado como outro cliente e não teve seus serviços ou dados inspecionados. O projeto com nome genérico foi verificado apenas por metadados de serviço e origem do repositório, confirmando que não corresponde a emeverton/vintage_arcade. Nenhuma variável secreta, log de aplicação, dado de cliente ou conteúdo dos bancos foi solicitado. Nenhum dos projetos existentes foi alterado.

whoami e list-workspaces não retornaram plano contratado, saldo, crédito, fatura corrente ou limites financeiros. O tipo personal não prova assinatura Hobby. Billing permanece NÃO VERIFICADO; não inferir que existe crédito disponível. A ferramenta Railway Agent tem cobrança própria e não foi usada para contornar a ausência desses campos nas leituras diretas.

## Contas e isolamento

GitHub: emeverton/vintage_arcade, branch foundation/vintage-commerce-v1. Branch relida em 9f3a5e396d3b05571e5be19fce4c35a4befb8754 antes desta atualização documental. Main relida em 2646129d3a944b3ae27346af7b2ab54312cf3115. Nunca promover main implicitamente.
Railway: usar a conta emeverton e o workspace emeverton's Projects já verificados. Antes de qualquer write, reler os IDs do workspace e do projeto-alvo; nunca usar implicitamente o primeiro workspace retornado.
Vercel: nenhuma alteração ao projeto existente está autorizada por este plano.

## Serviços planejados

| Serviço | Origem | Configuração pretendida |
| --- | --- | --- |
| storefront-staging | Raiz do repositório | Next.js, npm ci --include=dev e npm run build, processo Node persistente |
| commerce-staging | apps/commerce | Medusa 2.21.0, Node 22, servidor + worker no modo shared durante homologação pequena |
| postgres-staging | PostgreSQL 17 | Banco próprio vintage_staging, credencial própria, volume e backup, sem endpoint TCP público |
| redis-staging | Redis 7.2 | Credencial própria, rede privada, persistência e maxmemory/noeviction verificadas |

Nomes acima são propostas, não recursos criados. Uma réplica de cada aplicação basta para o primeiro ensaio. Não ativar autoscaling, microservices ou Kubernetes. O dimensionamento deve ser confirmado com medidas reais de memória/CPU, não inferido do tempo do CI. O worker e seus jobs impedem presumir que o backend pode dormir com segurança.

## Estimativa inicial de custo, não orçamento contratado

Tarifas públicas consultadas em 20/09/2026: RAM US$ 10/GB-mês, CPU US$ 20/vCPU-mês, tráfego de saída US$ 0,05/GB e armazenamento de volume US$ 0,15/GB-mês. Hobby tem mínimo mensal de US$ 5 e Pro de US$ 20, com uso incluído nesse valor. A assinatura não deve ser somada integralmente ao consumo sem descontar o crédito correspondente.

Cenário central exclusivamente estimado para o conjunto dos quatro serviços durante um mês completo: média de 2 GB de RAM, 0,15 vCPU, 5 GB de armazenamento faturável e 5 GB de tráfego de saída. Conta: 2 x 10 + 0,15 x 20 + 5 x 0,15 + 5 x 0,05 = US$ 24/mês em recursos.

Cenário superior de planejamento: média de 3 GB de RAM, 0,30 vCPU, 10 GB de armazenamento faturável e 20 GB de saída. Conta: 3 x 10 + 0,30 x 20 + 10 x 0,15 + 20 x 0,05 = US$ 38,50/mês. Capacidade de volume e retenção de backup precisam caber no plano efetivamente contratado.

Reserva proposta para aprovação: até US$ 40/mês de consumo adicional deste ambiente Vintage. Faixa de planejamento: US$ 25 a US$ 40/mês, antes de câmbio e tributos. Não inclui consumo de outros projetos, novos serviços externos nem Railway Agent. A estimativa não é medição, teto automático, cotação garantida ou aprovação de gasto. Backups além do armazenamento estimado exigem recálculo. O consumo real será medido no ensaio inicial antes de manter o ambiente ligado por um mês completo.

Como o workspace já hospeda outros projetos, não tratar US$ 40 como limite da fatura inteira. Créditos da assinatura podem já ser consumidos por outros workloads. Eventual necessidade de contratação ou upgrade depende de confirmação separada do titular; não alterar o plano automaticamente.

## Controle financeiro sem afetar terceiros

O hard limit documentado de Compute Usage é aplicado no workspace e pode desligar seus workloads. NÃO configurar um limite global de US$ 40 para tentar limitar somente a Vintage. Isso poderia interromper projetos preexistentes.

A aprovação do valor proposto define um orçamento operacional da Vintage, não cria um mecanismo automático de contenção. Antes de ligar serviços, definir medição por projeto, alertas disponíveis, limites de recursos e procedimento de interrupção somente do staging Vintage. Não prometer limite rígido por projeto se a plataforma não oferecer esse controle na conta. Não criar monitoramento recorrente sem solicitação específica.

## Bloqueios de código antes de hospedar a prévia

O código atual bloqueia a prévia em APP_ENV=staging. Não contornar definindo APP_ENV=test em um servidor público. O BFF aceita apenas origem/backend de loopback e o seed exige vintage_ci. Isso foi intencional para impedir exposição prematura.

Antes de habilitar staging, implementar configuração explícita separada, origem HTTPS permitida, cookies Secure, acesso restrito dos homologadores, segredo exclusivo BFF/backend, autorização do operador, banco realmente separado e bootstrap idempotente de dados sintéticos próprio de staging. Remover dependência do arquivo efêmero .cache/checkout-fixture.json, persistindo IDs da fixture em configuração própria. Nenhum seed de CI deve rodar contra o banco persistente.

Backend e bancos não devem ficar públicos sem necessidade. O acesso administrativo exige sessão autenticada e proteção de entrada; esconder URL não constitui controle de acesso. Não abrir o backend inteiro somente para expor o painel.

## Condições para provisionar

1. Conexão Railway e workspace: VERIFICADOS por leitura, com nova conferência dos IDs antes do write.
2. Plano e billing: PENDENTES. Estimativa e orçamento proposto de US$ 40/mês: AGUARDAM APROVAÇÃO.
3. Configuração própria de staging, autenticação e bootstrap persistente: PENDENTES de implementação e CI. O PASS local/CI da Fase 1E não aprova staging público.
4. Segredos novos fora do Git, nenhum token de CI reutilizado.
5. HTTPS, acesso restrito, health/readiness, backup/restore, observação de custos e rollback com responsáveis definidos.
6. Revisão específica do storefront e aceite do logotipo original íntegro.

## Sequência e aceite

Conferir plano e aprovar orçamento; implementar e testar configuração própria de staging; criar projeto Vintage separado; provisionar bancos privados; executar migrations sob controle; publicar backend; carregar fixtures sintéticas idempotentes; publicar frontend com acesso restrito; testar login, ownership, falha de pagamento e cotação; reiniciar aplicações e confirmar persistência; realizar restore em banco diferente; registrar SHA e URLs realmente validadas.

A URL só será entregue como funcional após readback HTTP, teste de navegador e autorização do destinatário. O aceite do staging não libera venda real. PSP, iFood, cozinha, entregadores, dados reais de consumidores e exportação de conversões continuam desativados.

## Entradas comerciais

Usar docs/discovery/commercial-intake.md para catálogo, opções, preço fixo de combo, CEPs, horários, subsídio máximo, meio de pagamento e homologadores. Valores de teste não podem virar oferta por omissão de aprovação.

## Referências consultadas

https://docs.railway.com/networking/private-networking
https://docs.railway.com/volumes
https://docs.railway.com/pricing/plans
https://docs.railway.com/pricing/understanding-your-bill
https://docs.railway.com/pricing/cost-control
https://docs.railway.com/pricing

Este documento registra leituras, proposta e dependências. Não confirma billing, aprovação de gastos, infraestrutura provisionada ou deploy realizado.
