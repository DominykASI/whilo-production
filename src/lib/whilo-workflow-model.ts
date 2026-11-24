import type { Routine, RoutineRun, RoutineSchedule, RoutineRunStatus } from "@/lib/routines";

export type WorkflowNodeKind =
  | "routine"
  | "agent"
  | "trigger"
  | "prompt"
  | "llm"
  | "condition"
  | "approval"
  | "output"
  | "image"
  | "data"
  | "note"
  | "text"
  | "shape"
  | "frame";

export type WorkflowStepStatus = "waiting" | "running" | "succeeded" | "failed" | "skipped";
export type WorkflowRunStatus = "running" | "succeeded" | "failed" | "cancelled";

export interface WorkflowPoint {
  x: number;
  y: number;
}

export interface WorkflowStepRun {
  nodeId: string;
  status: WorkflowStepStatus;
  input: string | null;
  output: string | null;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface WorkflowRoutineRun {
  id: string;
  kind: "scheduled" | "manual";
  status: WorkflowRunStatus;
  startedAt: string;
  finishedAt: string | null;
}

export interface WorkflowRun {
  id: string;
  routineNodeId: string;
  kind: "scheduled" | "manual";
  status: WorkflowRunStatus;
  startedAt: string;
  finishedAt: string | null;
  steps: WorkflowStepRun[];
}

export interface WorkflowRoutineNode {
  kind: "routine";
  id: string;
  position: WorkflowPoint;
  routineId: string;
  name: string;
  instruction: string;
  schedule: RoutineSchedule;
  active: boolean;
  upcomingRuns: string[];
  recentRuns: WorkflowRoutineRun[];
}

export interface WorkflowAgentNode {
  kind: "agent";
  id: string;
  position: WorkflowPoint;
  agentId: string;
  task: string;
  tasks: Record<string, string>;
}

export interface WorkflowStepNode {
  kind: Exclude<WorkflowNodeKind, "routine" | "agent">;
  id: string;
  position: WorkflowPoint;
  title: string;
  text: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger" | "neutral";
}

export type WorkflowNode = WorkflowRoutineNode | WorkflowAgentNode | WorkflowStepNode;

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  /** The routine whose run uses this connection. Absent, every routine whose run reaches `from` passes on through it. */
  routineId?: string;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  lastRuns: WorkflowRun[];
  updatedAt: string;
}

export interface WorkflowMessage {
  id: string;
  author: "user" | "agent";
  text: string;
  changes?: string[];
  createdAt: string;
}

export const WORKFLOW_NODE_WIDTH: Record<WorkflowNodeKind, number> = {
  routine: 268,
  agent: 268,
  trigger: 236,
  prompt: 252,
  llm: 252,
  condition: 240,
  approval: 236,
  output: 236,
  image: 236,
  data: 268,
  note: 240,
  text: 232,
  shape: 220,
  frame: 320,
};

export const WORKFLOW_NODE_HEIGHT: Record<WorkflowNodeKind, number> = {
  routine: 184,
  agent: 200,
  trigger: 148,
  prompt: 148,
  llm: 148,
  condition: 140,
  approval: 140,
  output: 132,
  image: 200,
  data: 168,
  note: 168,
  text: 120,
  shape: 120,
  frame: 240,
};

export const WORKFLOW_PORT_OFFSET_Y = 26;

export type WorkflowConnectionProblem = "same-node" | "into-routine" | "duplicate" | "cycle";

export function workflowConnectionProblem(
  nodes: readonly WorkflowNode[],
  edges: readonly WorkflowEdge[],
  from: string,
  to: string,
): WorkflowConnectionProblem | null {
  if (from === to) return "same-node";
  if (nodes.find((node) => node.id === to)?.kind === "routine") return "into-routine";
  if (edges.some((edge) => edge.from === from && edge.to === to)) return "duplicate";
  return reaches(edges, to, from) ? "cycle" : null;
}

function reaches(edges: readonly WorkflowEdge[], start: string, target: string): boolean {
  const seen = new Set<string>();
  const queue = [start];
  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    if (next === target) return true;
    if (seen.has(next)) continue;
    seen.add(next);
    for (const edge of edges) if (edge.from === next) queue.push(edge.to);
  }
  return false;
}

export function workflowEdgeCarries(edge: WorkflowEdge, routineId: string): boolean {
  return edge.routineId === undefined || edge.routineId === routineId;
}

export function workflowRoutineSteps(edges: readonly WorkflowEdge[], routineId: string): Map<string, number> {
  const depth = new Map<string, number>();
  const queue = [routineId];
  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    const current = depth.get(next) ?? 0;
    for (const edge of edges) {
      if (edge.from !== next || !workflowEdgeCarries(edge, routineId)) continue;
      if ((depth.get(edge.to) ?? 0) >= current + 1) continue;
      depth.set(edge.to, current + 1);
      queue.push(edge.to);
    }
  }
  return depth;
}

export function workflowRoutineReach(edges: readonly WorkflowEdge[], routineId: string): { direct: string[]; nodes: number; steps: number } {
  const steps = workflowRoutineSteps(edges, routineId);
  const direct = edges.filter((edge) => edge.from === routineId).map((edge) => edge.to);
  return { direct, nodes: steps.size, steps: Math.max(0, ...steps.values()) };
}

export function workflowRoutinesReaching(
  nodes: readonly WorkflowNode[],
  edges: readonly WorkflowEdge[],
  nodeId: string,
): WorkflowRoutineNode[] {
  return nodes.filter(
    (node): node is WorkflowRoutineNode => node.kind === "routine" && workflowRoutineSteps(edges, node.id).has(nodeId),
  );
}

