import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Whilo konnte nicht starten",
  "startup.failedBody":
    "{message}\n\nDeine lokalen Daten wurden weder zurückgesetzt noch überschrieben. Schritte zur Wiederherstellung findest du in der Anleitung zur Fehlerbehebung.",
  "startup.archiveChangedTitle": "Whilo-Dateien wurden geändert",
  "startup.archiveChangedBody":
    "Ein anderes Programm hat die Whilo-Datei app.asar geändert. Whilo läuft jetzt, startet aber nicht mehr, wenn du es beendest.\n\nInstalliere Whilo erneut, um es zu reparieren. Deine lokalen Daten bleiben erhalten.",
  "startup.archiveChangedDownload": "Whilo laden",
  "startup.newerDataUpdatingTitle": "Whilo wird aktualisiert",
  "startup.newerDataUpdatingBody":
    "Eine neuere Version von Whilo hat deine Daten gespeichert. Whilo installiert die neueste Version und startet dann neu.\n\nDeine lokalen Daten wurden nicht zurückgesetzt oder überschrieben.",
  "startup.newerDataTitle": "Neueste Whilo-Version installieren",
  "startup.newerDataBody":
    "Eine neuere Version von Whilo hat deine Daten gespeichert, und diese Version ({version}) kann sie nicht öffnen. Installiere die neueste Version, um deine Daten zu öffnen.\n\nDeine lokalen Daten wurden nicht zurückgesetzt oder überschrieben.",
  "startup.newerDataDownload": "Whilo laden",
  "startup.newerDataGuide": "Anleitung öffnen",
  "startup.newerDataQuit": "Beenden",
} as const satisfies PartialTranslation<typeof source>;
