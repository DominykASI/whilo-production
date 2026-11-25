/**
 * The board store: the boards on this computer, and the hook the pages use to read and write one.
 *
 * Like the team canvas, boards live in localStorage keyed by the environment id the server
 * answers. A write is debounced, so dragging a node does not hit storage on every frame. The
 * store is small on purpose: the canvas holds the live React Flow state, and this keeps the
 * document that state is saved into.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/state/api";
import {
  createWhiloBoard,
  parseWhiloBoard,
  parseWhiloBoardIndex,
  serializeWhiloBoard,
  whiloBoardIndexKey,
  whiloBoardStorageKey,
  type WhiloBoardDoc,
  type WhiloBoardIndexEntry,
} from "./whilo-board-model";

const SAVE_DELAY_MS = 500;

/** The environment id the server answers, cached for the tab. Null until it answers. */
let environmentIdPromise: Promise<string> | null = null;

export function whiloEnvironmentId(): Promise<string> {
  environmentIdPromise ??= api<{ environmentId?: string }>("/.well-known/whilo/environment", {
    signal: AbortSignal.timeout(5_000),
  })
    .then((environment) => (typeof environment.environmentId === "string" ? environment.environmentId : "local"))
    .catch(() => "local");
  return environmentIdPromise;
}

function readRaw(environmentId: string, boardId: string): unknown {
  try {
    const stored = localStorage.getItem(`${whiloBoardStorageKey(environmentId)}:${boardId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function readIndex(environmentId: string): WhiloBoardIndexEntry[] {
  try {
    return parseWhiloBoardIndex(JSON.parse(localStorage.getItem(whiloBoardIndexKey(environmentId)) ?? "[]"));
  } catch {
    return [];
  }
}

function writeIndex(environmentId: string, entries: WhiloBoardIndexEntry[]): void {
  try {
    localStorage.setItem(whiloBoardIndexKey(environmentId), JSON.stringify(entries));
  } catch {
    /* storage is best effort; a full disk must not break the board */
  }
}

/** Loads every board on this computer, creating the first one when there are none. */
export async function loadWhiloBoards(): Promise<WhiloBoardDoc[]> {
  const environmentId = await whiloEnvironmentId();
  const index = readIndex(environmentId);
  const boards = index
    .map((entry) => parseWhiloBoard(readRaw(environmentId, entry.id), entry.id, entry.name))
    .filter((doc) => doc.nodes.length > 0 || doc.edges.length > 0 || index.some((entry) => entry.id === doc.id));
  if (boards.length > 0) return boards.sort((a, b) => b.updatedAt - a.updatedAt);
  const first = createWhiloBoard("Untitled board");
  saveWhiloBoardNow(environmentId, first);
  return [first];
}

export async function saveWhiloBoardNow(environmentId: string, doc: WhiloBoardDoc): Promise<void> {
  try {
    localStorage.setItem(`${whiloBoardStorageKey(environmentId)}:${doc.id}`, serializeWhiloBoard(doc));
    const index = readIndex(environmentId).filter((entry) => entry.id !== doc.id);
    index.unshift({ id: doc.id, name: doc.name, updatedAt: doc.updatedAt, nodeCount: doc.nodes.length });
    writeIndex(environmentId, index);
  } catch {
    /* best effort */
  }
}

export async function deleteWhiloBoard(boardId: string): Promise<void> {
  const environmentId = await whiloEnvironmentId();
  try {
    localStorage.removeItem(`${whiloBoardStorageKey(environmentId)}:${boardId}`);
    writeIndex(environmentId, readIndex(environmentId).filter((entry) => entry.id !== boardId));
  } catch {
    /* best effort */
  }
}

export interface UseWhiloBoard {
  boards: WhiloBoardDoc[];
  doc: WhiloBoardDoc | null;
  loading: boolean;
  /** Replaces the document for the open board and schedules a save. */
  update: (mutate: (doc: WhiloBoardDoc) => WhiloBoardDoc) => void;
  /** Makes a new empty board and opens it. */
  createBoard: (name: string) => WhiloBoardDoc;
  /** Opens an existing board by id. */
  selectBoard: (id: string) => void;
  removeBoard: (id: string) => void;
  /** Flushes any pending save right away (used when a page unmounts). */
  flush: () => void;
}

export function useWhiloBoard(preferredId?: string): UseWhiloBoard {
  const [boards, setBoards] = useState<WhiloBoardDoc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(preferredId ?? null);
  const [loading, setLoading] = useState(true);
  const environmentRef = useRef<string>("local");
  const pendingRef = useRef<WhiloBoardDoc | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let live = true;
    void loadWhiloBoards().then((loaded) => {
      if (!live) return;
      void whiloEnvironmentId().then((id) => {
        environmentRef.current = id;
      });
      setBoards(loaded);
      setActiveId((current) => current ?? loaded[0]?.id ?? null);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!preferredId) return;
    setActiveId(preferredId);
  }, [preferredId]);

  const doc = useMemo(() => boards.find((board) => board.id === activeId) ?? null, [boards, activeId]);

  const flush = useCallback(() => {
    window.clearTimeout(timerRef.current);
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    void saveWhiloBoardNow(environmentRef.current, pending);
  }, []);

  useEffect(() => () => flush(), [flush]);

  const update = useCallback(
    (mutate: (doc: WhiloBoardDoc) => WhiloBoardDoc) => {
      setBoards((current) =>
        current.map((board) => {
          if (board.id !== activeId) return board;
          const next = mutate({ ...board, updatedAt: Date.now() });
          pendingRef.current = next;
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(flush, SAVE_DELAY_MS);
          return next;
        }),
      );
    },
    [activeId, flush],
  );

  const createBoard = useCallback(
    (name: string) => {
      const board = createWhiloBoard(name);
      setBoards((current) => [board, ...current]);
      setActiveId(board.id);
      pendingRef.current = board;
      void saveWhiloBoardNow(environmentRef.current, board);
      return board;
    },
    [],
  );

  const removeBoard = useCallback(
    (id: string) => {
      void deleteWhiloBoard(id);
      setBoards((current) => {
        const next = current.filter((board) => board.id !== id);
        setActiveId((active) => (active === id ? (next[0]?.id ?? null) : active));
        return next;
      });
    },
    [],
  );

  return {
    boards,
    doc,
    loading,
    update,
    createBoard,
    selectBoard: setActiveId,
    removeBoard,
    flush,
  };
}
