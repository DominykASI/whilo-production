# Whilo · Kit Instagram (8 carrosséis + 2 reels)

Arquivo de produção. Cada bloco é fechado: arte, texto, legenda, hashtags, alt e CTA.
Idioma da entrega: português do Brasil. Direto, sem corporativês.

Base de direção já acordada: `docs/business/marketing-posts.md`. Regras herdadas dele e mantidas
aqui: o gatilho é **comente Whilo**; o tom é autoridade por comparação; proibido inventar número,
depoimento, contagem de usuários ou função de concorrente.

## Regras de execução (valem para as 10 peças)

1. Nenhum número na arte sem fonte. Se falta o dado, a arte leva `[DADO A CONFIRMAR]` e a peça não
   vai ao ar antes do preenchimento.
2. Só entra função que existe neste repositório. Whilo Inbox e Minha Carteira não estão no ar:
   sempre "em breve", nunca "disponível".
3. Comparação é de categoria (chat x agente com espaço de trabalho) ou de recurso do Whilo. Não se
   afirma o que um concorrente faz ou deixa de fazer. Logo de terceiro só em SVG oficial, sem
   legenda que descreva a função dele.
4. Legenda de carrossel tem no máximo 3 linhas antes do "ver mais". A primeira linha é a mesma
   promessa da capa.
5. Uma peça, um CTA. O CTA de lead magnet é sempre a palavra única: **comente Whilo**.
6. Toda peça declara o papel no funil. Papel repetido é peça descartada.

## Linguagem visual real do app (não inventar cor)

Os nomes abaixo são tokens de `packages/brand/src/tokens.css` e presets de
`packages/contracts/src/app-interface-look.ts`. A direção de arte cita o token, não o hex solto.

| Papel na arte | Token / preset | Valor base |
| --- | --- | --- |
| Fundo principal | `--whilo-bg-canvas` | `#1a1a1a` |
| Card sobre o fundo | `--whilo-bg-surface` | `#212121` |
| Card elevado | `--whilo-bg-surface-raised` | `#242424` |
| Moldura da janela | `--whilo-bg-frame` | `#0d0d0d` |
| Texto principal | `--whilo-text-primary` | `#ffffff` |
| Texto secundário | `--whilo-text-secondary` | `#dcdcdc` |
| Texto de apoio | `--whilo-text-muted` | `#979797` |
| Texto fraco | `--whilo-text-dim` | `#6a6a6a` |
| Ação / destaque | `--whilo-accent` (preset `blue`, padrão do app) | `#007cf7` |
| Hover de ação | `--whilo-accent-hover` | `#1f8fff` |
| Texto em acento | `--whilo-accent-text` | `#42a0ff` |
| Fundo suave de acento | `--whilo-accent-soft` | `rgba(0,124,247,0.16)` |
| Borda/realce de acento | `--whilo-accent-strong` | `rgba(0,124,247,0.34)` |
| Aprovação pendente | `--whilo-approval-badge-soft` + `--whilo-warning` | `rgba(255,148,18,0.18)` / `#ff9412` |
| Concluído / liberado | `--whilo-success` | `#31cf76` |
| Erro / recusa | `--whilo-danger` | `#fd2f3b` |
| Selo de novidade | `--whilo-badge-new` | `#ff1e5e` |
| Não lido / destaque azul claro | `--whilo-unread-surface` | `#74b9ff` |
| Série de dado frio | `--whilo-file-teal` / `--whilo-chart-series-grok` | `#6bc7d9` |
| Série de dado quente | `--whilo-file-pink` | `#d98ac9` |
| Marca Whilo | `--whilo-logo-production` | `#d6adf2` |
| Vidro | `--whilo-glass-surface` + `--whilo-glass-border` | `rgba(255,255,255,0.07)` / `0.18` |
| Raio de card | `--whilo-radius-card` | `14px` |
| Raio de bolha | `--whilo-radius-bubble` | `22px` |
| Raio de pílula | `--whilo-radius-pill` | `999px` |
| Tipo | `--whilo-font-sans` (Inter Variable) | pesos 400/500/600/700 |
| Escala de título | `--whilo-text-3xl` (24) e `--whilo-text-display` (32) | título de capa em 32/700 |
| Ícone | Lucide, `--whilo-icon-stroke` | traço 1.5 |

Presets de acento disponíveis, um por peça: `blue`, `violet`, `teal`, `amber`, `rose`, `graphite`,
`lagoon`, `ember`. Cada peça usa **um** preset, para o feed ter assinatura e não sopa de cores.

Formato: carrossel 1080x1350 (4:5). Reels 1080x1920 (9:16), legenda queimada em 70% da tela.
Margem de segurança: 96px nas laterais, 120px no topo.

## Mapa do funil

| # | Peça | Papel | Objetivo único | Preset |
| --- | --- | --- | --- | --- |
| 1 | Carrossel | Autoridade por comparação | Dizer o que uma categoria inteira não entrega | `blue` |
| 2 | Carrossel | Problema e agitação | Nomear a dor "meu agente não termina nada" | `amber` |
| 3 | Carrossel | Prova de demonstração | Mostrar uma tarefa real, passo por passo | `teal` |
| 4 | Carrossel | Objeção (confiança, cartão, e-mail) | Responder "não confio" sem mentir sobre o que falta | `graphite` |
| 5 | Carrossel | Comparação | Chat contra agente com espaço de trabalho | `violet` |
| 6 | Carrossel | Caso de uso | Cinco trabalhos delegáveis nesta semana | `lagoon` |
| 7 | Carrossel | Prova social (placeholder) | Dar rosto humano ao resultado, com dado real | `rose` |
| 8 | Carrossel | Oferta direta | Converter comentário em lead agora | `ember` |
| 9 | Reel | Conversão | Quebrar objeção de compra e levar ao comentário | `ember` |
| 10 | Reel | Demonstração | Provar que o agente termina trabalho sozinho | `teal` |

Ordem de publicação sugerida: 2, 5, 1, 3, 4, 6, 10, 9, 7, 8. Abre na dor, constrói autoridade,
fecha com oferta. A peça 7 só entra quando houver depoimento real.

---

# CARROSSEL 1 · AUTORIDADE POR COMPARAÇÃO

Título interno: "O que as Big Techs não te entregam".
Papel: autoridade. Fala da categoria, não de um concorrente nomeado.
Preset: `blue`. Fundo `--whilo-bg-canvas` em todos os slides. Logo Whilo em `--whilo-logo-production`,
48px, canto inferior direito, opacidade 100%.

### Slide 1 (capa)
Texto: "O que as Big Techs não te entregam."
Visual: preto de `--whilo-bg-canvas`, sem card. Título em `--whilo-text-display`, peso 700,
alinhado à esquerda, quebrando em 3 linhas. Um filete de 4px em `--whilo-accent` sob a última
linha. Sem imagem.
Legenda: "puxe o leitor com uma frase que só se explica deslizando."
Alt: "Fundo escuro com o texto O que as Big Techs não te entregam em branco."

