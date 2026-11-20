import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { migrateUserDataDirectory } from "./user-data-migration";

const appData = "/appData";

describe("migrateUserDataDirectory", () => {
  it("moves the directory of the previous name when the current one is absent", () => {
    const existing = new Set([join(appData, "Whilo Dev")]);
    const moves: Array<[string, string]> = [];

    const moved = migrateUserDataDirectory({
      appData,
      names: { current: "Whilo Dev", legacy: "Whilo Dev" },
      exists: (path) => existing.has(path),
      rename: (from, to) => moves.push([from, to]),
    });

    expect(moved).toBe(true);
    expect(moves).toEqual([[join(appData, "Whilo Dev"), join(appData, "Whilo Dev")]]);
  });

  it("keeps a directory that the current name already owns", () => {
    const existing = new Set([join(appData, "Whilo Dev"), join(appData, "Whilo Dev")]);
    const moves: Array<[string, string]> = [];

    const moved = migrateUserDataDirectory({
      appData,
      names: { current: "Whilo Dev", legacy: "Whilo Dev" },
      exists: (path) => existing.has(path),
      rename: (from, to) => moves.push([from, to]),
    });

    expect(moved).toBe(false);
    expect(moves).toEqual([]);
  });

  it("does nothing on a first launch without the previous directory", () => {
    const moves: Array<[string, string]> = [];

    const moved = migrateUserDataDirectory({
      appData,
      names: { current: "Whilo Dev", legacy: "Whilo Dev" },
      exists: () => false,
      rename: (from, to) => moves.push([from, to]),
    });

    expect(moved).toBe(false);
    expect(moves).toEqual([]);
  });

  it("reports a refused rename and lets the app start", () => {
    const failure = new Error("EBUSY: resource busy or locked");
    const reported: unknown[] = [];

    const moved = migrateUserDataDirectory({
      appData,
      names: { current: "Whilo Dev", legacy: "Whilo Dev" },
      exists: (path) => path === join(appData, "Whilo Dev"),
      rename: () => {
        throw failure;
      },
      onError: (error) => reported.push(error),
    });

    expect(moved).toBe(false);
    expect(reported).toEqual([failure]);
  });
});
