# Fase 1E: segurança e preparação de homologação

Status inicial: candidato, aguarda CI completo deste incremento.

## Logo

O asset existente public/images/vintage-arcade-logo.webp tem 7.513 bytes, enquanto o cabeçalho RIFF declara 25.662 bytes. SHA-256 fd85880dc700f2a0baf292fae939f86ade6f7afeb2da3836e763fa7703ebcabc. A decodificação local falhou. O arquivo foi coletado sem alteração no artefato existing-brand-diagnostic do CI 35543587492.

Portanto o defeito não foi atribuído ao CSS. A prévia passa a tratar falha de carregamento/decodificação, inclusive antes da hidratação, e exibir identificação textual provisória VINTAGE ARCADE em área reservada responsiva. O arquivo compartilhado com a LP não foi substituído, redesenhado ou declarado recuperado. O original íntegro ainda é uma entrada de aceite visual. Duas buscas por imagens na Biblioteca/conversa não localizaram uma fonte original utilizável nesta intervenção.

## Dependência transitiva

Ver docs/security/uuid-remediation.md. Override restrito ao UUID do BullMQ, sem mudar versões Medusa/BullMQ. Teste adicional executa uma fila QA com deduplicação, falha com retry, job atrasado e eventos de conclusão, além da regressão integrada existente.

## Ambiente

Ver docs/operations/staging-plan.md. Homologação persistente preparada como plano, ainda não provisionada. A prévia continua bloqueada fora de local/test. Não habilitar integrações nem contornar a configuração usando APP_ENV=test em infraestrutura pública.

## Preservação

Alterações restritas à branch foundation/vintage-commerce-v1. Nenhum merge ou deploy de produção. Nenhum preço, catálogo, credencial iFood, PSP ou regra comercial foi inventado ou ativado.