export function workflowAgentTask(node: WorkflowNode, routineId: string | null): string {
  if (node.kind !== "agent") return "";
  if (routineId && routineId in node.tasks) return node.tasks[routineId] ?? "";
  return node.task;
}

export function workflowLatestRun(workflow: Pick<Workflow, "lastRuns">): WorkflowRun | null {
  let latest: WorkflowRun | null = null;
  for (const run of workflow.lastRuns) if (!latest || run.startedAt > latest.startedAt) latest = run;
  return latest;
}

export function workflowRunOf(workflow: Pick<Workflow, "lastRuns">, routineId: string | null): WorkflowRun | null {
  return workflow.lastRuns.find((run) => run.routineNodeId === routineId) ?? null;
}

export const WORKFLOW_ROUTINE_COLORS = 6;

export function workflowRoutineColor(nodes: readonly WorkflowNode[], routineId: string): number {
  const index = nodes.filter((node) => node.kind === "routine").findIndex((node) => node.id === routineId);
  return Math.max(0, index) % WORKFLOW_ROUTINE_COLORS;
}

export function workflowExecutionSteps(nodes: readonly WorkflowNode[], edges: readonly WorkflowEdge[]): Map<string, number> {
  const agents = new Set(nodes.flatMap((node) => (node.kind === "agent" ? [node.id] : [])));
  const steps = new Map<string, number>();
  for (const routine of nodes) {
    if (routine.kind !== "routine") continue;
    for (const [id, step] of workflowRoutineSteps(edges, routine.id)) {
      if (agents.has(id)) steps.set(id, Math.max(steps.get(id) ?? 0, step));
    }
  }
  return steps;
}

export function workflowBounds(nodes: readonly WorkflowNode[]): { x: number; y: number; width: number; height: number } {
  if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const left = Math.min(...nodes.map((node) => node.position.x));
  const top = Math.min(...nodes.map((node) => node.position.y));
  const right = Math.max(...nodes.map((node) => node.position.x + WORKFLOW_NODE_WIDTH[node.kind]));
  const bottom = Math.max(...nodes.map((node) => node.position.y + WORKFLOW_NODE_HEIGHT[node.kind]));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function workflowStepSeconds(step: WorkflowStepRun): number | null {
  if (!step.startedAt || !step.finishedAt) return null;
  return Math.max(0, Math.round((Date.parse(step.finishedAt) - Date.parse(step.startedAt)) / 1000));
}

export function workflowRunStepStatus(status: WorkflowRunStatus): WorkflowStepStatus {
  return status === "cancelled" ? "skipped" : status;
}

export const WORKFLOW_STEP_STATUS_LABEL: Record<WorkflowStepStatus, string> = {
  waiting: "whiloWorkflow.statusWaiting",
  running: "whiloWorkflow.statusRunning",
  succeeded: "whiloWorkflow.statusSucceeded",
  failed: "whiloWorkflow.statusFailed",
  skipped: "whiloWorkflow.statusSkipped",
};

export const WORKFLOW_RUN_STATUS_LABEL: Record<WorkflowRunStatus, string> = {
  running: "whiloWorkflow.runRunning",
  succeeded: "whiloWorkflow.runSucceeded",
  failed: "whiloWorkflow.runFailed",
  cancelled: "whiloWorkflow.runCancelled",
};

/** One duration in words, from whole seconds. */
export function workflowSecondsText(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

export function workflowRunStatus(status: RoutineRunStatus): WorkflowRunStatus {
  if (status === "completed") return "succeeded";
  if (status === "cancelled") return "cancelled";
  if (status === "failed" || status === "missed") return "failed";
  return "running";
}

export function workflowRoutineRun(run: RoutineRun): WorkflowRoutineRun {
  const status = workflowRunStatus(run.status);
  const startedAt = run.startedAt ?? run.scheduledFor;
  return {
    id: run.id,
    kind: run.manual ? "manual" : "scheduled",
    status,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: status === "running" ? null : new Date(run.finishedAt ?? run.createdAt).toISOString(),
  };
}

export function workflowStepRun(nodeId: string, run: RoutineRun): WorkflowStepRun {
  const status: WorkflowStepStatus =
    run.status === "queued"
      ? "waiting"
      : run.status === "running"
        ? "running"
        : run.status === "completed"
          ? "succeeded"
          : run.status === "cancelled"
            ? "skipped"
            : "failed";
  const startedAt = run.startedAt ?? run.scheduledFor;
  return {
    nodeId,
    status,
    input: run.prompt ?? null,
    output: run.output ?? null,
    error: run.error ?? run.attention ?? null,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: status === "running" || status === "waiting" ? null : new Date(run.finishedAt ?? run.createdAt).toISOString(),
  };
}

export function routineNodeId(routineId: string): string {
  return `routine:${routineId}`;
}

export function agentNodeId(agentId: string): string {
  return `agent:${agentId}`;
}

export function routineIdOfNode(nodeId: string | null): string | null {
  return nodeId?.startsWith("routine:") ? nodeId.slice("routine:".length) : null;
}

export function agentIdOfNode(nodeId: string): string | null {
  return nodeId.startsWith("agent:") ? nodeId.slice("agent:".length) : null;
}

export const ROUTINE_START_PREFIX = "routine-start:";

export function isRoutineStartEdge(edgeId: string): boolean {
  return edgeId.startsWith(ROUTINE_START_PREFIX);
}

export function routinesOfAgent(routines: readonly Routine[], agentId: string): Routine[] {
  return routines.filter((routine) => routine.botId === agentId);
}
