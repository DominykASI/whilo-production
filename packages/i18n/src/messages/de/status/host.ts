import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/host";

export const messages = {
  "status.host.registered": "Dieser Whilo wurde für den WebRTC-Zugriff registriert.",
  "status.host.keyRotated": "Serverschlüssel geändert. Gekoppelte Geräte bleiben gekoppelt.",
  "status.host.identityUpdated": "Serveridentität aktualisiert.",
  "status.host.starting": "WebRTC-Host wird gestartet…",
  "status.host.ready": "Dieser Whilo ist für WebRTC-Verbindungen bereit.",
  "status.host.stopping": "Dieser Whilo wird auf privat gesetzt…",
  "status.host.private": "Dieser Whilo ist privat.",
  "status.host.removed": "Dieser Whilo wurde aus deinem Konto entfernt. Veröffentliche ihn erneut, um ihn zu teilen.",
} as const satisfies PartialTranslation<typeof source>;
