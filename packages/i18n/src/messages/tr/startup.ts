import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Whilo başlatılamadı",
  "startup.failedBody":
    "{message}\n\nYerel verileriniz sıfırlanmadı veya üzerine yazılmadı. Kurtarma adımları için sorun giderme kılavuzuna bakın.",
  "startup.archiveChangedTitle": "Whilo dosyaları değiştirildi",
  "startup.archiveChangedBody":
    "Başka bir program Whilo’un app.asar dosyasını değiştirdi. Whilo şu an çalışıyor, ancak kapattıktan sonra açılmayacak.\n\nOnarmak için Whilo’u yeniden yükleyin. Yerel verileriniz korunur.",
  "startup.archiveChangedDownload": "Whilo’u indir",
  "startup.newerDataUpdatingTitle": "Whilo güncelleniyor",
  "startup.newerDataUpdatingBody":
    "Whilo’un daha yeni bir sürümü verilerinizi kaydetti. Whilo en son sürümü yüklüyor ve ardından yeniden açılacak.\n\nYerel verileriniz sıfırlanmadı veya üzerine yazılmadı.",
  "startup.newerDataTitle": "En son Whilo’u yükleyin",
  "startup.newerDataBody":
    "Whilo’un daha yeni bir sürümü verilerinizi kaydetti ve bu sürüm ({version}) onları açamıyor. Verilerinizi açmak için en son sürümü yükleyin.\n\nYerel verileriniz sıfırlanmadı veya üzerine yazılmadı.",
  "startup.newerDataDownload": "Whilo’u indir",
  "startup.newerDataGuide": "Kılavuzu aç",
  "startup.newerDataQuit": "Çık",
} as const satisfies PartialTranslation<typeof source>;
