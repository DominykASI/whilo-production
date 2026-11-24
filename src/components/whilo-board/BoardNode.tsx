/**
 * One card on the Whilo board. Every node kind renders through this component so the canvas, the
 * Sheets view and the AI tools all describe a node the same way. The card is styled with the app's
 * semantic tokens (`bg-card`, `text-ink`, `border-hairline`), so it re-skins with the rest of Whilo.
 */

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bot, Brain, Braces, Check, Database, FileText, Frame, GitBranch, Image as ImageIcon, Shapes, Sparkles, Type } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { WhiloBoardNode, WhiloNodeData, WhiloNodeKind, WhiloNodeTone } from "@/lib/whilo-board-model";

const TONE_BORDER: Record<WhiloNodeTone, string> = {
  default: "border-hairline/50",
  accent: "border-accent/60",
  success: "border-success/60",
  warning: "border-warning/60",
  danger: "border-danger/60",
  neutral: "border-hairline/40",
};

const TONE_WASH: Record<WhiloNodeTone, string> = {
  default: "",
  accent: "bg-accent/[0.06]",
  success: "bg-success/[0.07]",
  warning: "bg-warning/[0.08]",
  danger: "bg-danger/[0.07]",
  neutral: "bg-raised/40",
};

const KIND_ICON: Record<WhiloNodeKind, typeof Type> = {
  note: FileText,
  text: Type,
  shape: Shapes,
  frame: Frame,
  prompt: Sparkles,
  agent: Bot,
  llm: Brain,
  output: Check,
  condition: GitBranch,
  image: ImageIcon,
  data: Database,
};

const KIND_SIZE: Partial<Record<WhiloNodeKind, string>> = {
  shape: "min-h-[86px] min-w-[220px]",
  frame: "min-h-[220px] min-w-[320px]",
  note: "min-h-[120px] w-[264px]",
  text: "min-h-[64px] w-[240px]",
  prompt: "w-[288px]",
  agent: "w-[248px]",
  llm: "w-[248px]",
  output: "w-[220px]",
  condition: "w-[236px]",
  image: "w-[248px]",
  data: "w-[300px]",
};

function Handles() {
  const common = "!size-2.5 !border-2 !border-card !bg-accent/70";
  return (
    <>
      <Handle type="target" position={Position.Left} className={cn(common, "!-left-[5px]")} />
      <Handle type="source" position={Position.Right} className={cn(common, "!-right-[5px]")} />
      <Handle type="target" position={Position.Top} id="top" className={cn(common, "!-top-[5px]")} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={cn(common, "!-bottom-[5px]")} />
    </>
  );
}

function TitleRow({ data }: { data: WhiloNodeData }) {
  const Icon = KIND_ICON[data.kind] ?? FileText;
  if (data.kind === "shape" || data.kind === "text" || data.kind === "note") {
    if (!data.title) return null;
  }
  return (
    <div className="flex items-center gap-2 border-b border-hairline/30 px-3 py-2">
      <Icon size={14} className="shrink-0 text-ink-secondary" />
      <span className="truncate text-[13px] font-semibold text-ink">{data.title || labelFor(data.kind)}</span>
      {data.model && <span className="ml-auto shrink-0 truncate rounded-md bg-raised px-1.5 py-0.5 text-[10px] text-ink-secondary">{data.model}</span>}
    </div>
  );
}

function labelFor(kind: WhiloNodeKind): string {
  switch (kind) {
    case "agent":
      return "Agent";
    case "llm":
      return "Model";
    case "prompt":
      return "Prompt";
    case "output":
      return "Output";
    case "condition":
      return "Condition";
    case "image":
      return "Image";
    case "data":
      return "Data";
    case "frame":
      return "Frame";
    default:
      return "Note";
  }
}

