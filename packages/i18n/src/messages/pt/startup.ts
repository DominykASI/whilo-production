import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "O Whilo não conseguiu iniciar",
  "startup.failedBody":
    "{message}\n\nSeus dados locais não foram redefinidos nem sobrescritos. Consulte o guia de solução de problemas para ver os passos de recuperação.",
  "startup.archiveChangedTitle": "Arquivos do Whilo foram alterados",
  "startup.archiveChangedBody":
    "Outro programa alterou o arquivo app.asar do Whilo. O Whilo funciona agora, mas não vai abrir depois que você fechá-lo.\n\nPara reparar, instale o Whilo novamente. Seus dados locais são mantidos.",
  "startup.archiveChangedDownload": "Baixar Whilo",
  "startup.newerDataUpdatingTitle": "Atualizando o Whilo",
  "startup.newerDataUpdatingBody":
    "Uma versão mais recente do Whilo salvou seus dados. O Whilo instala a versão mais recente e depois abre de novo.\n\nSeus dados locais não foram redefinidos nem substituídos.",
  "startup.newerDataTitle": "Instale o Whilo mais recente",
  "startup.newerDataBody":
    "Uma versão mais recente do Whilo salvou seus dados, e esta versão ({version}) não consegue abri-los. Instale a versão mais recente para abrir seus dados.\n\nSeus dados locais não foram redefinidos nem substituídos.",
  "startup.newerDataDownload": "Baixar Whilo",
  "startup.newerDataGuide": "Abrir guia",
  "startup.newerDataQuit": "Sair",
} as const satisfies PartialTranslation<typeof source>;
