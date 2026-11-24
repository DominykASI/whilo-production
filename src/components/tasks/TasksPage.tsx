import { memo, useMemo, useState, type CSSProperties } from "react";
import { ArrowUp, Check, Clock, Inbox, Paperclip, RotateCw } from "lucide-react";

import { cn } from "@/lib/cn";
import { whiloText } from "@/lib/whilo-workflow-text";

export interface TaskItem {
  id: string;
  title: string;
  status: "needs-you" | "running" | "done" | "scheduled" | "archived";
  agentName?: string;
  agentHue?: number | null;
  updatedAt?: string;
}

export interface TasksPageProps {
  tasks?: TaskItem[];
  onOpenTask?: (t: TaskItem) => void;
}

const SECTIONS: readonly { id: TaskItem["status"]; label: string }[] = [
  { id: "needs-you", label: "whiloTasks.sectionNeedsYou" },
  { id: "running", label: "whiloTasks.sectionRunning" },
  { id: "scheduled", label: "whiloTasks.sectionScheduled" },
  { id: "done", label: "whiloTasks.sectionDone" },
  { id: "archived", label: "whiloTasks.sectionArchived" },
];

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function StatusMark({ status }: { status: TaskItem["status"] }) {
  if (status === "needs-you") {
    return (
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="absolute h-4 w-4 animate-ping rounded-full bg-accent/40" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        <RotateCw className="h-4 w-4 animate-spin text-accent" strokeWidth={2} />
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-hairline text-ink-secondary">
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-ink-secondary">
        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    );
  }
  return <span className="flex h-4 w-4 shrink-0 items-center justify-center"><span className="h-2 w-2 rounded-full bg-white/20" /></span>;
}

const TaskRow = memo(function TaskRow({ task, onOpen }: { task: TaskItem; onOpen?: (t: TaskItem) => void }) {
  const name = task.agentName?.trim();
  const avatarStyle: CSSProperties =
    task.agentHue === null || task.agentHue === undefined
      ? {}
      : { backgroundColor: `hsl(${task.agentHue} 60% 45%)` };

  return (
    <button
      type="button"
      onClick={() => onOpen?.(task)}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]",
        task.status === "archived" && "opacity-55",
      )}
    >
      <StatusMark status={task.status} />
      <span className={cn("min-w-0 flex-1 truncate text-sm text-ink", task.status === "done" && "text-ink-secondary")}>
        {task.title}
      </span>
      {task.updatedAt ? <span className="hidden shrink-0 text-xs text-ink-secondary sm:block">{task.updatedAt}</span> : null}
      <span
        style={avatarStyle}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-ink",
          !name && "bg-white/[0.06] text-ink-secondary",
        )}
      >
        {name ? initialsOf(name) : "—"}
      </span>
    </button>
  );
});

export function TasksPage({ tasks = [], onOpenTask }: TasksPageProps) {
  const [draft, setDraft] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<TaskItem["status"], TaskItem[]>();
    for (const section of SECTIONS) map.set(section.id, []);
    for (const task of tasks) map.get(task.status)?.push(task);
    return map;
  }, [tasks]);

  const canSend = draft.trim().length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-app text-ink">
      <header className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{whiloText("whiloTasks.title")}</h1>
          <span className="rounded-full border border-hairline bg-inset px-2 py-0.5 text-xs text-ink-secondary">
            {tasks.length}
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-hairline bg-card">
              <Inbox className="h-6 w-6 text-ink-secondary" strokeWidth={1.5} />
            </span>
            <p className="text-base font-medium">{whiloText("whiloTasks.emptyTitle")}</p>
            <p className="max-w-xs text-sm text-ink-secondary">{whiloText("whiloTasks.emptyBody")}</p>
            <button
              type="button"
              className="mt-2 cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {whiloText("whiloTasks.newTask")}
            </button>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-2">
            {SECTIONS.map((section) => {
              const items = grouped.get(section.id) ?? [];
              if (items.length === 0) return null;
              return (
                <section key={section.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-3 pb-1">
                    <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">{whiloText(section.label)}</h2>
                    <span className="rounded-full bg-white/[0.06] px-1.5 text-[11px] text-ink-secondary">{items.length}</span>
                  </div>
                  {items.map((task) => (
                    <TaskRow key={task.id} task={task} onOpen={onOpenTask} />
                  ))}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 pb-5">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-hairline bg-inset p-2">
          <button
            type="button"
            aria-label={whiloText("whiloTasks.attach")}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink-secondary transition-colors hover:bg-white/[0.04] hover:text-ink"
          >
            <Paperclip className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={1}
            placeholder={whiloText("whiloTasks.placeholder")}
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-ink placeholder:text-ink-secondary focus:outline-none"
          />
          <button
            type="button"
            aria-label={whiloText("whiloTasks.send")}
            disabled={!canSend}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
              canSend ? "cursor-pointer bg-accent text-white hover:opacity-90" : "cursor-not-allowed bg-white/[0.06] text-ink-secondary",
            )}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
