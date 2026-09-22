# Vintage Arcade: entradas para homologação comercial

Status: CHECKLIST OPERACIONAL — dados reais **PENDENTE**.  
Fixtures sintéticas (R$ 25 / R$ 9 / CEP `00000001` etc.) **não** são oferta real.  
Responsável comercial: Vintage Arcade. Tradução técnica/QA: Veltrus.

Legenda: `PENDENTE` · `APROVADO` · `N/A` · `BLOQUEADO`

Preencher `aprovado_por`, `aprovado_em`, `versão`, `fonte` antes de publicar qualquer regra.

---

## CATÁLOGO

| Item | Status | Evidência / notas |
| --- | --- | --- |
| Lista de produtos (nome, descrição) | PENDENTE | |
| SKUs estáveis | PENDENTE | |
| Categorias | PENDENTE | |
| Modificadores / adicionais que alteram preço | PENDENTE | |
| Remoções (ingredientes) e impacto em preparo | PENDENTE | |
| Disponibilidade por item / pausas | PENDENTE | |
| Combos (slots, min/max, acréscimos) | PENDENTE | Inclui COMBO_V2 no canal iFood |
| Imagens aprovadas | PENDENTE | WebP atual truncado — logo íntegro pendente |
| Exportação atual do cardápio | PENDENTE | |

## PREÇO

| Item | Status | Evidência / notas |
| --- | --- | --- |
| Preço unitário por SKU | PENDENTE | |
| Combo: preço fixo **ou** soma de componentes | PENDENTE | Escolher e documentar |
| Regras promocionais | PENDENTE | |
| Limites de desconto | PENDENTE | |
| Teto de subsídio (frete/promo) | PENDENTE | |
| Acumulação com cupons | PENDENTE | |

## ENTREGA

| Item | Status | Evidência / notas |
| --- | --- | --- |
| CEPs / raios atendidos | PENDENTE | |
| Taxa base | PENDENTE | |
| Distância / faixas | PENDENTE | |
| Pedido mínimo | PENDENTE | |
| Threshold frete grátis | PENDENTE | |
| Horários de entrega | PENDENTE | |
| Indisponibilidade / pausas | PENDENTE | |
| Retirada no salão | PENDENTE | |
| ETA e responsável pela entrega | PENDENTE | |

## PAGAMENTOS

| Item | Status | Evidência / notas |
| --- | --- | --- |
| PSP escolhido | APROVADO (sandbox) | **Mercado Pago** — live off (`PAYMENTS_LIVE_ENABLED=false`) |
| Métodos (Pix, cartão, …) | PENDENTE | Confirmar no sandbox MP |
| Pagamento na entrega | PENDENTE | Confirmar se existe |
| Fluxo create / authorize / capture | PENDENTE | Adapter contract + mock; MP sandbox next |
| Cancelamento / reembolso | PENDENTE | |
| Titular da conta / sandbox | PENDENTE | Credenciais MP sandbox |

## OPERAÇÃO

| Item | Status | Evidência / notas |
| --- | --- | --- |
| Quem recebe / confirma / prepara / despacha | PENDENTE | |
| Cozinha / capacidade | PENDENTE | |
| Impressora / KDS | PENDENTE | |
| SLA de aceite / rejeição | PENDENTE | |
| Política de cancelamento | PENDENTE | |
| Canal de suporte | PENDENTE | |

## CANAIS

| Canal | Status | Notas |
| --- | --- | --- |
| Site próprio (LP) | APROVADO (marketing) | Produção Vercel alinhada à main; commerce ainda sintético |
| WhatsApp | PENDENTE | Número existente na LP; fluxo pedido formal PENDENTE |
| iFood | PENDENTE | Adapter/mocks no código; `IFOOD_ENABLED=false`; credenciais/homologação PENDENTE |
| Retirada | PENDENTE | |
| Salão | PENDENTE | |

## MARCA

| Item | Status | Evidência / notas |
| --- | --- | --- |
| Logo íntegro | PENDENTE | Asset truncado quarantinado |
| Cores / tipografia | PENDENTE | |
| Assets de campanha | PENDENTE | |
| Crédito/selo de autoria | WIP isolado | Branch local `wip/vintage-brand-seal` — **não** bloquear site |

## HOMOLOGADORES

| Nome | Papel | Canal | Status |
| --- | --- | --- | --- |
| | Aprovação comercial | | PENDENTE |
| | Operação / cozinha | | PENDENTE |
| | QA técnico Veltrus | | PENDENTE |

## Bateria mínima de aceite (quando houver dados reais)

1. Pedido abaixo do mínimo  
2. Um centavo abaixo / no / acima do benefício de frete  
3. Adicional obrigatório ausente  
4. Troca com acréscimo  
5. Remoção que perde benefício  
6. Endereço não atendido  
7. Regra alterada depois da cotação  
8. Pagamento pendente / falho / confirmado  
9. Confirmação duplicada  
10. Indisponibilidade da cozinha  
11. Webhook iFood com assinatura inválida / evento duplicado / fora de sequência  

CI sintético **não** fecha estas entradas. Prazo de acesso iFood/PSP é dependência explícita do cronograma.
