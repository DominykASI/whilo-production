import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/host";

export const messages = {
  // Status lines of the WebRTC host.
  "status.host.registered": "Cet Whilo est enregistré pour l’accès WebRTC.",
  "status.host.keyRotated": "Clé du serveur changée. Les appareils associés restent associés.",
  "status.host.identityUpdated": "Identité du serveur mise à jour.",
  "status.host.starting": "Démarrage de l’hôte WebRTC…",
  "status.host.ready": "Cet Whilo est prêt pour les connexions WebRTC.",
  "status.host.stopping": "Passage de cet Whilo en mode privé…",
  "status.host.private": "Cet Whilo est privé.",
  "status.host.removed": "Cet Whilo a été retiré de votre compte. Publiez-le à nouveau pour le partager.",
} as const satisfies PartialTranslation<typeof source>;
