# Distribuição — o que está pronto, o que falta credencial, o que não existe

> **Data:** 03/11/2026, ciclo de distribuição. **Método:** leitura de `electron-builder.yml`,
> `electron-builder.windows-signing.yml`, `apps/mobile/eas.json`, `apps/mobile/app.json`,
> `.github/workflows/release*.yml`, `windows-installer-e2e.yml`.
>
> **Nada aqui foi executado.** Não rodei `electron-builder` nem `eas build`: a máquina tem
> ~800 MB de RAM livre e nenhuma dessas credenciais está no ambiente. Tudo abaixo é leitura de
> configuração. Onde a configuração não prova, está marcado.

---

## 1. Resumo

| Plataforma | Artefato | Status | Prova |
|---|---|---|---|
| macOS | `.dmg` + `.zip` | **READY** | `electron-builder.yml:154-156` |
| macOS | arm64 **e** x64 | **READY** (matrix separada) | `release.yml:258-265` |
| macOS | notarização + hardened runtime | **READY** (precisa Apple ID) | `electron-builder.yml` (`notarize: true`, `hardenedRuntime: true`) |
| Windows | `.exe` (NSIS assistido) x64 | **READY** | `electron-builder.yml:166-170`, `nsis:` |
| Windows | assinatura de código | **NEEDS CREDENTIAL** | `electron-builder.windows-signing.yml` |
| Windows | **arm64** | **MISSING** | só `x64` no target |
| Linux | `.AppImage` x64 + arm64 | **READY** | `electron-builder.yml:204-208` |
| Linux | **`.deb`** | **MISSING** | só AppImage no target |
| Linux | **`.rpm`** | **MISSING** | idem |
| iOS | build EAS | **READY** (perfil) | `eas.json` `production` |
| iOS | **submit para App Store** | **MISSING** | `submit.production` = `{}` |
| Android | build EAS | **READY** (perfil) | `eas.json` `production`, `autoIncrement: true` |
| Android | **submit para Play Store** | **MISSING** | `submit.production` = `{}` |

**O achado que mais importa:** `apps/mobile/eas.json` tem `submit.production` como **objeto
vazio**. Não há `appleId`, `ascAppId`, `appleTeamId` nem caminho de service account do Google.
Isso não é "quase pronto": sem esses quatro valores, `eas submit` não roda.

---

## 2. macOS

`VERIFICADO` — `target: [dmg, zip]`, sem `arch` fixo no alvo, porque o comentário do próprio
arquivo explica: *"a target's own arch list replaces the one given on the command line, so
`--x64` would still build ARM64"*. Por isso o arquivo manda buildar **uma arquitetura por vez**.

O workflow resolve isso com matrix (`release.yml:258-265`): `arm64` e `x64` em runners
separados, cada um chamando `bun x electron-builder --mac --${{ matrix.arch }}`.
`VERIFICADO`.

Artefatos produzidos (`release.yml:505-507`):
- `Whilo-$VERSION-$ARCH.dmg`
- `Whilo-$VERSION-$ARCH.zip`
- `Whilo-Host-$VERSION-arm64.pkg` — **só arm64**
- `SHA256SUMS-$suffix.txt`

**O que o dono precisa fornecer:** certificado Developer ID Application, senha de app ou API key
da App Store Connect, e o Team ID. Sem isso `notarize: true` falha e o macOS bloqueia o app.

**Fora da App Store:** este app **não vai** para a Mac App Store por este caminho. Um `.dmg`
notarizado é distribuição direta. Publicar na Mac App Store exige sandbox, entitlements
próprios e um target diferente — que não existe hoje. `INFERIDO` pela ausência de
`mas`/`mas-dev` em qualquer workflow.

---

## 3. Windows

`VERIFICADO` — NSIS assistido (`oneClick: false`, `allowToChangeInstallationDirectory: true`),
apenas `x64`. `build/installer.nsh` instala por usuário e move para subpasta `Whilo` quando a
pasta escolhida tem outros arquivos.

**Gap real:** não há `arm64`. Um Windows ARM (Surface, Snapdragon X) roda o x64 por emulação,
o que funciona mas é lento. Se o dono quiser arm64 nativo, é adicionar `arm64` ao bloco `arch`
e garantir que `build/cua-driver/win32/arm64` exista — hoje o `extraResources` aponta
**hard-coded** para `win32/x64` (`electron-builder.yml:164-165`). `VERIFICADO`: para arm64
seria preciso `${arch}` no caminho, como o Linux já faz.

`windows-installer-e2e.yml` existe — há teste de instalador. `VERIFICADO`.

**Credencial:** `electron-builder.windows-signing.yml` é o arquivo de assinatura. Sem
certificado EV/OV, o SmartScreen mostra aviso vermelho em cada instalação.

---

## 4. Linux

`VERIFICADO` — só `AppImage`, em x64 e arm64.

O comentário do arquivo explica a escolha do runtime estático: o AppImage type2 tem `libfuse`
embutido, então abre em Arch, Omarchy e sistemas sem `libfuse.so.2`. Isso é decisão boa e
deliberada.

**Gap real:** não há `.deb` nem `.rpm`. Para um usuário Ubuntu/Fedora, AppImage significa:
baixar, `chmod +x`, e conviver com atualização manual. `.deb` resolve isso com `apt`/repositório.
`INFERIDO` que a ausência é escolha, não esquecimento: o alvo está isolado em `target:` e o
arquivo tem 20 linhas de comentário justificando só o AppImage.

