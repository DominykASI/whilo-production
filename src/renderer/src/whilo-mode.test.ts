import { describe, expect, it } from "vitest";
import {
  DOTS_ONLY_TOOLS,
  DOTS_ONLY_VIEWS,
  PETS_ALLOWED_TOOLS,
  isWhiloMode,
  toolAllowedInMode,
  viewAllowedInMode,
  WHILO_MODES,
} from "@whilo/contracts/whilo-mode";

// The mode is what separates the focused Pets surface from the full Dots workspace, so the
// allow-lists are the contract both the web app and the desktop shell read. If one of these flips,
// a heavy planning tool leaks into Pets or a kept tool disappears from it.
describe("whilo mode", () => {
  it("accepts only the two named modes", () => {
    expect(WHILO_MODES).toEqual(["pets", "dots"]);
    expect(isWhiloMode("pets")).toBe(true);
    expect(isWhiloMode("dots")).toBe(true);
    expect(isWhiloMode("Pets")).toBe(false);
    expect(isWhiloMode("")).toBe(false);
    expect(isWhiloMode(null)).toBe(false);
    expect(isWhiloMode(undefined)).toBe(false);
  });

  it("keeps every tool in Dots", () => {
    for (const tool of [...DOTS_ONLY_TOOLS, ...PETS_ALLOWED_TOOLS]) {
      expect(toolAllowedInMode(tool, "dots")).toBe(true);
    }
  });

  it("hides the heavy tools in Pets and keeps the companion ones", () => {
    for (const tool of DOTS_ONLY_TOOLS) expect(toolAllowedInMode(tool, "pets")).toBe(false);
    for (const tool of PETS_ALLOWED_TOOLS) expect(toolAllowedInMode(tool, "pets")).toBe(true);
  });

  it("shows every view in Dots and refuses a Dots-only view in Pets", () => {
    for (const view of DOTS_ONLY_VIEWS) {
      expect(viewAllowedInMode(view, "dots")).toBe(true);
      expect(viewAllowedInMode(view, "pets")).toBe(false);
    }
    expect(viewAllowedInMode("agents", "pets")).toBe(true);
    expect(viewAllowedInMode("agents", "dots")).toBe(true);
  });

  it("names the heavy surfaces that must never open in Pets", () => {
    for (const surface of ["workflows", "agenda", "tasks", "usage", "sheets", "whilo-data", "server-cloud"]) {
      expect(viewAllowedInMode(surface, "pets")).toBe(false);
    }
  });
});
