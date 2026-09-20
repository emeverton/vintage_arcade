# Fase 1E: segurança e preparação de homologação

Status: ajuste de apresentação candidato, aguarda nova regressão integrada e inspeção visual. O run 35543973161 passou os testes automatizados, mas sua captura desktop ainda mostrava uma área vazia de marca. Não usar esse run como aceite visual.

## Logo

O asset existente public/images/vintage-arcade-logo.webp tem 7.513 bytes, enquanto o cabeçalho RIFF declara 25.662 bytes. SHA-256 fd85880dc700f2a0baf292fae939f86ade6f7afeb2da3836e763fa7703ebcabc. A decodificação local falhou. O arquivo foi coletado sem alteração no artefato existing-brand-diagnostic do CI 35543587492.

Chromium pode informar naturalWidth positivo para esse arquivo sem desenhar o logo; por isso um fallback baseado somente no evento error ou nas dimensões naturais não foi suficiente. A prévia agora deixa de carregar esse asset conhecido como truncado e exibe identificação textual provisória VINTAGE ARCADE em área reservada responsiva. O teste passa a exigir texto legível e ausência da imagem truncada em desktop e mobile.

O arquivo compartilhado com a LP não foi substituído, redesenhado ou declarado recuperado. O original íntegro ainda é entrada de aceite visual comercial. Duas buscas por imagens na Biblioteca/conversa não localizaram fonte original utilizável nesta intervenção.

## Dependência transitiva

Ver docs/security/uuid-remediation.md. Override restrito ao UUID do BullMQ, sem mudar versões Medusa/BullMQ. O run 35543973161 confirmou zero advisories no runtime do backend e passou o ensaio de fila QA com deduplicação, falha com retry, job atrasado e eventos de conclusão. A nova alteração de interface exige reteste integrado antes do aceite deste incremento.

## Ambiente

Ver docs/operations/staging-plan.md. Homologação persistente preparada como plano, ainda não provisionada. A prévia continua bloqueada fora de local/test. Não habilitar integrações nem contornar a configuração usando APP_ENV=test em infraestrutura pública.

## Preservação

Alterações restritas à branch foundation/vintage-commerce-v1. Nenhum merge ou deploy de produção. Nenhum preço, catálogo, credencial iFood, PSP ou regra comercial foi inventado ou ativado.
