import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { whiloText } from "@/lib/whilo-workflow-text";

const STEP_MS = 1_400;
const LENGTH = 10;
const SHOW_AT = [0, 1, 1, 2, 2, 3, 4];

interface SampleNode {
  id: string;
  x: number;
  y: number;
  label: string;
  appear: number;
  kind: "routine" | "agent";
}

const SAMPLE: SampleNode[] = [
  { id: "routine", x: 0, y: 220, label: "whiloWorkflow.sampleRoutine", appear: 0, kind: "routine" },
  { id: "research", x: 380, y: 40, label: "whiloWorkflow.nodeAgent", appear: 1, kind: "agent" },
  { id: "sales", x: 380, y: 400, label: "whiloWorkflow.nodeAgent", appear: 1, kind: "agent" },
  { id: "writer", x: 760, y: 220, label: "whiloWorkflow.nodeAgent", appear: 2, kind: "agent" },
  { id: "chief", x: 1140, y: 220, label: "whiloWorkflow.nodeAgent", appear: 3, kind: "agent" },
];

const EDGES = [
  { id: "e1", from: "routine", to: "research", draw: 1 },
  { id: "e2", from: "routine", to: "sales", draw: 1 },
  { id: "e3", from: "research", to: "writer", draw: 2 },
  { id: "e4", from: "sales", to: "writer", draw: 2 },
  { id: "e5", from: "writer", to: "chief", draw: 3 },
];

const WIDTH = 268;
const HEIGHT = 140;

function pathFor(from: SampleNode, to: SampleNode): string {
  const x1 = from.x + WIDTH;
  const y1 = from.y + 26;
  const x2 = to.x;
  const y2 = to.y + 26;
  const bend = Math.max(48, Math.abs(x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
}

export function WorkflowCanvasEmpty({ onCreateRoutine }: { onCreateRoutine?: (() => void) | undefined }) {
  const [tick, setTick] = useState(SHOW_AT.length);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStill(true);
      setTick(SHOW_AT.length);
      return;
    }
    let frame = 0;
    const step = () => {
      setTick((value) => {
        const next = value + 1;
        if (next >= LENGTH) {
          frame = window.setTimeout(() => setTick(0), 120);
          return next;
        }
        frame = window.setTimeout(step, STEP_MS);
        return next;
      });
    };
    frame = window.setTimeout(step, STEP_MS);
    return () => window.clearTimeout(frame);
  }, []);

  const byId = useMemo(() => new Map(SAMPLE.map((node) => [node.id, node])), []);
  const bounds = useMemo(() => {
    const right = Math.max(...SAMPLE.map((node) => node.x + WIDTH));
    const bottom = Math.max(...SAMPLE.map((node) => node.y + HEIGHT));
    return { width: right, height: bottom };
  }, []);

  return (
    <div className="flow-canvas relative min-h-0 flex-1 overflow-hidden bg-app" data-still={still ? "" : undefined}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.55]">
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--color-ink)_18%,transparent)_1px,transparent_0)] [background-size:24px_24px]" />
        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width={bounds.width} height={bounds.height} viewBox={`0 0 ${bounds.width} ${bounds.height}`}>
          {EDGES.map((edge) => {
            const from = byId.get(edge.from)!;
            const to = byId.get(edge.to)!;
            const shown = tick >= edge.draw;
            return (
              <path
                key={edge.id}
                d={pathFor(from, to)}
                fill="none"
                stroke="color-mix(in srgb, var(--color-ink) 34%, transparent)"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeDasharray={1600}
                strokeDashoffset={shown ? 0 : 1600}
                style={{ transition: "stroke-dashoffset 900ms ease-in-out 350ms" }}
              />
            );
          })}
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: bounds.width, height: bounds.height }}>
          {SAMPLE.map((node) => (
            <div
              key={node.id}
              className={cn("absolute rounded-xl border border-hairline/50 bg-card/80 transition-[opacity,filter,transform] duration-700", tick >= node.appear ? "opacity-100 blur-0" : "opacity-0 blur-[6px]")}
              style={{ left: node.x, top: node.y, width: WIDTH, transform: tick >= node.appear ? "none" : "translateY(12px) scale(0.96)" }}
            >
              <div className="flex h-[52px] items-center gap-2 border-b border-hairline/40 px-2.5">
                <span className={cn("size-7 shrink-0 rounded-lg", node.kind === "routine" ? "bg-accent/20" : "bg-inset")} />
                <span className="text-[13px] font-semibold text-ink">{node.kind === "routine" ? whiloText("whiloWorkflow.sampleRoutine") : whiloText(node.label)}</span>
              </div>
              <p className="px-3 py-2.5 text-[12px] leading-relaxed text-ink-secondary">
                {node.kind === "routine" ? whiloText("whiloWorkflow.sampleInstruction") : whiloText("whiloWorkflow.agentTask")}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 grid h-full place-content-center gap-5 p-8 text-center" style={{ maxWidth: "34rem", margin: "0 auto" }}>
        <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">
          <span className="block text-ink-tertiary">{whiloText("whiloWorkflow.emptyLead")} </span>
          <span>
            {whiloText("whiloWorkflow.emptyRun")}
            <span className="text-accent-text"> {whiloText("whiloWorkflow.emptyHand")}</span>
          </span>
        </h2>
        <p className="grid gap-1 text-[14px] leading-relaxed text-ink-secondary">
          <span>{whiloText("whiloWorkflow.emptyStart")}</span>
          <span>{whiloText("whiloWorkflow.emptyHandoff")}</span>
        </p>
        {onCreateRoutine && (
          <button
            type="button"
            onClick={onCreateRoutine}
            className="mx-auto w-full max-w-[22rem] rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-ink hover:brightness-110"
          >
            {whiloText("whiloWorkflow.emptyCreate")}
          </button>
        )}
      </div>
    </div>
  );
}

export function firstStepTick(): number {
  return STEP_MS;
}
