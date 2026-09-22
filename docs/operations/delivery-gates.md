# Delivery gates — Vintage Arcade

Status: operacional · atualizado 2026-09-21  
Regra: **não misturar gates**. Cada gate exige evidência própria (SHA + testes + docs).  
Commerce **não** faz merge em `main` sem gate explícito de go-live.

| Gate | Nome | Critério de saída | Estado |
| --- | --- | --- | --- |
| **A** | commerce synthetic complete | Frete, combos, cart incentives, checkout sintético, quote expiry, simulated order, unit+smoke PASS, APP_ENV staging preparado no código | **PASS** (código; staging host BLOQUEADO) |
| **B** | iFood adapter complete with mocks | ACL, OAuth mock, catalog/COMBO_V2 map, ingest, assinatura, idempotência, retries, DLQ, polling fixture, `IFOOD_ENABLED=false`, testes unitários | **PASS** (mocks; live = Gate F) |
| **C** | commercial data approved | `docs/discovery/commercial-intake.md` sem itens críticos PENDENTE; homologadores nomeados; fixtures ≠ dados reais | **PENDENTE** (checklist pronto; dados PENDENTE) |
| **D** | staging live | Projeto `vintage-arcade-staging` no Railway, HTTPS, Basic Auth, private net, migrations, bootstrap, backup/restore · host futuro `homolog.vintagearcade.com.br` | **BLOQUEADO** (trial Railway expirado) |
| **E** | PSP sandbox | **Mercado Pago** sandbox + webhooks; `PAYMENTS_LIVE_ENABLED=false` | **PENDENTE** (adapter mock → MP sandbox) |
| **F** | iFood homologation | Credenciais reais, OAuth live, webhook endpoint, polling live, aceite merchant | **PENDENTE** (credenciais) |
| **G** | pilot internal | Pedidos reais controlados, operação/KDS, tracking sem Ads export | **PENDENTE** |
| **H** | controlled launch | Soft launch com feature flags; Ads export só com decisão | **PENDENTE** |
| **I** | production stabilization | Observabilidade, anomaly v1, rollback ensaiado, SLOs | **PENDENTE** |

## Flags padrões (todos os gates até H, salvo decisão)

```
IFOOD_ENABLED=false
PAYMENTS_LIVE_ENABLED=false
ADS_EXPORT_ENABLED=false
```

## Dependências externas

| Bloqueio | Impacto | Ação sem gasto |
| --- | --- | --- |
| Railway trial expirado | Gate D | Manter código/docs; não provisionar; não upgrade sem autorização |
| PSP não escolhido | Gate E | Manter adapter mock |
| Credenciais iFood | Gate F | Manter mocks |
| Dados comerciais | Gate C | Intake checklist; não inventar preços |

## Próximo foco após Gate B

1. Fechar Gate B com CI verde nesta branch  
2. Aguardar Gate C (decisão comercial) **em paralelo** com Gate D (billing Railway)  
3. Não abrir Gate F/E live sem C + D
