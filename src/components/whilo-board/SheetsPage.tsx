/**
 * Whilo Sheets: a spreadsheet over the board document. Every node is a row, its title and text are
 * cells, and the columns map to the node's own fields. Editing a cell edits the node, so a sheet and
 * a whiteboard are two views of one document — exactly the model the user asked for.
 */

import { Plus, Sheet, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useCaptionChrome } from "@/components/DesktopCapabilities";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useWhiloBoard } from "@/lib/whilo-board-store";
import { createWhiloNode, type WhiloBoardNode, type WhiloNodeData, type WhiloNodeKind } from "@/lib/whilo-board-model";

interface Column {
  key: keyof WhiloNodeData | "id";
  label: string;
  width: string;
}

const COLUMNS: Column[] = [
  { key: "title", label: "Title", width: "min-w-[200px] flex-1" },
  { key: "kind", label: "Kind", width: "w-[130px]" },
  { key: "text", label: "Text", width: "min-w-[280px] flex-[2]" },
  { key: "tone", label: "Tone", width: "w-[110px]" },
  { key: "tags", label: "Tags", width: "w-[160px]" },
];

const KINDS: WhiloNodeKind[] = ["note", "text", "shape", "prompt", "agent", "llm", "data", "output"];

export function SheetsPage() {
  const { dragProps } = useCaptionChrome();
  const { doc, update, createBoard, boards, selectBoard } = useWhiloBoard();
  const [filter, setFilter] = useState("");

  const rows = useMemo(() => {
    if (!doc) return [];
    const needle = filter.trim().toLowerCase();
    if (!needle) return doc.nodes;
    return doc.nodes.filter(
      (node) =>
        node.data.title.toLowerCase().includes(needle) ||
        node.data.text.toLowerCase().includes(needle) ||
        node.data.kind.includes(needle),
    );
  }, [doc, filter]);

  const editCell = (nodeId: string, key: Column["key"], value: string) => {
    update((current) => ({
      ...current,
      nodes: current.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...(key === "title" ? { title: value } : {}),
                ...(key === "text" ? { text: value } : {}),
                ...(key === "kind" ? { kind: (KINDS.includes(value as WhiloNodeKind) ? value : node.data.kind) as WhiloNodeKind } : {}),
                ...(key === "tags" ? { tags: value ? value.split(",").map((tag) => tag.trim()).filter(Boolean) : undefined } : {}),
              },
            }
          : node,
      ),
      updatedAt: Date.now(),
    }));
  };

  const addRow = () => {
    update((current) => ({
      ...current,
      nodes: [...current.nodes, createWhiloNode("note", { x: 60 + current.nodes.length * 24, y: 60 + current.nodes.length * 24 })],
      updatedAt: Date.now(),
    }));
  };

  const removeRow = (nodeId: string) => {
    update((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => node.id !== nodeId),
      edges: current.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      updatedAt: Date.now(),
    }));
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-app text-ink animate-workspace-in">
      <header {...dragProps} className="flex shrink-0 items-center gap-2.5 border-b border-hairline/40 px-6 py-3.5 max-md:pl-12">
        <Sheet size={18} className="text-ink-secondary" />
        <h1 className="text-[17px] font-semibold">{t("sheets.title")}</h1>
        <div className="ml-auto flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter rows…"
            className="w-44 rounded-lg border border-hairline/50 bg-inset px-3 py-1.5 text-[12.5px] text-ink outline-none placeholder:text-ink-tertiary focus:border-accent/50"
          />
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
          <button type="button" onClick={() => createBoard("Untitled sheet")} className="flex size-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-raised hover:text-ink" title="New sheet" aria-label="New sheet">
            <Plus size={16} />
          </button>
        </div>
      </header>
      {doc ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-[12.5px]" data-whilo-sheet>
            <thead className="sticky top-0 z-10 bg-panel">
              <tr className="border-b border-hairline/50 text-left text-[11px] uppercase tracking-wide text-ink-tertiary">
                <th className="w-10 px-3 py-2 font-medium">#</th>
                {COLUMNS.map((column) => (
                  <th key={column.key} className={cn("px-3 py-2 font-medium", column.width)}>
                    {column.label}
                  </th>
                ))}
                <th className="w-12 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((node, index) => (
                <SheetRow key={node.id} node={node} index={index} onEdit={editCell} onRemove={removeRow} />
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <p className="text-[13px] text-ink-secondary">{filter ? "No rows match." : "This sheet is empty."}</p>
              <button type="button" onClick={addRow} className="ui-button ui-button-primary">
                Add a row
              </button>
            </div>
          )}
          {rows.length > 0 && (
            <div className="sticky bottom-0 border-t border-hairline/40 bg-panel px-3 py-2">
              <button type="button" onClick={addRow} className="flex items-center gap-1.5 text-[12px] text-accent hover:underline">
                <Plus size={13} /> Add row
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-[13px] text-ink-secondary">Loading…</div>
      )}
    </main>
  );
}

function SheetRow({
  node,
  index,
  onEdit,
  onRemove,
}: {
  node: WhiloBoardNode;
  index: number;
  onEdit: (nodeId: string, key: Column["key"], value: string) => void;
  onRemove: (nodeId: string) => void;
}) {
  const cell = "border-b border-hairline/30 px-3 py-1.5 align-top";
  return (
    <tr className="group hover:bg-raised/40">
      <td className={cn(cell, "text-center text-[11px] text-ink-tertiary")}>{index + 1}</td>
      <td className={cell}>
        <CellInput value={node.data.title} onChange={(value) => onEdit(node.id, "title", value)} placeholder="Untitled" />
      </td>
      <td className={cell}>
        <select
          value={node.data.kind}
          onChange={(event) => onEdit(node.id, "kind", event.target.value)}
          className="w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[12px] text-ink-secondary hover:border-hairline/40 focus:border-accent/40 focus:outline-none"
        >
          {KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </td>
      <td className={cell}>
        <CellInput value={node.data.text} onChange={(value) => onEdit(node.id, "text", value)} placeholder="…" />
      </td>
      <td className={cn(cell, "text-ink-secondary")}>{node.data.tone}</td>
      <td className={cell}>
        <CellInput
          value={(node.data.tags ?? []).join(", ")}
          onChange={(value) => onEdit(node.id, "tags", value)}
          placeholder="tag, tag"
        />
      </td>
      <td className={cn(cell, "text-center")}>
        <button
          type="button"
          onClick={() => onRemove(node.id)}
          className="flex size-6 items-center justify-center rounded-md text-ink-tertiary opacity-0 transition-opacity hover:bg-raised hover:text-danger group-hover:opacity-100 touch:opacity-100"
          aria-label="Delete row"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

function CellInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const shown = focused ? draft : value;
  return (
    <input
      value={shown}
      placeholder={placeholder}
      onFocus={() => {
        setDraft(value);
        setFocused(true);
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        setFocused(false);
        if (draft !== value) onChange(draft);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      className="w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[12.5px] text-ink outline-none placeholder:text-ink-tertiary hover:border-hairline/40 focus:border-accent/40"
    />
  );
}