### Slide 2
Texto: "Um agente que termina o trabalho. Não só conversa."
Visual: card `--whilo-bg-surface`, raio `--whilo-radius-card`. À direita, ícone Lucide `SquareCheck`
em `--whilo-success`, 64px. Título em 32/700 sobre uma coluna de 6/10.
Legenda: "a promessa do carrossel inteiro mora aqui."
Alt: "Card cinza escuro com a frase sobre agente que termina o trabalho e um ícone de check verde."

### Slide 3
Texto: "Espaço de trabalho real, com os seus arquivos, no seu computador."
Visual: mockup de duas colunas. Esquerda: lista de arquivos com ícones `--whilo-file-blue` e
`--whilo-file-teal`, linhas de 40px. Direita: chat com a bolha em `--whilo-radius-bubble`. Fundo
`--whilo-bg-frame` na moldura.
Legenda: "workspace + arquivos é o que separa agente de chatbot."
Alt: "Mockup do app com lista de arquivos de um lado e a conversa do agente do outro."

### Slide 4
Texto: "Ele abre o navegador, clica e volta com o resultado."
Visual: captura de tela real de uma aba controlada, dentro de card `--whilo-bg-surface`. Barra
superior com a etiqueta "controlada por agente" em `--whilo-accent-soft` e texto
`--whilo-accent-text`.
Legenda: "captura real, sem mockup. Nada de arte que finge produto."
Alt: "Captura do navegador do app com uma aba aberta e a etiqueta de aba controlada pelo agente."

### Slide 5
Texto: "Cada passo sensível para no seu OK."
Visual: cartão de aprovação. Fundo `--whilo-approval-badge-soft`, borda 1px `--whilo-warning`,
título em `--whilo-text-primary`, dois botões: "Recusar" em contorno e "Aprovar" em
`--whilo-accent`. Ícone Lucide `ShieldCheck`.
Legenda: "aprovação é o argumento de venda, não a letra miúda."
Alt: "Cartão de aprovação com borda âmbar, botões Recusar e Aprovar e um ícone de escudo."

### Slide 6
Texto: "Rotinas na Agenda. O trabalho roda sem você abrir o app."
Visual: grade de agenda com 4 blocos de rotina em `--whilo-accent-soft`, hora em
`--whilo-text-muted`, um bloco marcado com ponto `--whilo-success`.
Legenda: "recorrência é o que cria hábito. Mostre a grade."
Alt: "Grade de agenda com blocos de rotinas agendadas e um marcador verde de concluído."

### Slide 7
Texto: "Claude, Codex, Gemini, Grok, Kimi, Cursor, Cline, OpenCode, Hermes."
Visual: lista em duas colunas, nome em `--whilo-text-secondary`, marcador de 8px em
`--whilo-provider-current` (cada linha usa o `data-provider` do seu provedor). Rodapé em
`--whilo-text-muted`: "o agente e o espaço de trabalho não trocam quando você troca de modelo".
Legenda: "multi-provedor é retenção: ele não perde o agente ao trocar de modelo."
Alt: "Lista de provedores de IA suportados em duas colunas sobre fundo escuro."

### Slide 8 (CTA)
Texto: "Comente Whilo e receba o link + checklist de autonomia agêntica."
Visual: fundo `--whilo-accent`, texto `--whilo-text-on-accent` branco, 40/700. Palavra "Whilo" em
caixa alta com sublinhado de 6px. Ícone Lucide `MessageCircle` a 24px.
Legenda: "o slide 8 tem um trabalho: gerar comentário. Nada de link na arte."
Alt: "Slide azul com o texto Comente Whilo e receba o link e o checklist."

### Legenda do carrossel
Toda ferramenta de IA responde bem. Quase nenhuma termina o trabalho.
Um agente com espaço de trabalho real abre o navegador, escreve o arquivo e para no seu OK antes do
passo sensível. É isso que o Whilo faz, com o provedor que você já paga.
Comente **Whilo** e eu te mando o link do app + o checklist de autonomia agêntica.

### Hashtags
#inteligenciaartificial #agentesdeia #automacao #produtividade #tecnologia #llm #agentesautonomos
#mcp #devtools #claudecode #codex #iaBrasil #startupbrasileira #empreendedorismodigital

### Alt text do carrossel (para o post)
"Carrossel de 8 slides sobre o que assistentes de chat não entregam: agente que termina a tarefa,
espaço de trabalho com arquivos no computador, navegador controlado, aprovação por passo, rotinas na
agenda e suporte a vários provedores de IA."

---

# CARROSSEL 2 · PROBLEMA E AGITAÇÃO

