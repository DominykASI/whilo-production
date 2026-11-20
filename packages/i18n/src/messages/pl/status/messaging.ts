import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/messaging";

export const messages = {
  "status.messaging.working": "Pracuję nad tym…",
  "status.messaging.queued": "Oczekiwanie: Whilo pracuje nad innym żądaniem. Odpowiedź pojawi się tutaj.",
  "status.messaging.busy": "Czeka zbyt wiele żądań. Spróbuj ponownie później.",
  "status.messaging.failed": "Whilo nie mógł dokończyć tego żądania. Szczegóły są na hoście Whilo.",
  "status.messaging.noAnswer": "Whilo zakończył pracę bez odpowiedzi tekstowej.",
  "status.messaging.noAgent": "Żaden agent nie może tu jeszcze odpowiadać. Dodaj Slack Orchestrator w Whilo.",
  "status.messaging.delegated": "Członek zespołu nad tym pracuje. Odpowiedź pojawi się tutaj.",
  "status.messaging.stopped": "Zatrzymano.",
  "status.messaging.stop": "Zatrzymaj",
  "status.messaging.approvalTitle": "Whilo prosi o zatwierdzenie, aby kontynuować.",
  "status.messaging.approvalCommand": "Uruchomienie polecenia",
  "status.messaging.approvalFileChange": "Zmiana plików",
  "status.messaging.approvalPermissions": "Dodatkowe uprawnienia",
  "status.messaging.approve": "Zatwierdź",
  "status.messaging.deny": "Odrzuć",
  "status.messaging.approvedBy": "Zatwierdzone przez: {user}.",
  "status.messaging.deniedBy": "Odrzucone przez: {user}.",
  "status.messaging.answeredOnHost": "Odpowiedziano na hoście Whilo.",
  "status.messaging.requestInactive": "To żądanie nie jest już aktywne.",
  "status.messaging.onlyRequester": "Tylko {user} może to zrobić. Może też odpowiedzieć host Whilo.",
  "status.messaging.hostOnly": "Na to żądanie może odpowiedzieć tylko host Whilo.",
  "status.messaging.filesSkipped": "Niektóre pliki nie zostały wysłane: {names}.",
  "status.messaging.orchestratorName": "Slack Orchestrator",
  "status.messaging.orchestratorTitle": "Odpowiada w Slacku i pyta zespół",
  "status.messaging.discordNoAgent":
    "Żaden agent nie może tu jeszcze odpowiadać. Dodaj Discord Orchestrator w Whilo.",
  "status.messaging.discordOrchestratorName": "Discord Orchestrator",
  "status.messaging.discordOrchestratorTitle": "Odpowiada na Discordzie i pyta zespół",
  "status.messaging.integrationsSection": "Integracje",
  "status.messaging.signInReceived": "Whilo otrzymał instalację Slack. Możesz zamknąć tę kartę.",
  "status.messaging.signInUnknown": "Whilo nie rozpoczął tej instalacji Slack. Rozpocznij ją ponownie w Whilo.",
  "status.messaging.telegramNoAgent":
    "Żaden agent nie może tu jeszcze odpowiadać. Dodaj Telegram Orchestrator w Whilo.",
  "status.messaging.telegramLinked":
    "Whilo jest połączony z tym czatem. Oznacz {bot} lub odpowiedz na wiadomość Whilo, aby zapytać agentów.",
  "status.messaging.telegramOrchestratorName": "Telegram Orchestrator",
  "status.messaging.telegramOrchestratorTitle": "Odpowiada w Telegramie i pyta zespół",
  "status.messaging.whatsappNoAgent":
    "Żaden agent nie może tu jeszcze odpowiadać. Dodaj WhatsApp Orchestrator w Whilo.",
  "status.messaging.whatsappApprovalMenu": "Odpowiedz 1, aby zatwierdzić, lub 2, aby odrzucić.",
  "status.messaging.whatsappStopMenu": "Odpowiedz „stop”, aby zatrzymać.",
  "status.messaging.whatsappPairingCode":
    "Ten numer odpowiada tylko osobom, którym pozwolił właściciel. Przekaż właścicielowi ten kod: {code}",
  "status.messaging.whatsappPairingApproved": "Możesz teraz wysyłać prośby na ten numer.",
  "status.messaging.whatsappOwnChat": "Wiadomość do siebie",
  "status.messaging.whatsappWelcomeOwn":
    "👋 *Whilo jest połączony*\n\nNapisz tutaj, aby poprosić swoich agentów. WhatsApp Orchestrator odpowiada albo przekazuje pracę właściwemu agentowi.\n\nWyślij *stop*, aby zatrzymać prośbę.",
  "status.messaging.whatsappWelcomeDedicated":
    "👋 *Whilo jest połączony*\n\nOsoby, na które pozwolisz w Whilo, mogą już pisać na ten numer. Nowa osoba dostaje kod: zatwierdź go w Whilo w sekcji Prośby.\n\nWyślij *stop*, aby zatrzymać prośbę.",
  "status.messaging.whatsappOrchestratorName": "WhatsApp Orchestrator",
  "status.messaging.whatsappOrchestratorTitle": "Odpowiada w WhatsApp i pyta zespół",
} as const satisfies PartialTranslation<typeof source>;
