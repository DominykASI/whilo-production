/**
 * The Whilo canvas: React Flow wrapped in Whilo's look. It owns nothing about which board is open;
 * the page hands it a document and a way to change it, so the same canvas serves Whiteboard, Sheets
 * and Data. Every node kind renders through `BoardNode`; edges are drawn by React Flow.
 */

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
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/cn";
import {
  createWhiloNode,
  whiloBoardId,
  type WhiloBoardDoc,
  type WhiloBoardEdge,
  type WhiloBoardNode,
  type WhiloNodeKind,
} from "@/lib/whilo-board-model";
import { BoardNode } from "./BoardNode";
import { BoardToolbar } from "./BoardToolbar";

const nodeTypes = { note: BoardNode, text: BoardNode, shape: BoardNode, frame: BoardNode, prompt: BoardNode, agent: BoardNode, llm: BoardNode, output: BoardNode, condition: BoardNode, image: BoardNode, data: BoardNode };

export interface BoardCanvasProps {
  doc: WhiloBoardDoc;
  /** Applies a change to the document; the page debounces the save. */
  onChange: (mutate: (doc: WhiloBoardDoc) => WhiloBoardDoc) => void;
  /** Adds the agent nodes for the agents the app knows, laid out in a column. */
  onInsertAgents?: (() => void) | undefined;
  className?: string;
  /** Which node kinds the toolbar offers. Sheets and Data pass a narrower set. */
  kinds?: WhiloNodeKind[] | undefined;
  readOnly?: boolean | undefined;
}

/**
 * The inner canvas. It reads the document once into React Flow state and writes every change back
 * through `onChange`. `doc.id` keys the whole thing, so switching boards remounts cleanly.
 */
function BoardCanvasInner({ doc, onChange, onInsertAgents, className, kinds, readOnly }: BoardCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<WhiloBoardNode>(doc.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WhiloBoardEdge>(doc.edges);
  const { screenToFlowPosition, setViewport } = useReactFlow();
  const restoredRef = useRef(false);
  // The document seeds the canvas; the canvas must not write that seed straight back, or merely
  // opening a board would mark it edited and shuffle it to the top of the picker.
  const hydratedRef = useRef(false);

  // A new board (a new id) replaces what the canvas holds.
  useEffect(() => {
    hydratedRef.current = false;
    setNodes(doc.nodes);
    setEdges(doc.edges);
    restoredRef.current = false;
    const frame = requestAnimationFrame(() => {
      hydratedRef.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [doc.id, setNodes, setEdges]);

  // The saved camera is applied once per board, after the canvas is measured.
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const viewport = doc.viewport;
    const frame = requestAnimationFrame(() => {
      if (viewport && (viewport.x !== 0 || viewport.y !== 0 || viewport.zoom !== 1)) {
        void setViewport(viewport, { duration: 0 });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [doc.id, doc.viewport, setViewport]);

  // Every change to nodes or edges persists back into the document.
  useEffect(() => {
    if (!hydratedRef.current) return;
    onChange((current) => ({ ...current, nodes, edges }));
  }, [nodes, edges, onChange]);

  const onConnect = useCallback<OnConnect>(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge({ ...connection, id: whiloBoardId("edge"), type: "smoothstep", animated: false }, current),
      );
    },
    [setEdges],
  );

  const addNode = useCallback(
    (kind: WhiloNodeKind) => {
      const bounds = document.querySelector("[data-whilo-canvas]")?.getBoundingClientRect();
      const center = bounds
        ? screenToFlowPosition({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 })
        : { x: 0, y: 0 };
      const jitter = nodes.length * 18;
      setNodes((current) => [...current, createWhiloNode(kind, { x: center.x - 120 + jitter, y: center.y - 60 + jitter })]);
    },
    [nodes.length, screenToFlowPosition, setNodes],
  );

  const deleteSelected = useCallback(() => {
    setNodes((current) => current.filter((node) => !node.selected));
    setEdges((current) => current.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  const minimapColor = useMemo(
    () => (node: WhiloBoardNode) => (node.data?.tone === "accent" ? "var(--color-accent)" : "color-mix(in srgb, var(--color-ink) 30%, transparent)"),
    [],
  );

  return (
    <div data-whilo-canvas className={cn("relative h-full w-full", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView={false}
        minZoom={0.1}
        maxZoom={4}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        onMoveEnd={(_, viewport) => onChange((current) => ({ ...current, viewport }))}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.5}
          color="color-mix(in srgb, var(--color-ink-secondary) 22%, transparent)"
        />
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
      {!readOnly && (
        <BoardToolbar
          onAdd={addNode}
          onDelete={deleteSelected}
          onInsertAgents={onInsertAgents}
          kinds={kinds}
        />
      )}
    </div>
  );
}

export function BoardCanvas(props: BoardCanvasProps) {
  return (
    <ReactFlowProvider>
      <BoardCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
