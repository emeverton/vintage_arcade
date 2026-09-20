# Backoffice de regras de entrega: guia operacional

Versão: incremento 1C, 20/09/2026.
Status: testado em CI descartável. Ainda não há endereço público de homologação nem liberação para produção.

## Localização

No painel Medusa, o menu Regras de entrega abre a rota relativa /app/vintage-delivery. O primeiro cadastro de uma opção de entrega depende de provisionamento técnico e das condições comerciais aprovadas. O painel deste incremento administra as opções Vintage já existentes.

## Fluxo de trabalho

Selecione a opção de entrega e confira a versão ativa. Edite o pedido mínimo, frete base, limite do benefício, teto de subsídio, área por CEP e período de validade. Os campos monetários da tela recebem valores em reais; o serviço persiste a política em centavos.

Antes de salvar, use Simular frete com um total de itens e um CEP. O resultado é apenas uma simulação, não uma promessa enviada ao comprador, e não cria pedido. O total elegível considera os itens após descontos e com os tributos dos itens, sem o próprio frete.

Informe o motivo e use Salvar rascunho. A versão ativa não muda. Confira a revisão salva selecionada. Um usuário com permissão de publicação pode então usar Publicar revisão e Confirmar publicação.

A publicação aplica a revisão salva, não eventuais edições ainda não salvas no formulário. Uma nova política passa a ser utilizada nos próximos cálculos do ambiente; pedidos concluídos não são reescritos.

## Reversão

Selecione uma revisão anteriormente publicada ou Configuração inicial. Informe o motivo, use Reverter para revisão e confirme. A reversão gera um novo registro no histórico, preservando o que foi feito anteriormente.

## Permissões

Consulta permite leitura e simulação. Edição acrescenta criação de rascunhos. Publicação acrescenta publicação e reversão. Um usuário autenticado sem permissão explícita não acessa este módulo. A concessão desses perfis é administrativa e permanece restrita ao servidor; não é feita no formulário.

## Conflitos e falhas

Se outra publicação tiver ocorrido, atualize o estado e confira a versão ativa antes de decidir novamente. Não trate uma mensagem de conflito como autorização para sobrescrever alterações de outro operador.

Se houver erro de comunicação, confira o estado ativo e o histórico antes de reenviar. A API possui idempotência, mas o formulário atual ainda não oferece uma fila persistente de operações pendentes entre recarregamentos de página.

Uma falha na gravação da auditoria impede a confirmação da publicação. O histórico mostra autor, motivo, revisão, geração e data. Não use o motivo para registrar dados pessoais de compradores.

## Limites atuais

As datas são informadas em UTC; a conversão assistida de fuso e recorrência por dia da semana ainda não estão incluídas. O benefício é limitado por pedido e não calcula margem automaticamente. As opções são paginadas e o histórico sinaliza quando exibe apenas os 100 registros mais recentes.

Não há sincronização automática dessas condições com o iFood. Nenhum clique deste painel agenda entregador ou cobra pagamento. Não existe liberação comercial sem concluir os gates registrados no checklist F0 e no relatório da fase 1C.