**Correção já feita no rebrand:** `build/linux/openbot.apparmor` foi deletado e
`build/linux/whilo.apparmor` é o referenciado. `VERIFICADO` no `git status`.

---

## 5. Lojas móveis — o que bloqueia de verdade

### 5.1 `eas.json`

| Campo | Valor | Leitura |
|---|---|---|
| `build.development` | `developmentClient: true`, `internal` | dev build, ok |
| `build.preview` | `internal` | ok |
| `build.production` | `autoIncrement: true`, `channel: production` | build ok, **sem store type** |
| `submit.production` | `{}` | **VAZIO — nada configurado** |

`VERIFICADO` por leitura direta do JSON.

### 5.2 Identificadores

`VERIFICADO` em `apps/mobile/app.json`:
- iOS `bundleIdentifier`: `run.whilo.mobile` — consistente, não é placeholder.
- Scheme `whilo`, slug `whilo`, name `Whilo`.
- `associatedDomains: ["applinks:openbot.run"]` — **ainda aponta para o domínio antigo**. Isso
  está correto se `openbot.run` continua sendo o domínio canônico (o
  `docs/plugin-distribution.md` diz que sim), mas se o domínio migrar para whilo.*, os links
  universais quebram. `A CONFIRMAR` qual domínio vale.

### 5.3 O que falta para publicar

**iOS (App Store Connect):**
1. Apple Developer Program ativo (US$ 99/ano) — conta de organização se for publicar como Whilo.
2. `appleId`, `ascAppId` (o ID numérico do app criado no ASC), `appleTeamId` no
   `submit.production`.
3. App record criado no App Store Connect **antes** do primeiro submit.
4. Privacy manifest (`PrivacyInfo.xcprivacy`). **Não existe como arquivo no repositório** —
   `find apps/mobile -name "PrivacyInfo.xcprivacy"` retorna vazio, e não há `apps/mobile/ios/`
   (projeto Expo gerenciado). O Expo 58 gera manifests para os módulos que conhece no prebuild,
   mas **não** gera para código nativo próprio. `INFERIDO`: se `cua-driver` ou qualquer módulo
   nativo de `apps/mobile/modules/` tocar em API de privacidade (File Timestamp, User Defaults,
   Disk Space, Active Keyboard), a Apple exige a declaração e a rejeição é automática. Precisa
   de verificação no build gerado, não no fonte.
5. Screenshots por tamanho de dispositivo, ícone 1024×1024, descrição, palavras-chave, e a
   política de privacidade publicada em URL.

**Android (Play Console):**
1. Conta de desenvolvedor Google Play (US$ 25 único).
2. Service account JSON com permissão de release, caminho declarado no `submit.production`.
3. `google-services.json` **já existe** em `apps/mobile/` — `VERIFICADO`. Mas isso é Firebase/FCM,
   não é credencial de publicação; as duas coisas são diferentes.
4. Data safety form no Play Console. É curto: o app móvel só pede câmera e guarda uma cópia
   cifrada de leitura dos agentes. Ver o item 5.
5. **Política de dados sensíveis — risco menor do que parece.** `VERIFICADO` em
   `apps/mobile/app.json`: a permissão Android é **só** `android.permission.CAMERA`, e
   `blockedPermissions` bloqueia explicitamente `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`,
   `READ_MEDIA_AUDIO` e `READ_MEDIA_VISUAL_USER_SELECTED`. O app móvel **não** lê arquivos nem
   controla o aparelho: ele é cliente do desktop (`AGENTS.md`: *"a signed-in phone keeps an
   encrypted, read-only copy"*). Isso significa que **não há declaração de serviço de
   acessibilidade a fazer** e o formulário Data Safety é curto. O risco de rejeição que eu
   esperava não existe aqui — o `cua-driver` roda no desktop, não no telefone.

---

## 6. O que eu recomendo, em ordem

1. **Preencher `submit.production`** — é o bloqueio único das duas lojas. Sem isso, todo o resto
   de mobile é build local.
2. **Confirmar o domínio canônico** (`openbot.run` vs whilo.*) antes de tocar em
   `associatedDomains`. Trocar depois quebra links universais já indexados.
3. **`PrivacyInfo.xcprivacy`** — se não existir, o iOS rejeita automaticamente. Verificar antes
   de gastar um ciclo de review.
4. **`.deb` no Linux — não basta uma linha.** Eu ia recomendar "uma linha em `target:`", mas
   conferi o workflow antes: `release.yml:807-860` tem um passo *"Verify AppImage and updater
   metadata"* que faz `appImages=(dist/*.AppImage)` e `shasum` em `./*.AppImage`, e
   `release.yml:886-887` faz upload de `dist/*.AppImage` — **só**. Adicionar `deb` ao
   `electron-builder.yml` produziria um arquivo que nenhum passo coleta e nenhum teste cobre.
   A mudança correta é em dois lugares: o target e o upload. `VERIFICADO` que hoje não existe.
5. **Windows arm64** — maior esforço (precisa do binário `cua-driver` para arm64). Deixar por
   último.

---

## 7. O que este documento NÃO prova

- Que o `release.yml` roda com sucesso hoje. Não executei.
- Que as credenciais existem em secrets do GitHub. Não tenho acesso.
- Que o app passa em review da Apple. A política de "controla seu computador" é a categoria mais
  escrutinada da App Store — recomendo ler as diretrizes 2.5.2 e 4.2 antes de submeter.
- Nenhum número de tamanho de download, tempo de build ou custo de runner foi medido.

`A CONFIRMAR` listados acima: 3 (domínio, privacy manifest, escopo de acessibilidade Android).
