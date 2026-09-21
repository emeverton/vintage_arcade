# LP Vintage Arcade — atualização de hierarquia comercial

Data: 21/09/2026.
Branch: `foundation/vintage-commerce-v1`.
Escopo: homepage / gabinete arcade. Sem provisionamento Railway nesta tarefa.

## Alterações

- CTA principal: cardápio/pedido via WhatsApp existente.
- CTA secundário: reserva/visita via WhatsApp existente.
- Cardápio na tela do gabinete (menos espaço vazio no hero).
- Identificação textual provisória (`BrandMark`); logo WebP truncado não é carregado.
- Removidos da publicação: nota Google 4,8 / 540+ avaliações / “desde 2018” / grade de horários.
- Na LP, o visitante vê apenas: “Consulte nossos horários pelo WhatsApp.” A aprovação da grade de horários permanece só nesta documentação.
- CTAs de cardápio rotulados “Cardápio pelo WhatsApp”; cards de evento com link acessível “Consultar evento”.
- Destinos preservados: `wa.me/551733402000`, Instagram `@vintagearcadeburger`, Maps Tobias Lima 1320, telefone (17) 3340-2000.
- Sem link de cliente para `/pedido-teste`. Sem URLs inventadas de cardápio/iFood.

## Pendências de conteúdo e assets

| Item | Status |
| --- | --- |
| Logotipo original íntegro | Pendente (arquivo atual truncado; RIFF 25654 vs 7505 bytes) |
| Horários de funcionamento | Pendente de aprovação comercial (não listados na LP) |
| Avaliações / rating Google | Pendente de fonte atual |
| URL oficial de cardápio / iFood | Pendente; WhatsApp permanece canal operacional |
| Confirmação de endereço/telefone | Mantidos como destinos já existentes; revalidar com o cliente |

## Staging (fora desta tarefa)

O CI anterior validou a jornada de checkout em `APP_ENV=test` (infra descartável). Antes de qualquer deploy de homologação: validar `APP_ENV=staging`, Basic Auth, HTTPS, bootstrap e persistência, sem contornar guards. Trial Railway ainda expirado — sem contratação de plano aqui.
