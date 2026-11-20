import { Effect, Schema } from "effect";
import { WHILO_LINKS } from "../lib/landing-links";

export type AvailableDownloadPlatform = "linux" | "macos" | "windows";

/**
 * `latest-mac.yml` lists the Apple silicon and the Intel installer, so a macOS download also names
 * its architecture. electron-builder puts `arm64` in the Apple silicon asset name and no
 * architecture suffix that contains it in the Intel one. Linux has one manifest per architecture,
 * and Windows ships x64 only.
 */
export type DownloadArchitecture = "arm64" | "x64";

/**
 * The product prefix an installer carries, most wanted first. `Whilo` is the name of the product, and
 * `electron-builder.yml` writes it into every artifact through `${productName}`. Releases cut before
 * the rename still carry `OpenBot`, and their names are the ones in the manifests that the
 * `releases/latest` feed serves today, so the resolver prefers a `Whilo-…` asset and falls back to
 * the `OpenBot-…` one rather than 404. The fallback goes out of use on its own, the first time a
 * release is published under the new name.
 */
export const INSTALLER_PRODUCT_NAMES = ["Whilo", "OpenBot"] as const;

type InstallerProductName = (typeof INSTALLER_PRODUCT_NAMES)[number];

interface DownloadManifestConfig {
  /**
   * Compared against a lowercased asset name, so it must be lowercase itself. The Linux asset is
   * published as `.AppImage`.
   */
  extension: ".appimage" | ".dmg" | ".exe";
  manifest: "latest-linux-arm64.yml" | "latest-linux.yml" | "latest-mac.yml" | "latest.yml";
}

const RELEASES_BASE_URL = `${WHILO_LINKS.releases}`;

const DOWNLOAD_PLATFORMS = ["linux", "macos", "windows"] as const satisfies readonly AvailableDownloadPlatform[];

function downloadManifest(
  platform: AvailableDownloadPlatform,
  architecture: DownloadArchitecture,
): DownloadManifestConfig {
  if (platform === "linux")
    return {
      extension: ".appimage",
      manifest: architecture === "arm64" ? "latest-linux-arm64.yml" : "latest-linux.yml",
    };
  if (platform === "macos") return { extension: ".dmg", manifest: "latest-mac.yml" };
  return { extension: ".exe", manifest: "latest.yml" };
}

export function isAvailableDownloadPlatform(value: string): value is AvailableDownloadPlatform {
  return DOWNLOAD_PLATFORMS.some((platform) => platform === value);
}

/**
 * The architecture a `?arch=` value asks for. Most Macs are Apple silicon and most Linux computers
 * are x64, so anything else gets those. Windows has only the x64 installer.
 */
export function downloadArchitecture(platform: AvailableDownloadPlatform, arch: string | null): DownloadArchitecture {
  if (platform === "macos") return arch === "x64" ? "x64" : "arm64";
  if (platform === "linux") return arch === "arm64" ? "arm64" : "x64";
  return "x64";
}

function redirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      "cache-control": "no-store",
      location,
    },
  });
}

/**
 * The installer a manifest offers, and the name the file should carry.
 *
 * `asset` is the name in the manifest, which is the name of the published file and the only name
 * that fetches bytes. `fileName` is that same release named for the product, so a release published
 * as `OpenBot-0.74.0-arm64.dmg` reads as `Whilo-0.74.0-arm64.dmg`. `productName` says which prefix
 * the release really published, for the log line that a stale release needs.
 */
export interface ResolvedInstaller {
  asset: string;
  fileName: string;
  productName: InstallerProductName;
}

/** The same release named for the product: the pre-rename `OpenBot-0.74.0-arm64.dmg` reads as `Whilo-…`. */
function whiloFileName(asset: string): string {
  const prefix = INSTALLER_PRODUCT_NAMES.find((name) => asset.startsWith(`${name}-`));
  return prefix === undefined || prefix === "Whilo" ? asset : `Whilo${asset.slice(prefix.length)}`;
}

