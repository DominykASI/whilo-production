import { AppLogo, type AppLogoVariant, OrcaPet } from "@whilo/brand";
import { APP_LOGO_W_PATH } from "@whilo/brand/app-logo-shape";
import { useText } from "@whilo/ui/text";
import { createEffect, createSignal, onSettled } from "solid-js";

// The fade takes the overlay duration. If no `animationend` comes, the splash ends this time after the
// app is ready, so it cannot cover the app.
const EXIT_LIMIT_MS = 1500;
const EXIT_ANIMATION = "startup-splash-exit";
// The splash does not fade before the mark is drawn, so a fast start does not show a half-drawn logo.
const INTRO_ANIMATION = "startup-splash-mark-draw";

/** The total length of the `W` path, in the mark's own units, so its stroke can be drawn by dash. */
function pathLength(d: string): number {
  const tokens = d.trim().split(/\s+/);
  let length = 0;
  let previous: [number, number] | undefined;
  for (let index = 0; index + 1 < tokens.length; index += 2) {
    const command = tokens[index]?.replace(/^[A-Za-z]/, "");
    const point: [number, number] = [Number(command), Number(tokens[index + 1])];
    if (Number.isFinite(point[0]) && Number.isFinite(point[1])) {
      if (previous) length += Math.hypot(point[0] - previous[0], point[1] - previous[1]);
      previous = point;
    }
  }
  return Math.ceil(length);
}

const MARK_LENGTH = pathLength(APP_LOGO_W_PATH);

/**
 * Set on a splash root, so its CSS can draw the logo mark with `stroke-dasharray`. The unit is px:
 * a unitless number in `calc()` does not interpolate. In SVG, px are the mark's user units.
 */
const SPLASH_MARK_LENGTH_STYLE = {
  "--splash-mark-length": `${MARK_LENGTH}px`,
};

interface StartupSplashProps {
  variant: AppLogoVariant;
  /** The app is ready: the splash fades out. Remove it in `onExited`. */
  ready: boolean;
  onExited?: () => void;
}

/**
 * The desktop window's first screen: the logo draws its eyes and blinks until the app is ready. The
 * fade starts when the app is ready and the eyes are drawn.
 */
export function StartupSplash(props: StartupSplashProps) {
  const { t } = useText();
  let root: HTMLElement | undefined;
  let exitTimer: ReturnType<typeof setTimeout> | undefined;
  let exited = false;
  const [introDone, setIntroDone] = createSignal(false);
  const exiting = () => props.ready && introDone();

  function finishExit(): void {
    if (exited) return;
    exited = true;
    clearTimeout(exitTimer);
    props.onExited?.();
  }

  // With reduced motion, without the stylesheet, or in a test DOM, the mark does not draw: no wait.
  onSettled(() => {
    const mark = root?.querySelector(".app-logo-mark");
    if (!mark || !getComputedStyle(mark).animationName.includes(INTRO_ANIMATION)) setIntroDone(true);
  });

  createEffect(
    () => props.ready,
    (ready) => {
      if (!ready) return;
      exitTimer ??= setTimeout(finishExit, EXIT_LIMIT_MS);
      return () => clearTimeout(exitTimer);
    },
  );

  createEffect(exiting, (exit) => {
    // Without the stylesheet, or in a test DOM, the exit does not animate: end the splash now.
    if (exit && root && !getComputedStyle(root).animationName.includes(EXIT_ANIMATION)) queueMicrotask(finishExit);
  });

  function handleAnimationEnd(event: AnimationEvent): void {
    if (event.animationName === INTRO_ANIMATION) setIntroDone(true);
    else if (event.animationName === EXIT_ANIMATION && event.target === event.currentTarget) finishExit();
  }

  return (
    <main
      ref={(element) => {
        root = element;
      }}
      class="startup-splash"
      data-phase={exiting() ? "exit" : "loading"}
      role="status"
      aria-label={t("app.loading")}
      aria-busy={exiting() ? "false" : "true"}
      style={SPLASH_MARK_LENGTH_STYLE}
      onAnimationEnd={handleAnimationEnd}
      // Reduce motion turned on during the draw cancels it: the eyes are then shown in full.
      onAnimationCancel={(event) => {
        if (event.animationName === INTRO_ANIMATION) setIntroDone(true);
      }}
    >
      <div class="startup-splash-stage">
        <AppLogo variant={props.variant} class="startup-splash-logo" />
        {/* The pet waits beside the mark while the app opens. It is decoration: the splash is a
            drag region and a status, so the pet takes neither a click nor a tab stop. */}
        <span class="startup-splash-pet">
          <OrcaPet mood="idle" />
        </span>
      </div>
    </main>
  );
}
