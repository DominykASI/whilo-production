import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Nie udało się uruchomić Whilo",
  "startup.failedBody":
    "{message}\n\nTwoje lokalne dane nie zostały zresetowane ani nadpisane. Kroki przywracania znajdziesz w przewodniku rozwiązywania problemów.",
  "startup.archiveChangedTitle": "Pliki Whilo zostały zmienione",
  "startup.archiveChangedBody":
    "Inny program zmienił plik app.asar Whilo. Whilo działa teraz, ale nie uruchomi się po zamknięciu.\n\nAby naprawić Whilo, zainstaluj go ponownie. Twoje lokalne dane zostaną zachowane.",
  "startup.archiveChangedDownload": "Pobierz Whilo",
  "startup.newerDataUpdatingTitle": "Aktualizowanie Whilo",
  "startup.newerDataUpdatingBody":
    "Nowsza wersja Whilo zapisała Twoje dane. Whilo instaluje najnowszą wersję, a potem uruchomi się ponownie.\n\nTwoje lokalne dane nie zostały zresetowane ani nadpisane.",
  "startup.newerDataTitle": "Zainstaluj najnowszy Whilo",
  "startup.newerDataBody":
    "Nowsza wersja Whilo zapisała Twoje dane, a ta wersja ({version}) nie może ich otworzyć. Zainstaluj najnowszą wersję, aby otworzyć swoje dane.\n\nTwoje lokalne dane nie zostały zresetowane ani nadpisane.",
  "startup.newerDataDownload": "Pobierz Whilo",
  "startup.newerDataGuide": "Otwórz przewodnik",
  "startup.newerDataQuit": "Zakończ",
} as const satisfies PartialTranslation<typeof source>;
