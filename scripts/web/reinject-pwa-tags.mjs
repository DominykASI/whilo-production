#!/usr/bin/env node
/**
 * Idempotently reinjects PWA tags into an HTML file's <head>/<body>.
 * Safe to run after every web export (no duplicates). Node stdlib only.
 *
 * Usage:
 *   node scripts/web/reinject-pwa-tags.mjs [path/to/index.html]
 *   bun scripts/web/reinject-pwa-tags.mjs [path/to/index.html]
 *
 * Default: ./index.html (current working directory).
 *
 * Injects (only if missing):
 * - <link rel="manifest" href="./site.webmanifest" />
 * - <meta name="theme-color" content="#f5f5f7" />
 * - <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
 * - favicon links: ./favicon-16.png, ./favicon-32.png, ./favicon-48.png, ./favicon.ico
 * - Service worker registration for ./sw.js (inline script before </body>)
 *
 * Filenames/paths match apps/mobile/public PWA assets. Adjust HEAD_TAGS or SW_SRC
 * if deploying a different asset layout.
 */
import fs from "node:fs";
import path from "node:path";

const DEFAULT_INDEX = path.resolve(process.cwd(), "index.html");
const SW_SRC = "./sw.js";
const THEME_COLOR = "#f5f5f7";

const HEAD_TAGS = [
  { test: /<link\b[^>]*\brel=["']manifest["'][^>]*>/i, tag: '<link rel="manifest" href="./site.webmanifest" />' },
  { test: /<meta\b[^>]*\bname=["']theme-color["'][^>]*>/i, tag: `<meta name="theme-color" content="${THEME_COLOR}" />` },
  { test: /<meta\b[^>]*\bname=["']mobile-web-app-capable["'][^>]*>/i, tag: '<meta name="mobile-web-app-capable" content="yes" />' },
  { test: /<meta\b[^>]*\bname=["']apple-mobile-web-app-capable["'][^>]*>/i, tag: '<meta name="apple-mobile-web-app-capable" content="yes" />' },
  { test: /<meta\b[^>]*\bname=["']apple-mobile-web-app-status-bar-style["'][^>]*>/i, tag: '<meta name="apple-mobile-web-app-status-bar-style" content="default" />' },
  { test: /<meta\b[^>]*\bname=["']apple-mobile-web-app-title["'][^>]*>/i, tag: '<meta name="apple-mobile-web-app-title" content="Whilo" />' },
  { test: /<link\b[^>]*\brel=["']apple-touch-icon["'][^>]*>/i, tag: '<link rel="apple-touch-icon" href="./apple-touch-icon.png" />' },
  { test: /<link\b[^>]*\brel=["']icon["'][^>]*\bhref=["']\.\/favicon-16\.png["'][^>]*>/i, tag: '<link rel="icon" type="image/png" sizes="16x16" href="./favicon-16.png" />' },
  { test: /<link\b[^>]*\brel=["']icon["'][^>]*\bhref=["']\.\/favicon-32\.png["'][^>]*>/i, tag: '<link rel="icon" type="image/png" sizes="32x32" href="./favicon-32.png" />' },
  { test: /<link\b[^>]*\brel=["']icon["'][^>]*\bhref=["']\.\/favicon-48\.png["'][^>]*>/i, tag: '<link rel="icon" type="image/png" sizes="48x48" href="./favicon-48.png" />' },
  { test: /<link\b[^>]*\brel=["'](?:shortcut )?icon["'][^>]*\bhref=["']\.\/favicon\.ico["'][^>]*>/i, tag: '<link rel="icon" href="./favicon.ico" sizes="any" />' },
];

const SW_SNIPPET = [
  "<script>",
  "  if ('serviceWorker' in navigator) {",
  "    window.addEventListener('load', function () {",
  `      navigator.serviceWorker.register('${SW_SRC}').catch(function () {});`,
  "    });",
  "  }",
  "</script>",
].join("\n");

function hasServiceWorkerRegistration(html) {
  return /serviceWorker\s*\.\s*register\b/i.test(html) || /['"]serviceWorker['"]\s+in\s+navigator/i.test(html);
}

function injectHead(html) {
  const missing = HEAD_TAGS.filter(({ test }) => !test.test(html)).map(({ tag }) => tag);
  if (missing.length === 0) return { html, added: 0 };
  const block = missing.map((t) => `    ${t}`).join("\n") + "\n";
  const headClose = /<\/head>/i;
  if (!headClose.test(html)) {
    throw new Error("index.html has no </head> tag; cannot inject PWA head tags.");
  }
  return { html: html.replace(headClose, `${block}  </head>`), added: missing.length };
}

function injectSw(html) {
  if (hasServiceWorkerRegistration(html)) return { html, added: false };
  const bodyClose = /<\/body>/i;
  if (!bodyClose.test(html)) {
    throw new Error("index.html has no </body> tag; cannot inject service worker registration.");
  }
  const block = `    ${SW_SNIPPET}\n  `;
  return { html: html.replace(bodyClose, `${block}</body>`), added: true };
}

function main() {
  const input = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : DEFAULT_INDEX;
  if (!fs.existsSync(input)) {
    console.error(`reinject-pwa-tags: file not found: ${input}`);
    process.exit(2);
  }
  const original = fs.readFileSync(input, "utf8");
  const head = injectHead(original);
  const sw = injectSw(head.html);
  const changed = sw.html !== original;
  if (changed) {
    fs.writeFileSync(input, sw.html, "utf8");
  }
  const summary = {
    file: input,
    changed,
    headTagsAdded: head.added,
    swRegistrationAdded: sw.added,
  };
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

main();
