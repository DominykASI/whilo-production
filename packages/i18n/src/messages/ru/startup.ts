import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Whilo не удалось запустить",
  "startup.failedBody":
    "{message}\n\nЛокальные данные не сброшены и не перезаписаны. Шаги восстановления — в руководстве по устранению неполадок.",
  "startup.archiveChangedTitle": "Файлы Whilo изменены",
  "startup.archiveChangedBody":
    "Другая программа изменила файл Whilo app.asar. Сейчас Whilo работает, но после выхода он больше не запустится.\n\nЧтобы исправить это, установите Whilo заново. Ваши локальные данные сохранятся.",
  "startup.archiveChangedDownload": "Скачать Whilo",
  "startup.newerDataUpdatingTitle": "Обновление Whilo",
  "startup.newerDataUpdatingBody":
    "Более новая версия Whilo сохранила ваши данные. Whilo устанавливает последнюю версию и затем откроется снова.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataTitle": "Установите последнюю версию Whilo",
  "startup.newerDataBody":
    "Более новая версия Whilo сохранила ваши данные, и эта версия ({version}) не может их открыть. Установите последнюю версию, чтобы открыть данные.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataDownload": "Скачать Whilo",
  "startup.newerDataGuide": "Открыть руководство",
  "startup.newerDataQuit": "Выйти",
} as const satisfies PartialTranslation<typeof source>;
