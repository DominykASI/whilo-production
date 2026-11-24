import { cn } from "@/lib/cn";

import { scLabel } from "./copy";
import { type ServerState } from "./types";

export const SERVER_STATE_LABEL: Record<ServerState, Parameters<typeof scLabel>[0]> = {
  awaiting_payment: "serverCloud.state.awaiting_payment",
  creating: "serverCloud.state.creating",
  starting: "serverCloud.state.starting",
  running: "serverCloud.state.running",
  stopping: "serverCloud.state.stopping",
  stopped: "serverCloud.state.stopped",
  waking: "serverCloud.state.waking",
  error: "serverCloud.state.error",
  deleted: "serverCloud.state.deleted",
};

const TONE: Record<ServerState, { pill: string; dot: string; turn?: string }> = {
  running: { pill: "bg-success/12 text-success", dot: "bg-success" },
  waking: { pill: "bg-accent/12 text-accent", dot: "bg-accent", turn: "border-accent/30 border-t-accent" },
  starting: { pill: "bg-accent/12 text-accent", dot: "bg-accent", turn: "border-accent/30 border-t-accent" },
  creating: { pill: "bg-accent/12 text-accent", dot: "bg-accent", turn: "border-accent/30 border-t-accent" },
  stopping: { pill: "bg-warning/12 text-warning", dot: "bg-warning", turn: "border-warning/30 border-t-warning" },
  awaiting_payment: { pill: "bg-warning/12 text-warning", dot: "bg-warning" },
  stopped: { pill: "bg-control text-ink-secondary", dot: "bg-ink-secondary/70" },
  error: { pill: "bg-danger/12 text-danger", dot: "bg-danger" },
  deleted: { pill: "bg-control text-ink-tertiary", dot: "bg-ink-tertiary" },
};

export function serverStateLabel(state: ServerState): string {
  return scLabel(SERVER_STATE_LABEL[state]);
}

/** True while a server is on the way somewhere: the dot turns, the pill stays quiet. */
export function serverStateMoving(state: ServerState): boolean {
  return typeof TONE[state].turn === "string";
}

export function ServerStatusBadge({ state, className }: { state: ServerState; className?: string }) {
  const tone = TONE[state];
  return (
    <span
      data-server-status={state}
      className={cn("inline-flex min-h-5 shrink-0 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium leading-4", tone.pill, className)}
    >
      {tone.turn
        ? <span aria-hidden className={cn("sc-spin size-2.5 rounded-full border-[1.5px]", tone.turn)} />
        : <span aria-hidden className={cn("size-2 shrink-0 rounded-full", tone.dot, state === "running" && "sc-pulse")} />}
      {serverStateLabel(state)}
    </span>
  );
}

/** The dot alone, for a card's header corner where the badge would crowd the name. */
export function ServerStatusDot({ state, size = "md", className }: { state: ServerState; size?: "sm" | "md"; className?: string }) {
  const tone = TONE[state];
  const box = size === "sm" ? "size-2" : "size-2.5";
  if (tone.turn) return <span aria-hidden className={cn("sc-spin block rounded-full border-[1.5px]", box, tone.turn, className)} />;
  return (
    <span aria-hidden className={cn("relative flex", box, className)}>
      {state === "running" && <span className={cn("sc-ping absolute inset-0 rounded-full", tone.dot)} />}
      <span className={cn("relative block rounded-full", box, tone.dot, state === "running" && "sc-pulse")} />
    </span>
  );
}
