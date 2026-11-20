import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Whilo を起動できませんでした",
  "startup.failedBody":
    "{message}\n\nお使いのデータは初期化も上書きもされていません。復旧の手順はトラブルシューティングガイドをご覧ください。",
  "startup.archiveChangedTitle": "Whilo のファイルが変更されました",
  "startup.archiveChangedBody":
    "別のプログラムが Whilo のファイル app.asar を変更しました。Whilo は今は動作していますが、終了すると次は起動しません。\n\n修復するには、Whilo をもう一度インストールしてください。ローカルのデータはそのまま残ります。",
  "startup.archiveChangedDownload": "Whilo をダウンロード",
  "startup.newerDataUpdatingTitle": "Whilo を更新しています",
  "startup.newerDataUpdatingBody":
    "新しいバージョンの Whilo がデータを保存しました。Whilo は最新バージョンをインストールしてから、もう一度開きます。\n\nローカルデータはリセットも上書きもされていません。",
  "startup.newerDataTitle": "最新の Whilo をインストールしてください",
  "startup.newerDataBody":
    "新しいバージョンの Whilo がデータを保存したため、このバージョン ({version}) では開けません。データを開くには最新バージョンをインストールしてください。\n\nローカルデータはリセットも上書きもされていません。",
  "startup.newerDataDownload": "Whilo をダウンロード",
  "startup.newerDataGuide": "ガイドを開く",
  "startup.newerDataQuit": "終了",
} as const satisfies PartialTranslation<typeof source>;
