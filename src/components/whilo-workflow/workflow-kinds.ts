import type { WorkflowNodeKind } from "@/lib/whilo-workflow-model";

/** Nodes a run never goes through: they are for people reading the board. */
export const CONTENT_KINDS = ["text", "note", "shape", "frame"] as const satisfies readonly WorkflowNodeKind[];

/** Nodes the reference's add menu offers on the flow. */
export const FLOW_KINDS = ["condition", "approval", "output"] as const satisfies readonly WorkflowNodeKind[];

/** Nodes a run goes through, in the order the reference's menu groups them. */
export const STEP_KINDS = ["llm", "agent", "image"] as const satisfies readonly WorkflowNodeKind[];

export const INPUT_KINDS = ["trigger", "prompt"] as const satisfies readonly WorkflowNodeKind[];

export const CANVAS_KINDS: readonly WorkflowNodeKind[] = [
  ...INPUT_KINDS,
  ...STEP_KINDS,
  ...FLOW_KINDS,
  "data",
  ...CONTENT_KINDS,
];

/** The kinds a web page can add: everything the reference's canvas shows, in both runtimes. */
export const WEB_KINDS: readonly WorkflowNodeKind[] = CANVAS_KINDS;

/** The kinds that only the desktop app can actually run, so the web page marks them. */
export const DESKTOP_ONLY_KINDS: readonly WorkflowNodeKind[] = ["trigger", "image", "data"];

export function isContentKind(kind: WorkflowNodeKind): boolean {
  return (CONTENT_KINDS as readonly string[]).includes(kind);
}

export function isStepKind(kind: WorkflowNodeKind): boolean {
  return !isContentKind(kind);
}

export function workflowKindLabelKey(kind: WorkflowNodeKind): string {
  switch (kind) {
    case "routine":
      return "whiloWorkflow.nodeTrigger";
    case "agent":
      return "whiloWorkflow.nodeAgent";
    case "trigger":
      return "whiloWorkflow.nodeTrigger";
    case "prompt":
      return "whiloWorkflow.nodePrompt";
    case "llm":
      return "whiloWorkflow.nodeLlm";
    case "condition":
      return "whiloWorkflow.nodeCondition";
    case "approval":
      return "whiloWorkflow.nodeApproval";
    case "output":
      return "whiloWorkflow.nodeOutput";
    case "image":
      return "whiloWorkflow.nodeImage";
    case "data":
      return "whiloWorkflow.nodeData";
    case "note":
      return "whiloWorkflow.nodeNote";
    case "text":
      return "whiloWorkflow.nodeText";
    case "shape":
      return "whiloWorkflow.nodeShape";
    case "frame":
      return "whiloWorkflow.nodeFrame";
  }
}
