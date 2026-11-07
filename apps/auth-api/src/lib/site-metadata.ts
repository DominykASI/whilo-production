// No Vite-only import belongs in this file. `vite.config.ts` reads it, through the
// news artwork generator, while plain Node loads the config, and Node cannot
// resolve an `?url` specifier. That is why the font asset arrives as an argument
// from the root route instead of as an import here.

import { LANDING_FAQ_STRUCTURED_DATA } from "./landing-faq";
import { WHILO_ALTERNATE_DOWNLOAD_LINKS, WHILO_DOWNLOAD_LINKS } from "./landing-links";

export const WHILO_SITE_URL = "https://whilo.onerall.com/";
export const WHILO_SITE_TITLE = "Whilo: Run a team of AI agents on your computer";
export const WHILO_SITE_DESCRIPTION =
  "A free desktop app that runs AI agents as a team on your own computer, with the ChatGPT, Claude, Gemini or Grok plan you already pay for, or your own model.";
export const WHILO_SOCIAL_IMAGE_URL = `${WHILO_SITE_URL}whilo-social.png`;
/** The account `WHILO_LINKS.x` opens, which a shared card names. */
export const WHILO_X_HANDLE = "@Whilo_";
const WHILO_X_URL = "https://x.com/Whilo_";
const WHILO_REPOSITORY_URL = "https://github.com/nightly-labs/openbot";
const WHILO_PRODUCT_HUNT_URL = "https://www.producthunt.com/products/whilo-3";
const WHILO_LICENSE_URL = "https://polyformproject.org/licenses/noncommercial/1.0.0/";
// One id for each entity, so that every page describes the same organization,
// site and app, and an assistant can join what the pages say about each.
const WHILO_ORGANIZATION_ID = `${WHILO_SITE_URL}#organization`;
const WHILO_WEBSITE_ID = `${WHILO_SITE_URL}#website`;
const WHILO_APPLICATION_ID = `${WHILO_SITE_URL}#app`;
/** Square, as schema.org wants for a publisher logo. */
export const WHILO_LOGO_URL = `${WHILO_SITE_URL}icon-512x512.png`;
export const WHILO_SOCIAL_IMAGE_ALT = "Meet Whilo on a dark grid background";

/** The Open Graph tags of the site's own social card, which is 1600x900. */
export const WHILO_SOCIAL_IMAGE_META = [
  { property: "og:image", content: WHILO_SOCIAL_IMAGE_URL },
  { property: "og:image:type", content: "image/png" },
  { property: "og:image:width", content: "1600" },
  { property: "og:image:height", content: "900" },
  { property: "og:image:alt", content: WHILO_SOCIAL_IMAGE_ALT },
] as const;

// The hosts production answers on. Both serve the same pages, and those pages go by
// whilo.onerall.com.
const WHILO_PRODUCTION_HOSTS = new Set([
  "whilo.onerall.com",
  "api.whilo.onerall.com",
]);

/**
 * The site that the head tags of a page served at `pageUrl` name. Social sites fetch
 * `og:url` and `og:image` themselves and show no card when those answer 404. A
 * pull-request preview serves pages and images that whilo.onerall.com does not have yet,
 * so any host other than production names itself. Cloudflare marks preview URLs
 * `noindex`, so a preview canonical does not compete with production.
 */
export function siteUrlForPage(pageUrl: URL): string {
  return WHILO_PRODUCTION_HOSTS.has(pageUrl.hostname) ? WHILO_SITE_URL : `${pageUrl.origin}/`;
}

/** What the app's structured data names and that this file can not import: see the note at the top. */
export interface WhiloApplicationFacts {
  /** The version of the newest release. */
  version: string;
  /** An absolute URL of a picture of the app. */
  screenshot: string;
}

