# Fase 1E: verificação de dependências, apresentação e preparação de homologação

Data: 20/09/2026.
Resultado: PASS no escopo técnico sintético executado. Homologação persistente não provisionada. Identidade visual comercial ainda depende do logotipo original íntegro.

## Proveniência

Repositório: emeverton/vintage_arcade.
Branch: foundation/vintage-commerce-v1.
Código efetivamente aprovado: 46d5365b9cc124dcae109e5ccf12c793eb91c42b.
CI: https://github.com/emeverton/vintage_arcade/actions/runs/35544281439
Job: 106167328619, completed/success.
Artefato: foundation-evidence, ID 10615796422, 20 arquivos, 566.509 bytes.
SHA-256 do ZIP baixado e conferido: cc32b22fdad4623bb2be2ee30b1c1c11639997fa96e2ac3a3422f5205b6d7576.
SHA-256 do lockfile instalado: 130cdf747abd33027906b24ac33d483cdbcd316b4a244d35cae51e398bc173f4.
Retenção do artefato informada pelo GitHub: até 27/09/2026 às 23:22:10 UTC. Uma cópia foi entregue na conversa.

Este commit documental não altera o código testado. Nova alteração de código, dependências ou infraestrutura exige nova validação.

## Dependência transitiva corrigida

Os cinco alertas moderados anteriores eram entradas propagadas de um único advisory de UUID. Foi aplicado override limitado a bullmq@5.13.0 -> uuid@11.1.1, preservando Medusa 2.21.0 e BullMQ 5.13.0. A entrada aninhada de uuid 9.0.1 deixou de existir no lockfile aprovado; a resolução CommonJS efetiva a partir de BullMQ foi verificada.

O npm audit --omit=dev desta execução retornou zero entradas de runtime no backend: info 0, low 0, moderate 0, high 0 e critical 0. Esse resultado é pontual e limitado a esse manifesto/lock e à base de advisories consultada. Não certifica a segurança da aplicação inteira nem cobre automaticamente o runtime do storefront, infraestrutura ou integrações.

A primeira tentativa de correção reteve uma resolução antiga de UUID no lockfile e foi rejeitada antes de publicar manifest/lock. O reparo posterior invalidou somente a entrada aninhada antiga, executou instalação limpa e preservou os pins do commerce. O workflow temporário de escrita foi removido; o pipeline habitual permanece somente leitura do repositório.

O teste adicional de fila, além da regressão Medusa, confirmou sete verificações: resolução CommonJS, geração UUID v4, rejeição de buffer inválido v5, deduplicação por job ID, retry após falha, execução atrasada e eventos de conclusão. O job de retry executou duas vezes por falha proposital na primeira tentativa; o atrasado executou uma vez. Não houve erros de infraestrutura no relatório. A fila aleatória de QA foi removida após o ensaio.

## Logo: causa identificada e falha de apresentação mitigada

O arquivo public/images/vintage-arcade-logo.webp contém 7.513 bytes, mas seu cabeçalho RIFF declara 25.662 bytes. SHA-256: fd85880dc700f2a0baf292fae939f86ade6f7afeb2da3836e763fa7703ebcabc. Foi coletado sem alteração no artefato existing-brand-diagnostic do run 35543587492. A decodificação local falhou. Duas buscas por imagens na Biblioteca/conversa não localizaram original íntegro utilizável.

O primeiro tratamento baseado em erro de imagem passou nos testes automatizados do run 35543973161, mas a inspeção da captura desktop encontrou o cabeçalho ainda vazio: Chromium reportava naturalWidth positivo sem desenhar o logo. Esse resultado não foi usado como aceite visual.

A implementação final deixa de carregar esse asset conhecido como truncado na prévia e exibe identificação textual provisória VINTAGE ARCADE. Os testes agora exigem texto legível e ausência da imagem truncada nos dois viewports. As novas capturas desktop e mobile foram abertas e conferidas; ambas exibem a identificação, os valores sintéticos e o aviso de simulação. Desktop: área de marca 76 x 76; mobile: 56 x 56. Não houve overflow horizontal nem page_errors nos cenários testados.

