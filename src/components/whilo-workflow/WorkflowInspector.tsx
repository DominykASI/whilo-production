import { ArrowLeft, ChevronRight, Clock3, Play, Workflow as WorkflowIcon } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { BotAvatar } from "@/components/Avatar";
import { cn } from "@/lib/cn";
import { routineScheduleSummary } from "@/lib/routine-schedule-text";
import {
  workflowAgentTask,
  workflowRoutineColor,
  workflowRoutineReach,
  workflowRoutineSteps,
  workflowRoutinesReaching,
  workflowRunOf,
  workflowRunStepStatus,
  workflowStepSeconds,
  WORKFLOW_RUN_STATUS_LABEL,
  WORKFLOW_STEP_STATUS_LABEL,
  type Workflow,
  type WorkflowNode,
  type WorkflowRoutineNode,
  type WorkflowStepRun,
} from "@/lib/whilo-workflow-model";
import { whiloText } from "@/lib/whilo-workflow-text";
import type { Bot } from "@/state/store";
import { WorkflowStepIcon } from "./WorkflowToolbar";

export interface WorkflowInspectorProps {
  workflow: Workflow;
  bots: readonly Bot[];
  selectedNodeId: string | null;
  focusRoutineId: string | null;
  now: number;
  onSelectNode: (nodeId: string | null) => void;
  onFocusRoutine: (routineId: string) => void;
  /** Saves what an agent does in one routine. Without it, the task is read-only. */
  onEditTask?: ((nodeId: string, routineId: string, task: string) => void) | undefined;
}

