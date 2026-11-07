import { createSignal, onCleanup } from "solid-js";

export type OrcaPetMood = "idle" | "curious" | "sleepy";

export interface OrcaPetProps {
  /** The pet is drawn in this square, in its own units. */
  class?: string;
  mood?: OrcaPetMood;
  /** A click on the pet plays its greeting, such as a jump and a squeak of the tail. */
  interactive?: boolean;
}

/** The pet is drawn in a square of this side, as `AppLogo` is, so both fit one grid. */
export const ORCA_PET_SIZE = 240;

/** The body, the belly and the saddle patch share one outline of the back and the head. */
const BODY_PATH =
  "M120 40C74 40 40 78 34 128c-4 40 4 74 22 88 14 11 34 8 44-6 8-11 10-26 12-40 3-20 8-33 22-33s19 13 22 33c2 14 4 29 12 40 10 14 30 17 44 6 18-14 26-48 22-88-6-50-40-88-86-88Z";

const BELLY_PATH =
  "M120 100c-20 0-30 20-33 48-2 18-2 34 3 44 6 11 21 13 30 3 5-6 7-16 8-26 1-9 3-14 8-14h30c-2-19-5-34-10-44-6-13-17-21-36-21Z";

/** The white eyepatch of a killer whale, over the rear of the eye. */
const EYE_PATCH_PATH = "M92 96c-10 2-18 10-19 20-1 9 4 17 13 19 10 2 19-4 22-13 3-10-2-20-10-24-2-1-4-2-6-2Z";

const DORSAL_FIN_PATH = "M120 44c-4-16-2-32 4-44 3 14 9 26 16 36-6 4-13 7-20 8Z";

const TAIL_PATH =
  "M120 210c-10 4-18 12-24 22 8 1 15 4 21 9 3-6 5-13 5-20 0 7 2 14 5 20 6-5 13-8 21-9-6-10-16-18-26-22Z";

export function OrcaPet(props: OrcaPetProps) {
  const [greeting, setGreeting] = createSignal(false);
  let root: SVGSVGElement | undefined;
  let greetingTimer: number | undefined;

  function reduceMotion(): boolean {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }

  function greet(): void {
    if (!props.interactive || reduceMotion()) return;
    window.clearTimeout(greetingTimer);
    setGreeting(false);
    void root?.getBoundingClientRect();
    setGreeting(true);
    greetingTimer = window.setTimeout(() => setGreeting(false), 900);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    greet();
  }

  // A ref callback runs before the first paint, so the listener is in place without `onMount`.
  function attach(element: SVGSVGElement): void {
    root = element;
    if (!props.interactive) return;
    element.addEventListener("keydown", handleKeyDown);
    onCleanup(() => element.removeEventListener("keydown", handleKeyDown));
  }

  onCleanup(() => globalThis.clearTimeout(greetingTimer));

  return (
    <svg
      ref={attach}
      class={["orca-pet", props.class].filter(Boolean).join(" ")}
      data-mood={props.mood ?? "idle"}
      data-greeting={greeting() ? "true" : undefined}
      data-interactive={props.interactive ? "true" : undefined}
      viewBox={`0 0 ${ORCA_PET_SIZE} ${ORCA_PET_SIZE}`}
      aria-hidden={props.interactive ? undefined : "true"}
      aria-label={props.interactive ? "Orca pet" : undefined}
      role={props.interactive ? "button" : undefined}
      tabindex={props.interactive ? 0 : undefined}
      onClick={greet}
    >
      <ellipse class="orca-pet-shadow" cx="120" cy="222" rx="46" ry="8" />
      <g class="orca-pet-body">
        <path class="orca-pet-tail" d={TAIL_PATH} />
        <path
          class="orca-pet-flipper orca-pet-flipper-left"
          d="M78 146c-16 6-30 22-36 42 12-4 26-10 38-20 6-5 10-12 10-18 0-5-6-6-12-4Z"
        />
        <path
          class="orca-pet-flipper orca-pet-flipper-right"
          d="M162 146c16 6 30 22 36 42-12-4-26-10-38-20-6-5-10-12-10-18 0-5 6-6 12-4Z"
        />
        <path class="orca-pet-dorsal" d={DORSAL_FIN_PATH} />
        <path class="orca-pet-torso" d={BODY_PATH} />
        <path class="orca-pet-belly" d={BELLY_PATH} />
        <path class="orca-pet-eye-patch" d={EYE_PATCH_PATH} />
        <g class="orca-pet-eye">
          <ellipse class="orca-pet-pupil" cx="96" cy="110" rx="5.5" ry="7" />
        </g>
        <path class="orca-pet-smile" d="M104 150c8 7 20 8 30 3" />
      </g>
    </svg>
  );
}
