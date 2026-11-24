/**
 * Whilo Whiteboard: an infinite canvas of notes, shapes, prompts, agents and models, with the AI
 * panel beside it. It reads its boards from the local store and shows them in the sidebar picker.
 */

import { LayoutGrid, MessageSquare, Plus, Sparkles, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useCaptionChrome } from "@/components/DesktopCapabilities";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useWhiloBoard } from "@/lib/whilo-board-store";
import { createWhiloNode } from "@/lib/whilo-board-model";
import { useStore } from "@/state/store";
import { BoardCanvas } from "./BoardCanvas";
import { applyBoardOps, BoardChat, type BoardOp } from "./BoardChat";

export function WhiteboardPage() {
  const { dragProps } = useCaptionChrome();
  const { state } = useStore();
  const { boards, doc, update, createBoard, selectBoard, removeBoard } = useWhiloBoard();
  const [showChat, setShowChat] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const insertAgents = useCallback(() => {
    update((current) => {
      const agents = state.bots.slice(0, 12);
      if (agents.length === 0) return current;
      const existing = new Set(current.nodes.map((node) => node.data.agentId));
      const additions = agents
        .filter((bot) => !existing.has(bot.id))
        .map((bot, index) =>
          createWhiloNode("agent", { x: 120 + index * 40, y: 120 + index * 160 }, {
            title: bot.name,
            text: "",
            agentId: bot.id,
            tone: "accent",
          }),
        );
      return { ...current, nodes: [...current.nodes, ...additions], updatedAt: Date.now() };
    });
  }, [state.bots, update]);

  const onOps = useCallback(
    (ops: BoardOp[]) => {
      update((current) => applyBoardOps(current, ops));
    },
    [update],
  );

  const currentName = doc?.name ?? t("whiteboard.title");

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-app text-ink animate-workspace-in">
      <header
        {...dragProps}
        className="flex shrink-0 items-center gap-2.5 border-b border-hairline/40 px-6 py-3.5 max-md:pl-12"
      >
        <LayoutGrid size={18} className="text-ink-secondary" />
        <h1 className="text-[17px] font-semibold">{t("whiteboard.title")}</h1>
        <div className="relative ml-auto flex items-center gap-1.5" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <button
            type="button"
            onClick={() => setShowPicker((open) => !open)}
            className="flex items-center gap-2 rounded-lg border border-hairline/50 bg-inset px-3 py-1.5 text-[12.5px] text-ink hover:bg-raised"
          >
            <span className="max-w-[180px] truncate">{currentName}</span>
            <span className="text-ink-tertiary">{boards.length}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              createBoard("Untitled board");
              setShowPicker(false);
            }}
            className="flex size-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-raised hover:text-ink"
            title="New board"
            aria-label="New board"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowChat((open) => !open)}
            aria-pressed={showChat}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg hover:bg-raised",
              showChat ? "text-accent" : "text-ink-secondary hover:text-ink",
            )}
            title="Board assistant"
            aria-label="Board assistant"
          >
            <MessageSquare size={16} />
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
                    className={cn(
                      "flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] hover:bg-menu-hover",
                      board.id === doc?.id ? "text-accent" : "text-ink",
                    )}
                  >
                    <Sparkles size={14} className="shrink-0 opacity-70" />
                    <span className="truncate">{board.name}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-ink-tertiary">{board.nodes.length}</span>
                  </button>
                  {boards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBoard(board.id)}
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-tertiary hover:bg-menu-hover hover:text-danger"
                      aria-label={`Delete ${board.name}`}
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
      <div className="relative flex min-h-0 flex-1">
        {doc ? (
          <>
            <BoardCanvas doc={doc} onChange={update} onInsertAgents={insertAgents} />
            {showChat && <BoardChat doc={doc} onOps={onOps} className="max-lg:hidden" />}
          </>
        ) : (
          <EmptyBoard onCreate={() => createBoard("Untitled board")} />
        )}
      </div>
    </main>
  );
}

function EmptyBoard({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-hairline/50 bg-card">
        <LayoutGrid size={24} className="text-ink-tertiary" />
      </div>
      <div>
        <h2 className="text-[15px] font-semibold text-ink">No board yet</h2>
        <p className="mt-1 text-[13px] text-ink-secondary">Make your first board and start thinking on it.</p>
      </div>
      <button type="button" onClick={onCreate} className="ui-button ui-button-primary">
        New board
      </button>
    </div>
  );
}