function whenText(at: string | null): string {
  if (!at) return "";
  return new Date(at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function TextBlock({ title, text, empty, tone }: { title: string; text: string | null; empty: string; tone?: "danger" }) {
  return (
    <section className="grid gap-1.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">{title}</h3>
      {text ? (
        <pre className={cn("max-h-[320px] overflow-auto whitespace-pre-wrap rounded-lg px-3 py-2 font-sans text-[12.5px] leading-relaxed", tone === "danger" ? "bg-danger/10 text-danger" : "bg-inset text-ink")}>
          {text}
        </pre>
      ) : (
        <p className="text-[12.5px] text-ink-tertiary">{empty}</p>
      )}
    </section>
  );
}

function TaskEditor({ value, nodeId, routineId, onSave }: { value: string; nodeId: string; routineId: string; onSave: (nodeId: string, routineId: string, task: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  return (
    <textarea
      value={editing ? draft : value}
      rows={3}
      aria-label={whiloText("whiloWorkflow.inspectorTask")}
      placeholder={whiloText("whiloWorkflow.inspectorTaskPlaceholder")}
      onFocus={() => {
        setEditing(true);
        setDraft(value);
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        setEditing(false);
        const next = draft.trim();
        if (next !== value.trim()) onSave(nodeId, routineId, next);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setDraft(value);
          event.currentTarget.blur();
        } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.currentTarget.blur();
        }
      }}
      className="min-h-[64px] w-full resize-y rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-[12.5px] leading-relaxed text-ink outline-none hover:border-hairline/50 hover:bg-inset focus:border-hairline/60 focus:bg-inset"
    />
  );
}

export function WorkflowInspector({ workflow, bots, selectedNodeId, focusRoutineId, now, onSelectNode, onFocusRoutine, onEditTask }: WorkflowInspectorProps) {
  const steps = useMemo(
    () => (focusRoutineId ? workflowRoutineSteps(workflow.edges, focusRoutineId) : new Map<string, number>()),
    [focusRoutineId, workflow.edges],
  );
  const focusedRun = useMemo(() => workflowRunOf(workflow, focusRoutineId), [focusRoutineId, workflow]);
  const stepRuns = useMemo(() => new Map((focusedRun?.steps ?? []).map((step) => [step.nodeId, step])), [focusedRun]);
  const selected = workflow.nodes.find((node) => node.id === selectedNodeId);
  const botOf = (agentId: string) => bots.find((bot) => bot.id === agentId);

  const orderedAgents = useMemo(
    () =>
      workflow.nodes
        .filter((node): node is Extract<WorkflowNode, { kind: "agent" }> => node.kind === "agent" && (!focusRoutineId || steps.has(node.id)))
        .sort((left, right) => (steps.get(left.id) ?? Number.POSITIVE_INFINITY) - (steps.get(right.id) ?? Number.POSITIVE_INFINITY)),
    [focusRoutineId, steps, workflow.nodes],
  );

  const nameOf = (node: WorkflowNode | undefined): string => {
    if (!node) return "";
    if (node.kind === "routine") return node.name;
    if (node.kind === "agent") return botOf(node.agentId)?.name ?? node.agentId;
    return node.title;
  };

  const routine: WorkflowRoutineNode | undefined = selected?.kind === "routine" ? selected : undefined;

  return (
    <aside aria-label={whiloText("whiloWorkflow.inspector")} className="flow-inspector flex w-[340px] shrink-0 flex-col border-l border-hairline/40 bg-panel">
      <header className="flex min-h-[52px] items-center gap-2 border-b border-hairline/40 px-3 py-2">
        {selected ? (
          <>
            <button
              type="button"
              onClick={() => onSelectNode(null)}
              aria-label={whiloText("whiloWorkflow.inspectorBack")}
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-raised hover:text-ink"
            >
              <ArrowLeft size={14} />
            </button>
            {selected.kind === "agent" && botOf(selected.agentId) && <BotAvatar bot={botOf(selected.agentId)!} size={24} animated={false} />}
            <h2 className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">{nameOf(selected)}</h2>
            {steps.get(selected.id) !== undefined && (
              <span className="shrink-0 rounded-full bg-inset px-2 py-0.5 text-[11px] text-ink-secondary">{whiloText("whiloWorkflow.step", { step: steps.get(selected.id)! })}</span>
            )}
          </>
        ) : (
          <>
            <span className="grid size-[18px] shrink-0 place-items-center rounded-md bg-accent/15 text-accent" aria-hidden>
              <WorkflowIcon size={12} />
            </span>
            <h2 className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">{whiloText("whiloWorkflow.inspector")}</h2>
          </>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {!selected && !focusedRun && <p className="text-[12.5px] text-ink-secondary">{whiloText("whiloWorkflow.inspectorNoRun")}</p>}

        {!selected && focusedRun && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-medium",
                  focusedRun.status === "failed" && "bg-danger/15 text-danger",
                  focusedRun.status === "succeeded" && "bg-success/15 text-success",
                  focusedRun.status === "running" && "bg-accent/15 text-accent",
                  focusedRun.status === "cancelled" && "bg-inset text-ink-secondary",
                )}
              >
                {whiloText(WORKFLOW_RUN_STATUS_LABEL[focusedRun.status])}
              </span>
              <span className="text-ink-secondary">{whenText(focusedRun.startedAt)}</span>
              <span className="text-ink-tertiary">
                {focusedRun.kind === "manual" ? whiloText("whiloWorkflow.nodeTrigger") : nameOf(workflow.nodes.find((node) => node.id === focusedRun.routineNodeId))}
              </span>
            </div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText("whiloWorkflow.inspectorSteps")}</h3>
            {orderedAgents.length === 0 ? (
              <p className="text-[12.5px] text-ink-secondary">{whiloText("whiloWorkflow.inspectorNoRun")}</p>
            ) : (
              <ol className="grid gap-0.5">
                {orderedAgents.map((node) => {
                  const stepRun = stepRuns.get(node.id);
                  const bot = botOf(node.agentId);
                  const seconds = stepRun ? workflowStepSeconds(stepRun) : null;
                  return (
                    <li key={node.id}>
                      <button type="button" onClick={() => onSelectNode(node.id)} className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-raised">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-inset text-[11px] font-semibold tabular-nums text-ink-secondary">{steps.get(node.id) ?? "–"}</span>
                        {bot && <BotAvatar bot={bot} size={22} animated={false} />}
                        <span className="min-w-0 flex-1 truncate text-[12.5px]">{bot?.name ?? node.agentId}</span>
                        <span className="flex shrink-0 items-center gap-1 text-[11.5px] text-ink-secondary">
                          {stepRun ? (
                            <>
                              <WorkflowStepIcon status={stepRun.status} />
                              {seconds === null ? whiloText(WORKFLOW_STEP_STATUS_LABEL[stepRun.status]) : whiloText("whiloWorkflow.inspectorSeconds", { seconds })}
                            </>
                          ) : (
                            <>{steps.has(node.id) ? whiloText("whiloWorkflow.noRun") : whiloText("whiloWorkflow.unreachable")}</>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </>
        )}

        {selected?.kind === "agent" && (
          <>
            <section className="grid gap-1.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText("whiloWorkflow.inspectorTask")}</h3>
              {onEditTask && focusRoutineId && focusRoutineId in selected.tasks ? (
                <TaskEditor value={workflowAgentTask(selected, focusRoutineId)} nodeId={selected.id} routineId={focusRoutineId} onSave={onEditTask} />
              ) : (
                <p className="text-[12.5px] leading-relaxed text-ink">{workflowAgentTask(selected, focusRoutineId) || "—"}</p>
              )}
            </section>
            {(() => {
              const reaching = workflowRoutinesReaching(workflow.nodes, workflow.edges, selected.id);
              if (reaching.length === 0) return null;
              return (
                <section className="grid gap-1.5">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText("whiloWorkflow.startedBy")}</h3>
                  <ul className="grid gap-0.5">
                    {reaching.map((entry) => {
                      const step = workflowRunOf(workflow, entry.id)?.steps.find((candidate) => candidate.nodeId === selected.id);
                      return (
                        <li key={entry.id}>
                          <button
                            type="button"
                            data-flow-color={workflowRoutineColor(workflow.nodes, entry.id)}
                            aria-pressed={focusRoutineId === entry.id}
                            onClick={() => onFocusRoutine(entry.id)}
                            className={cn("flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-raised", focusRoutineId === entry.id && "bg-raised")}
                          >
                            <span className="size-2 shrink-0 rounded-full" style={{ background: "var(--flow-color)" }} aria-hidden />
                            <span className="min-w-0 flex-1 truncate text-[12.5px]">{entry.name}</span>
                            <span className="flex shrink-0 items-center gap-1 text-[11.5px] text-ink-secondary">
                              {step ? (
                                <>
                                  <WorkflowStepIcon status={step.status} />
                                  {whiloText(WORKFLOW_STEP_STATUS_LABEL[step.status])}
                                </>
                              ) : (
                                whiloText("whiloWorkflow.noRun")
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })()}
            {(() => {
              const stepRun: WorkflowStepRun | undefined = selected ? stepRuns.get(selected.id) : undefined;
              if (!stepRun) return <p className="text-[12.5px] text-ink-tertiary">{whiloText("whiloWorkflow.inspectorNoRun")}</p>;
              return (
                <>
                  <TextBlock title={whiloText("whiloWorkflow.inspectorInput")} text={stepRun.input} empty={whiloText("whiloWorkflow.inspectorNoInput")} />
                  {stepRun.error && <TextBlock title={whiloText("whiloWorkflow.inspectorError")} text={stepRun.error} empty="" tone="danger" />}
                  <TextBlock title={whiloText("whiloWorkflow.inspectorOutput")} text={stepRun.output} empty={whiloText("whiloWorkflow.inspectorNoOutput")} />
                </>
              );
            })()}
          </>
        )}

        {routine && <RoutineDetail workflow={workflow} bots={bots} routine={routine} now={now} onSelectNode={onSelectNode} />}

        {selected && selected.kind !== "agent" && selected.kind !== "routine" && (
          <TextBlock title={whiloText("whiloWorkflow.inspectorOutput")} text={selected.text || null} empty="—" />
        )}
      </div>
    </aside>
  );
}

function RoutineDetail({
  workflow,
  bots,
  routine,
  now,
  onSelectNode,
}: {
  workflow: Workflow;
  bots: readonly Bot[];
  routine: WorkflowRoutineNode;
  now: number;
  onSelectNode: (nodeId: string | null) => void;
}) {
  const reach = workflowRoutineReach(workflow.edges, routine.id);
  const started = reach.direct.flatMap((id) => {
    const node = workflow.nodes.find((candidate) => candidate.id === id);
    return node?.kind === "agent" ? [node] : [];
  });
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
        <span className={cn("rounded-full px-2 py-0.5 font-medium", routine.active ? "bg-success/15 text-success" : "bg-inset text-ink-secondary")}>
          {routine.active ? whiloText("whiloRoutines.enabled") : whiloText("whiloWorkflow.paused")}
        </span>
        <span className="text-ink-secondary">{routineScheduleSummary(routine.schedule, false)}</span>
      </div>
      <TextBlock title={whiloText("whiloWorkflow.inspectorTask")} text={routine.instruction} empty="—" />
      <section className="grid gap-1.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText("whiloWorkflow.startedBy")}</h3>
        {started.length === 0 ? (
          <p className="text-[12.5px] text-ink-tertiary">{whiloText("whiloWorkflow.unreachable")}</p>
        ) : (
          <>
            <ul className="grid gap-0.5">
              {started.map((node) => {
                const bot = bots.find((candidate) => candidate.id === node.agentId);
                return (
                  <li key={node.id}>
                    <button type="button" onClick={() => onSelectNode(node.id)} className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-raised">
                      {bot && <BotAvatar bot={bot} size={22} animated={false} />}
                      <span className="min-w-0 flex-1 truncate text-[12.5px]">{bot?.name ?? node.agentId}</span>
                      <ChevronRight size={14} className="shrink-0 text-ink-tertiary" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="text-[12px] text-ink-secondary">
              {whiloText("whiloWorkflow.inspectorSteps")}: {reach.nodes} · {reach.steps}
            </p>
          </>
        )}
      </section>
      <section className="grid gap-1.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText("whiloAgenda.upcoming")}</h3>
        <WorkflowRoutineWeek upcomingRuns={routine.upcomingRuns} now={now} />
        <ol className="grid gap-1 text-[12.5px] text-ink-secondary">
          {routine.upcomingRuns.slice(0, 5).map((at) => (
            <li key={at}>{whenText(at)}</li>
          ))}
          {routine.upcomingRuns.length === 0 && <li className="text-ink-tertiary">{routine.active ? whiloText("whiloRoutines.noNext") : whiloText("whiloWorkflow.paused")}</li>}
        </ol>
      </section>
      <section className="grid gap-1.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText("whiloWorkflow.recentRuns")}</h3>
        {routine.recentRuns.length === 0 ? (
          <p className="text-[12.5px] text-ink-tertiary">{whiloText("whiloRoutines.never")}</p>
        ) : (
          <ol className="grid gap-1">
            {routine.recentRuns.slice(0, 10).map((run) => (
              <li key={run.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-[12.5px]">
                <span className="flex items-center gap-1 text-ink-secondary">
                  <WorkflowStepIcon status={workflowRunStepStatus(run.status)} />
                  {whiloText(WORKFLOW_RUN_STATUS_LABEL[run.status])}
                </span>
                <span className="truncate text-ink-secondary">
                  {whenText(run.startedAt)}
                  {run.kind === "manual" && <span className="text-ink-tertiary"> · {whiloText("whiloWorkflow.triggerManual")}</span>}
                </span>
                <span className="text-ink-tertiary">
                  {run.finishedAt ? whiloText("whiloWorkflow.inspectorSeconds", { seconds: Math.max(0, Math.round((Date.parse(run.finishedAt) - Date.parse(run.startedAt)) / 1000)) }) : ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

export function WorkflowRoutineWeek({ upcomingRuns, now }: { upcomingRuns: readonly string[]; now: number }) {
  const days = useMemo(() => {
    const first = new Date(now);
    first.setHours(0, 0, 0, 0);
    const start = first.getTime();
    return Array.from({ length: 7 }, (_, index) => {
      const dayStart = start + index * 86_400_000;
      const date = new Date(dayStart);
      const ticks = upcomingRuns
        .map((value) => Date.parse(value))
        .filter((at) => at >= dayStart && at < dayStart + 86_400_000)
        .map((at) => ((at - dayStart) / 86_400_000) * 100);
      return { key: dayStart, date, ticks, today: index === 0, weekend: date.getDay() === 0 || date.getDay() === 6 };
    });
  }, [now, upcomingRuns]);
  return (
    <div className="grid grid-cols-7 gap-1" role="img" aria-label={whiloText("whiloAgenda.upcoming")}>
      {days.map((day) => (
        <div key={day.key} className="grid justify-items-center gap-1">
          <span className={cn("flow-week-track", day.today && "ring-1 ring-accent", day.weekend && "bg-raised-hover")}>
            {day.ticks.map((tick, index) => (
              <span key={index} className="flow-week-tick" style={{ "--flow-tick-at": `${tick}%` } as CSSProperties} />
            ))}
          </span>
          <span className={cn("text-[10px]", day.today ? "font-semibold text-accent-text" : "text-ink-tertiary")}>{day.date.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
        </div>
      ))}
    </div>
  );
}

export const INSPECTOR_ICONS = { Clock3, Play };
