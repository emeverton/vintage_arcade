# Vintage Arcade: plano de homologação persistente

Status: PREPARAÇÃO. Nenhum ambiente, domínio, volume ou serviço pago foi criado por este documento.

## Decisão proposta

Usar um projeto Railway exclusivo para homologação, com Next.js, Medusa, PostgreSQL e Redis no mesmo ambiente. Manter a LP de produção na Vercel sem alterações. É uma recomendação de implantação de staging, não migração da produção nem autorização de compra.

A rede privada entre serviços e os volumes persistentes reduzem conexões públicas e evitam perda dos dados de homologação entre reinícios. Os limites e backups do plano contratado devem ser conferidos na conta antes da criação. O catálogo de plugins mostrou Railway disponível, mas não instalado nesta conversa; nenhuma conta ou projeto Railway foi presumido.

## Contas e isolamento

GitHub: emeverton/vintage_arcade, branch foundation/vintage-commerce-v1. Nunca promover main implicitamente.
Railway: titular, workspace e billing ainda devem ser identificados por leitura da conexão autorizada. Não usar IDs presumidos nem copiar recursos de outro cliente.
Vercel: nenhuma alteração ao projeto existente está autorizada por este plano.

## Serviços planejados

| Serviço | Origem | Configuração pretendida |
| --- | --- | --- |
| storefront-staging | Raiz do repositório | Next.js, npm ci --include=dev e npm run build, processo Node persistente |
| commerce-staging | apps/commerce | Medusa 2.21.0, Node 22, servidor + worker no modo shared durante homologação pequena |
| postgres-staging | PostgreSQL 17 | Banco próprio vintage_staging, credencial própria, volume e backup, sem endpoint TCP público |
| redis-staging | Redis 7.2 | Credencial própria, rede privada, política de persistência e maxmemory/noeviction verificadas |

Nomes acima são propostas legíveis, não recursos criados. Uma réplica de cada aplicação basta para o primeiro ensaio; não ativar autoscaling, microservices ou Kubernetes. O dimensionamento deve ser confirmado com medidas de memória/CPU do processo, e não inferido do tempo do CI.

## Bloqueios de código antes de hospedar a prévia

O código atual bloqueia a prévia em APP_ENV=staging. Não contornar definindo APP_ENV=test em um servidor público. O BFF aceita apenas origem/backend de loopback e o seed exige vintage_ci. Isso foi intencional para impedir exposição prematura.

Antes de habilitar staging, implementar configuração explícita separada, origem HTTPS permitida, cookies Secure, acesso restrito dos homologadores, segredo exclusivo BFF/backend, autorização do operador, banco realmente separado e bootstrap idempotente de dados sintéticos próprio de staging. Remover dependência do arquivo efêmero .cache/checkout-fixture.json, persistindo IDs da fixture em configuração própria. Nenhum seed de CI deve rodar contra o banco persistente.

Backend e bancos não devem ficar públicos sem necessidade. O acesso administrativo exige sessão autenticada e proteção de entrada; esconder URL não constitui controle de acesso. Não abrir o backend inteiro somente para expor o painel.

## Condições para provisionar

1. Conexão Railway autorizada, workspace e titular verificados.
2. Plano, estimativa e teto de gasto aprovados pelo titular. O plano mínimo não representa o custo total de quatro serviços; consumo e backup devem entrar na estimativa.
3. SHA com CI completo aprovado, configurações de staging testadas e auditorias de backend e storefront revisadas.
4. Segredos novos fora do Git; nenhum token de CI reutilizado.
5. Acesso restrito, HTTPS, health/readiness, política de backup/restore e rollback com responsáveis definidos.

## Sequência e aceite

Conectar conta e aprovar orçamento; implementar configuração própria de staging; provisionar bancos privados; executar migrations uma vez sob controle; publicar backend; carregar fixtures sintéticas idempotentes; publicar frontend isolado; testar login/ownership/erro de pagamento/cotação; reiniciar aplicações e confirmar persistência de carrinho e regras; realizar restore em banco diferente; registrar SHA e URLs realmente validadas.

A URL só será entregue como funcional após readback HTTP, teste de navegador e autorização do destinatário. O aceite do staging não libera venda real. PSP, iFood, cozinha, entregadores, dados de consumidores e exportação de conversões continuam desativados.

## Entradas comerciais

Usar docs/discovery/commercial-intake.md para catálogo, opções, preço fixo de combo, CEPs, horários, subsídio máximo e meio de pagamento. Valores de teste não podem virar oferta por omissão de aprovação.

## Referências consultadas em 20/09/2026

https://docs.railway.com/networking/private-networking
https://docs.railway.com/volumes
https://docs.railway.com/pricing/plans

Este plano não confirma permissões, custo, região de hospedagem ou recursos existentes na conta.
