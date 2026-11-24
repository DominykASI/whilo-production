import { AlertTriangle, Clock3, LayoutGrid, MessageSquare, Monitor, RotateCcw, Sparkles, Trash2, Workflow as WorkflowIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCaptionChrome } from "@/components/DesktopCapabilities";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useRuntimeCapabilities } from "@/lib/runtime-capability";
import { useWhiloBoard, whiloEnvironmentId } from "@/lib/whilo-board-store";
import { buildWorkflow } from "@/lib/whilo-workflow-diagram";
import {
  agentNodeId,
  workflowBounds,
  type Workflow,
  type WorkflowEdge,
  type WorkflowNode,
  type WorkflowNodeKind,
  type WorkflowPoint,
  type WorkflowStepNode,
} from "@/lib/whilo-workflow-model";
import { whiloText } from "@/lib/whilo-workflow-text";
import { useStore } from "@/state/store";
import { WorkflowAssistant } from "./WorkflowAssistant";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { WorkflowCanvasEmpty } from "./WorkflowCanvasEmpty";
import { WorkflowInspector } from "./WorkflowInspector";
import { CANVAS_KINDS, DESKTOP_ONLY_KINDS, isContentKind } from "./workflow-kinds";

const LAYOUT_KEY = "whilo-workflow-layout";
const STEPS_KEY = "whilo-workflow-steps";
const SAVE_DELAY_MS = 500;

interface SavedLayout {
  nodeId: string;
  position: WorkflowPoint;
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function readLayout(envId: string): SavedLayout[] {
  const parsed = readJson(`${LAYOUT_KEY}:${envId}`);
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as { nodeId?: unknown; position?: { x?: unknown; y?: unknown } };
    const x = Number(record.position?.x);
    const y = Number(record.position?.y);
    return typeof record.nodeId === "string" && Number.isFinite(x) && Number.isFinite(y) ? [{ nodeId: record.nodeId, position: { x, y } }] : [];
  });
}

interface SavedSteps {
  nodes: WorkflowStepNode[];
  edges: WorkflowEdge[];
}

function readSteps(envId: string): SavedSteps {
  const parsed = readJson(`${STEPS_KEY}:${envId}`);
  if (typeof parsed !== "object" || parsed === null) return { nodes: [], edges: [] };
  const record = parsed as { nodes?: unknown; edges?: unknown };
  const nodes: WorkflowStepNode[] = Array.isArray(record.nodes)
    ? record.nodes.flatMap((entry) => {
        if (typeof entry !== "object" || entry === null) return [];
        const node = entry as Partial<WorkflowStepNode>;
        if (typeof node.id !== "string" || typeof node.kind !== "string" || !CANVAS_KINDS.includes(node.kind as WorkflowNodeKind)) return [];
        const x = Number(node.position?.x ?? 0);
        const y = Number(node.position?.y ?? 0);
        return [{ kind: node.kind as WorkflowStepNode["kind"], id: node.id, position: { x, y }, title: String(node.title ?? ""), text: String(node.text ?? "") }];
      })
    : [];
  const edges: WorkflowEdge[] = Array.isArray(record.edges)
    ? record.edges.flatMap((entry) => {
        if (typeof entry !== "object" || entry === null) return [];
        const edge = entry as Partial<WorkflowEdge>;
        return typeof edge.id === "string" && typeof edge.from === "string" && typeof edge.to === "string"
          ? [{ id: edge.id, from: edge.from, to: edge.to, ...(typeof edge.routineId === "string" ? { routineId: edge.routineId } : {}) }]
          : [];
      })
    : [];
  return { nodes, edges };
}

export interface WorkflowsPageProps {
  /** Whether the desktop-only parts of this screen render. Defaults to what the runtime detects. */
  isDesktop?: boolean;
  onOpenRoutines?: (() => void) | undefined;
}