Título interno: "Seu agente não termina nada".
Papel: dor. É a peça de abertura do funil.
Preset: `amber`. Acento de apoio `--whilo-warning` (#ff9412), nunca em bloco inteiro, só em filete,
ícone e palavra destacada.

### Slide 1 (capa)
Texto: "Você pediu e o agente só explicou como fazer?"
Visual: fundo `--whilo-bg-canvas`. Título 32/700. Abaixo, um balão de chat em
`--whilo-bg-surface` com reticências em `--whilo-text-muted` e nada dentro.
Legenda: "pergunta que o leitor já respondeu sim essa semana."
Alt: "Fundo escuro, pergunta sobre agente que só explica, e um balão de chat vazio."

### Slide 2
Texto: "Resposta bonita. Tarefa zero."
Visual: split vertical. Em cima, bloco de texto cinza em `--whilo-text-dim` simulando parágrafo. Em
baixo, um card vazio com borda tracejada `--whilo-text-dim` e a palavra "arquivo" em
`--whilo-text-muted`.
Legenda: "contraste visual entre texto e entrega. Sem texto de enfeite."
Alt: "Dois blocos empilhados, um com parágrafo cinza e outro com card vazio tracejado."

### Slide 3
Texto: "O problema não é o modelo. É onde ele roda."
Visual: fundo `--whilo-bg-frame`. Duas colunas: à esquerda, uma caixa fechada com borda
`--whilo-border-strong`; à direita, uma pasta aberta com ícones de arquivo em `--whilo-file-blue`.
Legenda: "tira a culpa do modelo. Isso desarma a defesa do leitor."
Alt: "Caixa fechada à esquerda e pasta aberta com arquivos à direita."

### Slide 4
Texto: "Um chat esquece o arquivo que você mandou ontem."
Visual: linha do tempo horizontal. Ponto 1 com ícone de clipe em `--whilo-accent`, ponto 2 com
ícone de interrogação em `--whilo-text-dim`, e um vão pontilhado entre eles.
Legenda: "memória de sessão é a dor número um de quem usa IA para trabalho."
Alt: "Linha do tempo com um anexo no começo e um ponto de interrogação depois de um vão."

### Slide 5
Texto: "Um chat não abre o sistema da sua empresa."
Visual: print de uma página de sistema interno dentro de uma moldura `--whilo-bg-frame`, com uma
linha vermelha `--whilo-danger` cortando a área de login. Sobreposição em
`--whilo-glass-surface`.
Legenda: "login é onde todo agente de chat para. É aqui que o leitor se reconhece."
Alt: "Captura de uma tela de login de sistema interno com uma linha vermelha sobre ela."

### Slide 6
Texto: "Um chat não acorda amanhã às 7h para fazer isso."
Visual: relógio grande em `--whilo-text-dim`, 120px, atrás do texto. Sem card. Hora "07:00" em
`--whilo-warning`.
Legenda: "tempo é a dor mais concreta que existe."
Alt: "Fundo escuro com um relógio grande apagado e a hora 07:00 em âmbar."

### Slide 7
Texto: "No Whilo o agente tem pasta, navegador, agenda e permissão."
Visual: quatro cards em grade 2x2, raio `--whilo-radius-card`, fundo `--whilo-bg-surface`. Ícones
Lucide: `Folder`, `Globe`, `CalendarClock`, `ShieldCheck`. Cada ícone em
`--whilo-accent-text`.
Legenda: "virada. Quatro cards, quatro provas. Sem promessa nova."
Alt: "Grade de quatro cards com ícones de pasta, navegador, agenda e escudo."

### Slide 8 (CTA)
Texto: "Comente Whilo e receba o checklist de autonomia agêntica."
Visual: fundo `--whilo-accent`, texto branco 40/700, ícone `ClipboardCheck`. Rodapé em
`--whilo-text-on-accent` com 70% de opacidade: "grátis, sem call de vendas".
Legenda: "o CTA também mata objeção: ninguém quer reunião."
Alt: "Slide azul com o texto Comente Whilo e um ícone de prancheta com check."

### Legenda do carrossel
Seu agente respondeu em 3 segundos e você perdeu 40 minutos fazendo o trabalho.
O modelo não é o problema. O lugar onde ele roda é.
Agente com espaço de trabalho abre o sistema, salva o arquivo e pede seu OK antes de publicar.
Comente **Whilo** e receba o checklist com os trabalhos que dá para delegar hoje.

### Hashtags
#inteligenciaartificial #produtividade #automacao #agentesdeia #iaparaempresas #n8n #rpa
#trabalhoremoto #pme #empreendedorismo #iaBrasil #gestaodetempo #solopreneur #tecnologia

### Alt text do carrossel
"Carrossel de 8 slides sobre a dor de agentes que respondem mas não executam: comparação entre
resposta e entrega, falta de memória entre sessões, login que bloqueia, tarefa que não roda
sozinha, e a virada com pasta, navegador, agenda e permissão."

---

# CARROSSEL 3 · PROVA DE DEMONSTRAÇÃO

Título interno: "Tarefa real, tela por tela".
Papel: prova. Sem promessa nova: só o que a tela mostra.
Preset: `teal`, apoio `--whilo-file-teal` (#6bc7d9) e `--whilo-success`.
Regra dura desta peça: toda imagem é captura de uma sessão real gravada no app. Se a captura não
existir no dia da publicação, o slide vira `[DADO A CONFIRMAR]` e a peça espera.

### Slide 1 (capa)
Texto: "Uma tarefa real, do pedido ao arquivo na pasta."
Visual: fundo `--whilo-bg-canvas`. À direita, recorte de captura com a pasta aberta. Filete vertical
de 3px em `--whilo-file-teal` separando texto e imagem.
Legenda: "capa de prova se anuncia como prova. Sem adjetivo."
Alt: "Capa com o texto sobre tarefa real e um recorte da pasta de arquivos do app."

### Slide 2
Texto: "1. Você escreve o pedido no chat do agente."
Visual: captura do compositor com o texto do pedido visível, cursor no fim. Card
`--whilo-bg-surface`, raio `--whilo-radius-bubble` na bolha do usuário.
Legenda: "mostre o pedido como o usuário escreveria. Sem prompt de vitrine."
Alt: "Captura do campo de mensagem do app com um pedido escrito."

### Slide 3
Texto: "2. Ele abre o navegador e pesquisa."
Visual: captura da aba controlada com a lista de resultados. Etiqueta de aba em
`--whilo-accent-soft`. Destaque com retângulo 2px `--whilo-accent` sobre o campo de busca.
Legenda: "aqui o leitor entende que é navegador de verdade, com sessão própria."
Alt: "Captura da aba do navegador aberta pelo agente com resultados de busca."

### Slide 4
Texto: "3. Ele lê, baixa e guarda no lugar certo."
Visual: captura da lista de arquivos com um item novo em `--whilo-success` e o caminho da pasta em
`--whilo-text-muted`, fonte `--whilo-font-mono`.
Legenda: "arquivo com caminho visível é prova. Arquivo sem caminho é promessa."
Alt: "Captura da lista de arquivos do espaço de trabalho com um arquivo recém-criado."

### Slide 5
Texto: "4. Ele escreve o resultado dentro do arquivo."
Visual: captura do editor com o documento aberto, título em `--whilo-text-primary`, tabela com
cabeçalho `--whilo-data-table-header-text`.
Legenda: "o entregável aparece na tela. Não descreva, mostre."
Alt: "Captura de um documento aberto no app com o resultado escrito pelo agente."

### Slide 6
Texto: "5. Antes de publicar, ele pede o seu OK."
Visual: cartão de aprovação sobre a captura, com desfoque atrás. Fundo
`--whilo-approval-badge-soft`, borda `--whilo-warning`, botão "Aprovar" em `--whilo-accent`.
Legenda: "o passo 5 é o que faz o dono de empresa confiar. Não corte."
Alt: "Cartão de aprovação sobreposto à captura do documento, com botão Aprovar destacado."

### Slide 7
Texto: "6. Você abre. Está pronto. Ninguém refez nada."
Visual: captura final em tela cheia, moldura `--whilo-bg-frame`, selo de 32px em
`--whilo-success` no canto. Tempo total em `[DADO A CONFIRMAR]`.
Legenda: "o tempo é o único número da peça. Sem ele, use o placeholder."
Alt: "Captura do arquivo concluído com um selo verde e o tempo total da tarefa."

### Slide 8 (CTA)
Texto: "Comente Whilo e receba o roteiro desta tarefa em PDF."
Visual: fundo `--whilo-file-teal`, texto `--whilo-text-on-status` (#07130c), 40/700. Ícone
`FileDown`.
Legenda: "o PDF é o mesmo passo a passo dos slides. Coerência gera confiança."
Alt: "Slide verde-água com o texto Comente Whilo e receba o roteiro em PDF."

### Legenda do carrossel
Gravei uma tarefa inteira, sem cortar o passo da aprovação.
Pedido no chat, pesquisa no navegador, arquivo salvo na pasta, OK antes de publicar.
Tempo total: `[DADO A CONFIRMAR]`.
Comente **Whilo** e receba o roteiro em PDF para repetir isso no seu computador.

### Hashtags
#agentesdeia #automacao #inteligenciaartificial #produtividade #navegador #mcp #llm #devtools
#iaBrasil #startupbrasileira #trabalhoremoto #pme #demonstracao #agenticai

### Alt text do carrossel
"Carrossel de 8 slides com capturas reais de uma tarefa executada pelo agente: pedido no chat,
pesquisa no navegador, arquivo salvo na pasta, resultado escrito, aprovação antes de publicar e
arquivo final."

---

# CARROSSEL 4 · OBJEÇÃO (CONFIANÇA, CARTÃO, E-MAIL)

Título interno: "Agente com cartão e e-mail? Calma."
Papel: quebra de objeção. É a peça mais delicada: tem que ser honesta sobre o que não existe.
Preset: `graphite`. Apoio `--whilo-success` para o que existe e `--whilo-badge-new` (#ff1e5e) só na
etiqueta "em breve".

### Slide 1 (capa)
Texto: "Agente com cartão e e-mail? Calma."
Visual: fundo `--whilo-bg-canvas`. Ícone Lucide `CreditCard` 96px em `--whilo-text-dim`, cortado
pela borda direita. Título à esquerda.
Legenda: "a capa cita a objeção antes do leitor. Isso desarma o ceticismo."
Alt: "Fundo escuro com a frase sobre cartão e e-mail e um ícone de cartão apagado."

### Slide 2
Texto: "Hoje ele não compra sozinho. E não tem caixa de entrada."
Visual: dois cards lado a lado. Cada um com etiqueta `--whilo-badge-new` no topo escrito "em breve"
e o resto do card em `--whilo-text-dim`, sem ícone colorido.
Legenda: "assumir o que falta é o que dá direito de falar do resto."
Alt: "Dois cards apagados com etiquetas vermelhas escritas em breve."

### Slide 3
Texto: "O que já existe: você aprova cada passo sensível."
Visual: cartão de aprovação em `--whilo-approval-badge-soft`, borda `--whilo-warning`, título
"Aguardando sua aprovação" em `--whilo-text-primary`. Ícone `ShieldCheck` em
`--whilo-warning-text`.
Legenda: "mesma frase que o app usa. Não invente vocabulário."
Alt: "Cartão âmbar de aprovação com o texto Aguardando sua aprovação."

### Slide 4
Texto: "Comando, arquivo e permissão caem em Precisa de você."
Visual: captura do agrupamento "Precisa de você" na barra lateral, três linhas, cada uma com o
ícone do tipo de pedido em `--whilo-warning`.
Legenda: "mostre o nome real da seção. Isso constrói confiança de produto."
Alt: "Captura da barra lateral com a seção Precisa de você e três pedidos pendentes."

### Slide 5
Texto: "No celular, você aprova ou recusa com um toque."
Visual: mockup de celular 1:1 com a notificação e os botões "Recusar" e "Aprovar", o segundo em
`--whilo-accent`. Fundo `--whilo-bg-grouped`.
Legenda: "mobilidade de aprovação é o que resolve a viagem e a reunião."
Alt: "Mockup de celular com uma notificação de aprovação do agente e dois botões."

### Slide 6
Texto: "Senha e cartão: o agente preenche sem ler o número."
Visual: campo de cartão com máscara de bolinhas, cadeado `--whilo-success` sobreposto. Rodapé em
`--whilo-text-muted`: "o valor vai do cofre para a página, não para o modelo".
Legenda: "mascarar o dado é o argumento que um técnico repete para o chefe."
Alt: "Ícone de cadeado verde sobre um campo de cartão com os dígitos mascarados."

### Slide 7
Texto: "Minha Carteira: cartão de uso único aprovado no celular. Em breve."
Visual: card com borda tracejada `--whilo-accent-strong`, interior `--whilo-accent-soft`, etiqueta
"em breve" em `--whilo-badge-new`. Ícone `Wallet` 40px.
Legenda: "visão tem lugar, mas com etiqueta. Nunca no corpo como se fosse produto."
Alt: "Card tracejado azul com etiqueta em breve e um ícone de carteira."

### Slide 8 (CTA)
Texto: "Whilo Inbox, a caixa de entrada do agente. Em breve. Comente Whilo."
Visual: fundo `--whilo-accent`, texto branco. Etiqueta "em breve" em `--whilo-badge-new` no topo do
slide. Ícone `Inbox`.
Legenda: "CTA duplo: o comentário captura o lead e a lista de espera do Inbox."
Alt: "Slide azul com o texto sobre a caixa de entrada do agente em breve e Comente Whilo."

### Legenda do carrossel
Antes de confiar num agente com dinheiro, você quer saber onde ele para.
Hoje o Whilo não compra sozinho e não tem caixa de entrada própria. Isso está em construção.
O que já roda: aprovação por passo, no desktop e com um toque no celular, e preenchimento de cartão
sem o modelo ver o número.
Comente **Whilo** e entre na lista de espera do Whilo Inbox.

### Hashtags
#segurancadainformacao #inteligenciaartificial #agentesdeia #privacidade #automacao #fintech
#iaparaempresas #compliance #iaBrasil #startupbrasileira #lgpd #produtividade #llm #confianca

### Alt text do carrossel
"Carrossel de 8 slides sobre confiança em agentes: o que ainda não existe, aprovação por passo,
seção Precisa de você, aprovação pelo celular, preenchimento de cartão sem expor o número e as duas
funções em desenvolvimento, Minha Carteira e Whilo Inbox."

---

# CARROSSEL 5 · COMPARAÇÃO

Título interno: "Chat ou agente com espaço de trabalho".
Papel: comparação. Compara categorias, nunca concorrente nomeado.
Preset: `violet`. Apoio `--whilo-file-pink` (#d98ac9) para a coluna do Whilo.

### Slide 1 (capa)
Texto: "Chat ou agente? A diferença aparece no dia 2."
Visual: fundo `--whilo-bg-canvas`, título 32/700. Duas colunas de 8px de largura, uma em
`--whilo-text-dim`, outra em `--whilo-file-pink`, separando texto e rodapé.
Legenda: "dia 2 é específico e crível. Nada de vou transformar sua vida."
Alt: "Capa escura com a frase sobre a diferença aparecer no dia 2 e duas colunas finas."

### Slide 2
Texto: "Chat: você cola o contexto de novo, toda vez."
Visual: coluna esquerda com três blocos de texto idênticos empilhados, todos em
`--whilo-text-dim`, e um ícone de repetição em `--whilo-text-muted`.
Legenda: "o leitor já fez isso hoje. Reconhecimento imediato."
Alt: "Três blocos de texto repetidos em cinza apagado com um ícone de repetição."

### Slide 3
Texto: "Agente: a pasta, a memória e as regras continuam lá."
Visual: mesma coluna, agora com três ícones: `Folder` em `--whilo-file-blue`, `Brain` em
`--whilo-file-pink`, `ScrollText` em `--whilo-file-teal`. Linha de base contínua.
Legenda: "espelhamento visual com o slide anterior. Mesma grade, conteúdo oposto."
Alt: "Três ícones alinhados de pasta, memória e regras em cores diferentes."

### Slide 4
Texto: "Chat: uma janela. Agente: navegador, terminal e arquivos."
Visual: à esquerda, um retângulo único em `--whilo-bg-surface`. À direita, quatro retângulos menores
em `--whilo-accent-soft` organizados em grade.
Legenda: "superfície é argumento. Mostre a quantidade, não o adjetivo."
Alt: "Um retângulo único à esquerda e quatro retângulos menores à direita."

### Slide 5
Texto: "Chat: você lembra. Agente: a rotina lembra por você."
Visual: linha de horários 06:00 a 22:00; só o horário 07:00 marcado com bloco em
`--whilo-file-pink` e o resto vazio em `--whilo-text-dim`.
Legenda: "recorrência é o que separa ferramenta de colega."
Alt: "Linha do tempo de um dia com apenas o horário das 7 marcado por um bloco colorido."

### Slide 6
Texto: "Chat: confiança total ou nada. Agente: aprovado passo a passo."
Visual: dois botões grandes. Esquerda: "Permitir" em bloco cheio `--whilo-danger`. Direita:
"Aprovar" em `--whilo-accent`, com um segundo botão "Recusar" ao lado.
Legenda: "esse slide é o argumento que fecha com dono de empresa."
Alt: "Dois botões, um vermelho escrito Permitir e outro azul escrito Aprovar."

### Slide 7
Texto: "E o modelo? Você troca. O agente e o espaço de trabalho ficam."
Visual: seletor de provedor no topo com 4 nomes em `--whilo-text-secondary`; abaixo, o mesmo card de
agente, idêntico, em `--whilo-bg-surface`. Seta de troca em `--whilo-icon-stroke` 1.5.
Legenda: "multi-provedor como seguro contra mudança de preço e de modelo."
Alt: "Seletor com quatro provedores e um cartão de agente que permanece igual."

### Slide 8 (CTA)
Texto: "Comente Whilo e receba a tabela de comparação completa."
Visual: fundo `--whilo-accent`. Tabela de 3 linhas em branco 40% de opacidade atrás do texto, como
textura. Ícone `Table`.
Legenda: "a tabela é o ativo que entra no direct. Ela precisa existir antes do post."
Alt: "Slide azul com o texto Comente Whilo e uma tabela desenhada ao fundo."

### Legenda do carrossel
Todo mundo já usou um chat que responde bem e não entrega nada no dia seguinte.
A diferença não é o modelo. É o que fica: pasta, memória, rotina e permissão.
No dia 2 o chat começa do zero. O agente continua de onde parou.
Comente **Whilo** e receba a tabela chat x agente em PDF.

### Hashtags
#inteligenciaartificial #agentesdeia #produtividade #automacao #llm #agenticai #comparativo
#ferramentasdeia #iaBrasil #startupbrasileira #pme #trabalhoremoto #tecnologia #devtools

### Alt text do carrossel
"Carrossel comparativo de 8 slides entre assistente de chat e agente com espaço de trabalho:
contexto repetido, memória, arquivos, navegador, rotinas, permissão e troca de provedor."

---

# CARROSSEL 6 · CASO DE USO

Título interno: "5 trabalhos que ele termina esta semana".
Papel: caso de uso. Traduz recurso em trabalho concreto.
Preset: `lagoon`. Apoio `--whilo-unread-surface` (#74b9ff) nos números dos passos.

### Slide 1 (capa)
Texto: "5 trabalhos que o seu agente termina esta semana."
Visual: fundo `--whilo-bg-canvas`, título 32/700, número "5" em `--whilo-text-hero` recortado pela
borda direita em `--whilo-text-dim`.
Legenda: "número ímpar soa específico. Cinco é a lista que cabe no salve."
Alt: "Capa escura com o número 5 grande e apagado atrás do texto sobre cinco trabalhos."

### Slide 2
Texto: "1. Relatório de concorrentes com fonte em cada linha."
Visual: card com tabela de 3 colunas, cabeçalho em `--whilo-data-table-header-text`, linhas
alternadas `--whilo-data-table-border`. Ícone `Globe` em `--whilo-unread-surface`.
Legenda: "fonte por linha é o que separa relatório de achismo."
Alt: "Card com uma tabela de três colunas e um ícone de globo."

### Slide 3
Texto: "2. Planilha de despesas montada a partir das notas."
Visual: pilha de ícones de arquivo `--whilo-file-yellow` à esquerda, seta em
`--whilo-text-muted`, planilha à direita com a coluna de total em `--whilo-success`.
Legenda: "antes e depois na mesma imagem. Nada de screenshot solto."
Alt: "Pilha de notas fiscais com uma seta apontando para uma planilha pronta."

### Slide 4
Texto: "3. Inscrição em evento: formulário, upload e confirmação."
Visual: captura de formulário preenchido com campos em `--whilo-bg-control`, um campo de upload com
borda `--whilo-accent` e o selo de confirmação em `--whilo-success`.
Legenda: "tarefa chata e verificável. É a que o leitor quer delegar primeiro."
Alt: "Captura de formulário preenchido com área de upload destacada e confirmação verde."

### Slide 5
Texto: "4. Triagem de currículos com o seu critério, não o do modelo."
Visual: três cards de candidato com etiqueta verde, amarela e vermelha usando
`--whilo-success`, `--whilo-warning` e `--whilo-danger`. Critério escrito no topo em
`--whilo-text-muted`.
Legenda: "critério é configurável e fica no arquivo de instruções do agente."
Alt: "Três cartões de candidato com etiquetas verde, âmbar e vermelha."

### Slide 6
Texto: "5. Resumo diário das suas fontes às 7h, na Agenda."
Visual: bloco de rotina em `--whilo-accent-soft` na grade da Agenda, hora 07:00 em
`--whilo-unread-surface`, e o card de resumo ao lado em `--whilo-bg-surface`.
Legenda: "recorrência transforma uma tarefa em retenção diária."
Alt: "Grade de agenda com um bloco às 7 horas e um cartão de resumo ao lado."

### Slide 7
Texto: "Cada um com aprovação antes de enviar ou publicar."
Visual: faixa horizontal no rodapé em `--whilo-approval-badge-soft`, texto em
`--whilo-text-primary`, ícone `ShieldCheck` 20px.
Legenda: "fecha a peça tirando o medo de delegação."
Alt: "Faixa âmbar no rodapé com ícone de escudo e texto sobre aprovação."

### Slide 8 (CTA)
Texto: "Comente Whilo e receba os 5 roteiros prontos para copiar."
Visual: fundo `--whilo-accent`, texto branco, cinco filetes horizontais em branco 20% como textura
de lista.
Legenda: "roteiro é mais acionável que dica. Prometa o que dá para copiar."
Alt: "Slide azul com o texto Comente Whilo e cinco linhas claras ao fundo."

### Legenda do carrossel
Delegar não é pedir opinião. É passar uma tarefa com começo, meio e arquivo no fim.
Estes cinco cabem na primeira semana, e todos param no seu OK antes de enviar algo.
Qual deles você tenta primeiro?
Comente **Whilo** e receba os cinco roteiros prontos para copiar.

### Hashtags
#produtividade #automacao #agentesdeia #inteligenciaartificial #freelancer #pme
#empreendedorismodigital #rotinadiaria #iaBrasil #startupbrasileira #gestaodetempo #backoffice
#trabalhoremoto #delegacao

### Alt text do carrossel
"Carrossel de 8 slides com cinco tarefas delegáveis: relatório de concorrentes com fontes, planilha
de despesas, inscrição em evento, triagem de currículos e resumo diário agendado."

---

# CARROSSEL 7 · PROVA SOCIAL (PLACEHOLDER)

Título interno: "O que muda na primeira semana".
Papel: prova social. Não publica sem depoimento real, autorizado e com nome.
Preset: `rose`. Apoio `--whilo-file-pink` (#d98ac9).
Estado do arquivo: **bloqueado até preencher**. Todo conteúdo de terceiro é `[DADO A CONFIRMAR]`.

### Slide 1 (capa)
Texto: "O que muda na primeira semana. Com quem já usa."
Visual: fundo `--whilo-bg-canvas`. Grade de três avatares circulares em `--whilo-bg-surface` com
iniciais em `--whilo-text-muted` (placeholder), borda 2px `--whilo-file-pink`.
Legenda: "quem já usa precisa aparecer. Sem rosto, a peça não existe."
Alt: "Capa escura com três avatares circulares vazios e o texto sobre a primeira semana."

### Slide 2
Texto: "`[DADO A CONFIRMAR]`"
Visual: card de depoimento. Print real da conversa dentro de moldura `--whilo-bg-frame`, altura de
600px. Nome e cargo abaixo em `--whilo-text-secondary`, 14px.
Legenda: "depoimento em print tem mais peso que em citação. Só com autorização escrita."
Alt: "Print de uma conversa real dentro de uma moldura, com nome e cargo abaixo."

### Slide 3
Texto: "Antes: `[DADO A CONFIRMAR]`. Depois: `[DADO A CONFIRMAR]`."
Visual: duas colunas com etiqueta "antes" em `--whilo-text-dim` e "depois" em `--whilo-file-pink`.
Mesmo enquadramento nas duas fotos ou capturas.
Legenda: "antes e depois só vale com a mesma tarefa nas duas colunas."
Alt: "Duas colunas comparando antes e depois com etiquetas de texto."

### Slide 4
Texto: "`[DADO A CONFIRMAR]`"
Visual: segundo depoimento. Card `--whilo-bg-surface`, avatar de 48px, nome, cargo e uma frase
única em 24/600.
Legenda: "frase curta e específica. Depoimento genérico não converte."
Alt: "Card de depoimento com avatar, nome, cargo e uma frase."

### Slide 5
Texto: "`[DADO A CONFIRMAR]`"
Visual: terceiro depoimento, mesmo componente, espelhado. Fundo `--whilo-bg-surface-raised` para
alternar o ritmo.
Legenda: "três depoimentos é o mínimo para o olho acreditar."
Alt: "Card de depoimento espelhado em tom de cinza mais claro."

### Slide 6
Texto: "`[DADO A CONFIRMAR]`"
Visual: bloco de números em três colunas. Valor em `--whilo-text-3xl`, rótulo em
`--whilo-text-muted`. Sem emoji, sem cifrão.
Legenda: "só número auditável. Se não tem origem, não entra."
Alt: "Três números grandes com rótulos abaixo."

### Slide 7
Texto: "O mesmo agente, o mesmo espaço de trabalho, outra pessoa."
Visual: quatro recortes de tela de agentes diferentes, cada um com nome em
`--whilo-text-secondary` e uma cor de avatar diferente do conjunto do app.
Legenda: "mostra variedade de uso sem afirmar resultado que você não mediu."
Alt: "Quatro recortes de tela de agentes com nomes e cores de avatar diferentes."

### Slide 8 (CTA)
Texto: "Comente Whilo e receba o link + checklist de autonomia agêntica."
Visual: fundo `--whilo-file-pink`, texto `--whilo-text-on-status` (#07130c), 40/700.
Legenda: "mesma arte de CTA das outras peças. Consistência acelera o reconhecimento."
Alt: "Slide rosa com o texto Comente Whilo e receba o link e o checklist."

### Legenda do carrossel
Perguntei para quem usa o Whilo todos os dias o que mudou na primeira semana.
As respostas estão nos slides, com nome e cargo, sem edição de conteúdo. `[DADO A CONFIRMAR]`.
Eu não vou colocar número aqui que eu não consiga provar.
Comente **Whilo** e receba o link do app + o checklist de autonomia agêntica.

### Hashtags
#depoimento #clientes #inteligenciaartificial #agentesdeia #produtividade #automacao
#empreendedorismodigital #iaBrasil #startupbrasileira #pme #trabalhoremoto #estudodecaso
#provasocial #tecnologia

### Alt text do carrossel
"Carrossel de 8 slides com depoimentos de usuários, comparação de antes e depois, números de uso e
recortes de tela de agentes em uso."

---

# CARROSSEL 8 · OFERTA DIRETA

Título interno: "Whilo. Onde o agente trabalha."
Papel: oferta. Fala de preço, acesso e próximo passo. Nada de história nova.
Preset: `ember`. Apoio `--whilo-badge-new` só na etiqueta de urgência, se houver urgência real.

### Slide 1 (capa)
Texto: "Whilo. O workspace onde o agente trabalha de verdade."
Visual: fundo `--whilo-bg-canvas`. Mockup da janela do app em perspectiva leve, moldura
`--whilo-bg-frame`, sombra `--whilo-shadow-overlay`. Marca em `--whilo-logo-production` no topo.
Legenda: "capa de oferta mostra o produto. Sem produto, sem clique."
Alt: "Capa escura com uma janela do app em perspectiva e a marca Whilo."

### Slide 2
Texto: "Baixe, crie um agente e mande a primeira tarefa."
Visual: três passos numerados em `--whilo-accent`, cada um com ícone Lucide (`Download`, `UserPlus`,
`Send`). Linha vertical em `--whilo-accent-strong` ligando os três.
Legenda: "onboarding em três passos, sem prometer tempo que você não mediu."
Alt: "Três passos numerados com ícones de download, criar usuário e enviar."

### Slide 3
Texto: "Funciona com o provedor que você já paga."
Visual: lista compacta de nomes em `--whilo-text-secondary`, marcador em
`--whilo-provider-current` por linha. Rodapé em `--whilo-text-muted`: "sem assinatura dupla de IA".
Legenda: "essa é a objeção de preço número um. Resolva no slide."
Alt: "Lista de provedores de IA com marcadores coloridos por provedor."

### Slide 4
Texto: "Local-first: conversas, arquivos e dados ficam no seu computador."
Visual: ícone `HardDrive` 64px em `--whilo-success`, com um card de arquivos ao lado em
`--whilo-bg-surface`.
Legenda: "local-first é o argumento que ganha a conversa com TI."
Alt: "Ícone de disco rígido verde ao lado de um cartão com lista de arquivos."

### Slide 5
Texto: "Plano: `[DADO A CONFIRMAR]`."
Visual: card de preço. Valor em `--whilo-text-display` com o tratamento de
`--whilo-price-metal-*` e a faixa `--whilo-price-sheen-*` (mesma linguagem da página de preço do
app). Sem selo de desconto inventado.
Legenda: "preço só entra com valor fechado. Até lá, o slide fica fora do ar."
Alt: "Cartão de preço com o valor em destaque metálico e sem desconto."

### Slide 6
Texto: "Garantia: `[DADO A CONFIRMAR]`."
Visual: card único, borda `--whilo-border-strong`, ícone `BadgeCheck` em `--whilo-success`.
Legenda: "garantia reduz risco. Não invente prazo: use o do contrato."
Alt: "Cartão escuro com um ícone de selo verde e o texto sobre garantia."

### Slide 7
Texto: "Bônus de hoje: checklist de autonomia agêntica."
Visual: card em `--whilo-accent-soft` com borda `--whilo-accent-strong`, ícone `ClipboardCheck`,
três linhas de item com check em `--whilo-success`.
Legenda: "o bônus é o mesmo do lead magnet. Sem produto secreto."
Alt: "Cartão azul claro com ícone de prancheta e três itens marcados."

### Slide 8 (CTA)
Texto: "Comente Whilo e receba o link + checklist."
Visual: fundo `--whilo-accent`, texto branco, 40/700. Seta `ArrowRight` de 32px à direita. Nenhum
"link na bio" escrito na arte.
Legenda: "a palavra Whilo é o pixel de conversão. Três letras viram lead."
Alt: "Slide azul com o texto Comente Whilo e receba o link e o checklist."

### Legenda do carrossel
Se o seu agente não termina a tarefa, o problema não é o modelo. É onde ele roda.
O Whilo é um workspace de agentes no seu computador: pasta real, navegador, rotinas e aprovação
passo a passo, com o provedor que você já usa.
Preço e garantia: `[DADO A CONFIRMAR]`.
Comente **Whilo** e eu te mando o link do app + o checklist de autonomia agêntica.

### Hashtags
#inteligenciaartificial #agentesdeia #produtividade #automacao #ferramentasdeia #llm #mcp
#devtools #iaBrasil #startupbrasileira #empreendedorismodigital #pme #trabalhoremoto #oferta

### Alt text do carrossel
"Carrossel de 8 slides com a oferta do Whilo: três passos para começar, provedores suportados,
dados locais, preço, garantia e o bônus do checklist."

---

# REEL 1 · CONVERSÃO (30 s)

Título interno: "Cartão, aprovação e o que falta".
Papel: conversão. Formato UGC, avatar de IA ou pessoa real, câmera na mão, ambiente doméstico.
Preset: `ember`. Legenda queimada em 70% da tela, fundo de texto sempre em
`--whilo-approval-badge-soft` com borda `--whilo-warning` quando o assunto for aprovação.
Duração alvo: 30 s.

### Gancho (0 a 2 s, literal)
"Você deixaria um agente gastar seu dinheiro?"

### Roteiro falado com marcação de tempo
- 0,0 a 2,0 s: "Você deixaria um agente gastar seu dinheiro?"
- 2,0 a 6,0 s: "Eu não deixaria. Nem por um segundo, sem limite."
- 6,0 a 11,0 s: "Então vamos ser honestos. Hoje o Whilo não compra sozinho. Não tem carteira no ar."
- 11,0 a 16,0 s: "O que ele tem é aprovação. Comando, arquivo, permissão: tudo cai em Precisa de você."
- 16,0 a 21,0 s: "E no celular você aprova ou recusa com um toque. Eu aprovo de qualquer lugar."
- 21,0 a 25,0 s: "Minha Carteira vem aí: cartão de uso único, aprovado no seu celular. Em breve."
- 25,0 a 30,0 s: "Comente Whilo que eu te mando o acesso e o checklist. Antes de todo mundo."

### Texto na tela por beat
- 0 a 2 s: "você deixaria?" (60px, branco, centralizado)
- 2 a 6 s: "sem limite? não." (48px, branco)
- 6 a 11 s: "hoje ele NÃO compra sozinho" com "NÃO" em `--whilo-danger`
- 11 a 16 s: "aprovação em cada passo" com filete `--whilo-warning` sob a linha
- 16 a 21 s: mockup de celular com "Aprovar" em `--whilo-accent`
- 21 a 25 s: "em breve · Minha Carteira" com etiqueta `--whilo-badge-new`
- 25 a 30 s: "comente WHILO" (80px, fundo `--whilo-accent`, texto branco)

### Lista de b-roll e demo
1. Close no rosto, luz lateral, celular na mão. Sem trilha cantada, só pulso grave.
2. Corte para captura de tela do app na seção "Precisa de você" com três pedidos pendentes.
3. Zoom no botão "Aprovar" sendo tocado. Gravar o toque de verdade, sem animação.
4. Captura da notificação de aprovação chegando no celular, com o nome do agente visível.
5. Tela final: marca Whilo em `--whilo-logo-production` sobre `--whilo-bg-canvas`.
6. Nenhuma cena de checkout, carrinho ou cartão real. Não existe gravação de compra aprovada
   porque a função não está no ar.

### CTA
Falado: "Comente Whilo que eu te mando o acesso e o checklist."
Na tela: "comente WHILO" em 80px nos últimos 5 s.
Legenda fixada no primeiro comentário: "Mandei no direct. Se não chegou, comenta de novo."

### Legenda do reel
"Você deixaria um agente gastar seu dinheiro?"
Eu também não.
Por isso o Whilo para em cada passo sensível e pede o seu OK, no desktop e no celular.
Minha Carteira, com cartão de uso único, está em construção. Quando sair, a aprovação continua sendo
 sua.
Comente **Whilo** e receba o acesso + o checklist de autonomia agêntica.

### Hashtags
#inteligenciaartificial #agentesdeia #fintech #seguranca #automacao #produtividade #cartao
#iaparaempresas #reels #iaBrasil #startupbrasileira #empreendedorismodigital #pme #lgpd

### Alt text do reel
"Vídeo de 30 segundos, pessoa falando para a câmera sobre não deixar um agente gastar dinheiro sem
limite, com capturas do app mostrando a seção Precisa de você e a aprovação pelo celular."

---

# REEL 2 · DEMONSTRAÇÃO (32 s)

Título interno: "Não vou tocar no mouse".
Papel: demonstração. Uma tarefa real, sem corte no passo da aprovação.
Preset: `teal`. Captura de tela em tela cheia com moldura `--whilo-bg-frame`.
Duração alvo: 32 s. Regra: se a tarefa falhar na gravação, o reel não é publicado com outro texto.
Grava-se de novo.

### Gancho (0 a 2 s, literal)
"Vou pedir uma tarefa e não vou tocar no mouse."

### Roteiro falado com marcação de tempo
- 0,0 a 2,0 s: "Vou pedir uma tarefa e não vou tocar no mouse."
- 2,0 a 5,0 s: "Tarefa: achar o preço dos três concorrentes e salvar numa planilha."
- 5,0 a 10,0 s: "Ele abre o navegador. Aba própria, sessão própria. Não é a minha aba."
- 10,0 a 15,0 s: "Agora ele lê as páginas e baixa o que precisa."
- 15,0 a 20,0 s: "Ele está escrevendo na planilha. Dentro da pasta do agente."
- 20,0 a 25,0 s: "Aqui ele para. Publicar arquivo pede a minha aprovação. Eu aprovo."
- 25,0 a 29,0 s: "Abri a planilha. Três linhas, três preços, as fontes do lado."
- 29,0 a 32,0 s: "Comente Whilo e eu te mando o passo a passo."

### Texto na tela por beat
- 0 a 2 s: "sem tocar no mouse" (64px, branco)
- 2 a 5 s: a tarefa escrita em card `--whilo-bg-surface`, fonte mono
- 5 a 10 s: "aba do agente" com etiqueta `--whilo-accent-soft`
- 10 a 15 s: "lendo e baixando" com ícone `Download` em `--whilo-file-teal`
- 15 a 20 s: caminho do arquivo em `--whilo-font-mono`, `--whilo-text-muted`
- 20 a 25 s: "aguardando sua aprovação" com borda `--whilo-warning`
- 25 a 29 s: "pronto" com selo `--whilo-success`
- 29 a 32 s: "comente WHILO" em fundo `--whilo-accent`

### Lista de b-roll e demo
1. Gravação de tela contínua, cursor parado fora da janela o vídeo inteiro. É a prova do gancho.
2. Plano do teclado com as mãos longe, 1 s, no início.
3. Captura da aba aberta pelo agente com dois indicadores: barra de endereço e etiqueta de controle.
4. Captura da lista de arquivos recebendo o arquivo novo, sem corte.
5. Captura do cartão de aprovação e do clique em "Aprovar". Sem acelerar.
6. Captura da planilha aberta com três linhas preenchidas e a coluna de fonte.
7. Fechamento com a marca em `--whilo-logo-production` sobre `--whilo-bg-canvas` por 1 s.
8. Se o tempo total real passar de 29 s, corte o beat 10 a 15 s antes de acelerar outro trecho.

### CTA
Falado: "Comente Whilo e eu te mando o passo a passo."
Na tela: "comente WHILO" nos últimos 3 s, com o mesmo enquadramento do reel 1.
Legenda fixada no primeiro comentário: "passo a passo no direct."

### Legenda do reel
Pedi, saí de perto e voltei com a planilha pronta.
O agente abriu o navegador na aba dele, leu as páginas, escreveu o arquivo na pasta e parou para eu
aprovar a publicação.
Tempo real da tarefa: `[DADO A CONFIRMAR]`. Sem corte no passo da aprovação.
Comente **Whilo** e receba o passo a passo + o checklist de autonomia agêntica.

### Hashtags
#agentesdeia #automacao #inteligenciaartificial #produtividade #navegador #mcp #llm #reels
#iaBrasil #startupbrasileira #trabalhoremoto #pme #devtools #agenticai

### Alt text do reel
"Vídeo de 32 segundos mostrando uma tarefa feita pelo agente sem uso do mouse: pesquisa no
navegador, download, planilha escrita na pasta do agente, aprovação do usuário e arquivo final
aberto."

---

# BANCO DE HASHTAGS (reaproveitável)

Regra: 14 a 16 tags por peça. Sempre 4 amplas, 6 de nicho, 4 de Brasil, 2 da peça.

Amplas: #inteligenciaartificial #ia #automacao #produtividade #tecnologia #ferramentasdeia
Nicho: #agentesdeia #agentesautonomos #agenticai #llm #mcp #devtools #claudecode #codex #n8n
Brasil: #iaBrasil #startupbrasileira #empreendedorismodigital #pme #trabalhoremoto #lgpd
Peça: #comparativo #depoimento #demonstracao #provasocial #seguranca #fintech #reels

Nunca usar: #viral #fyp #explorar #instagood. Não trazem comprador e sujam o perfil.

# CHECKLIST DE PUBLICAÇÃO POR PEÇA

- [ ] Papel no funil declarado e diferente das outras peças da semana.
- [ ] Nenhum número sem fonte na arte e na legenda.
- [ ] Whilo Inbox e Minha Carteira com etiqueta "em breve".
- [ ] Nenhuma frase sobre o que um concorrente faz ou deixa de fazer.
- [ ] CTA único: comente Whilo. Sem link na arte.
- [ ] Alt text escrito no campo de acessibilidade do Instagram, não na legenda.
- [ ] Primeiro comentário com a instrução do direct pronto antes de publicar.
- [ ] Resposta automática do direct testada com a palavra "Whilo".

# AUDITORIA DE AFIRMAÇÃO (o que é produto e o que é visão)

| Afirmação usada nas peças | Estado | Onde confirmei |
| --- | --- | --- |
| Agente com espaço de trabalho e arquivos no computador | No ar | `docs/architecture/agents.md`, `src/renderer/src/features/files` |
| Navegador controlado pelo agente, com aba e sessão próprias | No ar | `docs/architecture/browser.md` (Browser sessions, Tab lifetime) |
| Aprovação por passo, seção "Precisa de você" | No ar | `packages/i18n/src/messages/pt/sidebar.ts`, `chat.ts` |
| Aprovar ou recusar pelo celular | No ar | `packages/i18n/src/messages/pt/mobile/liveActivity.ts` |
| Preenchimento de cartão sem o modelo ver o número | No ar | `docs/architecture/skills-and-plugins.md` (Vault, `fill_card`) |
| Rotinas agendadas e página Agenda | No ar | `docs/architecture/agents.md`, `packages/i18n/src/messages/pt/app.ts` |
| Fluxos de trabalho com passos, condição e aprovação | No ar | `docs/architecture/agents.md` (Workflows) |
| Tópicos paralelos (Tarefas) | No ar | `docs/architecture/agents.md` (Agent threads) |
| Multi-provedor | No ar | `packages/contracts/src/agent-providers.ts` |
| Loja com apps, habilidades e agentes | No ar | `src/renderer/src/features/settings/marketplace-plugin-catalog.ts` |
| Dados locais como fonte da verdade | No ar | `AGENTS.md` (Product constraints) |
| Minha Carteira, cartão de uso único aprovado no celular | Visão / em breve | `docs/business/whilo-strategy.md` |
| Whilo Inbox, caixa de entrada do agente | Visão / em breve | `docs/business/whilo-inbox.md` |

# PENDÊNCIAS `[DADO A CONFIRMAR]` (preencher antes de publicar)

| Peça | Onde | O que falta |
| --- | --- | --- |
| C3 slide 7 | arte | tempo total da tarefa demonstrada |
| C3 legenda | legenda | tempo total da tarefa demonstrada |
| C7 slide 2 | arte e legenda | depoimento 1 com print, nome, cargo e autorização |
| C7 slide 3 | arte | par antes/depois com a mesma tarefa |
| C7 slide 4 | arte e legenda | depoimento 2 |
| C7 slide 5 | arte e legenda | depoimento 3 |
| C7 slide 6 | arte | bloco de números com origem auditável |
| C7 legenda | legenda | resumo do que os usuários responderam |
| C8 slide 5 | arte | preço do plano |
| C8 slide 6 | arte | prazo de garantia |
| C8 legenda | legenda | preço e garantia |
| Reel 2 legenda | legenda | tempo real da tarefa gravada |

# OBSERVAÇÕES DE RISCO PARA O DONO DO PRODUTO

1. A integração de pagamento por cartão de uso único existe no código como `request_link_payment`,
   ligada à conta Link (link.com, Stripe). Ela é limitada a EUA e Canadá segundo
   `docs/business/whilo-strategy.md`. Por isso toda menção a compra no kit é "em breve" e nenhuma
   peça mostra uma compra aprovada.
2. "Gemini" aparece no kit como provedor suportado. No repositório o identificador é `antigravity`,
   descrito em `packages/brand/src/tokens.css` como a cor de marca do Gemini. Se o nome comercial na
   loja for outro, ajustar o slide 7 do carrossel 1.
3. A contagem do catálogo da Loja não entra em nenhuma arte. Se quiser usar número, confirmar em
   `src/renderer/src/features/settings/marketplace-plugin-catalog.ts` no dia da publicação.
4. A peça 7 é a única que depende de terceiro. Sem depoimento assinado, ela fica fora do calendário
   e o rodízio usa a peça 6 no lugar.
