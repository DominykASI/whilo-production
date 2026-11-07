# Whilo Inbox — desenho técnico (não testado; para revisão)

Objetivo: cada agente do Whilo tem uma caixa de entrada própria em `whilo.bot@onerall.com`.
Custo alvo: ~R$0 (Cloudflare recebe; Mailrelay faz até 80k envios/mês para saída).

## Fluxo
1. **Entrada (grátis):** Cloudflare Email Routing no `wr.onerall.com`/domínio do whilo
   captura `catch-all` → roteia para `whilo-inbox` (Email Worker).
   O Worker parseia o MIME (ex.: `mailparser`), guarda o e-mail (D1 ou KV/R2) e indexa
   por agente (envelope "to" = whilo.bot@onerall.com → resolver agente por tag/id no assunto ou
   alias `<agente>@whilo.bot`).
2. **Saída:** Mailrelay via SMTP/API (80k grátis/mês) — ou Resend se mudar de ideia.
   SPF/DKIM/DMARC no DNS da onerall.com conforme exigido pelo provedor.
3. **Agente acessa:** um MCP local ("whilo-inbox") expõe tools `inbox.list`, `inbox.read`,
   `inbox.search`, `inbox.reply` → o agente responde/triagem segundo a política (approval
   gates como no resto do app).
4. **UI:** aba "Caixa de entrada" nos settings/agente: lista de e-mails, rascunho para envio,
   "aprovar envio" toggle (ou aprovação via chat).

## Esqueleto do Email Worker (ilustrativo; precisa revisão + deploy com suas credenciais)
```js
// wrangler.toml: binding d1 = WHILO_DB, e route de catch-all via Email Routing
import PostalMime from "postal-mime";
export default {
  async email(message, env, ctx) {
    const raw = await new Response(message.raw).arrayBuffer();
    const parsed = await PostalMime.parse(raw);
    await env.WHILO_DB.prepare(
      "INSERT INTO messages (id, to_addr, from_addr, subject, body_text, received_at) VALUES (?1,?2,?3,?4,?5,?6)"
    ).bind(crypto.randomUUID(), message.to, parsed.from?.address, parsed.subject, parsed.text ?? "", Date.now()).run();
  },
};
```
API REST (`/v1/mail/list|read|send`) protegida por token, usada pelo MCP local via HTTP.

## Passos no Cloudflare/DNS (você faz, com sua conta — eu não posso)
1. Painel Cloudflare → Email → Routing → habilitar no domínio.
2. Criar catch-all `*@whilo.bot` → Send to Email Worker `whilo-inbox` (criar o Worker).
3. DNS: registros SPF/MX do Email Routing (gerados automaticamente); DKIM do Mailrelay;
   `DMARC TXT` recomendado (`v=DMARC1; p=quarantine; rua=mailto:dmarc@onerall.com`).
4. Mailrelay: verificar domínio, pegar credenciais SMTP, criar API key (para o MCP).

## Riscos e notas
- Entrega no Gmail/Outlook depende de rep/IP do Mailrelay — para volume alto, troque por Resend.
- Spam: nada entra no agente sem passar por regras simples (allowlist/lista cinza) + approval.
- Privacidade: e-mails ficam em D1/KV da Cloudflare — DPA com Cloudflare necessário para
  dados pessoais (o agente é o seu usuário de confiança; ainda assim, minimizar).
- `Whilo.bot` deve estar ligado ao mesmo produto (registro de marca/domínio a avaliar).

## Próximos passos (execução)
1. Decidir onde o MCP vive (apps/whilo-inbox no monorepo ou repositório próprio).
2. Você cria o Worker na sua conta + injeta segredos (D1/API key) e me devolve o endpoint.
3. Eu implemento o MCP + aba no app + tools para agentes.