export function whiloSoftwareApplication(facts: WhiloApplicationFacts) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": WHILO_APPLICATION_ID,
    name: "Whilo",
    url: WHILO_SITE_URL,
    image: WHILO_SOCIAL_IMAGE_URL,
    description: WHILO_SITE_DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "AI agent app",
    operatingSystem: [
      "macOS 13 or later (Apple silicon or Intel)",
      "Windows 10 or later (x64)",
      "Linux (x64 or arm64)",
    ],
    // The installers themselves: schema.org's `downloadUrl` is the file, not a page about it.
    downloadUrl: [
      WHILO_DOWNLOAD_LINKS.macos,
      WHILO_ALTERNATE_DOWNLOAD_LINKS.macos,
      WHILO_DOWNLOAD_LINKS.windows,
      WHILO_DOWNLOAD_LINKS.linux,
      WHILO_ALTERNATE_DOWNLOAD_LINKS.linux,
    ].map((path) => new URL(path, WHILO_SITE_URL).toString()),
    // What people ask an assistant for. Keep it to what the released app does.
    featureList: [
      "Runs Codex, Claude Code, Gemini (Antigravity), Grok and OpenCode agents",
      "Uses your ChatGPT, Claude, Google AI Pro or Ultra, or Grok plan",
      "Any OpenAI-compatible model server, also one on your own computer",
      "Agents that work as a team and keep their workspace and history",
      "Chats, files and workspaces stay on your computer",
      "iPhone and Android apps that connect to your own computer",
      "Free for noncommercial use",
    ],
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    softwareVersion: facts.version,
    screenshot: facts.screenshot,
    license: WHILO_LICENSE_URL,
    publisher: { "@id": WHILO_ORGANIZATION_ID },
    sameAs: [WHILO_REPOSITORY_URL, WHILO_PRODUCT_HUNT_URL],
  } as const;
}

export type WhiloSoftwareApplication = ReturnType<typeof whiloSoftwareApplication>;

// Search engines read these two for the site name and the logo next to a result.
const WHILO_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": WHILO_ORGANIZATION_ID,
  name: "Whilo",
  url: WHILO_SITE_URL,
  logo: WHILO_LOGO_URL,
  sameAs: [WHILO_REPOSITORY_URL, WHILO_X_URL, WHILO_PRODUCT_HUNT_URL],
} as const;

const WHILO_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WHILO_WEBSITE_ID,
  name: "Whilo",
  url: WHILO_SITE_URL,
  publisher: { "@id": WHILO_ORGANIZATION_ID },
} as const;

export const WHILO_SECURITY_HEADERS = {
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
} as const;

/**
 * @param interLatinFont The hashed URL of Inter's upright latin range, the one font
 * file this site downloads. It is reached through two levels of CSS `@import`, so a
 * browser only learns of it after the stylesheet has parsed. That is late enough
 * that the first paint uses a fallback face and every line of text moves when Inter
 * replaces it. The caller passes the same hashed asset the `@font-face` rule asks
 * for, so the preload below is that request and not a second one.
 */
export function whiloRootHead(interLatinFont: string) {
  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: WHILO_SITE_TITLE },
      { name: "description", content: WHILO_SITE_DESCRIPTION },
      { name: "application-name", content: "Whilo" },
      { name: "color-scheme", content: "dark" },
      { name: "theme-color", content: "#1a1a1a" },
    ],
    links: [
      {
        rel: "preload",
        as: "font" as const,
        type: "font/woff2",
        href: interLatinFont,
        crossorigin: "anonymous" as const,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  };
}

export function whiloHomeHead(application: WhiloSoftwareApplication) {
  return {
    meta: [
      { "script:ld+json": application },
      { "script:ld+json": WHILO_ORGANIZATION },
      { "script:ld+json": WHILO_WEBSITE },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Whilo" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: WHILO_SITE_URL },
      { property: "og:title", content: WHILO_SITE_TITLE },
      { property: "og:description", content: WHILO_SITE_DESCRIPTION },
      ...WHILO_SOCIAL_IMAGE_META,
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: WHILO_X_HANDLE },
      { name: "twitter:title", content: WHILO_SITE_TITLE },
      { name: "twitter:description", content: WHILO_SITE_DESCRIPTION },
      { name: "twitter:image", content: WHILO_SOCIAL_IMAGE_URL },
      { name: "twitter:image:alt", content: WHILO_SOCIAL_IMAGE_ALT },
      { "script:ld+json": LANDING_FAQ_STRUCTURED_DATA },
    ],
    links: [{ rel: "canonical", href: WHILO_SITE_URL }],
  };
}
