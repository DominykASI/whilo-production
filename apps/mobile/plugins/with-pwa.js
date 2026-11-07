const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { withBaseMod } = require("expo/config-plugins");

// Injects the PWA <head> tags (manifest, theme-color, apple-touch-icon, favicons)
// and the service-worker registration into the generated web index.html.
//
// Expo generates index.html from `webTemplate` (@expo/cli) at dev/export time and
// merges `web.themeColor` into a <meta name="theme-color"> tag. There is no
// first-class config for manifest/apple-touch-icon/sw registration, so this
// plugin appends a `withBaseMod` "web" mod that edits the exported HTML in
// place. It is a no-op on native platforms: the mod only runs when the web
// platform is prebuilt/exported, and it skips silently if the HTML is absent.
//
// The generated tags use paths relative to the web base URL ("./"), matching
// the manifest's scope/start_url, so the app works under any sub-path.

const HEAD_SNIPPET = [
  '<link rel="manifest" href="./site.webmanifest" />',
  '<meta name="theme-color" content="#f5f5f7" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default" />',
  '<meta name="apple-mobile-web-app-title" content="Whilo" />',
  '<link rel="apple-touch-icon" href="./apple-touch-icon.png" />',
  '<link rel="icon" type="image/png" sizes="16x16" href="./favicon-16.png" />',
  '<link rel="icon" type="image/png" sizes="32x32" href="./favicon-32.png" />',
  '<link rel="icon" type="image/png" sizes="48x48" href="./favicon-48.png" />',
].join("\n    ");

const SW_SNIPPET = [
  "<script>",
  "if ('serviceWorker' in navigator) {",
  "  window.addEventListener('load', function () {",
  "    navigator.serviceWorker.register('./sw.js').catch(function () {});",
  "  });",
  "}",
  "</script>",
].join("\n    ");

function inject(html) {
  let out = html;
  if (!out.includes('rel="manifest"')) {
    out = out.replace("</head>", `    ${HEAD_SNIPPET}\n  </head>`);
  }
  if (!out.includes("serviceWorker")) {
    out = out.replace("</body>", `    ${SW_SNIPPET}\n  </body>`);
  }
  return out;
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = (config) =>
  withBaseMod(config, {
    platform: "web",
    action: async (config) => {
      const htmlPath = join(config.modRequest.projectRoot, "dist", "index.html");
      if (existsSync(htmlPath)) {
        const html = readFileSync(htmlPath, "utf8");
        const next = inject(html);
        if (next !== html) writeFileSync(htmlPath, next);
      }
      return config;
    },
  });
