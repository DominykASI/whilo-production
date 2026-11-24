import { memo, useDeferredValue, useMemo, useState } from "react";
import { Download, Library, Search } from "lucide-react";

import { cn } from "@/lib/cn";
import { whiloText } from "@/lib/whilo-workflow-text";

export interface LibraryItem {
  id: string;
  name: string;
  description: string;
  author?: string;
  category?: string;
  installs?: number;
}

export interface LibraryPageProps {
  items?: LibraryItem[];
  onInstall?: (i: LibraryItem) => void;
}

const ALL_CATEGORY = "all";
const CATEGORIES: readonly { id: string; label: string }[] = [
  { id: ALL_CATEGORY, label: "whiloLibrary.all" },
  { id: "productivity", label: "whiloLibrary.categoryProductivity" },
  { id: "sales", label: "whiloLibrary.categorySales" },
  { id: "support", label: "whiloLibrary.categorySupport" },
  { id: "data", label: "whiloLibrary.categoryData" },
];

const DEFAULT_ITEMS: LibraryItem[] = [
  {
    id: "sdr",
    name: "whiloLibrary.sample.sdrName",
    description: "whiloLibrary.sample.sdrBody",
    author: "Whilo Labs",
    category: "sales",
    installs: 4820,
  },
  {
    id: "analyst",
    name: "whiloLibrary.sample.analystName",
    description: "whiloLibrary.sample.analystBody",
    author: "Whilo Labs",
    category: "data",
    installs: 3160,
  },
  {
    id: "support",
    name: "whiloLibrary.sample.supportName",
    description: "whiloLibrary.sample.supportBody",
    author: "Whilo Labs",
    category: "support",
    installs: 2740,
  },
  {
    id: "copy",
    name: "whiloLibrary.sample.copyName",
    description: "whiloLibrary.sample.copyBody",
    author: "Whilo Labs",
    category: "productivity",
    installs: 5210,
  },
  {
    id: "research",
    name: "whiloLibrary.sample.researchName",
    description: "whiloLibrary.sample.researchBody",
    author: "Whilo Labs",
    category: "data",
    installs: 1980,
  },
  {
    id: "scheduler",
    name: "whiloLibrary.sample.schedulerName",
    description: "whiloLibrary.sample.schedulerBody",
    author: "Whilo Labs",
    category: "productivity",
    installs: 2350,
  },
];

function formatInstalls(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

const LibraryCard = memo(function LibraryCard({
  item,
  onInstall,
}: {
  item: LibraryItem;
  onInstall?: (i: LibraryItem) => void;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-card transition-colors hover:bg-white/[0.02]">
      <div className="flex h-20 items-center justify-center bg-gradient-to-br from-accent/30 via-accent/10 to-transparent">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-app/70">
          <Library className="h-5 w-5 text-accent" strokeWidth={1.75} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-bold text-ink">{whiloText(item.name)}</h3>
          {item.category ? (
            <span className="shrink-0 rounded-full border border-hairline bg-inset px-2 py-0.5 text-[11px] text-ink-secondary">
              {whiloText(CATEGORIES.find((entry) => entry.id === item.category)?.label ?? item.category)}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm text-ink-secondary">{whiloText(item.description)}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="flex min-w-0 flex-col">
            {item.author ? <span className="truncate text-xs text-ink-secondary">{item.author}</span> : null}
            {item.installs !== undefined ? (
              <span className="flex items-center gap-1 text-xs text-ink-secondary">
                <Download className="h-3 w-3" strokeWidth={1.75} />
                {whiloText("whiloLibrary.installs", { count: formatInstalls(item.installs) })}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onInstall?.(item)}
            className="shrink-0 cursor-pointer rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {whiloText("whiloLibrary.add")}
          </button>
        </div>
      </div>
    </article>
  );
});

export function LibraryPage({ items, onInstall }: LibraryPageProps) {
  const source = items ?? DEFAULT_ITEMS;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();
    return source.filter((item) => {
      const matchesCategory = category === ALL_CATEGORY || item.category === category;
      if (!matchesCategory) return false;
      if (term.length === 0) return true;
      return (
        whiloText(item.name).toLowerCase().includes(term) ||
        whiloText(item.description).toLowerCase().includes(term) ||
        (item.author?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [source, category, deferredQuery]);

  return (
    <div className="h-full overflow-y-auto bg-app text-ink">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 py-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight">{whiloText("whiloLibrary.title")}</h1>
            <span className="rounded-full border border-hairline bg-inset px-2 py-0.5 text-xs text-ink-secondary">
              {filtered.length}
            </span>
          </div>
          <div className="flex w-full items-center gap-2 rounded-full border border-hairline bg-inset px-3 py-1.5 sm:w-72">
            <Search className="h-4 w-4 shrink-0 text-ink-secondary" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={whiloText("whiloLibrary.search")}
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-secondary focus:outline-none"
            />
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setCategory(option.id)}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors",
                category === option.id
                  ? "bg-accent font-medium text-white"
                  : "border border-hairline bg-inset text-ink-secondary hover:text-ink",
              )}
            >
              {whiloText(option.label)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-hairline bg-card py-16 text-center">
            <Library className="h-6 w-6 text-ink-secondary" strokeWidth={1.5} />
            <p className="text-sm font-medium">{whiloText("whiloLibrary.empty")}</p>
            <p className="text-sm text-ink-secondary">{whiloText("whiloLibrary.emptyBody")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <LibraryCard key={item.id} item={item} onInstall={onInstall} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
