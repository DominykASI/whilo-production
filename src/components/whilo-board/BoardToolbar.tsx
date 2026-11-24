/**
 * The floating toolbar over the Whilo canvas: what to add, and the two actions that act on the
 * selection. It is the same control for every board; the page narrows the node kinds it offers.
 */

import { Bot, Braces, Check, Database, FileText, Frame, GitBranch, Image as ImageIcon, Shapes, Sparkles, Trash2, Type } from "lucide-react";
import { cn } from "@/lib/cn";
import type { WhiloNodeKind } from "@/lib/whilo-board-model";

const ALL_KINDS: Array<{ kind: WhiloNodeKind; label: string; icon: typeof Type }> = [
  { kind: "note", label: "Note", icon: FileText },
  { kind: "text", label: "Text", icon: Type },
  { kind: "shape", label: "Shape", icon: Shapes },
  { kind: "frame", label: "Frame", icon: Frame },
  { kind: "prompt", label: "Prompt", icon: Sparkles },
  { kind: "agent", label: "Agent", icon: Bot },
  { kind: "llm", label: "Model", icon: Braces },
  { kind: "condition", label: "Condition", icon: GitBranch },
  { kind: "output", label: "Output", icon: Check },
  { kind: "image", label: "Image", icon: ImageIcon },
  { kind: "data", label: "Data", icon: Database },
];

export interface BoardToolbarProps {
  onAdd: (kind: WhiloNodeKind) => void;
  onDelete: () => void;
  onInsertAgents?: (() => void) | undefined;
  kinds?: WhiloNodeKind[] | undefined;
}

const button =
  "flex size-9 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-accent";

export function BoardToolbar({ onAdd, onDelete, onInsertAgents, kinds }: BoardToolbarProps) {
  const shown = kinds ? ALL_KINDS.filter((entry) => kinds.includes(entry.kind)) : ALL_KINDS;
  return (
    <div
      data-board-toolbar
      className={cn(
        "absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl border border-hairline/50 bg-card/85 p-1.5 shadow-xl backdrop-blur-md",
        "animate-pop-in",
      )}
    >
      {shown.map(({ kind, label, icon: Icon }) => (
        <button
          key={kind}
          type="button"
          className={button}
          title={`Add ${label}`}
          aria-label={`Add ${label}`}
          onClick={() => onAdd(kind)}
        >
          <Icon size={17} />
        </button>
      ))}
      {onInsertAgents && (
        <>
          <span className="mx-1 h-5 w-px bg-hairline/60" aria-hidden />
          <button type="button" className={button} title="Insert your agents" aria-label="Insert your agents" onClick={onInsertAgents}>
            <Bot size={17} className="text-accent" />
          </button>
        </>
      )}
      <span className="mx-1 h-5 w-px bg-hairline/60" aria-hidden />
      <button type="button" className={cn(button, "hover:text-danger")} title="Delete selection" aria-label="Delete selection" onClick={onDelete}>
        <Trash2 size={17} />
      </button>
    </div>
  );
}
