import { Bot, Braces, Check, Clock3, Database, FileText, Frame, GitBranch, Image as ImageIcon, Layers, MessageSquareText, Search, Send, Shapes, Sparkles, StickyNote, Trash2, Type, UserCheck, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { whiloText } from "@/lib/whilo-workflow-text";
import type { WorkflowNodeKind } from "@/lib/whilo-workflow-model";

export interface WorkflowTool {
  kind: WorkflowNodeKind;
  label: string;
  icon: typeof Type;
  group: "inputs" | "steps" | "flow" | "people";
}

export const WORKFLOW_TOOLS: WorkflowTool[] = [
  { kind: "trigger", label: "whiloWorkflow.nodeTrigger", icon: Zap, group: "inputs" },
  { kind: "prompt", label: "whiloWorkflow.nodePrompt", icon: MessageSquareText, group: "inputs" },
  { kind: "llm", label: "whiloWorkflow.nodeLlm", icon: Sparkles, group: "steps" },
  { kind: "agent", label: "whiloWorkflow.nodeAgent", icon: Bot, group: "steps" },
  { kind: "image", label: "whiloWorkflow.nodeImage", icon: ImageIcon, group: "steps" },
  { kind: "condition", label: "whiloWorkflow.nodeCondition", icon: GitBranch, group: "flow" },
  { kind: "approval", label: "whiloWorkflow.nodeApproval", icon: UserCheck, group: "flow" },
  { kind: "output", label: "whiloWorkflow.nodeOutput", icon: Send, group: "flow" },
  { kind: "data", label: "whiloWorkflow.nodeData", icon: Database, group: "people" },
  { kind: "note", label: "whiloWorkflow.nodeNote", icon: StickyNote, group: "people" },
  { kind: "text", label: "whiloWorkflow.nodeText", icon: Type, group: "people" },
  { kind: "shape", label: "whiloWorkflow.nodeShape", icon: Shapes, group: "people" },
  { kind: "frame", label: "whiloWorkflow.nodeFrame", icon: Frame, group: "people" },
];

const GROUP_LABEL: Record<WorkflowTool["group"], string> = {
  inputs: "whiloWorkflow.addInputs",
  steps: "whiloWorkflow.addSteps",
  flow: "whiloWorkflow.addFlow",
  people: "whiloWorkflow.addPeople",
};

const ICON_OF: Record<string, typeof Type> = {
  routine: Clock3,
  agent: Bot,
  trigger: Zap,
  prompt: MessageSquareText,
  llm: Sparkles,
  condition: GitBranch,
  approval: UserCheck,
  output: Send,
  image: ImageIcon,
  data: Database,
  note: StickyNote,
  text: Type,
  shape: Shapes,
  frame: Frame,
  check: Check,
  file: FileText,
  braces: Braces,
  layers: Layers,
};

export function workflowKindIcon(kind: WorkflowNodeKind): typeof Type {
  return ICON_OF[kind] ?? FileText;
}

export function workflowToolIcon(name: keyof typeof ICON_OF): typeof Type {
  return ICON_OF[name] ?? FileText;
}

export interface WorkflowAddMenuProps {
  kinds: readonly WorkflowNodeKind[];
  onAdd: (kind: WorkflowNodeKind) => void;
  disabledKinds?: readonly WorkflowNodeKind[];
  disabledReason?: string;
}

export function WorkflowAddMenu({ kinds, onAdd, disabledKinds = [], disabledReason }: WorkflowAddMenuProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as unknown as Node)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups = useMemo(() => {
    const allowed = WORKFLOW_TOOLS.filter((tool) => kinds.includes(tool.kind));
    const wanted = query.trim().toLowerCase();
    const filtered = wanted ? allowed.filter((tool) => whiloText(tool.label).toLowerCase().includes(wanted)) : allowed;
    const order: WorkflowTool["group"][] = ["inputs", "steps", "flow", "people"];
    return order
      .map((group) => ({ group, items: filtered.filter((tool) => tool.group === group) }))
      .filter((entry) => entry.items.length > 0);
  }, [kinds, query]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-[12.5px] font-semibold text-accent-ink hover:brightness-110"
      >
        <Layers size={14} />
        {whiloText("whiloWorkflow.addMenu")}
      </button>
      {open && (
        <div
          role="menu"
          aria-label={whiloText("whiloWorkflow.addMenu")}
          className="absolute left-1/2 top-11 z-30 max-h-[60vh] w-[268px] -translate-x-1/2 overflow-hidden rounded-xl border border-hairline/50 bg-menu p-1 shadow-2xl animate-pop-in"
        >
          <label className="mb-1 flex items-center gap-2 rounded-lg border border-hairline/40 bg-inset px-2.5 py-1.5">
            <Search size={13} className="shrink-0 text-ink-tertiary" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={whiloText("whiloWorkflow.addSearch")}
              aria-label={whiloText("whiloWorkflow.addSearch")}
              className="min-w-0 flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-tertiary"
            />
          </label>
          <div className="max-h-[320px] overflow-y-auto">
            {groups.length === 0 && <p className="px-3 py-4 text-center text-[12px] text-ink-secondary">{whiloText("whiloWorkflow.addNoMatch", { query: query.trim() })}</p>}
            {groups.map((entry) => (
              <div key={entry.group} className="py-1">
                <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText(GROUP_LABEL[entry.group])}</p>
                {entry.items.map((tool) => {
                  const Icon = tool.icon;
                  const disabled = disabledKinds.includes(tool.kind);
                  return (
                    <button
                      key={tool.kind}
                      type="button"
                      role="menuitem"
                      disabled={disabled}
                      title={disabled ? disabledReason : undefined}
                      onClick={() => {
                        if (disabled) return;
                        onAdd(tool.kind);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-ink",
                        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-menu-hover",
                      )}
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-inset text-ink-secondary" aria-hidden>
                        <Icon size={13} />
                      </span>
                      {whiloText(tool.label)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export interface WorkflowToolbarProps {
  onDelete: () => void;
  canDelete: boolean;
  kinds: readonly WorkflowNodeKind[];
  addMenu: WorkflowAddMenuProps;
  extra?: React.ReactNode;
}

export function WorkflowToolbar({ onDelete, canDelete, kinds, addMenu, extra }: WorkflowToolbarProps) {
  return (
    <div
      data-flow-toolbar
      role="toolbar"
      aria-label={whiloText("whiloWorkflow.addMenu")}
      className="flex items-center gap-1 rounded-2xl border border-hairline/50 bg-card/85 p-1.5 shadow-xl backdrop-blur-md"
    >
      {WORKFLOW_TOOLS.filter((tool) => kinds.includes(tool.kind)).slice(0, 4).map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.kind}
            type="button"
            title={whiloText(tool.label)}
            aria-label={whiloText(tool.label)}
            onClick={() => addMenu.onAdd(tool.kind)}
            className="flex size-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-raised hover:text-ink"
          >
            <Icon size={15} />
          </button>
        );
      })}
      <span className="mx-1 h-5 w-px bg-hairline/60" aria-hidden />
      <WorkflowAddMenu {...addMenu} />
      <span className="mx-1 h-5 w-px bg-hairline/60" aria-hidden />
      <button
        type="button"
        title={whiloText("whiloWorkflow.deleteSelection")}
        aria-label={whiloText("whiloWorkflow.deleteSelection")}
        disabled={!canDelete}
        onClick={onDelete}
        className="flex size-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-raised hover:text-danger disabled:opacity-40"
      >
        <Trash2 size={16} />
      </button>
      {extra}
    </div>
  );
}

export function WorkflowStepIcon({ status }: { status: string | undefined }) {
  if (status === "succeeded") return <Check size={12} className="text-success" aria-hidden />;
  if (status === "failed") return <Braces size={12} className="text-danger" aria-hidden />;
  return <Clock3 size={12} className="text-ink-tertiary" aria-hidden />;
}
