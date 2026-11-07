# Whilo — estratégia (rascunho de trabalho, 03/11/2026)

Não é aconselhamento; é síntese para decidir. Dados de mercado devem ser validados por pesquisas
próprias; a busca ao vivo não retornou fontes hoje.

## A tese (o que a Sequoia e fundos similares dizem, em linhas gerais)
Os fundos que financiaram a última onda de trilhões (Amazon, Google, Facebook) observam o mesmo
padrão em IA: quem vence não vende "um botão mágico", vence quem controla o **trabalho** — os dados
do workflow, a distribuição e os efeitos de rede. Sequoia chama isso de "AI's Act Two": agentes que
**trabalham** (planejam, executam, verificam), não chatbots que respondem. O novo trilhão tende a
sair de produtos que (1) substituem uma função completa com ROI mensurável, (2) têm distribuição
própria, (3) ficam mais valiosos com cada uso (dados + rede + integradores).

## Onde o Whilo está forte (confirmado no código)
- Agentes persistentes locais, com workspaces, fila de mensagens, controle de browser, apps MCP,
  marketplace, multi-provedor (Codex, Claude, Grok, OpenCode, Gemini, Cursor, Cline, Kimi, Hermes).
- Foco em execução (files, terminal, browser, purchases via MCP) — exatamente a direção "trabalho".
- Desktop-nativo (Electron) + web + iOS — superfície de distribuição ampla.

## A lacuna competitiva (honesto)
Manus e GrokBot têm marca e distribuição. O que **ninguém** tem fechado ainda:
1. **Agente que compra** (aprovado no celular, cartão de uso único — Link Agent Wallet da Stripe).
2. **Agente com caixa de entrada própria** (Whilo Inbox — email como workspace nativo).
3. Local-first + governança (aprovar cada passo sensível) — a dor real de empresas.
Quem fecha 1+2 primeiro tem um loop de retenção diária (o inbox toca o usuário todo dia).

## O que faz comprar (não inovação, pressão de dor)
- Dor 1: "meu agente não consegue terminar nada sozinho" → modo de execução completa + purchases.
- Dor 2: "eu não confio num agente com cartão/email" → aprovação por push, limites, domínios
  permitidos, log de auditoria — transformar segurança em argumento de venda.
- Dor 3: "eu já pago 3 ferramentas e nada se conversa" → inbox + compras + browser como uma casa só.

## Requisitos para $1M/mês (diretrizes, não garantia)
Ex.: 4 mil assinantes a ~US$ 249/mês, ou mix equipe/enterprise com ARR concentrado.
Para chegar lá: canal (creators/UGC), ativação < 5 min até o 1º resultado, 1 automação vencedora
óbvia (ex.: "o inbox se responde sozinho enquanto você dorme").

## Decisões pendentes (dono do produto)
- Escopo e região do **Minha Carteira** (Link = EUA/Canadá; Brasil precisa de alternativa).
- Provedor de email do **whilo.bot@onerall.com** (Mailgun / Resend / Postmark + DNS).
- Rebrand "Whilo" vs "Whilo" (o que o usuário vê: app name, domínio, lojas).
- Métrica de 1 milhão/mês e precificação: proposta a validar com dados reais.
