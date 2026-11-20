import { type WhiloExperienceMode, WHILO_MODES } from "@whilo/contracts/whilo-mode";
import { Check, DropdownMenu, LayoutGrid, MotionTooltip, PawPrint } from "@whilo/ui";
import { useText } from "@whilo/ui/text";
import { For, Show, createMemo, createSignal } from "solid-js";
import { setWhiloMode, whiloMode } from "../../whilo-mode";

/**
 * The Pets/Dots switch of the web rail. Pets is the focused companion surface, Dots the full
 * workspace. The choice persists in `localStorage`, stays in `?mode`, and notifies the rail so the
 * gated pages appear or hide at once.
 */
export function WebModeToggle() {
  const { t } = useText();
  const [open, setOpen] = createSignal(false);
  const inDots = createMemo(() => whiloMode() === "dots");
  const label = () => t(inDots() ? "app.mode.dots" : "app.mode.pets");
  const icon = (mode: WhiloExperienceMode) =>
    mode === "dots" ? (
      <LayoutGrid class="agent-context-icon size-4" aria-hidden="true" />
    ) : (
      <PawPrint class="agent-context-icon size-4" aria-hidden="true" />
    );
  return (
    <DropdownMenu.Root placement="right-start" gutter={10} onOpenChange={setOpen}>
      <MotionTooltip content={t("app.mode.label", { mode: label() })} suppressed={open()}>
        <DropdownMenu.Trigger class="window-rail-button" aria-label={t("app.mode.label", { mode: label() })}>
          <Show when={inDots()} fallback={<PawPrint aria-hidden="true" />}>
            <LayoutGrid aria-hidden="true" />
          </Show>
        </DropdownMenu.Trigger>
      </MotionTooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="agent-context-menu window-rail-more-menu" aria-label={t("app.mode.title")}>
          <For each={WHILO_MODES}>
            {(mode) => (
              <DropdownMenu.Item class="window-rail-mode-item" onSelectAfterClose={() => setWhiloMode(mode)}>
                {icon(mode)}
                <span class="window-rail-mode-copy">
                  <span>{t(mode === "dots" ? "app.mode.dots" : "app.mode.pets")}</span>
                  <span class="window-rail-mode-hint">
                    {t(mode === "dots" ? "app.mode.dotsHint" : "app.mode.petsHint")}
                  </span>
                </span>
                <Show when={whiloMode() === mode}>
                  <Check class="agent-context-icon size-4 window-rail-mode-check" aria-hidden="true" />
                </Show>
              </DropdownMenu.Item>
            )}
          </For>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
