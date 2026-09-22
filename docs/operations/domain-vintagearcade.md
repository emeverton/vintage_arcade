# Domínio oficial — vintagearcade.com.br

Atualizado: 2026-09-22  
Registrar: **Registro.br**  
DNS autoritativo atual: **CemWeb** (`ns1.cemweb.com.br` / `ns2.cemweb.com.br`)  
Provedor de zona pretendido: **DNS do Registro.br** (cutover manual no painel)  
LP Vercel: projeto `vintage-arcade-web` (manter `*.vercel.app`)

## Arquitetura de hosts

| Host | Uso | Quando |
| --- | --- | --- |
| `vintagearcade.com.br` | LP produção (apex) | Agora |
| `www.vintagearcade.com.br` | Redirect 308 → apex | Agora (Vercel já configurado) |
| `homolog.vintagearcade.com.br` | Storefront staging Railway | Gate D (não criar DNS ainda) |
| `pedido.vintagearcade.com.br` | Commerce go-live | Gate H (reservado; não publicar) |
| `api.vintagearcade.com.br` | **Não criar** | Medusa/PG/Redis privados |

## Estado Vercel (preparado)

| Domínio no projeto | Status | Nota |
| --- | --- | --- |
| `vintagearcade.com.br` | Adicionado a `vintage-arcade-web` | Aguarda DNS `A → 76.76.21.21` |
| `www.vintagearcade.com.br` | Adicionado + **redirect 308 → apex** | Mesmo `A`/`CNAME` Vercel |
| `vintage-arcade-web.vercel.app` | Mantido | Backup / QA |

Produção Git atual: deployment `dpl_5Ww5` · SHA `b825941` · READY.

## Readback DNS atual (público)

| HOST | TYPE | VALOR ATUAL | VALOR NECESSÁRIO (Registro.br) | AÇÃO | IMPACTO |
| --- | --- | --- | --- | --- | --- |
| `@` (apex) | NS | `ns1.cemweb.com.br` / `ns2.cemweb.com.br` | NS do DNS Registro.br (painel gera) | Trocar NS **só depois** de zona pronta | Propagação 15min–48h; DNS passa a ser editável no Registro.br |
| `@` | A | `107.161.183.67` (CemWeb / Linktree atual) | `76.76.21.21` (Vercel) | Substituir A do apex | Site deixa Linktree e passa a servir LP Vercel |
| `@` | AAAA | (nenhum) | (não criar, salvo Vercel pedir) | Manter vazio | — |
| `www` | CNAME → apex | `vintagearcade.com.br` → `107.161.183.67` | `A 76.76.21.21` **ou** CNAME que Vercel indicar | Alinhar a Vercel | www → LP; Vercel aplica 308→apex |
| `@` | MX | `0 vintagearcade.com.br.` | `0 mail.vintagearcade.com.br.` | **Obrigatório antes** de mudar A do apex | Sem isso, e-mail quebra (MX segue o A) |
| `mail` | CNAME → apex | `vintagearcade.com.br` → `107.161.183.67` | **A** `107.161.183.67` (fixo, não CNAME) | Converter CNAME→A no IP CemWeb | Mantém mailbox no servidor atual |
| `@` | TXT (SPF) | `v=spf1 +a +mx +ip4:107.161.183.67 ~all` | **Preservar** (mesmo texto) | Recriar idêntico na zona Registro.br | Autorização de envio |
| `default._domainkey` | TXT (DKIM) | chave RSA atual (ver dig) | **Preservar** byte-a-byte | Recriar idêntico | Assinatura de e-mail |
| `_dmarc` | TXT | **inexistente** | Opcional depois (`v=DMARC1; p=none; …`) | Não bloquear cutover | Política DMARC |
| `webmail` / `cpanel` / `ftp` | A | `107.161.183.67` | Preservar se ainda usam painel CemWeb | Recriar | Acesso ao host antigo |
| `homolog` | — | — | (futuro) CNAME/A Railway | **Não criar agora** | Staging |
| `pedido` | — | — | (futuro) | **Não criar agora** | Commerce |

### DKIM atual (copiar integral no Registro.br)

```
default._domainkey TXT
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtiOF5M+4UnZB1Vp9U0NwcDRXT+Eo3mCWUdmEG2sIQXv7Ay3QsSAmY1cPlPuUIYuKN+ZBQe742EExQq7xMGurXAXxKT6QYOey4rL6oiIeQuApMLJjOXxOWdlW34oJuIwbz6Qf9khcBqvzWbIZTRhbiex8KtpJlPddeLQXiZz1xspzoQmGFHrwNGlhG5qGcB9KLK6yeHGHvGY/rw//CiZzXkJt7Yb+nouefytKG/yi6Kv0Kktc9qxGc3zckaS1OdlBY/7cCHyvSwdHjFyQYsAKzkx/2qr2+JBuxAlGvHhzHtb9sA8e6CTV7sxm2UP4fUK/vlALQsBL+TJiyg+9BNuywQIDAQAB;
```

## Riscos

1. **E-mail**: MX aponta para o próprio apex. Mudar só o A do site **sem** `mail` A + MX novo = **quebra imediata de @vintagearcade.com.br**.
2. Trocar NS para Registro.br **com zona vazia** derruba site + e-mail.
3. Cloudflare proxy: **não usar** neste cutover.
4. Titular RDAP: Thales / tech Tharik — login no Registro.br é deles (credencial externa).

## Sequência segura (executar no painel Registro.br)

**Não automatizável daqui** — exige login Registro.br.

1. Entrar em https://registro.br → domínio `vintagearcade.com.br` → DNS.
2. Ativar **DNS do Registro.br** (criar zona) **sem** apagar ainda os NS CemWeb até a zona estar completa — ou seguir o fluxo do painel que pede registros antes da troca.
3. Na zona nova, criar **nesta ordem**:
   1. `mail` **A** → `107.161.183.67`
   2. `@` **MX** → `0 mail.vintagearcade.com.br.`
   3. `@` **TXT** SPF (texto atual)
   4. `default._domainkey` **TXT** DKIM (texto atual)
   5. `webmail` / `cpanel` / `ftp` **A** → `107.161.183.67` (se ainda necessários)
   6. `@` **A** → `76.76.21.21`
   7. `www` **A** → `76.76.21.21` (Vercel recomendou A; redirect 308 já está no projeto)
4. Só então confirmar troca de NS para os servidores que o Registro.br exibir.
5. Aguardar propagação; validar:
   - `dig A vintagearcade.com.br` → `76.76.21.21`
   - `dig MX` → `mail.vintagearcade.com.br`
   - `dig A mail` → `107.161.183.67`
   - HTTPS apex → LP Vintage (não Linktree)
   - Envio/recebimento de e-mail de teste

## Alternativa mais rápida (sem mudar NS agora)

Se quiser ir ao ar **hoje** sem migrar DNS para Registro.br:

- Editar zona **na CemWeb** (cPanel do IP `107.161.183.67`): mesmos passos 3.1–3.7.
- NS permanecem CemWeb; Registro.br só guarda o domínio.
- Migrar zona para Registro.br depois, com cópia fiel.

## Proibições

- Não apagar MX/SPF/DKIM.
- Não criar `api.` / `homolog.` / `pedido.` neste cutover.
- Não apontar nameservers para Cloudflare/Vercel sem plano de e-mail.
- Não publicar commerce em produção.