Isso não é restauração, recriação ou aprovação do logotipo comercial. O arquivo compartilhado com a LP não foi substituído. O original íntegro continua pendente para o aceite de identidade visual.

## Resultado integrado

| Grupo | Resultado confirmado nesta execução |
| --- | --- |
| Instalação limpa | npm ci aprovado |
| Auditoria de runtime do backend | Zero advisories reportados |
| Unitários | 155 aprovados, zero falhas, zero ignorados |
| TypeScript e builds | Backend/admin Medusa e Next.js aprovados |
| Migrations e módulos | Duas execuções, persistência PostgreSQL, locking Redis e módulos aprovados |
| Compatibilidade da fila | Sete verificações aprovadas, relatório incluído em checkout-ui-report.json |
| Commerce | 11 cenários agrupados aprovados |
| API do backoffice | 11 cenários agrupados aprovados |
| Navegador do backoffice | Sete verificações aprovadas, zero page_errors |
| API privada do checkout | 10 cenários agrupados aprovados |
| Checkout no navegador | Oito cenários agrupados aprovados, zero page_errors |
| Prévia desligada e homepage | 404 da página/API de teste e HTTP 200 da homepage no CI |
| Falha e recuperação Redis | Readiness aprovado durante indisponibilidade e após recuperação |
| Backup/restore isolado | Restauração aprovada, com hashes dos registros das sete tabelas próprias iguais |
| Encerramento | Processos e containers de teste encerrados pelo pipeline |

Navegador: Chromium, viewport desktop 1380 x 1000 e mobile 390 x 844. Não houve ensaio Safari, Firefox ou dispositivo físico. Restore das sete tabelas próprias não equivale a recuperação financeira completa, RPO/RTO certificado ou ensaio de produção.

O fluxo continuou usando produtos e valores sintéticos: R$ 25,00 em itens mais R$ 9,00 de frete, total R$ 34,00; adicionar R$ 5,00 em sobremesa levou a R$ 30,00 em itens e frete zero; remover o extra restituiu a taxa. O pagamento é pp_system_default, simulado e sem cobrança. Pedido criado não equivale a purchase pago verificado.

## Homologação persistente preparada, não provisionada

Foram versionados docs/operations/staging-plan.md e docs/discovery/commercial-intake.md. O primeiro propõe um projeto Railway exclusivo com Next.js, Medusa, PostgreSQL e Redis em rede privada, mantendo a LP de produção na Vercel. O segundo mantém explícitas as entradas ainda não aprovadas: catálogo, composição/preço do combo, regras reais de frete, horário, PSP, permissões iFood, operação, marca e homologadores.

A busca no catálogo de plugins mostrou Railway disponível, mas não instalado nesta conversa. Não foram presumidos titular, workspace, billing ou IDs de serviços. Não houve criação de recurso pago. Para provisionar, é necessário conectar a conta correta, verificar o plano/custo e obter aprovação de gasto; também implementar e testar configuração própria de staging, credenciais exclusivas, HTTPS e bootstrap persistente. Não contornar os bloqueios usando APP_ENV=test em infraestrutura pública.

A prévia permanece limitada a local/test. Não existe URL pública persistente nova para entregar como homologação funcional.

## Preservação

Main foi relida em 2646129d3a944b3ae27346af7b2ab54312cf3115. Não houve merge, acionamento de deploy de produção, alteração de DNS, ativação de iFood, PSP real, cozinha, entregador ou exportação para Ads nesta intervenção. Os testes foram restritos ao banco vintage_ci e ao Redis descartável.

O diff desta fase preservou a homepage app/page.tsx, estilos globais, imagens compartilhadas e manifesto/lock da raiz. A alteração visual ficou em app/pedido-teste. A confirmação de main não é auditoria de todos os recursos externos da operação.

## Próximo gate

Conexão da conta de hospedagem e orçamento aprovado; configuração segura de staging; logotipo íntegro; revisão específica do storefront; dados e regras comerciais aprovados. PSP e iFood, operação real e validação de produção permanecem liberações separadas. O PASS aqui registrado não autoriza go-live.
