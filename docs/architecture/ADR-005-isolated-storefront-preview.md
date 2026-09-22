# ADR-005: experiência de carrinho em homologação isolada

Status: candidato, aguardando CI. Data: 20/09/2026.

## Escopo

Conectar uma rota Next.js de teste ao backend existente sem modificar a homepage, os assets ou as dependências da LP. Não é lançamento comercial, PWA completo, homologação de PSP ou integração iFood.

A rota /pedido-teste e o BFF /api/vintage-test/* exigem flags explícitas e ambiente local/test. O endereço do BFF e seu backend precisam ser loopback. Em configuração normal ou produção, a rota responde 404. Não há URL pública provisionada.

## Propriedade do carrinho

Um cookie HttpOnly e SameSite Strict guarda uma capacidade aleatória de 256 bits. O backend persiste somente seu hash e o vínculo com um carrinho nativo, com validade de 24 horas. O BFF mantém a credencial de serviço exclusivamente no servidor. Nenhuma ação aceita cart_id, order_id, preço ou total do navegador. Todas as operações da sessão passam por um lock Redis. A Store API nativa fica bloqueada enquanto esta prévia específica está habilitada para impedir caminhos alternativos sem ownership.

As mutações do BFF verificam Origin, Host, cabeçalho específico e JSON limitado a 16 KB. O backend exige credencial de serviço, recusa Origin de navegador e aplica limites Redis. As respostas não são cacheáveis. HTTP sem Secure é permitido somente nessa homologação loopback; não é receita de cookie para produção.

## Experiência mínima

Um combo com soma dos componentes, opcional de sobremesa, cálculo de diferença para benefício, adição/remoção idempotente do extra, CEP sintético, cotação e conclusão pelo simulador interno pp_system_default. Catálogo e preços vêm do backend. Uma segunda sessão não vê o primeiro carrinho.

A cotação expira após cinco minutos e inclui uma impressão do carrinho, valores, endereço e política publicada. Alteração anterior à confirmação exige nova cotação. Um snapshot da política aceita é persistido em metadata do pedido de teste. Pedidos concluídos usam seus valores registrados, não regras atuais.

## Limites e gates

Somente fixtures verificadas como sintéticas são provisionadas. Não há cadastro de cliente, endereço real, cobrança, entrega, métricas enviadas para mídia ou integração iFood. O evento order_created não é purchase confirmado.

O protótipo permite um combo por sessão, mais um extra avulso. Alteração da composição, quantidade arbitrária, cupom, retirada e catálogo completo são incrementos futuros. Os locks do gateway não equivalem a ordenação transacional global de publicação e checkout. Corrida de publicação durante a confirmação, recuperação de queda entre criação do carrinho e vinculação da sessão, retenção/limpeza de sessões expiradas, estoque real e PSP continuam gates para produção.

## Referências

- https://nextjs.org/docs/app/api-reference/functions/cookies
- https://nextjs.org/docs/app/api-reference/file-conventions/route
- https://docs.medusajs.com/resources/commerce-modules/product/guides/price
- https://docs.medusajs.com/resources/references/medusa-workflows/deleteLineItemsWorkflow
