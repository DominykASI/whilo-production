import { DEFAULT_APP_LANGUAGE } from "@whilo/contracts/app-language";
import { loadLocale, resolveLocale } from "@whilo/i18n";
import { createLazyFileRoute } from "@tanstack/solid-router";
import { createSignal, lazy, onSettled, Show } from "solid-js";
import "../../../../src/renderer/src/preview/preview.css";

// The demo follows the visitor's language. Its catalogs load with the code, so the demo does not
// start in English; if they fail, the demo shows English.
const WhiloPlayground = lazy(() =>
  Promise.all([
    import("@whilo/renderer-preview"),
    loadLocale(resolveLocale(DEFAULT_APP_LANGUAGE, navigator.language)).catch(() => undefined),
  ]).then(([module]) => ({ default: module.WhiloPlayground })),
);

export const Route = createLazyFileRoute("/app-preview")({ component: AppPreviewPage });

export function AppPreviewPage() {
  const [mounted, setMounted] = createSignal(false);
  onSettled(() => {
    setMounted(true);
  });

  return (
    <div id="root" class="whilo-playground-root" data-preview-variant="landing">
      <Show
        when={mounted()}
        fallback={<div class="whilo-playground-loading" role="status" aria-label="Loading Whilo preview" />}
      >
        <WhiloPlayground variant="landing" />
      </Show>
    </div>
  );
}
