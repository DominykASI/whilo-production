import { describe, expect, it } from "vitest";

import { defaultSentinelOut, isInside } from "./paths.ts";

describe("sentinel paths", () => {
  it("keeps Sentinel's files in the platform's state folder, outside the data dir", () => {
    expect(defaultSentinelOut("/Users/maus/.whilo", "darwin", "/Users/maus", {})).toBe("/Users/maus/Library/Application Support/whilo-sentinel");
    expect(defaultSentinelOut("/home/maus/.whilo", "linux", "/home/maus", {})).toBe("/home/maus/.local/state/whilo-sentinel");
    expect(defaultSentinelOut("/home/maus/.whilo", "linux", "/home/maus", { XDG_STATE_HOME: "/var/state/maus" })).toBe("/var/state/maus/whilo-sentinel");
    // a relative XDG_STATE_HOME is invalid by the spec and ignored
    expect(defaultSentinelOut("/home/maus/.whilo", "linux", "/home/maus", { XDG_STATE_HOME: "state" })).toBe("/home/maus/.local/state/whilo-sentinel");
    expect(defaultSentinelOut("C:\\Users\\maus\\.whilo", "win32", "C:\\Users\\maus", { LOCALAPPDATA: "D:\\Local" })).toBe("D:\\Local\\whilo-sentinel");
  });

  it("gives any other data dir its own subfolder, the same one every time", () => {
    const other = defaultSentinelOut("/srv/whilo-data", "linux", "/home/maus", {});
    expect(other).toMatch(/^\/home\/maus\/\.local\/state\/whilo-sentinel\/data-[0-9a-f]{12}$/);
    expect(defaultSentinelOut("/srv/whilo-data", "linux", "/home/maus", {})).toBe(other);
    expect(defaultSentinelOut("/srv/whilo-data-2", "linux", "/home/maus", {})).not.toBe(other);
  });

  it("knows when a folder is inside another", () => {
    expect(isInside("/d/whilo/sentinel", "/d/whilo", "linux")).toBe(true);
    expect(isInside("/d/whilo", "/d/whilo", "linux")).toBe(true);
    expect(isInside("/d/whilo-sentinel", "/d/whilo", "linux")).toBe(false);
    expect(isInside("/d", "/d/whilo", "linux")).toBe(false);
    expect(isInside("C:\\d\\whilo\\x", "C:\\d\\whilo", "win32")).toBe(true);
  });
});
