import test from "node:test";
import assert from "node:assert/strict";
import { buildWhiloUnifiedUrl, normalizeWhiloMode, normalizeWhiloUnifiedUrl, resolveWhiloSurface, withWhiloMode } from "./whilo-surface.mjs";

test("normalizeWhiloMode defaults to pets", () => {
  assert.equal(normalizeWhiloMode(), "pets");
  assert.equal(normalizeWhiloMode("DOTS"), "dots");
  assert.equal(normalizeWhiloMode("bogus"), "pets");
});

test("normalizeWhiloUnifiedUrl accepts http(s) and rejects credentials/javascript", () => {
  assert.equal(normalizeWhiloUnifiedUrl("https://whilo.example/app")?.origin, "https://whilo.example");
  assert.equal(normalizeWhiloUnifiedUrl("http://127.0.0.1:5173")?.toString(), "http://127.0.0.1:5173/");
  assert.equal(normalizeWhiloUnifiedUrl("javascript:alert(1)"), null);
  assert.equal(normalizeWhiloUnifiedUrl("https://u:p@x.test/"), null);
  assert.equal(normalizeWhiloUnifiedUrl(""), null);
});

test("buildWhiloUnifiedUrl merges mode", () => {
  assert.equal(buildWhiloUnifiedUrl("https://w.test/app?x=1", "dots"), "https://w.test/app?x=1&mode=dots");
  assert.equal(buildWhiloUnifiedUrl("https://w.test/app?mode=pets", "dots"), "https://w.test/app?mode=dots");
});

test("resolveWhiloSurface falls back to local by default", () => {
  const s = resolveWhiloSurface({ env: {}, localUrl: "http://127.0.0.1:8799" });
  assert.equal(s.kind, "local");
  assert.equal(s.configured, false);
});

test("resolveWhiloSurface returns unified when configured", () => {
  const s = resolveWhiloSurface({ env: { WHILO_UNIFIED_URL: "https://w.test", WHILO_MODE: "dots" } });
  assert.equal(s.kind, "unified");
  assert.equal(s.mode, "dots");
  assert.equal(s.trusted, true);
  assert.match(s.url, /mode=dots/);
});

test("withWhiloMode rewrites same-origin unified URL", () => {
  const s = resolveWhiloSurface({ env: { WHILO_UNIFIED_URL: "https://w.test/app" } });
  assert.equal(withWhiloMode("https://w.test/other?mode=pets", "dots", s), "https://w.test/other?mode=dots");
  assert.equal(withWhiloMode("https://evil.test/app", "dots", s), null);
});
