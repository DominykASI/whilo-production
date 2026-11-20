import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/host";

export const messages = {
  "status.host.registered": "تم تسجيل Whilo هذا للوصول عبر WebRTC.",
  "status.host.keyRotated": "تغيّر مفتاح الخادم. تبقى الأجهزة المقترنة مقترنة.",
  "status.host.identityUpdated": "تم تحديث هوية الخادم.",
  "status.host.starting": "جارٍ تشغيل مضيف WebRTC…",
  "status.host.ready": "Whilo هذا جاهز لاتصالات WebRTC.",
  "status.host.stopping": "جارٍ جعل Whilo هذا خاصًا…",
  "status.host.private": "Whilo هذا خاص.",
  "status.host.removed": "أُزيل Whilo هذا من حسابك. انشره مرة أخرى لمشاركته.",
} as const satisfies PartialTranslation<typeof source>;
