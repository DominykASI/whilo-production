/**
 * Whilo Data: the board seen as data. Every node kind is counted and the connections drawn as a
 * small graph, so a board becomes a dashboard over itself. It reads the same document the
 * Whiteboard and Sheets do; nothing here is a second source of truth.
 */

import { BarChart3, GitBranch, Layers, Plus } from "lucide-react";
import { useMemo } from "react";
import { useCaptionChrome } from "@/components/DesktopCapabilities";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useWhiloBoard } from "@/lib/whilo-board-store";
import type { WhiloNodeKind } from "@/lib/whilo-board-model";

const KIND_COLOR: Record<string, string> = {
  note: "bg-raised",
  text: "bg-raised",
  shape: "bg-accent/25",
  frame: "bg-raised/60",
  prompt: "bg-accent/20",
  agent: "bg-accent/30",
  llm: "bg-success/25",
  output: "bg-warning/25",
  condition: "bg-danger/20",
  image: "bg-raised",
  data: "bg-accent/20",
};

export function DataPage() {
  const { dragProps } = useCaptionChrome();
  const { doc, boards, selectBoard, createBoard } = useWhiloBoard();

  const stats = useMemo(() => {
    if (!doc) return { byKind: new Map<WhiloNodeKind, number>(), total: 0, edges: 0, orphan: 0, tones: new Map<string, number>() };
    const byKind = new Map<WhiloNodeKind, number>();
    const tones = new Map<string, number>();
    for (const node of doc.nodes) {
      byKind.set(node.data.kind, (byKind.get(node.data.kind) ?? 0) + 1);
      tones.set(node.data.tone, (tones.get(node.data.tone) ?? 0) + 1);
    }
    const connected = new Set<string>();
    for (const edge of doc.edges) {
      connected.add(edge.source);
      connected.add(edge.target);
    }
    const orphan = doc.nodes.filter((node) => !connected.has(node.id) && node.data.kind !== "frame").length;
    return { byKind, total: doc.nodes.length, edges: doc.edges.length, orphan, tones };
  }, [doc]);

  const maxCount = Math.max(1, ...[...stats.byKind.values()]);

  const words = useMemo(() => {
    if (!doc) return 0;
    return doc.nodes.reduce((sum, node) => sum + node.data.text.split(/\s+/).filter(Boolean).length, 0);
  }, [doc]);

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-app text-ink animate-workspace-in">
      <header {...dragProps} className="flex shrink-0 items-center gap-2.5 border-b border-hairline/40 px-6 py-3.5 max-md:pl-12">
        <BarChart3 size={18} className="text-ink-secondary" />
        <h1 className="text-[17px] font-semibold">{t("whiloData.title")}</h1>
        <div className="ml-auto flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <select
            value={doc?.id ?? ""}
            onChange={(event) => selectBoard(event.target.value)}
            className="rounded-lg border border-hairline/50 bg-inset px-2.5 py-1.5 text-[12.5px] text-ink outline-none"
          >
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => createBoard("Untitled data")} className="flex size-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-raised hover:text-ink" title="New board" aria-label="New board">
            <Plus size={16} />
          </button>
        </div>
      </header>
      {doc ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Nodes" value={stats.total} icon={<Layers size={16} />} />
              <Stat label="Connections" value={stats.edges} icon={<GitBranch size={16} />} />
              <Stat label="Loose nodes" value={stats.orphan} icon={<Layers size={16} />} />
              <Stat label="Words" value={words} icon={<BarChart3 size={16} />} />
            </section>

            <section className="rounded-2xl border border-hairline/40 bg-card p-5">
              <h2 className="mb-4 text-[15px] font-semibold text-ink">Nodes by kind</h2>
              <div className="flex flex-col gap-2.5">
                {[...stats.byKind.entries()].sort((a, b) => b[1] - a[1]).map(([kind, count]) => (
                  <div key={kind} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-[12px] capitalize text-ink-secondary">{kind}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-inset">
                      <div
                        className={cn("h-full rounded-full transition-[width] duration-500", KIND_COLOR[kind] ?? "bg-accent/25")}
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-[12px] tabular-nums text-ink">{count}</span>
                  </div>
                ))}
                {stats.byKind.size === 0 && <p className="text-[13px] text-ink-secondary">No nodes yet.</p>}
              </div>
            </section>

            <section className="rounded-2xl border border-hairline/40 bg-card p-5">
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Recent nodes</h2>
              <ul className="divide-y divide-hairline/30">
                {doc.nodes.slice(-8).reverse().map((node) => (
                  <li key={node.id} className="flex items-center gap-3 py-2">
                    <span className="rounded-md bg-raised px-1.5 py-0.5 text-[10.5px] capitalize text-ink-secondary">{node.data.kind}</span>
                    <span className="flex-1 truncate text-[12.5px] text-ink">{node.data.title || node.data.text || "(empty)"}</span>
                  </li>
                ))}
                {doc.nodes.length === 0 && <li className="py-2 text-[13px] text-ink-secondary">Nothing yet — add nodes on the Whiteboard.</li>}
              </ul>
            </section>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-[13px] text-ink-secondary">Loading…</div>
      )}
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline/40 bg-card p-4">
      <div className="flex items-center gap-2 text-ink-secondary">
        {icon}
        <span className="text-[11.5px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-[26px] font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
