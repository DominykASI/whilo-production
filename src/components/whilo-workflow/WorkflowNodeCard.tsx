import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Check, Clock3, Play, X } from "lucide-react";
import { BotAvatar } from "@/components/Avatar";
import { cn } from "@/lib/cn";
import { whiloText } from "@/lib/whilo-workflow-text";
import { workflowKindIcon } from "./WorkflowToolbar";
import type { WorkflowFlowNode, WorkflowFlowNodeData } from "./workflow-flow-types";

const NODE_WIDTH: Record<string, string> = {
  routine: "w-[268px]",
  agent: "w-[268px]",
  note: "w-[240px]",
  text: "w-[232px]",
  shape: "w-[220px]",
  frame: "w-[320px] min-h-[180px]",
  data: "w-[268px]",
  image: "w-[236px]",
};

const KIND_KICKER: Record<string, string> = {
  routine: "whiloWorkflow.nodeTrigger",
  agent: "whiloWorkflow.nodeAgent",
  trigger: "whiloWorkflow.nodeTrigger",
  prompt: "whiloWorkflow.nodePrompt",
  llm: "whiloWorkflow.nodeLlm",
  condition: "whiloWorkflow.nodeCondition",
  approval: "whiloWorkflow.nodeApproval",
  output: "whiloWorkflow.nodeOutput",
  image: "whiloWorkflow.nodeImage",
  data: "whiloWorkflow.nodeData",
  note: "whiloWorkflow.nodeNote",
  text: "whiloWorkflow.nodeText",
  shape: "whiloWorkflow.nodeShape",
  frame: "whiloWorkflow.nodeFrame",
};

const DOT_TONE: Record<string, string> = {
  succeeded: "bg-success",
  failed: "bg-danger",
  running: "bg-accent",
  cancelled: "bg-ink-tertiary",
  skipped: "bg-ink-tertiary",
};

function StatusMark({ status }: { status: string | undefined }) {
  if (status === "running" || status === "waiting") return <span aria-hidden className="size-2 shrink-0 animate-pulse rounded-full bg-accent" />;
  if (status === "succeeded") return <Check aria-hidden size={12} className="shrink-0 text-success" />;
  if (status === "failed") return <X aria-hidden size={12} className="shrink-0 text-danger" />;
  return <Clock3 aria-hidden size={12} className="shrink-0 text-ink-tertiary" />;
}

