import { routineScheduleSummary } from "@/lib/routine-schedule-text";
import type { Routine, RoutineRun } from "@/lib/routines";
import { createWhiloNode, type WhiloBoardNode, type WhiloNodeKind, type WhiloNodeTone } from "@/lib/whilo-board-model";
import type { Bot } from "@/state/store";
import {
  agentNodeId,
  routineNodeId,
  ROUTINE_START_PREFIX,
  workflowRoutineRun,
  workflowRunStatus,
  workflowStepRun,
  type Workflow,
  type WorkflowEdge,
  type WorkflowMessage,
  type WorkflowNode,
  type WorkflowNodeKind,
  type WorkflowPoint,
  type WorkflowRoutineNode,
  type WorkflowRun,
  type WorkflowStepNode,
} from "./whilo-workflow-model";

const COLUMN = 380;
const ROUTINE_ROW = 320;
const AGENT_ROW = 320;
const RECENT_RUNS = 10;

export interface BuildWorkflowInput {
  name: string;
  bots: readonly Bot[];
  routines: readonly Routine[];
  runs: readonly RoutineRun[];
  /** Positions the user moved, by node id. */
  moved?: Readonly<Record<string, WorkflowPoint>>;
}

/** The workflow the canvas draws: one node per routine, one per bot, and the start edge between them. */
export function buildWorkflow(input: BuildWorkflowInput): Workflow {
  const visible = input.bots.filter((bot) => !bot.hidden);
  const moved = input.moved ?? {};
  const routines = input.routines.filter((routine) => visible.some((bot) => bot.id === routine.botId));

  const runsOf = new Map<string, RoutineRun[]>();
  for (const run of input.runs) {
    const list = runsOf.get(run.routineId);
    if (list) list.push(run);
    else runsOf.set(run.routineId, [run]);
  }
  for (const list of runsOf.values()) {
    list.sort((left, right) => (right.startedAt ?? right.scheduledFor) - (left.startedAt ?? left.scheduledFor));
  }

  const agentIds = [...new Set(routines.map((routine) => routine.botId))];
  const routineOrder = new Map(routines.map((routine, index) => [routine.botId, index]));

  const nodes: WorkflowNode[] = [
    ...routines.map((routine, index): WorkflowRoutineNode => {
      const key = routineNodeId(routine.id);
      return {
        kind: "routine",
        id: key,
        position: moved[key] ?? { x: 0, y: index * ROUTINE_ROW },
        routineId: routine.id,
        name: routine.name,
        instruction: routine.prompt,
        schedule: routine.schedule,
        active: routine.enabled,
        upcomingRuns: routine.enabled && routine.nextRunAt !== null ? [new Date(routine.nextRunAt).toISOString()] : [],
        recentRuns: (runsOf.get(routine.id) ?? []).slice(0, RECENT_RUNS).map(workflowRoutineRun),
      };
    }),
    ...agentIds.flatMap((agentId): WorkflowNode[] => {
      const bot = visible.find((candidate) => candidate.id === agentId);
      if (!bot) return [];
      const key = agentNodeId(agentId);
      const row = routineOrder.get(agentId) ?? agentIds.indexOf(agentId);
      const tasks: Record<string, string> = {};
      for (const routine of routines) {
        if (routine.botId !== agentId) continue;
        tasks[routineNodeId(routine.id)] = routine.prompt;
      }
      return [
        {
          kind: "agent",
          id: key,
          position: moved[key] ?? { x: COLUMN, y: row * AGENT_ROW },
          agentId,
          task: tasks[routineNodeId(routines.find((routine) => routine.botId === agentId)?.id ?? "")] ?? "",
          tasks,
        },
      ];
    }),
  ];
  const present = new Set(nodes.map((node) => node.id));

  const edges: WorkflowEdge[] = routines
    .map((routine) => ({
      id: `${ROUTINE_START_PREFIX}${routine.id}`,
      from: routineNodeId(routine.id),
      to: agentNodeId(routine.botId),
      routineId: routineNodeId(routine.id),
    }))
    .filter((edge) => present.has(edge.from) && present.has(edge.to));

  const lastRuns: WorkflowRun[] = routines.flatMap((routine) => {
    const newest = (runsOf.get(routine.id) ?? [])[0];
    if (!newest) return [];
    const status = workflowRunStatus(newest.status);
    const startedAt = newest.startedAt ?? newest.scheduledFor;
    return [
      {
        id: newest.id,
        routineNodeId: routineNodeId(routine.id),
        kind: newest.manual ? "manual" : "scheduled",
        status,
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: status === "running" ? null : new Date(newest.finishedAt ?? newest.createdAt).toISOString(),
        steps: [workflowStepRun(agentNodeId(routine.botId), newest)],
      },
    ];
  });

  return {
    id: "whilo-workflow:routines",
    name: input.name,
    nodes,
    edges,
    lastRuns,
    updatedAt: lastRuns[0]?.startedAt ?? new Date(0).toISOString(),
  };
}

export interface AssistantOp {
  op: "add" | "update" | "remove" | "connect";
  id?: string;
  kind?: WorkflowStepNode["kind"];
  title?: string;
  text?: string;
  x?: number;
  y?: number;
  from?: string;
  to?: string;
}

export interface AssistantResult {
  workflow: Workflow;
  changes: string[];
}

