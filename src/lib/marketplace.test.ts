import { describe, expect, it } from "vitest";

import {
  MARKETPLACE_EXPERTS,
  MARKETPLACE_PLUGINS,
  MARKETPLACE_TABS,
  bankShelf,
  marketplaceTab,
  matchBank,
} from "@/lib/marketplace";

describe("marketplace", () => {
  it("lists the five shelves in the order the tab bar shows them", () => {
    expect(MARKETPLACE_TABS.map((tab) => tab.id)).toEqual(["apps", "plugins", "experts", "skills", "banks"]);
  });

  it("gives every shelf a unique id, a label and a description", () => {
    const ids = MARKETPLACE_TABS.map((tab) => tab.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const tab of MARKETPLACE_TABS) {
      expect(tab.labelKey).toBeTruthy();
      expect(tab.descriptionKey).toBeTruthy();
      expect(tab.icon).toBeTruthy();
    }
  });

  it("resolves a shelf by id and refuses an unknown one", () => {
    expect(marketplaceTab("banks").id).toBe("banks");
    expect(() => marketplaceTab("nope" as never)).toThrow();
  });

  it("keeps plugin ids unique and marks each one included or not", () => {
    const ids = MARKETPLACE_PLUGINS.map((plugin) => plugin.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(MARKETPLACE_PLUGINS.some((plugin) => plugin.included)).toBe(true);
    for (const plugin of MARKETPLACE_PLUGINS) expect(plugin.capability).toBeTruthy();
  });

  it("gives every expert a role and at least one task it is sold to do", () => {
    const ids = MARKETPLACE_EXPERTS.map((expert) => expert.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const expert of MARKETPLACE_EXPERTS) {
      expect(expert.role).toBeTruthy();
      expect(expert.does.length).toBeGreaterThan(0);
    }
  });

  it("groups the banks catalogue without dropping a single institution", () => {
    const groups = bankShelf();
    const all = groups.flatMap((group) => group.banks);
    expect(all.length).toBeGreaterThan(200);
    expect(groups[0]?.kind).toBe("banco");
    expect(new Set(all.map((bank) => bank.compe)).size).toBe(all.length);
  });

  it("matches a bank by name, short name and COMPE code", () => {
    const santander = { compe: "033", name: "Banco Santander", short: "Santander", kind: "banco" as const };
    expect(matchBank(santander, "santander")).toBe(true);
    expect(matchBank(santander, "033")).toBe(true);
    expect(matchBank(santander, "itau")).toBe(false);
    expect(matchBank(santander, "")).toBe(true);
  });
});
