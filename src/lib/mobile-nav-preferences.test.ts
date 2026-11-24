import { describe, expect, it } from "vitest";

import {
  MOBILE_NAV_CATALOG,
  MOBILE_NAV_DEFAULT,
  MOBILE_NAV_MAX_ITEMS,
  moveMobileNav,
  parseMobileNav,
  swapMobileNav,
} from "@/lib/mobile-nav-preferences";
import { MARKETPLACE_TABS } from "@/lib/marketplace";

describe("mobile nav catalog", () => {
  it("offers every surface the sidebar has, plus the two panel entries", () => {
    for (const id of ["chat", "workflows", "agenda", "tasks", "usage", "library", "server-cloud", "plans", "marketplace", "files", "apps", "store"]) {
      expect(MOBILE_NAV_CATALOG).toContain(id);
    }
  });

  it("keeps the catalog free of duplicates", () => {
    expect(new Set(MOBILE_NAV_CATALOG).size).toBe(MOBILE_NAV_CATALOG.length);
  });

  it("starts with four reachable slots, all of them in the catalog", () => {
    expect(MOBILE_NAV_DEFAULT).toHaveLength(MOBILE_NAV_MAX_ITEMS);
    for (const id of MOBILE_NAV_DEFAULT) expect(MOBILE_NAV_CATALOG).toContain(id);
  });

  it("parses a stored choice, keeps at most four and drops unknown ids", () => {
    expect(parseMobileNav(JSON.stringify(["chat", "marketplace", "bogus", "plans", "store", "files"])))
      .toEqual(["chat", "marketplace", "plans", "store"]);
  });

  it("falls back to the default when the stored value is empty or broken", () => {
    expect(parseMobileNav("[]")).toEqual([...MOBILE_NAV_DEFAULT]);
    expect(parseMobileNav("{oops")).toEqual([...MOBILE_NAV_DEFAULT]);
    expect(parseMobileNav(null)).toEqual([...MOBILE_NAV_DEFAULT]);
  });

  it("swaps a slot for a catalog item that is not on the bar yet", () => {
    const next = swapMobileNav(["chat", "workflows", "agenda", "store"], "marketplace", 3);
    expect(next).toEqual(["chat", "workflows", "agenda", "marketplace"]);
    expect(next).toHaveLength(MOBILE_NAV_MAX_ITEMS);
  });

  it("reorders without losing a slot", () => {
    expect(moveMobileNav(["chat", "workflows", "agenda", "store"], "store", 0))
      .toEqual(["store", "chat", "workflows", "agenda"]);
  });

  it("names every marketplace tab it can place on the bar", () => {
    expect(MARKETPLACE_TABS).toHaveLength(5);
    expect(MOBILE_NAV_CATALOG).toContain("marketplace");
  });
});
