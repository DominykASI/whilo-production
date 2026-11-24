import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, LayoutGrid, PawPrint } from "lucide-react";

import { cn } from "@/lib/cn";
import { readWhiloMode, syncWhiloModeUrl, writeWhiloMode, WHILO_MODE_EVENT, type WhiloExperienceMode } from "@/lib/whilo-mode";
import { usePopoverDismiss } from "@/hooks/use-popover-dismiss";
import { useMenuMotion } from "./MenuMotion";
import { MENU_ITEM, MENU_SHEET } from "./menu-recipe";

export type WhiloMode = WhiloExperienceMode;

const readMode = readWhiloMode;
const writeMode = writeWhiloMode;

export function WhiloModeToggle({
  className,
  variant = "default",
  barClassName,
  onBeforeDots,
}: {
  className?: string;
  variant?: "default" | "bar";
  barClassName?: string;
  /** Optional hook before switching to Dots (kept for compatibility; no longer used for external open). */
  onBeforeDots?: () => void;
}) {
  const [mode, setMode] = useState<WhiloMode>(readMode);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const motion = useMenuMotion(open);

  useEffect(() => {
    const onMode = (event: Event) => {
      const next = (event as CustomEvent<{ mode?: WhiloMode }>).detail?.mode;
      if (next === "dots" || next === "pets") setMode(next);
    };
    window.addEventListener(WHILO_MODE_EVENT, onMode as EventListener);
    return () => window.removeEventListener(WHILO_MODE_EVENT, onMode as EventListener);
  }, []);

  usePopoverDismiss(open, rootRef, () => setOpen(false));

  const selectMode = (next: WhiloMode) => {
    if (next === "dots") onBeforeDots?.();
    setMode(next);
    writeMode(next);
    syncWhiloModeUrl(next);
    setOpen(false);
  };

  const inDots = mode === "dots";
  const TriggerIcon = inDots ? LayoutGrid : PawPrint;
  const label = inDots ? "Dots" : "Pets";
  const menuId = "whilo-mode-menu";

  return (
    <div ref={rootRef} data-whilo-mode-dropdown className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={motion.shown ? menuId : undefined}
        aria-label={`Whilo: ${label}`}
        title={`Whilo: ${label}`}
        data-whilo-mode-trigger
        onClick={() => setOpen((value) => !value)}
        className={cn(
          variant === "bar"
            ? cn(
                "flex h-[22px] items-center gap-1 rounded-md px-1.5 text-ink-secondary transition-colors hover:bg-ink/[0.07] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus",
                open && "bg-ink/[0.07] text-ink",
                barClassName,
              )
            : cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border border-hairline/50 bg-raised/60 px-2.5 text-[12px] font-medium text-ink-secondary transition-colors hover:bg-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                open && "bg-raised text-ink",
              ),
        )}
      >
        <TriggerIcon size={variant === "bar" ? 14 : 15} strokeWidth={1.75} aria-hidden="true" />
        {variant !== "bar" && <span>{label}</span>}
        <ChevronDown
          size={12}
          strokeWidth={2}
          aria-hidden="true"
          className={cn("opacity-70 transition-transform", open && "rotate-180")}
        />
      </button>

      {motion.shown && (
        <div
          id={menuId}
          role="menu"
          aria-label="Whilo"
          data-whilo-mode-menu
          className={cn(
            "absolute left-0 top-full z-50 mt-1 min-w-[220px] overflow-hidden",
            MENU_SHEET,
            motion.className,
          )}
          {...motion.exitProps}
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={mode === "pets"}
            data-mode="pets"
            onClick={() => selectMode("pets")}
            className={cn(MENU_ITEM, mode === "pets" ? "bg-menu-active text-ink" : "text-ink hover:bg-menu-hover")}
          >
            <PawPrint size={16} className="shrink-0 text-ink-secondary" aria-hidden="true" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span>Pets</span>
              <span className="text-[12px] font-normal leading-4 text-ink-secondary">Foco no essencial: chat e seus pets</span>
            </span>
            {mode === "pets" && <Check size={14} className="shrink-0 text-accent" aria-hidden="true" />}
          </button>

          <button
            type="button"
            role="menuitemradio"
            aria-checked={mode === "dots"}
            data-mode="dots"
            onClick={() => selectMode("dots")}
            className={cn(MENU_ITEM, mode === "dots" ? "bg-menu-active text-ink" : "text-ink hover:bg-menu-hover")}
          >
            <LayoutGrid size={16} className="shrink-0 text-ink-secondary" aria-hidden="true" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span>Dots</span>
              <span className="text-[12px] font-normal leading-4 text-ink-secondary">Todas as ferramentas e sidebar completa</span>
            </span>
            {mode === "dots" && <Check size={14} className="shrink-0 text-accent" aria-hidden="true" />}
          </button>
        </div>
      )}
    </div>
  );
}