export function WorkflowsPage({ isDesktop, onOpenRoutines }: WorkflowsPageProps) {
  const { dragProps } = useCaptionChrome();
  const { state, dispatch } = useStore();
  const capabilities = useRuntimeCapabilities();
  const desktop = isDesktop ?? capabilities.isDesktop;
  const { boards, doc, createBoard, selectBoard, removeBoard } = useWhiloBoard();
  const [showAssistant, setShowAssistant] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [focusRoutineId, setFocusRoutineId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: "neutral" | "danger" } | null>(null);
  const [envId, setEnvId] = useState("local");
  const [layout, setLayout] = useState<SavedLayout[]>([]);
  const [steps, setSteps] = useState<SavedSteps>({ nodes: [], edges: [] });

  useEffect(() => {
    let live = true;
    void whiloEnvironmentId().then((id) => {
      if (!live) return;
      setEnvId(id);
      setLayout(readLayout(id));
      setSteps(readSteps(id));
    });
    return () => {
      live = false;
    };
  }, []);

  const persistLayout = useCallback(
    (next: SavedLayout[]) => {
      setLayout(next);
      window.setTimeout(() => writeJson(`${LAYOUT_KEY}:${envId}`, next), SAVE_DELAY_MS);
    },
    [envId],
  );

  const persistSteps = useCallback(
    (next: SavedSteps) => {
      setSteps(next);
      window.setTimeout(() => writeJson(`${STEPS_KEY}:${envId}`, next), SAVE_DELAY_MS);
    },
    [envId],
  );

  const moved = useMemo(() => Object.fromEntries(layout.map((entry) => [entry.nodeId, entry.position])), [layout]);

  const workflow = useMemo<Workflow>(() => {
    const base = buildWorkflow({
      name: doc?.name ?? whiloText("whiloWorkflow.title"),
      bots: state.bots,
      routines: state.routines,
      runs: state.routineRuns,
      moved,
    });
    if (steps.nodes.length === 0 && steps.edges.length === 0) return base;
    const present = new Set([...base.nodes.map((node) => node.id), ...steps.nodes.map((node) => node.id)]);
    return {
      ...base,
      nodes: [...base.nodes, ...steps.nodes],
      edges: [...base.edges, ...steps.edges].filter((edge) => present.has(edge.from) && present.has(edge.to)),
    };
  }, [doc?.name, moved, state.bots, state.routineRuns, state.routines, steps]);

  const routineNodes = useMemo(() => workflow.nodes.filter((node) => node.kind === "routine"), [workflow.nodes]);
  const agentCount = useMemo(() => workflow.nodes.filter((node) => node.kind === "agent").length, [workflow.nodes]);
  const empty = routineNodes.length === 0 && state.routines.length === 0;

  const remember = useCallback(
    (nodeId: string, position: WorkflowPoint) => {
      persistLayout([...layout.filter((entry) => entry.nodeId !== nodeId), { nodeId, position }]);
    },
    [layout, persistLayout],
  );

  const handleAddNode = useCallback(
    (kind: WorkflowNodeKind, position: WorkflowPoint) => {
      const id = `${kind}-${Math.random().toString(36).slice(2, 9)}`;
      const node: WorkflowStepNode = {
        kind: kind as WorkflowStepNode["kind"],
        id,
        position,
        title: whiloText(isContentKind(kind) ? "whiloWorkflow.nodeNote" : "whiloWorkflow.nodeOutput"),
        text: "",
      };
      persistSteps({ ...steps, nodes: [...steps.nodes, node] });
      setSelectedNodeId(id);
    },
    [persistSteps, steps],
  );

  const handleConnect = useCallback(
    async (from: string, to: string) => {
      const id = `edge-${Math.random().toString(36).slice(2, 9)}`;
      persistSteps({ ...steps, edges: [...steps.edges, { id, from, to, ...(focusRoutineId ? { routineId: focusRoutineId } : {}) }] });
      return true;
    },
    [focusRoutineId, persistSteps, steps],
  );

  const handleRemoveEdge = useCallback(
    (edgeId: string) => {
      persistSteps({ ...steps, edges: steps.edges.filter((edge) => edge.id !== edgeId) });
    },
    [persistSteps, steps],
  );

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      if (nodeId.startsWith("agent:")) {
        const agentId = nodeId.slice("agent:".length);
        persistLayout(layout.filter((entry) => entry.nodeId !== agentNodeId(agentId)));
      } else {
        persistSteps({ nodes: steps.nodes.filter((node) => node.id !== nodeId), edges: steps.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId) });
      }
      setSelectedNodeId(null);
    },
    [layout, persistLayout, persistSteps, steps.edges, steps.nodes],
  );

  const handleRunRoutine = useCallback(
    (nodeId: string) => {
      const routineId = nodeId.startsWith("routine:") ? nodeId.slice("routine:".length) : null;
      if (!routineId) return;
      if (!desktop) {
        setNotice({ text: whiloText("whiloWorkflow.desktopOnlyRuns"), tone: "neutral" });
        return;
      }
      dispatch({ type: "runRoutine", routineId });
    },
    [desktop, dispatch],
  );

  const insertAgents = useCallback(() => {
    if (!desktop) {
      setNotice({ text: whiloText("whiloWorkflow.desktopOnly"), tone: "neutral" });
      return;
    }
    const placed = new Set(layout.map((entry) => entry.nodeId));
    const next = state.bots
      .filter((bot) => !bot.hidden && !placed.has(agentNodeId(bot.id)))
      .slice(0, 12)
      .map((bot, index) => ({ nodeId: agentNodeId(bot.id), position: { x: 400 + (index % 3) * 36, y: 40 + index * 220 } }));
    if (next.length === 0) {
      setNotice({ text: whiloText("whiloWorkflow.allAgentsPlaced"), tone: "neutral" });
      return;
    }
    persistLayout([...layout.filter((entry) => !next.some((added) => added.nodeId === entry.nodeId)), ...next]);
  }, [desktop, layout, persistLayout, state.bots]);

  const clearBoard = useCallback(() => {
    persistLayout([]);
    persistSteps({ nodes: [], edges: [] });
    createBoard(doc?.name ?? whiloText("whiloWorkflow.untitled"));
    setFocusRoutineId(null);
    setSelectedNodeId(null);
  }, [createBoard, doc?.name, persistLayout, persistSteps]);

  const currentName = doc?.name ?? whiloText("whiloWorkflow.title");
  const crowded = showAssistant && showInspector;

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-app text-ink animate-workspace-in">
      <header {...dragProps} className="flex shrink-0 items-center gap-2.5 border-b border-hairline/40 px-6 py-3.5 max-md:pl-12">
        <WorkflowIcon size={18} className="shrink-0 text-ink-secondary" />
        <h1 className="text-[17px] font-semibold">{t("automations.title")}</h1>
        <span className="hidden truncate text-[12.5px] text-ink-secondary xl:inline">
          {whiloText("whiloWorkflow.subtitle")} · {routineNodes.length} · {agentCount}
        </span>
        <div className="relative ml-auto flex items-center gap-1.5" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          {!desktop && (
            <span
              title={whiloText("whiloWorkflow.webNotice")}
              className="hidden items-center gap-1.5 rounded-full border border-hairline/50 bg-inset px-2.5 py-1 text-[11px] text-ink-secondary lg:flex"
            >
              <Monitor size={12} />
              {whiloText("whiloWorkflow.desktopOnly")}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowPicker((open) => !open)}
            aria-expanded={showPicker}
            className="flex items-center gap-2 rounded-lg border border-hairline/50 bg-inset px-3 py-1.5 text-[12.5px] text-ink hover:bg-raised"
          >
            <span className="max-w-[180px] truncate">{currentName}</span>
            <span className="text-ink-tertiary">{boards.length}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              createBoard(whiloText("whiloWorkflow.untitled"));
              setShowPicker(false);
            }}
            aria-label={whiloText("whiloWorkflow.newBoard")}
            title={whiloText("whiloWorkflow.newBoard")}
            className="flex size-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-raised hover:text-ink"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={insertAgents}
            aria-pressed={false}
            title={whiloText("whiloWorkflow.insertAgents")}
            aria-label={whiloText("whiloWorkflow.insertAgents")}
            className="flex size-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-raised hover:text-ink"
          >
            <Sparkles size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowAssistant((open) => !open)}
            aria-pressed={showAssistant}
            title={whiloText("whiloWorkflow.assistant")}
            aria-label={whiloText("whiloWorkflow.assistant")}
            className={cn("flex size-8 items-center justify-center rounded-lg hover:bg-raised", showAssistant ? "text-accent" : "text-ink-secondary hover:text-ink")}
          >
            <MessageSquare size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowInspector((open) => !open)}
            aria-pressed={showInspector}
            title={whiloText("whiloWorkflow.inspector")}
            aria-label={whiloText("whiloWorkflow.inspector")}
            className={cn("flex size-8 items-center justify-center rounded-lg hover:bg-raised", showInspector ? "text-accent" : "text-ink-secondary hover:text-ink")}
          >
            <Clock3 size={16} />
          </button>
          <button
            type="button"
            onClick={clearBoard}
            aria-label={whiloText("whiloWorkflow.clear")}
            title={whiloText("whiloWorkflow.clear")}
            className="flex size-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-raised hover:text-danger"
          >
            <RotateCcw size={16} />
          </button>
          {showPicker && (
            <div className="absolute right-0 top-10 z-20 w-64 overflow-hidden rounded-xl border border-hairline/50 bg-menu p-1 shadow-2xl animate-pop-in">
              {boards.map((board) => (
                <div key={board.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      selectBoard(board.id);
                      setShowPicker(false);
                    }}
                    className={cn("flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] hover:bg-menu-hover", board.id === doc?.id ? "text-accent" : "text-ink")}
                  >
                    <WorkflowIcon size={14} className="shrink-0 opacity-70" />
                    <span className="truncate">{board.name}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-ink-tertiary">{board.nodes.length}</span>
                  </button>
                  {boards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBoard(board.id)}
                      aria-label={`${t("common.delete")} ${board.name}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-tertiary hover:bg-menu-hover hover:text-danger"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {!desktop && (
        <p className="flex items-start gap-2 border-b border-hairline/30 bg-inset px-6 py-2 text-[12px] leading-relaxed text-ink-secondary">
          <Monitor size={13} className="mt-0.5 shrink-0" />
          {whiloText("whiloWorkflow.webNotice")}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className={cn(
            "flex items-center gap-2 border-b border-hairline/30 px-6 py-2 text-[12px]",
            notice.tone === "danger" ? "bg-danger/10 text-danger" : "bg-inset text-ink-secondary",
          )}
        >
          {notice.tone === "danger" ? <AlertTriangle size={13} className="shrink-0" /> : <Monitor size={13} className="shrink-0" />}
          <span className="min-w-0 flex-1">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] hover:bg-raised">
            {t("common.close")}
          </button>
        </p>
      )}

      <div className="relative flex min-h-0 flex-1">
        {empty ? (
          <WorkflowCanvasEmpty {...(onOpenRoutines ? { onCreateRoutine: onOpenRoutines } : {})} />
        ) : (
          <>
            <WorkflowCanvas
              workflow={workflow}
              bots={state.bots}
              focusRoutineId={focusRoutineId}
              selectedNodeId={selectedNodeId}
              editable
              canRun={desktop}
              kinds={CANVAS_KINDS}
              disabledKinds={desktop ? [] : DESKTOP_ONLY_KINDS}
              disabledReason={whiloText("whiloWorkflow.desktopOnly")}
              onSelectNode={setSelectedNodeId}
              onMoveNode={remember}
              onConnect={handleConnect}
              onRemoveEdge={handleRemoveEdge}
              onRemoveNode={handleRemoveNode}
              onAddNode={handleAddNode}
              onRunRoutine={handleRunRoutine}
              onFocusRoutine={setFocusRoutineId}
              onNotice={(message, tone) => setNotice({ text: whiloText(message), tone })}
              toolbarExtra={
                <button
                  type="button"
                  onClick={insertAgents}
                  disabled={!desktop}
                  title={whiloText("whiloWorkflow.insertAgents")}
                  aria-label={whiloText("whiloWorkflow.insertAgents")}
                  className="flex size-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-raised hover:text-ink disabled:opacity-40"
                >
                  <Sparkles size={16} />
                </button>
              }
            />
            {showAssistant && (
              <WorkflowAssistant
                workflow={workflow}
                agentId={state.bots[0]?.id}
                agentName={state.bots[0]?.name}
                onApply={() => undefined}
                className={cn(crowded && "max-xl:hidden")}
              />
            )}
            {showInspector && <WorkflowInspector workflow={workflow} bots={state.bots} selectedNodeId={selectedNodeId} focusRoutineId={focusRoutineId} now={Date.now()} onSelectNode={setSelectedNodeId} onFocusRoutine={setFocusRoutineId} />}
          </>
        )}
      </div>
    </main>
  );
}

export const WORKFLOW_WIDTH_HINT = { bounds: workflowBounds } as const;

export type { WorkflowNode };
