import { describe, expect, it } from "vitest";
import {
  createWhiloBoard,
  createWhiloNode,
  parseWhiloBoard,
  parseWhiloBoardIndex,
  serializeWhiloBoard,
  whiloBoardId,
  whiloBoardOutline,
} from "./whilo-board-model";
import { applyBoardOps, parseBoardOps } from "../components/whilo-board/BoardChat";

describe("whilo board model", () => {
  it("creates a node of a kind with a readable id", () => {
    const node = createWhiloNode("note", { x: 10, y: 20 }, { text: "hello" });
    expect(node.type).toBe("note");
    expect(node.data.kind).toBe("note");
    expect(node.data.text).toBe("hello");
    expect(node.position).toEqual({ x: 10, y: 20 });
    expect(node.id.startsWith("note-")).toBe(true);
    expect(whiloBoardId("edge").startsWith("edge-")).toBe(true);
  });

  it("round-trips a board through serialize and parse", () => {
    const board = createWhiloBoard("Plan");
    board.nodes = [createWhiloNode("agent", { x: 1, y: 2 }, { title: "Scout", agentId: "bot-1", tone: "accent" })];
    board.edges = [{ id: "edge-1", source: board.nodes[0].id, target: board.nodes[0].id, type: "smoothstep" }];
    board.viewport = { x: 12, y: -8, zoom: 1.4 };
    const back = parseWhiloBoard(JSON.parse(serializeWhiloBoard(board)), "fallback", "Fallback");
    expect(back.name).toBe("Plan");
    expect(back.nodes).toHaveLength(1);
    expect(back.nodes[0].data.agentId).toBe("bot-1");
    expect(back.nodes[0].data.tone).toBe("accent");
    expect(back.viewport).toEqual({ x: 12, y: -8, zoom: 1.4 });
    expect(back.edges).toHaveLength(1);
  });

  it("drops malformed nodes and edges rather than failing the whole load", () => {
    const parsed = parseWhiloBoard(
      {
        name: "Broken",
        nodes: [
          { id: "a", type: "note", position: { x: "nope", y: 0 }, data: { kind: "note" } },
          { nope: true },
          { id: "b", data: {} },
        ],
        edges: [
          { id: "e1", source: "a", target: "missing" },
          { id: "e2", source: "a", target: "b" },
        ],
        viewport: { x: 0, y: 0, zoom: 99 },
      },
      "f",
      "F",
    );
    expect(parsed.nodes.map((node) => node.id)).toEqual(["a", "b"]);
    expect(parsed.nodes[0].position.x).toBe(0);
    expect(parsed.nodes[0].data.kind).toBe("note");
    // the edge to a missing node is dropped; the zoom is clamped to the canvas ceiling.
    expect(parsed.edges.map((edge) => edge.id)).toEqual(["e2"]);
    expect(parsed.viewport.zoom).toBe(4);
  });

  it("rejects non-objects and prototype-polluting position keys", () => {
    expect(parseWhiloBoard(null, "id", "Name").name).toBe("Name");
    expect(parseWhiloBoard("nope", "id", "Name").nodes).toEqual([]);
    const index = parseWhiloBoardIndex([{ id: "x", name: "X", updatedAt: 5, nodeCount: 2 }, { id: "x" }, 42, { noId: 1 }]);
    expect(index).toHaveLength(1);
    expect(index[0]).toEqual({ id: "x", name: "X", updatedAt: 5, nodeCount: 2 });
  });

  it("writes an outline the model can read back", () => {
    const board = createWhiloBoard("Board");
    const a = createWhiloNode("note", { x: 0, y: 0 }, { title: "First", text: "line one\nline two" });
    const b = createWhiloNode("agent", { x: 0, y: 0 }, { title: "Scout" });
    board.nodes = [a, b];
    board.edges = [{ id: "e", source: a.id, target: b.id, type: "smoothstep", label: "then" }];
    const outline = whiloBoardOutline(board);
    expect(outline).toContain("# Board");
    expect(outline).toContain(`[${a.id}] note: First`);
    expect(outline).toContain("line one");
    expect(outline).toContain(`${a.id} -> ${b.id} (then)`);
  });

  it("says an empty board is empty", () => {
    expect(whiloBoardOutline(createWhiloBoard("Empty"))).toContain("(empty board)");
  });
});

describe("board assistant operations", () => {
  it("applies add, update, remove and connect", () => {
    const board = createWhiloBoard("B");
    const first = applyBoardOps(board, [{ op: "add", kind: "note", title: "A", x: 5, y: 6 }]);
    expect(first.nodes).toHaveLength(1);
    const id = first.nodes[0].id;
    const renamed = applyBoardOps(first, [{ op: "update", id, text: "changed" }]);
    expect(renamed.nodes[0].data.text).toBe("changed");
    const inserted = applyBoardOps(renamed, [{ op: "add", kind: "agent", title: "Scout" }]);
    const second = inserted.nodes[1].id;
    const wired = applyBoardOps(inserted, [{ op: "connect", from: id, to: second }]);
    expect(wired.edges).toHaveLength(1);
    const pruned = applyBoardOps(wired, [{ op: "remove", id }]);
    expect(pruned.nodes.map((node) => node.id)).toEqual([second]);
    // removing a node also removes its edges.
    expect(pruned.edges).toHaveLength(0);
  });

  it("ignores operations that name nothing", () => {
    const board = applyBoardOps(createWhiloBoard("B"), [{ op: "update", title: "no id" }, { op: "connect", from: "a" }]);
    expect(board.nodes).toHaveLength(0);
    expect(board.edges).toHaveLength(0);
  });

  it("reads plain-text operations from a model that cannot return JSON", () => {
    const ops = parseBoardOps("add note: Deploy plan\nconnect a -> b");
    expect(ops).toEqual([
      { op: "add", kind: "note", title: "Deploy plan" },
      { op: "connect", from: "a", to: "b" },
    ]);
  });
});
