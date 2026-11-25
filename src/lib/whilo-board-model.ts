/**
 * The Whilo board document: the model behind Whilo Whiteboard, Whilo Sheets and Whilo Data.
 *
 * One board is a list of nodes and the connections drawn between them, plus the camera the user
 * left it at. The document is framework-free and side-effect free, so the canvas, the spreadsheet
 * view and the AI tools all read and write the same shape. Persistence is defensive: anything read
 * back from storage is validated before it reaches the canvas, the same way the team canvas treats
 * its saved positions.
 */

import type { Edge, Node, Viewport } from "@xyflow/react";

/** What a node is. The kind decides its card look and what its fields mean. */
export type WhiloNodeKind =
  | "note"
  | "text"
  | "shape"
  | "frame"
  | "prompt"
  | "agent"
  | "llm"
  | "output"
  | "condition"
  | "image"
  | "data";

/** The colors a shape or note can take; resolved to theme tokens by the canvas. */
export type WhiloNodeTone = "default" | "accent" | "success" | "warning" | "danger" | "neutral";

export interface WhiloNodeData extends Record<string, unknown> {
  kind: WhiloNodeKind;
  /** The headline of the card. Empty for a bare shape. */
  title: string;
  /** The body: a note's text, a prompt's instruction, a node's description. */
  text: string;
  tone: WhiloNodeTone;
  /** Free-form tags, shown as chips. */
  tags?: string[];
  /** For `agent` and `llm` nodes: the bot or model the node stands for. */
  agentId?: string;
  model?: string;
  /** For `condition` nodes: the expression the branch tests. */
  expression?: string;
  /** For `data` nodes: the row source the grid shows. */
  source?: string;
}

export interface WhiloBoardNode extends Node<WhiloNodeData> {}

export interface WhiloBoardEdge extends Edge {}

export interface WhiloBoardDoc {
  id: string;
  name: string;
  nodes: WhiloBoardNode[];
  edges: WhiloBoardEdge[];
  viewport: Viewport;
  createdAt: number;
  updatedAt: number;
}

export const WHILO_BOARD_VERSION = 1;

const NODE_KINDS: ReadonlySet<string> = new Set<WhiloNodeKind>([
  "note",
  "text",
  "shape",
  "frame",
  "prompt",
  "agent",
  "llm",
  "output",
  "condition",
  "image",
  "data",
]);

const NODE_TONES: ReadonlySet<string> = new Set<WhiloNodeTone>([
  "default",
  "accent",
  "success",
  "warning",
  "danger",
  "neutral",
]);

const MAX_COORD = 1_000_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) < MAX_COORD ? value : fallback;
}

function stringOr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** A fresh id for a node, edge or board. Prefixed so a raw dump is readable. */
export function whiloBoardId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

/** A new node of a kind, placed where the user asked. */
export function createWhiloNode(
  kind: WhiloNodeKind,
  position: { x: number; y: number },
  overrides: Partial<WhiloNodeData> = {},
): WhiloBoardNode {
  return {
    id: whiloBoardId(kind),
    type: kind,
    position,
    data: {
      kind,
      title: defaultTitle(kind),
      text: "",
      tone: kind === "frame" ? "neutral" : "default",
      ...overrides,
    },
  };
}

function defaultTitle(kind: WhiloNodeKind): string {
  switch (kind) {
    case "note":
      return "";
    case "text":
      return "";
    case "shape":
      return "";
    case "frame":
      return "";
    case "prompt":
      return "";
    case "agent":
      return "";
    case "llm":
      return "";
    case "output":
      return "";
    case "condition":
      return "";
    case "image":
      return "";
    case "data":
      return "";
    default:
      return "";
  }
}

export function createWhiloBoard(name: string): WhiloBoardDoc {
  const now = Date.now();
  return {
    id: whiloBoardId("board"),
    name,
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: now,
    updatedAt: now,
  };
}

function parseNode(raw: unknown): WhiloBoardNode | null {
  if (!isRecord(raw)) return null;
  const id = stringOr(raw.id);
  if (!id) return null;
  const position = isRecord(raw.position) ? raw.position : {};
  const data = isRecord(raw.data) ? raw.data : {};
  const kind = NODE_KINDS.has(stringOr(data.kind)) ? (data.kind as WhiloNodeKind) : "note";
  const tone = NODE_TONES.has(stringOr(data.tone)) ? (data.tone as WhiloNodeTone) : "default";
  const tags = Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : undefined;
  const width = finiteOr(raw.width, 0);
  const height = finiteOr(raw.height, 0);
  return {
    id,
    type: kind,
    position: { x: finiteOr(position.x, 0), y: finiteOr(position.y, 0) },
    ...(width > 0 ? { width } : {}),
    ...(height > 0 ? { height } : {}),
    ...(typeof raw.parentId === "string" ? { parentId: raw.parentId } : {}),
    ...(typeof raw.selected === "boolean" ? { selected: raw.selected } : {}),
    ...(Number.isFinite(raw.zIndex as number) ? { zIndex: raw.zIndex as number } : {}),
    data: {
      kind,
      title: stringOr(data.title),
      text: stringOr(data.text),
      tone,
      ...(tags ? { tags } : {}),
      ...(typeof data.agentId === "string" ? { agentId: data.agentId } : {}),
      ...(typeof data.model === "string" ? { model: data.model } : {}),
      ...(typeof data.expression === "string" ? { expression: data.expression } : {}),
      ...(typeof data.source === "string" ? { source: data.source } : {}),
    },
  };
}

