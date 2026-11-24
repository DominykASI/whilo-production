/**
 * The AI panel beside a Whilo board. The agent reads the board as an outline and answers with
 * operations the canvas applies. This is the bridge between the Whilo models and the canvas: the
 * user types what they want, the panel sends the board and the request, and the returned ops are
 * applied. It degrades to a plain chat when the server has no board-aware endpoint yet.
 */

import { CornerDownLeft, Loader2, Sparkles } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { api } from "@/state/api";
import { whiloBoardId, whiloBoardOutline, type WhiloBoardDoc, type WhiloNodeKind } from "@/lib/whilo-board-model";

interface Message {
  role: "user" | "assistant";
  text: string;
}

/** One edit the model asked for. Kept tiny so any model can emit it. */
export interface BoardOp {
  op: "add" | "update" | "remove" | "connect";
  id?: string;
  kind?: WhiloNodeKind;
  title?: string;
  text?: string;
  x?: number;
  y?: number;
  from?: string;
  to?: string;
}

export function applyBoardOps(doc: WhiloBoardDoc, ops: BoardOp[]): WhiloBoardDoc {
  let nodes = [...doc.nodes];
  let edges = [...doc.edges];
  for (const op of ops) {
    if (op.op === "add") {
      const kind = op.kind ?? "note";
      nodes.push({
        id: whiloBoardId(kind),
        type: kind,
        position: { x: op.x ?? 80, y: op.y ?? 80 },
        data: { kind, title: op.title ?? "", text: op.text ?? "", tone: "default" },
      });
    } else if (op.op === "update" && op.id) {
      nodes = nodes.map((node) =>
        node.id === op.id
          ? { ...node, data: { ...node.data, ...(op.title !== undefined ? { title: op.title } : {}), ...(op.text !== undefined ? { text: op.text } : {}) } }
          : node,
      );
    } else if (op.op === "remove" && op.id) {
      nodes = nodes.filter((node) => node.id !== op.id);
      edges = edges.filter((edge) => edge.source !== op.id && edge.target !== op.id);
    } else if (op.op === "connect" && op.from && op.to) {
      edges.push({ id: whiloBoardId("edge"), source: op.from, target: op.to, type: "smoothstep" });
    }
  }
  return { ...doc, nodes, edges, updatedAt: Date.now() };
}

/** Reads `add note: Deploy` style lines the model returns, so a plain-text model still drives it. */
export function parseBoardOps(text: string): BoardOp[] {
  const ops: BoardOp[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const add = /^\s*(?:add|novo|create)\s+(\w+)\s*:?\s*(.*)$/i.exec(line);
    if (add) {
      ops.push({ op: "add", kind: (add[1] as WhiloNodeKind) ?? "note", title: add[2]?.trim() ?? "" });
      continue;
    }
    const connect = /^\s*connect\s+(\S+)\s*(?:->|→|to)\s*(\S+)/i.exec(line);
    if (connect) ops.push({ op: "connect", from: connect[1], to: connect[2] });
  }
  return ops;
}

export interface BoardChatProps {
  doc: WhiloBoardDoc;
  onOps: (ops: BoardOp[]) => void;
  className?: string;
}

export function BoardChat({ doc, onOps, className }: BoardChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    setMessages((current) => [...current, { role: "user", text }]);
    setBusy(true);
    try {
      const answer = await api<{ text?: string; ops?: BoardOp[]; reply?: string }>("/api/whilo/board/assist", {
        method: "POST",
        body: JSON.stringify({ board: whiloBoardOutline(doc), request: text }),
      });
      const reply = answer.reply ?? answer.text ?? "";
      const ops = answer.ops ?? parseBoardOps(reply);
      if (ops.length > 0) onOps(ops);
      setMessages((current) => [...current, { role: "assistant", text: reply || `${ops.length} change(s) applied.` }]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "The board assistant is unavailable.";
      setMessages((current) => [...current, { role: "assistant", text: `Could not reach the assistant. ${detail}` }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }));
    }
  }, [draft, busy, doc, onOps]);

  return (
    <aside className={cn("flex w-[320px] shrink-0 flex-col border-l border-hairline/40 bg-panel", className)}>
      <header className="flex items-center gap-2 border-b border-hairline/40 px-4 py-3">
        <Sparkles size={16} className="text-accent" />
        <h2 className="text-[14px] font-semibold text-ink">Board assistant</h2>
      </header>
      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            Ask the agent to build or change this board. It reads every node and connection and edits them for you.
          </p>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "rounded-xl px-3 py-2 text-[12.5px] leading-relaxed",
              message.role === "user" ? "ml-auto max-w-[85%] bg-accent/15 text-ink" : "max-w-[90%] bg-raised text-ink",
            )}
          >
            {message.text}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-[12px] text-ink-secondary">
            <Loader2 size={13} className="animate-spin" /> Thinking…
          </div>
        )}
      </div>
      <div className="border-t border-hairline/40 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-hairline/50 bg-inset px-3 py-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder="Ask for a board…"
            className="max-h-32 min-h-6 flex-1 resize-none bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-tertiary"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || !draft.trim()}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink disabled:opacity-40"
            aria-label="Send"
          >
            <CornerDownLeft size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
