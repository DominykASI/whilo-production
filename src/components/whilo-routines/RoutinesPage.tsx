import { useCallback } from "react";
import { useCaptionChrome } from "@/components/DesktopCapabilities";
import { t } from "@/lib/i18n";
import { useRuntimeCapabilities } from "@/lib/runtime-capability";
import { useStore } from "@/state/store";
import { RoutinesList } from "./RoutinesList";

export interface RoutinesPageProps {
  /** Whether the desktop-only parts of this screen render. Defaults to what the runtime detects. */
  isDesktop?: boolean;
}

export function RoutinesPage({ isDesktop }: RoutinesPageProps) {
  const { dragProps } = useCaptionChrome();
  const { dispatch } = useStore();
  const capabilities = useRuntimeCapabilities();
  const desktop = isDesktop ?? capabilities.isDesktop;

  const openBoard = useCallback(() => {
    dispatch({ type: "showRoutines", section: "schedule", view: "list" });
  }, [dispatch]);

  const openLogs = useCallback(() => {
    dispatch({ type: "showRoutines", section: "logs" });
  }, [dispatch]);

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-app text-ink animate-workspace-in">
      <div {...dragProps} className="flex shrink-0 items-center gap-2 border-b border-hairline/35 px-6 py-2.5 max-md:pl-12">
        <span className="text-[12.5px] font-medium text-ink-secondary">{t("routines.list")}</span>
      </div>
      <RoutinesList isDesktop={desktop} onCreate={openBoard} onOpenLogs={openLogs} />
    </main>
  );
}
