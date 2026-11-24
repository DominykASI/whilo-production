import type { Node } from "@xyflow/react";
import type { Bot } from "@/state/store";
import type { WorkflowNodeKind, WorkflowRoutineRun, WorkflowStepRun, WorkflowStepStatus } from "@/lib/whilo-workflow-model";

export interface WorkflowRoutineChipData {
  id: string;
  name: string;
  color: number;
  status: WorkflowStepStatus | undefined;
}

export interface WorkflowRecentRunData {
  id: string;
  status: WorkflowRoutineRun["status"];
  title: string;
}

export interface WorkflowFlowNodeData extends Record<string, unknown> {
  kind: WorkflowNodeKind;
  title: string;
  text: string;
  schedule: string;
  tone: "default" | "accent" | "success" | "warning" | "danger" | "neutral";
  bot: Bot | undefined;
  dimmed: boolean;
  unreachable: boolean;
  firing: boolean;
  removable: boolean;
  connectable: boolean;
  canRun: boolean;
  stepRun: WorkflowStepRun | undefined;
  routineChips: WorkflowRoutineChipData[];
  recentRuns: WorkflowRecentRunData[];
  onRemove: () => void;
  onRun: () => void;
  onFocusRoutine: (routineId: string) => void;
}

export type WorkflowFlowNode = Node<WorkflowFlowNodeData>;