function NodeBody({ data }: { data: WorkflowFlowNodeData }) {
  const kind = data.kind;
  if (kind === "routine") {
    return (
      <div className="flex flex-col gap-2 px-3 py-2.5">
        <p className="text-[12.5px] font-medium text-ink">{data.schedule}</p>
        <p className="line-clamp-3 border-l-2 pl-2 text-[12px] leading-relaxed text-ink-secondary" style={{ borderColor: "var(--flow-color)" }}>
          {data.text || whiloText("whiloWorkflow.routine")}
        </p>
        <div className="flex min-h-6 items-center justify-between gap-2">
          <ul className="flex items-center gap-1" aria-label={whiloText("whiloWorkflow.recentRuns")}>
            {data.recentRuns.slice(0, 8).map((run) => (
              <li key={run.id} title={run.title} className={cn("size-2 rounded-full", DOT_TONE[run.status] ?? "bg-ink-tertiary")}>
                <span className="sr-only">{run.title}</span>
              </li>
            ))}
          </ul>
          {data.canRun && (
            <button
              type="button"
              className="nodrag flex shrink-0 items-center gap-1 rounded-lg border border-hairline/50 bg-control px-2 py-1 text-[11px] font-medium text-ink hover:bg-raised-hover"
              onClick={(event) => {
                event.stopPropagation();
                data.onRun();
              }}
            >
              <Play size={11} />
              {whiloText("whiloWorkflow.runNow")}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (kind === "agent") {
    return (
      <div className="flex flex-col gap-2 px-3 py-2.5">
        <p className="line-clamp-3 text-[12px] leading-relaxed text-ink-secondary">{data.text || whiloText("whiloWorkflow.agentTask")}</p>
        {data.routineChips.length > 0 && (
          <ul className="flex flex-wrap gap-1" aria-label={whiloText("whiloWorkflow.startedBy")}>
            {data.routineChips.map((chip) => (
              <li key={chip.id}>
                <button
                  type="button"
                  data-flow-color={chip.color}
                  title={whiloText("whiloWorkflow.showRoutine", { name: chip.name })}
                  onClick={(event) => {
                    event.stopPropagation();
                    data.onFocusRoutine(chip.id);
                  }}
                  className="nodrag flex h-[22px] items-center gap-1 rounded-full px-2 text-[11px] hover:brightness-110"
                  style={{ background: "var(--flow-soft)", color: "var(--flow-color)" }}
                >
                  <span className="max-w-[110px] truncate">{chip.name}</span>
                  {chip.status && <StatusMark status={chip.status} />}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={cn("flex min-h-[56px] items-start rounded-lg bg-inset px-2 py-1.5 text-[12px] leading-relaxed", data.stepRun?.error ? "text-danger" : "text-ink")}>
          {data.stepRun?.error || data.stepRun?.output ? (
            <p className="line-clamp-4 whitespace-pre-line">{data.stepRun.error ?? data.stepRun.output}</p>
          ) : (
            <span className="text-ink-tertiary">
              {data.stepRun?.status === "running" || data.stepRun?.status === "waiting"
                ? whiloText("whiloWorkflow.running")
                : data.unreachable
                  ? whiloText("whiloWorkflow.unreachable")
                  : whiloText("whiloWorkflow.noRun")}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (kind === "condition") {
    return (
      <div className="px-3 py-2.5">
        <p className="rounded-md bg-inset px-2 py-1 font-mono text-[11px] text-ink-secondary">{data.text || whiloText("whiloWorkflow.conditionHint")}</p>
      </div>
    );
  }
  if (kind === "data") {
    return (
      <div className="px-3 py-2.5">
        <p className="rounded-lg border border-hairline/40 bg-inset px-2 py-1.5 font-mono text-[11px] text-ink-secondary">
          {whiloText("whiloWorkflow.dataSource", { name: data.text || "untitled" })}
        </p>
      </div>
    );
  }
  if (kind === "image") {
    return (
      <div className="px-3 py-2.5">
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-hairline/50 bg-inset text-[11px] text-ink-tertiary">
          {data.text || whiloText("whiloWorkflow.nodeImage")}
        </div>
      </div>
    );
  }
  if (kind === "frame") {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] uppercase tracking-wider text-ink-tertiary">{data.text || whiloText("whiloWorkflow.nodeFrame")}</p>
      </div>
    );
  }
  const placeholder = kind === "note" ? whiloText("whiloWorkflow.notePlaceholder") : kind === "text" ? whiloText("whiloWorkflow.textPlaceholder") : kind === "output" ? whiloText("whiloWorkflow.outputTask") : whiloText("whiloWorkflow.promptHint");
  return (
    <div className="px-3 py-2.5">
      <p className={cn("whitespace-pre-wrap text-[12px] leading-relaxed", data.text ? "text-ink" : "text-ink-tertiary")}>{data.text || placeholder}</p>
    </div>
  );
}

export function WorkflowNodeCard({ id, data, selected }: NodeProps<WorkflowFlowNode>) {
  const kind = data.kind;
  const Icon = workflowKindIcon(kind);
  const isRoutine = kind === "routine";
  const bot = data.bot;
  return (
    <div
      data-flow-node={id}
      data-kind={kind}
      data-tone={data.tone}
      data-selected={selected ? "" : undefined}
      data-firing={data.firing ? "" : undefined}
      data-dimmed={data.dimmed ? "" : undefined}
      className={cn(
        "flow-node group relative rounded-xl border bg-card/95 text-ink shadow-sm backdrop-blur transition-[box-shadow,opacity]",
        "border-hairline/50",
        data.tone === "accent" && "border-accent/55",
        data.tone === "success" && "border-success/55",
        data.tone === "warning" && "border-warning/55",
        data.tone === "danger" && "border-danger/55",
        NODE_WIDTH[kind] ?? "w-[236px]",
      )}
      style={isRoutine ? { borderColor: "var(--flow-color)" } : undefined}
    >
      {kind !== "routine" && <Handle type="target" position={Position.Left} id="in" isConnectable={data.connectable} className="!size-3 !border-2 !border-card !bg-accent/70" />}
      {kind !== "output" && <Handle type="source" position={Position.Right} id="out" isConnectable={data.connectable} className="!size-3 !border-2 !border-card !bg-accent/70" />}

      <div className="flex h-[52px] items-center gap-2 border-b border-hairline/40 px-2.5">
        {kind === "agent" && bot ? (
          <BotAvatar bot={bot} size={28} animated={false} />
        ) : (
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-lg bg-inset text-ink-secondary"
            style={isRoutine ? { background: "var(--flow-soft)", color: "var(--flow-color)" } : undefined}
          >
            <Icon size={15} />
          </span>
        )}
        <span className="grid min-w-0 flex-1">
          <span className="truncate text-[11px] leading-tight text-ink-tertiary">{kind === "agent" ? bot?.title || whiloText("whiloWorkflow.nodeAgent") : whiloText(KIND_KICKER[kind] ?? "whiloWorkflow.nodeNote")}</span>
          <strong className="truncate text-[13px] font-semibold leading-tight text-ink">{data.title}</strong>
        </span>
        {selected && data.removable && (
          <button
            type="button"
            aria-label={whiloText("whiloWorkflow.removeNode", { name: data.title })}
            onClick={(event) => {
              event.stopPropagation();
              data.onRemove();
            }}
            className="nodrag flex size-6 shrink-0 items-center justify-center rounded-lg text-ink-tertiary hover:bg-raised hover:text-danger"
          >
            <X size={13} />
          </button>
        )}
      </div>
      <NodeBody data={data} />
    </div>
  );
}
