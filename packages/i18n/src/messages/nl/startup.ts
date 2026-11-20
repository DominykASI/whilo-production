import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Whilo kan niet starten",
  "startup.failedBody":
    "{message}\n\nJe lokale gegevens zijn niet gereset of overschreven. Bekijk de handleiding voor probleemoplossing voor herstelstappen.",
  "startup.archiveChangedTitle": "Whilo-bestanden zijn gewijzigd",
  "startup.archiveChangedBody":
    "Een ander programma heeft het Whilo-bestand app.asar gewijzigd. Whilo werkt nu, maar opent niet meer nadat je het afsluit.\n\nInstalleer Whilo opnieuw om het te herstellen. Je lokale gegevens blijven bewaard.",
  "startup.archiveChangedDownload": "Whilo downloaden",
  "startup.newerDataUpdatingTitle": "Whilo wordt bijgewerkt",
  "startup.newerDataUpdatingBody":
    "Een nieuwere versie van Whilo heeft je gegevens opgeslagen. Whilo installeert de nieuwste versie en opent daarna opnieuw.\n\nJe lokale gegevens zijn niet gereset of overschreven.",
  "startup.newerDataTitle": "Installeer de nieuwste Whilo",
  "startup.newerDataBody":
    "Een nieuwere versie van Whilo heeft je gegevens opgeslagen, en deze versie ({version}) kan ze niet openen. Installeer de nieuwste versie om je gegevens te openen.\n\nJe lokale gegevens zijn niet gereset of overschreven.",
  "startup.newerDataDownload": "Whilo downloaden",
  "startup.newerDataGuide": "Gids openen",
  "startup.newerDataQuit": "Stoppen",
} as const satisfies PartialTranslation<typeof source>;