/** A note or a text node is edited where it sits: double click to type in place. */
function InlineText({ data, placeholder, className }: { data: WhiloNodeData; placeholder: string; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(data.text);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => setValue(data.text), [data.text]);
  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);
  if (!editing) {
    return (
      <p
        onDoubleClick={(event) => {
          event.stopPropagation();
          setEditing(true);
        }}
        className={cn("whitespace-pre-wrap text-[12.5px] leading-relaxed", data.text ? "text-ink" : "text-ink-tertiary", className)}
      >
        {data.text || placeholder}
      </p>
    );
  }
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setEditing(false);
        event.stopPropagation();
      }}
      onPointerDown={(event) => event.stopPropagation()}
      className="nodrag w-full resize-none bg-transparent text-[12.5px] leading-relaxed text-ink outline-none"
      rows={Math.max(2, value.split("\n").length)}
      placeholder={placeholder}
    />
  );
}

export const BoardNode = memo(function BoardNode({ data, selected }: NodeProps<WhiloBoardNode>) {
  const typed = data as WhiloNodeData;
  const isFrame = typed.kind === "frame";
  const showTitle = typed.kind !== "note" && typed.kind !== "text" && typed.kind !== "shape" ? typed.title || true : Boolean(typed.title);
  return (
    <div
      data-board-node={typed.kind}
      className={cn(
        "group relative rounded-xl border bg-card/95 text-ink shadow-sm backdrop-blur transition-[box-shadow,border-color]",
        TONE_BORDER[typed.tone],
        TONE_WASH[typed.tone],
        KIND_SIZE[typed.kind] ?? "w-[240px]",
        isFrame && "bg-panel/40",
        selected && "ring-2 ring-accent/50",
      )}
    >
      <Handles />
      {showTitle && <TitleRow data={typed} />}
      <div className={cn("px-3 py-2.5", isFrame && "px-4 py-3")}>
        {typed.kind === "note" && <InlineText data={typed} placeholder="Double-click to write…" />}
        {typed.kind === "text" && <InlineText data={typed} placeholder="Double-click to type…" />}
        {typed.kind === "shape" && (
          <p className="text-center text-[13px] font-medium text-ink">{typed.title || typed.text}</p>
        )}
        {typed.kind === "frame" && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-tertiary">{typed.title || "Frame"}</p>
        )}
        {typed.kind === "prompt" && (
          <InlineText data={typed} placeholder="What should the agent do?" className="text-[12px]" />
        )}
        {typed.kind === "agent" && (
          <p className={cn("text-[12px]", typed.text ? "text-ink" : "text-ink-tertiary")}>{typed.text || "No instruction yet"}</p>
        )}
        {typed.kind === "llm" && (
          <p className={cn("text-[12px]", typed.text ? "text-ink" : "text-ink-tertiary")}>{typed.text || "Model step"}</p>
        )}
        {typed.kind === "output" && (
          <p className={cn("text-[12px]", typed.text ? "text-ink" : "text-ink-tertiary")}>{typed.text || "Result lands here"}</p>
        )}
        {typed.kind === "condition" && (
          <p className="rounded-md bg-raised px-2 py-1 font-mono text-[11px] text-ink-secondary">{typed.expression || "when …"}</p>
        )}
        {typed.kind === "image" && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-hairline/50 bg-inset text-ink-tertiary">
            <ImageIcon size={20} />
          </div>
        )}
        {typed.kind === "data" && (
          <div className="rounded-lg border border-hairline/40 bg-inset px-2 py-1.5 font-mono text-[11px] text-ink-secondary">
            <span className="text-ink-tertiary">source</span> {typed.source || "untitled"}
          </div>
        )}
      </div>
      {typed.tags && typed.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2.5">
          {typed.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-raised px-1.5 py-0.5 text-[10px] text-ink-secondary">
              {tag}
            </span>
          ))}
        </div>
      )}
      {typed.kind === "agent" && (
        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-ink shadow">
          <Bot size={12} />
        </span>
      )}
      {typed.kind === "llm" && (
        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-success text-success-ink shadow">
          <Braces size={12} />
        </span>
      )}
    </div>
  );
});