/**
 * The installer the manifest holds for an extension, and for one architecture on macOS. A release
 * that ships both prefixes resolves to `Whilo`; one that ships only the pre-rename prefix still
 * resolves, so the button keeps working while that release waits to be republished.
 */
function findInstaller(
  manifest: string,
  extension: DownloadManifestConfig["extension"],
  macArchitecture: DownloadArchitecture | undefined,
): ResolvedInstaller | undefined {
  const assets: string[] = [];
  for (const match of manifest.matchAll(/^\s*-\s+url:\s*["']?([^\s"']+)["']?\s*$/gim)) {
    const asset = match[1];
    if (!asset?.toLowerCase().endsWith(extension) || !/^[a-z0-9][a-z0-9._+-]+$/i.test(asset)) continue;
    if (macArchitecture && asset.toLowerCase().includes("arm64") !== (macArchitecture === "arm64")) continue;
    assets.push(asset);
  }
  // The product order decides first. Within one prefix the manifest order stays, which is the newest
  // build of that archive.
  for (const productName of INSTALLER_PRODUCT_NAMES) {
    const asset = assets.find((candidate) => candidate.startsWith(`${productName}-`));
    if (asset) return { asset, fileName: whiloFileName(asset), productName };
  }
  return undefined;
}

/**
 * The releases page is a working answer but not the one that was asked for, so each fallback says
 * why. Written to the Worker log rather than to analytics: a server event has no session, and the
 * landing reports are defined on sessions. Platform and reason only, never a URL or a response body.
 */
function fallbackToReleases(platform: AvailableDownloadPlatform, reason: string): Response {
  console.warn(`latest-download: serving the releases page for ${platform} (${reason})`);
  return redirect(WHILO_LINKS.releases);
}

class DownloadManifestError extends Schema.TaggedError<DownloadManifestError>()("DownloadManifestError", {}) {}

const latestDownload = Effect.fn("LatestDownload.resolve")(function* (
  platform: AvailableDownloadPlatform,
  fetcher: typeof fetch,
  architecture: DownloadArchitecture,
) {
  const config = downloadManifest(platform, architecture);
  const manifestUrl = `${RELEASES_BASE_URL}/latest/download/${config.manifest}`;
  const response = yield* Effect.tryPromise({
    try: (signal) =>
      fetcher(manifestUrl, {
        headers: { accept: "text/yaml, text/plain" },
        signal: AbortSignal.any([signal, AbortSignal.timeout(5_000)]),
      }),
    catch: () => new DownloadManifestError({}),
  });
  if (!response.ok) return fallbackToReleases(platform, `manifest status ${response.status}`);
  const manifest = yield* Effect.tryPromise({
    try: () => response.text(),
    catch: () => new DownloadManifestError({}),
  });
  // Only the macOS manifest lists two architectures.
  const installer = findInstaller(manifest, config.extension, platform === "macos" ? architecture : undefined);
  if (!installer) return fallbackToReleases(platform, `no ${config.extension} asset in the manifest`);
  if (installer.productName !== "Whilo") {
    // The published release predates the rename, so the file a visitor receives is still called
    // `OpenBot-…`. A republish (`bun run dist:*`) is the fix, not a code change: GitHub sets the
    // download's `Content-Disposition` from the asset's own name, and a redirect cannot override it,
    // so no header this Worker adds can rename the file.
    console.warn(
      `latest-download: ${platform} serves the pre-rename asset ${installer.asset}; a release published as ${installer.fileName} replaces it`,
    );
  }
  return redirect(`${RELEASES_BASE_URL}/latest/download/${encodeURIComponent(installer.asset)}`);
});

export function latestDownloadResponse(
  platform: AvailableDownloadPlatform,
  fetcher: typeof fetch = fetch,
  architecture: DownloadArchitecture = downloadArchitecture(platform, null),
) {
  return latestDownload(platform, fetcher, architecture).pipe(
    Effect.catch(() => Effect.sync(() => fallbackToReleases(platform, "the manifest request failed"))),
  );
}
