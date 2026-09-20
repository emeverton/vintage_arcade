# UUID: correção controlada de dependência transitiva

Data: 20/09/2026. A correção é candidata até aprovação do CI completo do commit que a contém.

## Diagnóstico

O relatório de runtime da Fase 1D tinha cinco entradas moderadas propagadas pelo mesmo advisory GHSA-w5hq-g745-h8pq. Caminho: Medusa 2.21.0, event-bus-redis/workflow-engine-redis, BullMQ 5.13.0, uuid 9.0.1. Cinco entradas não significam cinco vulnerabilidades independentes.

O advisory descreve ausência de verificação de limites nos métodos v3/v5/v6 com buffer de saída fornecido pelo chamador. A versão CommonJS corrigida é 11.1.1. O módulo worker do BullMQ 5.13.0 importa v4; essa observação reduz a hipótese de exposição específica, mas não foi usada para dispensar a correção nem representa análise universal de alcançabilidade.

## Alteração mínima

Override restrito a bullmq@5.13.0 -> uuid@11.1.1. Medusa permanece 2.21.0; BullMQ permanece 5.13.0. Não foi executado npm audit fix --force nem downgrade do commerce para Medusa 1.x. A alteração cruza o major de uma dependência transitiva e exige a regressão descrita abaixo. Deve ser removida após adoção de uma versão do fornecedor que resolva o advisory sem override.

A primeira tentativa preservou uma resolução aninhada antiga no lockfile e foi rejeitada pelo teste de versão, sem publicar manifest/lock. A segunda invalidou somente a entrada aninhada de UUID, regenerou o lock com npm, instalou com npm ci e confirmou a resolução efetiva. O workflow temporário de reparo escreveu somente package.json e package-lock.json na branch aprovada e foi removido após uso.

## Gate

Confirmar npm ci, UUID efetivamente resolvido a partir de BullMQ, geração v4, rejeição de buffer inválido v5, duplicação de job ID sem duplicar trabalho, retry após falha, job atrasado e eventos de conclusão. Reexecutar migrations, eventos Medusa, backoffice, API privada, navegador, Redis e restauração do banco. Auditoria deve usar dependências de runtime efetivamente instaladas, não somente uma edição do manifesto.

O teste de fila só usa infraestrutura descartável local/CI e elimina exclusivamente a fila QA de nome aleatório que criou. Não acessa filas de clientes.

## Referências

https://github.com/advisories/GHSA-w5hq-g745-h8pq
https://github.com/taskforcesh/bullmq/blob/v5.13.0/src/classes/worker.ts
https://github.com/uuidjs/uuid/releases/tag/v11.1.1

Auditoria de runtime sem achados não é certificação de segurança da aplicação, nem substitui revisão do storefront, autenticação, infraestrutura e integrações.