/** The operations the helper asked for, applied to the workflow the canvas holds. */
export function applyAssistantOps(workflow: Workflow, ops: readonly AssistantOp[]): AssistantResult {
  let nodes = [...workflow.nodes];
  let edges = [...workflow.edges];
  const changes: string[] = [];
  for (const op of ops) {
    if (op.op === "add") {
      const kind = op.kind ?? "note";
      const id = `${kind}:${Math.random().toString(36).slice(2, 9)}`;
      nodes.push({
        kind,
        id,
        position: { x: op.x ?? 120, y: op.y ?? 120 },
        title: op.title ?? "",
        text: op.text ?? "",
      });
      changes.push(`Added ${op.title || kind}`);
      continue;
    }
    if (op.op === "update" && op.id) {
      nodes = nodes.map((node) =>
        node.id === op.id && node.kind !== "routine" && node.kind !== "agent"
          ? { ...node, ...(op.title !== undefined ? { title: op.title } : {}), ...(op.text !== undefined ? { text: op.text } : {}) }
          : node,
      );
      changes.push(`Edited ${op.title || op.id}`);
      continue;
    }
    if (op.op === "remove" && op.id) {
      nodes = nodes.filter((node) => node.id !== op.id);
      edges = edges.filter((edge) => edge.from !== op.id && edge.to !== op.id);
      changes.push(`Removed ${op.id}`);
      continue;
    }
    if (op.op === "connect" && op.from && op.to && !edges.some((edge) => edge.from === op.from && edge.to === op.to)) {
      edges.push({ id: `edge:${Math.random().toString(36).slice(2, 9)}`, from: op.from, to: op.to });
      changes.push(`Connected ${op.from} → ${op.to}`);
    }
  }
  return { workflow: { ...workflow, nodes, edges, updatedAt: new Date().toISOString() }, changes };
}

export function parseAssistantOps(text: string): AssistantOp[] {
  const ops: AssistantOp[] = [];
  for (const line of text.split("\n")) {
    const add = /^\s*(?:add|new|create|novo|criar)\s+(\w+)\s*:?\s*(.*)$/i.exec(line);
    if (add) {
      ops.push({ op: "add", kind: (add[1] as AssistantOp["kind"]) ?? "note", title: add[2]?.trim() ?? "" });
      continue;
    }
    const connect = /^\s*connect\s+(\S+)\s*(?:->|→|to)\s*(\S+)/i.exec(line);
    if (connect) ops.push({ op: "connect", from: connect[1], to: connect[2] });
  }
  return ops;
}

const KIND_TONE: Record<WorkflowNodeKind, WhiloNodeTone> = {
  routine: "accent",
  agent: "accent",
  trigger: "neutral",
  prompt: "default",
  llm: "success",
  condition: "warning",
  approval: "warning",
  output: "success",
  image: "default",
  data: "neutral",
  note: "default",
  text: "default",
  shape: "default",
  frame: "neutral",
};

export function workflowKindTone(kind: WorkflowNodeKind): WhiloNodeTone {
  return KIND_TONE[kind];
}

function mapStepKind(kind: WorkflowStepNode["kind"]): WhiloNodeKind {
  switch (kind) {
    case "trigger":
    case "prompt":
      return "prompt";
    case "llm":
      return "llm";
    case "condition":
    case "approval":
      return "condition";
    case "output":
      return "output";
    case "image":
      return "image";
    case "data":
      return "data";
    case "text":
      return "text";
    case "shape":
      return "shape";
    case "frame":
      return "frame";
    default:
      return "note";
  }
}

/** A workflow node as the older board model's node: Sheets and Data read the same board. */
export function workflowNodeToBoardNode(node: WorkflowNode, name: string): WhiloBoardNode {
  const title = node.kind === "routine" ? node.name : node.kind === "agent" ? name : node.title;
  const text = node.kind === "routine" ? node.instruction : node.kind === "agent" ? node.task : node.text;
  const boardKind: WhiloNodeKind = node.kind === "routine" ? "prompt" : node.kind === "agent" ? "agent" : mapStepKind(node.kind);
  return createWhiloNode(boardKind, node.position, {
    title,
    text,
    tone: workflowKindTone(node.kind),
    ...(node.kind === "agent" ? { agentId: node.agentId } : {}),
  });
}

export function workflowMessageList(messages: readonly WorkflowMessage[]): { users: WorkflowMessage[]; agents: WorkflowMessage[] } {
  return {
    users: messages.filter((message) => message.author === "user"),
    agents: messages.filter((message) => message.author === "agent"),
  };
}

export function workflowOutline(workflow: Workflow): string {
  const lines = [`# ${workflow.name}`, ""];
  if (workflow.nodes.length === 0) lines.push("(empty workflow)");
  for (const node of workflow.nodes) {
    const label = node.kind === "routine" ? node.name : node.kind === "agent" ? node.agentId : node.title;
    lines.push(`- [${node.id}] ${node.kind}: ${label}`);
    const body = node.kind === "routine" ? node.instruction : node.kind === "agent" ? node.task : node.text;
    if (body) lines.push(`    ${body.replace(/\n/g, "\n    ")}`);
  }
  if (workflow.edges.length > 0) {
    lines.push("", "Connections:");
    for (const edge of workflow.edges) lines.push(`- ${edge.from} -> ${edge.to}`);
  }
  return lines.join("\n");
}

export function routineLabelOfNode(node: WorkflowNode): string {
  if (node.kind === "routine") return routineScheduleSummary(node.schedule, false);
  return "";
}

export function nodeDisplayName(node: WorkflowNode, bots: readonly Bot[]): string {
  if (node.kind === "routine") return node.name;
  if (node.kind === "agent") return bots.find((bot) => bot.id === node.agentId)?.name ?? node.agentId;
  return node.title;
}
