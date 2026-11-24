import { MarkerType, type Edge } from "@xyflow/react";
import type { Bot } from "@/state/store";
import { routineScheduleSummary } from "@/lib/routine-schedule-text";
import { whiloText } from "@/lib/whilo-workflow-text";
import { isContentKind } from "./workflow-kinds";
import {
  agentNodeId,
  workflowAgentTask,
  workflowEdgeCarries,
  workflowExecutionSteps,
  workflowRoutineColor,
  workflowRoutineSteps,
  workflowRoutinesReaching,
  workflowRunOf,
  workflowStepSeconds,
  WORKFLOW_RUN_STATUS_LABEL,
  type Workflow,
  type WorkflowNode,
  type WorkflowPoint,
  type WorkflowRoutineNode,
  type WorkflowStepRun,
} from "@/lib/whilo-workflow-model";
import type { WorkflowFlowNode, WorkflowFlowNodeData } from "./workflow-flow-types";

export interface WorkflowFlowOptions {
  workflow: Workflow;
  bots: readonly Bot[];
  focusRoutineId: string | null;
  selectedNodeId: string | null;
  editable: boolean;
  canRun: boolean;
  connectable: boolean;
  onRemove: (nodeId: string) => void;
  onRun: (nodeId: string) => void;
  onFocusRoutine: (routineId: string) => void;
}

function nodeName(bots: readonly Bot[], node: WorkflowNode): string {
  if (node.kind === "routine") return node.name;
  if (node.kind === "agent") return bots.find((bot) => bot.id === node.agentId)?.name ?? node.agentId;
  return node.title || node.kind;
}

function nodeText(node: WorkflowNode): string {
  if (node.kind === "routine") return node.instruction;
  if (node.kind === "agent") return node.task;
  return node.text;
}

export function recentRunTitle(run: { id: string; status: string; startedAt: string }): string {
  const when = new Date(run.startedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  return whiloText("whiloWorkflow.runLabel", { status: whiloText(WORKFLOW_RUN_STATUS_LABEL[run.status as keyof typeof WORKFLOW_RUN_STATUS_LABEL] ?? "whiloWorkflow.runRunning"), time: when });
}

export function stepsOf(workflow: Workflow, focusRoutineId: string | null): Map<string, number> {
  return focusRoutineId ? workflowRoutineSteps(workflow.edges, focusRoutineId) : workflowExecutionSteps(workflow.nodes, workflow.edges);
}

export function buildFlowNodes(options: WorkflowFlowOptions): WorkflowFlowNode[] {
  const { workflow, bots, focusRoutineId, selectedNodeId, editable, connectable } = options;
  const steps = stepsOf(workflow, focusRoutineId);
  const reachable = workflowExecutionSteps(workflow.nodes, workflow.edges);
  const focusedRun = workflowRunOf(workflow, focusRoutineId);
  const stepRuns = new Map((focusedRun?.steps ?? []).map((step) => [step.nodeId, step]));
  const routineCount = workflow.nodes.filter((node) => node.kind === "routine").length;

  return workflow.nodes.map((node): WorkflowFlowNode => {
    const dimmed = focusRoutineId !== null && node.id !== focusRoutineId && !steps.has(node.id);
    const name = nodeName(bots, node);
    const schedule = node.kind === "routine" && node.schedule ? routineScheduleSummary(node.schedule, false) : "";
    const stepRun: WorkflowStepRun | undefined = stepRuns.get(node.id);
    const isAgent = node.kind === "agent";
    const chips =
      isAgent && routineCount >= 2
        ? workflowRoutinesReaching(workflow.nodes, workflow.edges, node.id).map((routine) => ({
            id: routine.id,
            name: routine.name,
            color: workflowRoutineColor(workflow.nodes, routine.id),
            status: workflowRunOf(workflow, routine.id)?.steps.find((step) => step.nodeId === node.id)?.status,
          }))
        : [];
    const data: WorkflowFlowNodeData = {
      kind: node.kind,
      title: name,
      text: nodeText(node),
      schedule,
      tone: isContentKind(node.kind) ? "default" : node.kind === "routine" || node.kind === "agent" ? "accent" : "neutral",
      bot: isAgent ? bots.find((bot) => bot.id === node.agentId) : undefined,
      dimmed,
      unreachable: isAgent && !reachable.has(node.id),
      firing: node.kind === "routine" && workflowRunOf(workflow, node.id)?.status === "running",
      removable: editable && isAgent,
      connectable,
      canRun: options.canRun && node.kind === "routine",
      stepRun,
      routineChips: chips,
      recentRuns:
        node.kind === "routine"
          ? node.recentRuns.map((run) => ({
              id: run.id,
              status: run.status,
              title: recentRunTitle({ id: run.id, status: run.status, startedAt: run.startedAt }),
            }))
          : [],
      onRemove: () => options.onRemove(node.id),
      onRun: () => options.onRun(node.id),
      onFocusRoutine: options.onFocusRoutine,
    };
    return {
      id: node.id,
      type: "workflowNode",
      position: node.position,
      data,
      ...(node.kind === "frame" ? { zIndex: -1 } : {}),
      ...(selectedNodeId === node.id ? { selected: true } : {}),
      width: undefined,
    };
  });
}

export function buildFlowEdges(options: Pick<WorkflowFlowOptions, "workflow" | "focusRoutineId">): Edge[] {
  const { workflow, focusRoutineId } = options;
  const present = new Set(workflow.nodes.map((node) => node.id));
  const focusedRun = workflowRunOf(workflow, focusRoutineId);
  const stepRuns = new Map((focusedRun?.steps ?? []).map((step) => [step.nodeId, step]));
  const focusSteps = focusRoutineId ? workflowRoutineSteps(workflow.edges, focusRoutineId) : null;
  const dimmedNode = (nodeId: string) => focusRoutineId !== null && nodeId !== focusRoutineId && !focusSteps?.has(nodeId);
  return workflow.edges
    .filter((edge) => present.has(edge.from) && present.has(edge.to))
    .map((edge) => {
      const dimmed = dimmedNode(edge.from) || dimmedNode(edge.to) || (focusRoutineId !== null && !workflowEdgeCarries(edge, focusRoutineId));
      const status = stepRuns.get(edge.to)?.status;
      const state = dimmed ? "dimmed" : status === "running" ? "running" : status === "succeeded" || status === "failed" ? "delivered" : "idle";
      const color = edge.routineId ? workflowRoutineColor(workflow.nodes, edge.routineId) : undefined;
      return {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        sourceHandle: "out",
        targetHandle: "in",
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: state === "idle" ? "color-mix(in srgb, var(--color-ink) 32%, transparent)" : "var(--color-accent)" },
        style:
          state === "delivered" || state === "running"
            ? { stroke: "var(--color-accent)", strokeWidth: 2, opacity: 1 }
            : { stroke: "color-mix(in srgb, var(--color-ink) 32%, transparent)", strokeWidth: 1.6, opacity: dimmed ? 0.28 : 1 },
        animated: state === "running",
        className: "flow-edge",
        data: { state, color },
      } satisfies Edge;
    });
}

