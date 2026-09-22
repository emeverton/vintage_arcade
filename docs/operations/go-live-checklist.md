# Go-live checklist (controlado)

Não executar itens LIVE sem decisão explícita do dono do projeto.

## Pré-requisitos de gates

- [ ] Gate A PASS  
- [ ] Gate B PASS (mocks)  
- [ ] Gate C APROVADO (dados comerciais)  
- [ ] Gate D staging live  
- [ ] Gate E PSP sandbox green  
- [ ] Gate F iFood homologado (se canal no lançamento)  
- [ ] Gate G pilot internal  
- [ ] Gate H controlled launch autorizado  

## Produção LP (já separada)

- [x] Main Git → Vercel production  
- [x] Domínio principal alinhado ao deployment Git  
- [x] `/vt-boot.js` = 404  
- [x] Sem bloqueio por selo/autoria  

## Commerce launch

- [ ] Migrations em banco de produção dedicado  
- [ ] Secrets rotacionados  
- [ ] Feature flags: iFood/PSP/Ads conforme decisão  
- [ ] Rollback ensaiado  
- [ ] On-call / runbook  
- [ ] Tracking: `purchase` só com pagamento confirmado  

## Rollback

1. Desligar feature flags live  
2. Rollback deployment commerce (sem tocar LP Vercel salvo necessidade)  
3. Não `git clean` / force push  
4. Registrar SHA e motivo
