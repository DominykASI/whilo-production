import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  previewBrowserSignIn, readSessionState, takeBrowserSignInFromLocation, takePairingCodeFromLocation, takeInvitedEmailFromLocation,
} from "./lib/session";
import { bootstrapBrand, productName } from "./lib/brand";
import { t } from "./lib/i18n";
import { loadPageLanguage } from "./lib/language-preference";
import { applySkinChoice, readSkinChoice } from "./lib/skins";
import { applyChatWidth, readChatWidth } from "./lib/chat-width";
import { applyFont, readFont } from "./lib/fonts";
import { settleAdvancedModeDefault } from "./lib/interface-mode";
import { BrowserSignInPage } from "./pair/BrowserSignInPage";
import { PairPage } from "./pair/PairPage";
import { HomeScreen, SignedOutAtHome } from "./components/HomeScreen";
import { PageBoundary } from "./components/PageBoundary";
import { endedBeforeReload, forgetEndedSession } from "./lib/session-ended";
import "./styles.css";

// Before first paint; settleAdvancedModeDefault must run before applySkin writes omb-skin.
settleAdvancedModeDefault();
applySkinChoice(readSkinChoice());
applyFont(readFont());
applyChatWidth(readChatWidth());
const pageLanguage = loadPageLanguage();

// The app is its own chunk, so these pages don't parse it. Everywhere else its fetch starts now, alongside the session
// read, instead of after it. A failed fetch renders as a throw, so PageBoundary offers a reload.
const PAGES_WITHOUT_THE_APP = new Set(["/home", "/pair", "/desktop-viewer"]);
const loadApp = () => {
  console.info("[whilo-boot] loadApp:start");
  return import("./App").then((m) => {
    console.info("[whilo-boot] loadApp:resolved");
    return m;
  }).catch((error: unknown) => {
    console.error("[whilo-boot] loadApp:failed", error);
    return { default: (): never => { throw error; } };
  });
};
const appPage = PAGES_WITHOUT_THE_APP.has(location.pathname) ? null : loadApp();

async function chooseRoot(): Promise<React.ReactNode> {
  console.info("[whilo-boot] chooseRoot:start", location.pathname);
  const home = window.ogb?.home;
  if (location.pathname === "/home" && home) return <HomeScreen bridge={home} manage={window.ogb?.cloudPlan?.manage} />;
  if (location.pathname === "/pair") {
    const signIn = takeBrowserSignInFromLocation();
    if (signIn) {
      const preview = await previewBrowserSignIn(signIn);
      await pageLanguage;
      return preview ? <BrowserSignInPage credential={signIn} owner={preview.owner} /> : <PairPage initialCode={null} reason={t("pair.browser.signInFailed")} />;
    }
    return <PairPage initialCode={takePairingCodeFromLocation()} initialEmail={takeInvitedEmailFromLocation()} />;
  }
  console.info("[whilo-boot] chooseRoot:before-session");
  const session = await readSessionState();
  console.info("[whilo-boot] chooseRoot:after-session", session.kind);
  if (session.kind === "unauthenticated") {
    await pageLanguage;
    const pair = <PairPage initialCode={null} reason={endedBeforeReload() ? t("pair.sessionEnded") : session.error} />;
    return home ? <SignedOutAtHome bridge={home} fallback={pair} /> : pair;
  }
  forgetEndedSession();
  if (session.kind === "loopback" && session.trust === "service") {
    await pageLanguage;
    return <PairPage initialCode={null} reason={t("pair.serviceTrust")} />;
  }
  if (location.pathname === "/desktop-viewer") {
    const { DesktopViewer } = await import("./components/DesktopViewer");
    return <DesktopViewer />;
  }
  console.info("[whilo-boot] chooseRoot:before-app", { hasAppPage: !!appPage });
  bootStatus("Carregando interface do Whilo…");
  const slow = setTimeout(() => {
    console.warn("[whilo-boot] app import still pending after 20s");
    bootStatus("Carregando interface do Whilo… (primeira inicialização pode demorar)");
  }, 20000);
  const appModule = await (appPage ?? loadApp()).finally(() => clearTimeout(slow));
  console.info("[whilo-boot] chooseRoot:after-app");
  return <appModule.default />;
}

// The window is named before the brand file is asked for: the answer only ever renames it.
document.title = productName();

function bootStatus(text: string) {
  try {
    const rootEl = document.getElementById("root");
    if (!rootEl || rootEl.dataset.mounted === "1") return;
    rootEl.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;color:#d4d4d8;background:#070707;font:14px/1.5 system-ui,-apple-system,sans-serif";
    wrap.textContent = text;
    rootEl.appendChild(wrap);
  } catch {}
}

function bootError(error: unknown, label = "mount") {
  console.error("[whilo-boot]", label, error);
  try {
    const rootEl = document.getElementById("root");
    if (!rootEl) return;
    rootEl.innerHTML = "";
    const pre = document.createElement("pre");
    pre.style.cssText = "white-space:pre-wrap;padding:16px;color:#fca5a5;background:#0b0b0b;font:12px/1.5 ui-monospace,monospace;min-height:100vh;margin:0";
    pre.textContent = `[whilo-boot:${label}] ` + (error instanceof Error ? (error.stack || error.message) : String(error));
    rootEl.appendChild(pre);
  } catch {}
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise.finally(() => { if (timer) clearTimeout(timer); }),
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`timeout: ${label} (${ms}ms)`)), ms);
    }),
  ]);
}

bootStatus("Abrindo Whilo…");

const traced = <T,>(label: string, p: Promise<T>) =>
  p.then((v) => { console.info("[whilo-boot] ok", label); return v; })
   .catch((e) => { console.error("[whilo-boot] fail", label, e); throw e; });

void (async () => {
  try {
    const brandP = withTimeout(traced("brand", bootstrapBrand()), 5000, "brand").catch((e) => { console.warn("[whilo-boot] brand-soft-fail", e); return null; });
    const langP = withTimeout(traced("language", pageLanguage), 15000, "language").catch((e) => { console.warn("[whilo-boot] language-soft-fail", e); return null; });
    const rootP = traced("root", chooseRoot());
    console.info("[whilo-boot] awaiting root");
    const root = await rootP;
    await Promise.allSettled([brandP, langP]);
    const rootEl = document.getElementById("root")!;
    rootEl.dataset.mounted = "1";
    createRoot(rootEl).render(<StrictMode><PageBoundary>{root}</PageBoundary></StrictMode>);
    console.info("[whilo-boot] mounted");
  } catch (error) {
    bootError(error, "mount");
  }
})();
