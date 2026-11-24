import path from "node:path";
import { pathToFileURL } from "node:url";
import nativeText from "./native-text.cjs";

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

const escapeText = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

function around(template, name) {
  const at = template.indexOf(`{${name}}`);
  return at < 0 ? [template, ""] : [template.slice(0, at), template.slice(at + name.length + 2)];
}

/** The page the main window shows when the background server never came up, in `text`'s language. */
export function buildErrorPage({ allPortsOccupied, logDir }, text = nativeText.englishText) {
  const serverLogPath = path.join(logDir, "server.log");
  const serverLogHref = pathToFileURL(serverLogPath).href;
  const reason = text.t(allPortsOccupied ? "native.dialog.serverFailed.portsTaken" : "native.dialog.serverFailed.slow");
  const [before, after] = around(text.t("native.dialog.serverFailed.keepsHappening"), "log");
  return (
    "data:text/html;charset=utf-8," +
    encodeURIComponent(
      `<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#121212;color:#fcfcfc;font:15px -apple-system,system-ui"><div style="text-align:center;max-width:360px"><div style="font-size:40px">🐭</div><h2 style="font-weight:600;margin:12px 0 6px">${escapeText(text.t("native.dialog.serverFailed.title"))}</h2><p style="color:#fcfcfc99;line-height:1.5">${escapeHtml(reason)} ${escapeText(before)}<a target="_blank" rel="noopener" href="${serverLogHref}" style="color:#fcfcfc">${escapeHtml(serverLogPath)}</a>${escapeText(after)}</p></div></body>`,
    )
  );
}

/** The page the live-desktop viewer shows when it cannot open, in `text`'s language. */
export function desktopViewerErrorPage(message, retryUrl, text = nativeText.englishText) {
  return (
    "data:text/html;charset=utf-8," +
    encodeURIComponent(`<!doctype html><html lang="${escapeText(text.intlTag())}"><meta name="color-scheme" content="dark"><title>${escapeText(text.t("native.viewer.title"))}</title>
      <body style="margin:0;display:grid;place-items:center;height:100vh;background:#121212;color:#f5f5f5;font:14px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif">
        <main style="max-width:420px;padding:32px;text-align:center"><h2 style="margin:0 0 10px;font-size:18px">${escapeText(text.t("native.viewer.heading"))}</h2>
        <p style="margin:0 0 20px;color:#a1a1aa;line-height:1.5">${escapeText(message)}</p>
        <a href="${escapeText(retryUrl)}" target="_blank" rel="noreferrer" style="display:inline-block;border-radius:9px;background:#fff;color:#111;padding:9px 14px;text-decoration:none;font-weight:600">${escapeText(text.t("native.viewer.open"))}</a></main>
      </body></html>`)
  );
}

/** Visible fallback when the desktop shell cannot load the explicit web UI (never a silent gray screen). */
export function explicitWebLoadErrorPage(url, error, { logPath = "/tmp/whilo-pets-desktop.log" } = {}) {
  const safeUrl = escapeText(url || "");
  const safeErr = escapeText(error || "A página não respondeu.");
  const retry = escapeText(url || "about:blank");
  return (
    "data:text/html;charset=utf-8," +
    encodeURIComponent(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="color-scheme" content="dark light"><title>Whilo</title>
      <body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0f17;color:#e5e7eb;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif">
        <main style="max-width:560px;padding:28px 24px">
          <div style="font-size:28px;margin-bottom:8px">Whilo</div>
          <h1 style="margin:0 0 8px;font-size:18px;font-weight:600">Não foi possível abrir a interface</h1>
          <p style="margin:0 0 14px;color:#a1a1aa">O app não conseguiu carregar a UI. Verifique sua conexão e tente novamente.</p>
          <div style="margin:0 0 14px;padding:12px 14px;border-radius:12px;background:#111827;border:1px solid #1f2937;word-break:break-all">
            <div style="font-size:12px;color:#9ca3af;margin-bottom:4px">Endereço</div>
            <div>${safeUrl || "—"}</div>
          </div>
          <div style="margin:0 0 18px;padding:12px 14px;border-radius:12px;background:#111827;border:1px solid #1f2937;white-space:pre-wrap;word-break:break-word">
            <div style="font-size:12px;color:#9ca3af;margin-bottom:4px">Detalhe</div>
            <div>${safeErr}</div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a href="${retry}" style="display:inline-block;border-radius:10px;background:#e5e7eb;color:#111827;padding:9px 14px;text-decoration:none;font-weight:600">Tentar novamente</a>
          </div>
          <p style="margin:18px 0 0;color:#6b7280;font-size:12px">Log: ${escapeText(logPath)} · ~/.config/Whilo Pets/logs/</p>
        </main>
      </body></html>`)
  );
}
