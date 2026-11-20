# Webhook da Boat (Whilo) — URL e configuração

> Documento factual. **Não contém segredos.** Sem deploy.

## URL do webhook para colocar na Boat

**URL do webhook para colocar na Boat (dashboard da conta boat.dev):**

```
https://api.whilo.onerall.com/v2/hosting/boat/webhook
```

## Eventos

O endpoint deve receber os seguintes 4 eventos (os mesmos lidos pelo `HostedServerService` / Worker):

- `sandbox.ready`
- `sandbox.error`
- `sandbox.archived`
- `sandbox.hydrated`

## Signing secret (`BOAT_WEBHOOK_SECRET`)

O **signing secret** é exibido **apenas uma vez** pela Boat quando o webhook/segredo é criado ou rotacionado. Ele **deve ser salvo como `BOAT_WEBHOOK_SECRET`** no Worker, por um destes meios:

- `wrangler secret put BOAT_WEBHOOK_SECRET` (no ambiente/Worker correto), ou
- script de registro/configuração que persista o segredo, ou
- `bun run hosting:setup --target=production` (atualiza/registra o webhook e armazena o segredo quando aplicável).

**Não imprima nem versione valores de segredos.**

## Observação sobre `setup-account-server.ts`

O script `scripts/hosting/setup-account-server.ts` está corrigido para `target=production` apontar para `https://api.whilo.onerall.com` (origem usada para registrar o webhook Stripe e o webhook da Boat em produção).
