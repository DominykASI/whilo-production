import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/host";

export const messages = {
  "status.host.registered": "Bu Whilo, WebRTC erişimi için kaydedildi.",
  "status.host.keyRotated": "Sunucu anahtarı değiştirildi. Eşlenmiş cihazlar eşli kalır.",
  "status.host.identityUpdated": "Sunucu kimliği güncellendi.",
  "status.host.starting": "WebRTC ana makinesi başlatılıyor…",
  "status.host.ready": "Bu Whilo, WebRTC bağlantıları için hazır.",
  "status.host.stopping": "Bu Whilo özel yapılıyor…",
  "status.host.private": "Bu Whilo özel.",
  "status.host.removed": "Bu Whilo hesabınızdan kaldırıldı. Paylaşmak için yeniden yayımlayın.",
} as const satisfies PartialTranslation<typeof source>;
