import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./workflow-canvas.css";
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { workflowConnectionProblem, workflowRoutineColor, type Workflow, type WorkflowNodeKind, type WorkflowPoint, type WorkflowConnectionProblem } from "@/lib/whilo-workflow-model";
import type { Bot } from "@/state/store";
import { buildFlowEdges, buildFlowNodes, placementFor } from "./workflow-flow";
import type { WorkflowFlowNode } from "./workflow-flow-types";
import { WorkflowNodeCard } from "./WorkflowNodeCard";
import { WorkflowToolbar, type WorkflowAddMenuProps } from "./WorkflowToolbar";

const nodeTypes = { workflowNode: WorkflowNodeCard };
const ROUTINE_PALETTE = ["#4f8dff", "#22b8a0", "#f2a13c", "#e56ba8", "#7d6cf5", "#b8b23a"];

const PROBLEM_KEY: Record<WorkflowConnectionProblem, string> = {
  "same-node": "whiloWorkflow.connectSameNode",
  "into-routine": "whiloWorkflow.connectIntoRoutine",
  duplicate: "whiloWorkflow.connectDuplicate",
  cycle: "whiloWorkflow.connectCycle",
};

export interface WorkflowCanvasProps {
  workflow: Workflow;
  bots: readonly Bot[];
  focusRoutineId: string | null;
  selectedNodeId: string | null;
  editable: boolean;
  canRun: boolean;
  kinds: readonly WorkflowNodeKind[];
  disabledKinds?: readonly WorkflowNodeKind[];
  disabledReason?: string;
  /** Whether a connection may be drawn now. A routine must be in focus, as in the reference. */
  connectable?: boolean;
  viewport?: Viewport;
  onSelectNode: (nodeId: string | null) => void;
  onMoveNode: (nodeId: string, position: WorkflowPoint) => void;
  onConnect: (from: string, to: string) => boolean | Promise<boolean>;
  onRemoveEdge: (edgeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onAddNode: (kind: WorkflowNodeKind, position: WorkflowPoint) => void;
  onRunRoutine: (nodeId: string) => void;
  onFocusRoutine: (routineId: string) => void;
  onViewportChange?: ((viewport: Viewport) => void) | undefined;
  onNotice?: ((message: string, tone: "neutral" | "danger") => void) | undefined;
  toolbarExtra?: ReactNode;
}

function CanvasInner(props: WorkflowCanvasProps) {
  const {
    workflow,
    bots,
    focusRoutineId,
    selectedNodeId,
    editable,
    canRun,
    kinds,
    viewport,
    onSelectNode,
    onMoveNode,
    onConnect,
    onRemoveEdge,
    onRemoveNode,
    onAddNode,
    onRunRoutine,
    onFocusRoutine,
    onViewportChange,
    onNotice,
  } = props;
  const { screenToFlowPosition, setViewport } = useReactFlow();
  const restoredRef = useRef(false);
  const draggedRef = useRef<Map<string, WorkflowPoint>>(new Map());

  const connectable = editable && props.connectable !== false;

  const derivedNodes = useMemo(
    () =>
      buildFlowNodes({
        workflow,
        bots,
        focusRoutineId,
        selectedNodeId,
        editable,
        canRun,
        connectable,
        onRemove: onRemoveNode,
        onRun: onRunRoutine,
        onFocusRoutine,
      }),
    [bots, canRun, connectable, editable, focusRoutineId, onFocusRoutine, onRemoveNode, onRunRoutine, selectedNodeId, workflow],
  );
  const derivedEdges = useMemo(() => buildFlowEdges({ workflow, focusRoutineId }), [focusRoutineId, workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowFlowNode>(derivedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(derivedEdges);
  const shown = useRef({ nodes: derivedNodes, edges: derivedEdges });

  useEffect(() => {
    // A drag in progress keeps the positions the canvas holds; every other change comes from the workflow.
    if ([...draggedRef.current.keys()].length > 0) {
      setNodes((current) =>
        current.map((node) => {
          const next = derivedNodes.find((candidate) => candidate.id === node.id);
          return next ? { ...node, data: next.data, selected: node.selected } : node;
        }),
      );
      setEdges(derivedEdges);
      shown.current = { nodes: derivedNodes, edges: derivedEdges };
      return;
    }
    setNodes(derivedNodes);
    setEdges(derivedEdges);
    shown.current = { nodes: derivedNodes, edges: derivedEdges };
  }, [derivedEdges, derivedNodes, setEdges, setNodes]);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const frame = requestAnimationFrame(() => {
      if (viewport && (viewport.x !== 0 || viewport.y !== 0 || viewport.zoom !== 1)) void setViewport(viewport, { duration: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [setViewport, viewport]);

  const handleConnect = useCallback<OnConnect>(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const problem = workflowConnectionProblem(workflow.nodes, workflow.edges, connection.source, connection.target);
      if (problem) {
        onNotice?.(PROBLEM_KEY[problem], "danger");
        return;
      }
      const id = `edge:${Math.random().toString(36).slice(2, 9)}`;
      void Promise.resolve(onConnect(connection.source, connection.target)).then((saved) => {
        if (!saved) return;
        setEdges((current) => addEdge({ ...connection, id, type: "smoothstep", sourceHandle: "out", targetHandle: "in" }, current));
      });
    },
    [onConnect, onNotice, setEdges, workflow.edges, workflow.nodes],
  );

  const minimapColor = useCallback(
    (node: Node) => {
      const kind = (node.data as { kind?: WorkflowNodeKind }).kind;
      if (kind === "routine") {
        const routine = workflow.nodes.find((candidate) => candidate.id === node.id);
        if (routine?.kind === "routine") return ROUTINE_PALETTE[workflowRoutineColor(workflow.nodes, routine.id)] ?? ROUTINE_PALETTE[0];
      }
      return "color-mix(in srgb, var(--color-ink) 32%, transparent)";
    },
    [workflow.nodes],
  );

  const addNodeAtCenter = useCallback(
    (kind: WorkflowNodeKind) => {
      const bounds = document.querySelector("[data-whilo-flow]")?.getBoundingClientRect();
      const center = bounds ? screenToFlowPosition({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }) : { x: 0, y: 0 };
      onAddNode(kind, placementFor(workflow, kind, center));
    },
    [onAddNode, screenToFlowPosition, workflow],
  );

  const deleteSelection = useCallback(() => {
    const removable = nodes.find((node) => node.selected && node.data.removable);
    if (removable) onRemoveNode(removable.id);
  }, [nodes, onRemoveNode]);

  const addMenu: WorkflowAddMenuProps = {
    kinds,
    onAdd: addNodeAtCenter,
    disabledKinds: props.disabledKinds ?? [],
    ...(props.disabledReason ? { disabledReason: props.disabledReason } : {}),
  };

  return (
    <div data-whilo-flow className="relative min-h-0 flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={connectable ? handleConnect : undefined}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView={false}
        minZoom={0.2}
        maxZoom={1.8}
        nodesDraggable={editable}
        nodesConnectable={connectable}
        elementsSelectable={editable}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        onNodeClick={(_event, node) => onSelectNode(node.id)}
        onPaneClick={() => onSelectNode(null)}
        onEdgeClick={(_event, edge) => (editable ? onRemoveEdge(edge.id) : undefined)}
        onNodeDragStart={(_event, node) => draggedRef.current.set(node.id, node.position)}
        onNodeDrag={(_event, node) => draggedRef.current.set(node.id, node.position)}
        onNodeDragStop={(_event, node) => {
          draggedRef.current.delete(node.id);
          onMoveNode(node.id, node.position);
        }}
        onMoveEnd={(_event, next) => onViewportChange?.(next)}
        deleteKeyCode={editable ? ["Delete", "Backspace"] : null}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.4} color="color-mix(in srgb, var(--color-ink) 18%, transparent)" />
        <Controls
          showInteractive={false}
          className="!rounded-xl !border !border-hairline/50 !bg-card/90 !shadow-lg [&_button]:!border-hairline/40 [&_button]:!bg-transparent [&_button:hover]:!bg-raised [&_button_svg]:!fill-ink-secondary"
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={minimapColor}
          maskColor="color-mix(in srgb, var(--color-app) 72%, transparent)"
          className="!rounded-xl !border !border-hairline/50 !bg-card/90"
        />
      </ReactFlow>
      {editable && (
        <div className={cn("pointer-events-none absolute inset-x-4 top-4 z-10 flex justify-center")}>
          <div className="pointer-events-auto" data-flow-overlay="">
            <WorkflowToolbar onDelete={deleteSelection} canDelete={nodes.some((node) => node.selected && node.data.removable)} kinds={kinds} addMenu={addMenu} extra={props.toolbarExtra} />
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
