# UUID: correção controlada de dependência transitiva

Data: 20/09/2026. Validada no CI completo 35544281439, código 46d5365b9cc124dcae109e5ccf12c793eb91c42b. Ver docs/discovery/phase-1e-preparation.md para proveniência e limites.

## Diagnóstico

O relatório de runtime da Fase 1D tinha cinco entradas moderadas propagadas pelo mesmo advisory GHSA-w5hq-g745-h8pq. Caminho: Medusa 2.21.0, event-bus-redis/workflow-engine-redis, BullMQ 5.13.0, uuid 9.0.1. Cinco entradas não significam cinco vulnerabilidades independentes.

O advisory descreve ausência de verificação de limites nos métodos v3/v5/v6 com buffer de saída fornecido pelo chamador. A versão CommonJS corrigida é 11.1.1. O módulo worker do BullMQ 5.13.0 importa v4; essa observação não foi usada para dispensar a correção e não representa análise universal de alcançabilidade.

## Alteração mínima

Override restrito a bullmq@5.13.0 -> uuid@11.1.1. Medusa permanece 2.21.0; BullMQ permanece 5.13.0. Não foi executado npm audit fix --force nem downgrade do commerce. A alteração cruza o major de uma dependência transitiva e foi submetida à regressão abaixo. Deve ser removida após adoção de versão do fornecedor que resolva o advisory sem override.

A primeira tentativa preservou resolução aninhada antiga no lockfile e foi rejeitada pelo teste de versão, sem publicar manifest/lock. A segunda invalidou somente a entrada aninhada de UUID, regenerou o lock com npm, instalou com npm ci e confirmou a resolução efetiva. O workflow temporário escreveu somente package.json e package-lock.json na branch aprovada e foi removido após uso.

## Validação executada

Instalação limpa; UUID resolvido a partir de BullMQ; geração v4; rejeição de buffer inválido v5; duplicação de job ID sem duplicar trabalho; retry após falha; job atrasado; eventos de conclusão. Foram reexecutados migrations, eventos Medusa, backoffice, API privada, navegador, Redis e restauração do banco. O npm audit --omit=dev retornou zero advisories no runtime do backend instalado.

O teste de fila só usa infraestrutura descartável local/CI e elimina exclusivamente a fila QA de nome aleatório que criou. Não acessa filas de clientes.

## Referências

https://github.com/advisories/GHSA-w5hq-g745-h8pq
https://github.com/taskforcesh/bullmq/blob/v5.13.0/src/classes/worker.ts
https://github.com/uuidjs/uuid/releases/tag/v11.1.1

Auditoria de runtime sem achados é pontual, não certificação de segurança da aplicação e não substitui revisão do storefront, autenticação, infraestrutura e integrações.
