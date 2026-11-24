import { MASCOT_BODIES, type MascotBody } from "./mascot-bodies.ts";

/** The bodies OpenMausBot ships that this catalog did not carry, in the order the picker adds them. */
export const MASCOT_BODY_IDS_EXTRA = ["triangle", "square", "pentagon", "cloud"] as const;

export type MascotBodyIdExtra = (typeof MASCOT_BODY_IDS_EXTRA)[number];

export type MascotBodyExtra = MascotBody;

/** The same entries the catalog holds, seen only as the bodies openbot brought over. */
export const MASCOT_BODIES_EXTRA: Record<MascotBodyIdExtra, MascotBodyExtra> = {
  triangle: MASCOT_BODIES.triangle,
  square: MASCOT_BODIES.square,
  pentagon: MASCOT_BODIES.pentagon,
  cloud: MASCOT_BODIES.cloud,
};