function parseEdge(raw: unknown, nodeIds: ReadonlySet<string>): WhiloBoardEdge | null {
  if (!isRecord(raw)) return null;
  const id = stringOr(raw.id);
  const source = stringOr(raw.source);
  const target = stringOr(raw.target);
  if (!id || !source || !target) return null;
  if (!nodeIds.has(source) || !nodeIds.has(target)) return null;
  return {
    id,
    source,
    target,
    ...(typeof raw.sourceHandle === "string" ? { sourceHandle: raw.sourceHandle } : {}),
    ...(typeof raw.targetHandle === "string" ? { targetHandle: raw.targetHandle } : {}),
    ...(typeof raw.label === "string" ? { label: raw.label } : {}),
    ...(raw.type === "smoothstep" || raw.type === "bezier" || raw.type === "step"
      ? { type: raw.type }
      : { type: "smoothstep" }),
    animated: raw.animated === true,
  };
}

/** Reads a stored board, dropping anything malformed rather than failing the whole load. */
export function parseWhiloBoard(raw: unknown, fallbackId: string, fallbackName: string): WhiloBoardDoc {
  if (!isRecord(raw)) return createWhiloBoard(fallbackName);
  const nodes = Array.isArray(raw.nodes)
    ? raw.nodes.map(parseNode).filter((node): node is WhiloBoardNode => node !== null)
    : [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = Array.isArray(raw.edges)
    ? raw.edges.map((edge) => parseEdge(edge, nodeIds)).filter((edge): edge is WhiloBoardEdge => edge !== null)
    : [];
  const viewport = isRecord(raw.viewport) ? raw.viewport : {};
  const zoom = finiteOr(viewport.zoom, 1);
  return {
    id: stringOr(raw.id, fallbackId) || fallbackId,
    name: stringOr(raw.name, fallbackName) || fallbackName,
    nodes,
    edges,
    viewport: {
      x: finiteOr(viewport.x, 0),
      y: finiteOr(viewport.y, 0),
      zoom: Math.min(4, Math.max(0.1, zoom)),
    },
    createdAt: finiteOr(raw.createdAt, Date.now()),
    updatedAt: finiteOr(raw.updatedAt, Date.now()),
  };
}

export function serializeWhiloBoard(doc: WhiloBoardDoc): string {
  return JSON.stringify({
    version: WHILO_BOARD_VERSION,
    id: doc.id,
    name: doc.name,
    viewport: doc.viewport,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    nodes: doc.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      ...(node.width ? { width: node.width } : {}),
      ...(node.height ? { height: node.height } : {}),
      ...(node.parentId ? { parentId: node.parentId } : {}),
      ...(node.zIndex !== undefined ? { zIndex: node.zIndex } : {}),
      data: node.data,
    })),
    edges: doc.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      ...(edge.sourceHandle ? { sourceHandle: edge.sourceHandle } : {}),
      ...(edge.targetHandle ? { targetHandle: edge.targetHandle } : {}),
      ...(typeof edge.label === "string" ? { label: edge.label } : {}),
      type: edge.type ?? "smoothstep",
      animated: edge.animated === true,
    })),
  });
}

/** Every board on this computer is stored under one key, keyed by environment, like the team canvas. */
export function whiloBoardStorageKey(environmentId: string): string {
  return `whilo-whilo-boards:${environmentId}`;
}

export interface WhiloBoardIndexEntry {
  id: string;
  name: string;
  updatedAt: number;
  nodeCount: number;
}

/** The list of boards kept alongside the docs, so the picker does not parse every board. */
export function whiloBoardIndexKey(environmentId: string): string {
  return `${whiloBoardStorageKey(environmentId)}:index`;
}

export function parseWhiloBoardIndex(raw: unknown): WhiloBoardIndexEntry[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: WhiloBoardIndexEntry[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    const id = stringOr(entry.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      name: stringOr(entry.name, "Board"),
      updatedAt: finiteOr(entry.updatedAt, 0),
      nodeCount: finiteOr(entry.nodeCount, 0),
    });
  }
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * A plain-text outline of a board, one line per node and one per connection. This is what the AI
 * tools return to the model, so it stays short and reads like a document, not a JSON dump.
 */
export function whiloBoardOutline(doc: WhiloBoardDoc): string {
  const lines: string[] = [`# ${doc.name}`, ""];
  if (doc.nodes.length === 0) {
    lines.push("(empty board)");
    return lines.join("\n");
  }
  for (const node of doc.nodes) {
    const { kind, title, text, expression } = node.data;
    const head = title ? `${title}` : `(${kind})`;
    lines.push(`- [${node.id}] ${kind}: ${head}`);
    if (text) lines.push(`    ${text.replace(/\n/g, "\n    ")}`);
    if (expression) lines.push(`    when ${expression}`);
  }
  if (doc.edges.length > 0) {
    lines.push("", "Connections:");
    for (const edge of doc.edges) {
      lines.push(`- ${edge.source} -> ${edge.target}${edge.label ? ` (${edge.label})` : ""}`);
    }
  }
  return lines.join("\n");
}
