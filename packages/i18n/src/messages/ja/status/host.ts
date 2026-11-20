import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/status/host";

export const messages = {
  // Status lines of the WebRTC host.
  "status.host.registered": "この Whilo を WebRTC アクセス用に登録しました。",
  "status.host.keyRotated": "サーバーキーを変更しました。ペアリング済みのデバイスはそのままです。",
  "status.host.identityUpdated": "サーバーの ID を更新しました。",
  "status.host.starting": "WebRTC ホストを起動しています…",
  "status.host.ready": "この Whilo は WebRTC 接続の準備ができています。",
  "status.host.stopping": "この Whilo を非公開にしています…",
  "status.host.private": "この Whilo は非公開です。",
  "status.host.removed": "この Whilo はアカウントから削除されました。共有するには、もう一度公開してください。",
} as const satisfies PartialTranslation<typeof source>;
