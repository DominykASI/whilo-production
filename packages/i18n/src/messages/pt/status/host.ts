import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/host";

export const messages = {
  "status.host.registered": "Este Whilo foi registrado para acesso por WebRTC.",
  "status.host.keyRotated": "Chave do servidor alterada. Os dispositivos pareados continuam pareados.",
  "status.host.identityUpdated": "Identidade do servidor atualizada.",
  "status.host.starting": "Iniciando o computador anfitrião WebRTC…",
  "status.host.ready": "Este Whilo está pronto para conexões WebRTC.",
  "status.host.stopping": "Tornando este Whilo privado…",
  "status.host.private": "Este Whilo é privado.",
  "status.host.removed": "Este Whilo foi removido da sua conta. Publique-o novamente para compartilhá-lo.",
} as const satisfies PartialTranslation<typeof source>;
