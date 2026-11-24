import { describe, expect, it } from "vitest";
import { whiloBoardOpsFromAnswer } from "./whilo-board.ts";

describe("whilo board assistant answer", () => {
  it("keeps only well-formed operations and their reply", () => {
    const parsed = whiloBoardOpsFromAnswer({
      reply: "Added a note.",
      ops: [
        { op: "add", kind: "note", title: "Plan" },
        { op: "connect", from: "a", to: "b" },
        { op: "remove", id: "c" },
        { op: "update", id: "d", text: "hello" },
      ],
    });
    expect(parsed.reply).toBe("Added a note.");
    expect(parsed.ops).toHaveLength(4);
  });

  it("drops operations with an unknown op or kind, and non-objects", () => {
    const parsed = whiloBoardOpsFromAnswer({
      reply: "",
      ops: [
        { op: "explode", id: "a" },
        { op: "add", kind: "spaceship" },
        { op: "add" },
        "nope",
        42,
        null,
      ],
    });
    // `{ op: "add" }` is valid: kind defaults on the canvas side.
    expect(parsed.ops).toHaveLength(1);
  });

  it("caps the number of operations and survives junk answers", () => {
    const many = Array.from({ length: 100 }, () => ({ op: "remove", id: "x" }));
    expect(whiloBoardOpsFromAnswer({ ops: many }).ops).toHaveLength(40);
    expect(whiloBoardOpsFromAnswer(null)).toEqual({ reply: "", ops: [] });
    expect(whiloBoardOpsFromAnswer({ reply: 5, ops: "no" })).toEqual({ reply: "", ops: [] });
  });
});
