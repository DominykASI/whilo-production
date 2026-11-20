import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "تعذّر بدء تشغيل Whilo",
  "startup.failedBody":
    "{message}\n\nلم تُعَد تعيين بياناتك المحلية ولم يُكتب فوقها. راجع دليل استكشاف الأخطاء وإصلاحها لمعرفة خطوات الاسترداد.",
  "startup.archiveChangedTitle": "تم تغيير ملفات Whilo",
  "startup.archiveChangedBody":
    "غيّر برنامج آخر ملف Whilo المسمى app.asar. يعمل Whilo الآن، لكنه لن يفتح بعد إنهائه.\n\nلإصلاح Whilo، ثبّته من جديد. تبقى بياناتك المحلية.",
  "startup.archiveChangedDownload": "تنزيل Whilo",
  "startup.newerDataUpdatingTitle": "جارٍ تحديث Whilo",
  "startup.newerDataUpdatingBody":
    "حفظ إصدار أحدث من Whilo بياناتك. يثبّت Whilo أحدث إصدار ثم يفتح مرة أخرى.\n\nلم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
  "startup.newerDataTitle": "ثبّت أحدث إصدار من Whilo",
  "startup.newerDataBody":
    "حفظ إصدار أحدث من Whilo بياناتك، ولا يستطيع هذا الإصدار ({version}) فتحها. ثبّت أحدث إصدار لفتح بياناتك.\n\nلم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
  "startup.newerDataDownload": "تنزيل Whilo",
  "startup.newerDataGuide": "فتح الدليل",
  "startup.newerDataQuit": "إنهاء",
} as const satisfies PartialTranslation<typeof source>;