export function placementFor(workflow: Workflow, kind: WorkflowNode["kind"], center: WorkflowPoint): WorkflowPoint {
  if (kind === "agent") {
    const agents = workflow.nodes.filter((node) => node.kind === "agent").length;
    return { x: center.x - 134 + (agents % 4) * 24, y: center.y - 100 + Math.floor(agents / 4) * 40 };
  }
  const count = workflow.nodes.filter((node) => node.kind !== "routine" && node.kind !== "agent").length;
  return { x: center.x - 118 + (count % 5) * 26, y: center.y - 74 + Math.floor(count / 5) * 32 };
}

export function agentPlacementNear(workflow: Workflow, point: WorkflowPoint): WorkflowPoint {
  const placed = workflow.nodes.filter((node) => node.kind === "agent" && node.id.startsWith("agent:")).length;
  return { x: point.x, y: point.y + placed * 24 };
}

export function secondsLabel(step: WorkflowStepRun): string | null {
  const seconds = workflowStepSeconds(step);
  return seconds === null ? null : whiloText("whiloWorkflow.inspectorSeconds", { seconds });
}

export function routineNodeFor(workflow: Workflow, routineId: string): WorkflowRoutineNode | undefined {
  return workflow.nodes.find((node): node is WorkflowRoutineNode => node.kind === "routine" && node.id === routineId);
}

export function agentIdsOnCanvas(workflow: Workflow): string[] {
  return workflow.nodes.filter((node) => node.kind === "agent").map((node) => node.id);
}

export function agentTaskOf(workflow: Workflow, nodeId: string): string {
  const node = workflow.nodes.find((candidate) => candidate.id === nodeId);
  return node ? workflowAgentTask(node, null) : "";
}

export const agentIdFromNode = agentNodeId;
export const routineScheduleOf = routineScheduleSummary;

