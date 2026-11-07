import {
  type AppInterfaceLookPreference,
  DEFAULT_APP_ACCENT,
  DEFAULT_APP_CORNER_RADIUS,
  isAppAccent,
  isAppCornerRadius,
  type SetAppInterfaceLookPreferenceInput,
} from "@whilo/contracts/ipc";
import { isDynamicRecord } from "@whilo/contracts/runtime-values";
import { Effect, Semaphore } from "effect";
import { type PreferenceFileFailure, readPreferenceFile, writePreferenceFile } from "./preference-file";

const DEFAULT_PREFERENCE: AppInterfaceLookPreference = {
  accent: DEFAULT_APP_ACCENT,
  cornerRadius: DEFAULT_APP_CORNER_RADIUS,
};

/**
 * The saved look, or the default. A file that is missing, unreadable or names an accent or a radius
 * this build does not offer reads as the default: a lost choice must not stop the app from starting.
 * A file that holds one field keeps the default of the other.
 */
const readInterfaceLookPreference = Effect.fn("InterfaceLookPreference.read")((path: string) =>
  readPreferenceFile(path, (parsed): AppInterfaceLookPreference => {
    if (!isDynamicRecord(parsed) || parsed.version !== 1) return { ...DEFAULT_PREFERENCE };
    return {
      accent: isAppAccent(parsed.accent) ? parsed.accent : DEFAULT_APP_ACCENT,
      cornerRadius: isAppCornerRadius(parsed.cornerRadius) ? parsed.cornerRadius : DEFAULT_APP_CORNER_RADIUS,
    };
  }).pipe(Effect.catch(() => Effect.succeed({ ...DEFAULT_PREFERENCE }))),
);

const writeInterfaceLookPreference = Effect.fn("InterfaceLookPreference.write")(function* (
  path: string,
  preference: AppInterfaceLookPreference,
) {
  yield* writePreferenceFile(path, { version: 1, ...preference });
  return { ...preference };
});

/**
 * The accent color and the corner radius of the interface. Main holds it so every window reads one
 * choice, and it tells each window about a change through `subscribe`. The renderer applies it, by
 * setting the accent and the corner tokens on the root element: main has no page to paint.
 */
export class InterfaceLookService {
  readonly #path: string;
  readonly #listeners = new Set<(preference: AppInterfaceLookPreference) => void>();
  #preference: AppInterfaceLookPreference = { ...DEFAULT_PREFERENCE };
  #writes = Semaphore.makeUnsafe(1);

  constructor(input: { path: string }) {
    this.#path = input.path;
  }

  get preference(): AppInterfaceLookPreference {
    return { ...this.#preference };
  }

  /** Read the saved preference. Called once at startup, before the first window loads. */
  load(): Effect.Effect<AppInterfaceLookPreference, PreferenceFileFailure> {
    return Effect.gen({ self: this }, function* () {
      this.#preference = yield* readInterfaceLookPreference(this.#path);
      return this.preference;
    });
  }

  /**
   * Serialized, as `AppearanceService.set` is, so two quick choices save the newer one. A field the
   * input leaves out keeps its saved value.
   */
  set(
    change: SetAppInterfaceLookPreferenceInput,
  ): Effect.Effect<AppInterfaceLookPreference, PreferenceFileFailure> {
    return this.#writes.withPermit(this.#write(change));
  }

  #write(
    change: SetAppInterfaceLookPreferenceInput,
  ): Effect.Effect<AppInterfaceLookPreference, PreferenceFileFailure> {
    return Effect.gen({ self: this }, function* () {
      this.#preference = yield* writeInterfaceLookPreference(this.#path, { ...this.#preference, ...change });
      for (const listener of this.#listeners) listener(this.preference);
      return this.preference;
    }).pipe(Effect.uninterruptible);
  }

  subscribe(listener: (preference: AppInterfaceLookPreference) => void): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }
}
