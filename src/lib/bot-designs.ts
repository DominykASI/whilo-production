import type { LocaleKey } from "@/locales";
import type { MascotFaceColor } from "../../shared/bot-avatar";
import type { BotBodyId } from "../../shared/bot-body";
import type { MausColor, MausState } from "@/lib/mascot";
import type { AvatarPatch } from "@/components/avatar-editing";

interface BotLook {
  color: MausColor;
  mascotBody?: BotBodyId | null;
  mascotExpression?: string | null;
  mascotFaceColor?: MascotFaceColor | null;
}

export type BotDesignOrigin = "landing" | "mascot";

export interface BotDesign {
  id: string;
  name: LocaleKey;
  note: LocaleKey;
  body: BotBodyId;
  color: MausColor;
  face: MausState;
  faceColor: MascotFaceColor | null;
  origin: BotDesignOrigin;
}

export const BOT_DESIGNS: readonly BotDesign[] = [
  {
    id: "ada",
    name: "botDesign.name.ada",
    note: "botDesign.note.ada",
    body: "diamond",
    color: "purple",
    face: "idle",
    faceColor: null,
    origin: "landing",
  },
  {
    id: "linus",
    name: "botDesign.name.linus",
    note: "botDesign.note.linus",
    body: "blob",
    color: "green",
    face: "working",
    faceColor: null,
    origin: "landing",
  },
  {
    id: "grace",
    name: "botDesign.name.grace",
    note: "botDesign.note.grace",
    body: "pentagon",
    color: "orange",
    face: "proud",
    faceColor: null,
    origin: "landing",
  },
  {
    id: "alan",
    name: "botDesign.name.alan",
    note: "botDesign.note.alan",
    body: "square",
    color: "cyan",
    face: "curious",
    faceColor: null,
    origin: "landing",
  },
  {
    id: "scout",
    name: "botDesign.name.scout",
    note: "botDesign.note.scout",
    body: "star",
    color: "yellow",
    face: "curious",
    faceColor: null,
    origin: "mascot",
  },
  {
    id: "warden",
    name: "botDesign.name.warden",
    note: "botDesign.note.warden",
    body: "shield",
    color: "red",
    face: "suspicious",
    faceColor: null,
    origin: "mascot",
  },
  {
    id: "hermit",
    name: "botDesign.name.hermit",
    note: "botDesign.note.hermit",
    body: "capsule",
    color: "teal",
    face: "drowsy",
    faceColor: null,
    origin: "mascot",
  },
  {
    id: "courier",
    name: "botDesign.name.courier",
    note: "botDesign.note.courier",
    body: "drop",
    color: "coral",
    face: "happy",
    faceColor: null,
    origin: "mascot",
  },
  {
    id: "oracle",
    name: "botDesign.name.oracle",
    note: "botDesign.note.oracle",
    body: "cloud",
    color: "silver",
    face: "thinking",
    faceColor: null,
    origin: "mascot",
  },
  {
    id: "navigator",
    name: "botDesign.name.navigator",
    note: "botDesign.note.navigator",
    body: "triangle",
    color: "blue",
    face: "searching",
    faceColor: null,
    origin: "mascot",
  },
  {
    id: "keeper",
    name: "botDesign.name.keeper",
    note: "botDesign.note.keeper",
    body: "hexagon",
    color: "pink",
    face: "listening",
    faceColor: null,
    origin: "mascot",
  },
  {
    id: "nova",
    name: "botDesign.name.nova",
    note: "botDesign.note.nova",
    body: "circle",
    color: "chrome",
    face: "idle",
    faceColor: null,
    origin: "mascot",
  },
];

export const BOT_DESIGN_IDS: readonly string[] = BOT_DESIGNS.map((design) => design.id);

export function botDesign(id: string): BotDesign | undefined {
  return BOT_DESIGNS.find((design) => design.id === id);
}

/** The patch that dresses a bot in a design: the look is the body, the colour and the face. */
export function botDesignPatch(design: BotDesign): AvatarPatch {
  return {
    avatarCrop: "mascot",
    color: design.color,
    mascotBody: design.body,
    mascotExpression: design.face,
    mascotFaceColor: design.faceColor,
  };
}

/** True when the bot already wears the design, so the grid can mark it. */
export function botWearsDesign(bot: BotLook, design: BotDesign): boolean {
  return (
    bot.color === design.color &&
    (bot.mascotBody ?? "cursor") === design.body &&
    (bot.mascotExpression ?? "idle") === design.face &&
    (bot.mascotFaceColor ?? null) === design.faceColor
  );
}
