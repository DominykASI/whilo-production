import { existsSync, renameSync } from "node:fs";
import { join } from "node:path";

/**
 * The directory name this build writes to, and the one it wrote to before the product was renamed.
 * Only the development profile keeps a name in `appData`; a packaged build gets its directory from
 * Electron, so the pair is empty there.
 */
export interface UserDataDirectoryNames {
  /** The directory this build resolves, such as `Whilo Dev`. */
  current: string;
  /** The directory the same profile resolved before the rename, such as `OpenBot Dev`. */
  legacy: string;
}

/**
 * Renames the directory of the previous name to the current one, so a developer who already has
 * agents and conversations keeps them after the rename.
 *
 * A move runs only when the current directory does not exist: a directory that is already there
 * wins, because it may hold work from a build that ran after the rename, and it is never merged
 * into or replaced. The two directories sit in the same `appData` folder, so the rename is one
 * atomic filesystem operation and no file is copied. A failure is reported and ignored: a rename
 * that a permission or a lock refuses must not stop the app from starting, and the next launch
 * tries again because the current directory is still absent.
 *
 * @returns Whether the directories were moved.
 */
export function migrateUserDataDirectory(input: {
  /** `app.getPath("appData")`, the folder both directories sit in. */
  appData: string;
  names: UserDataDirectoryNames;
  /** Reports a rename that failed. Injected so a test reads the reason without a real filesystem. */
  onError?: (error: unknown) => void;
  /** Injected so a test drives the filesystem without one. */
  exists?: (path: string) => boolean;
  rename?: (from: string, to: string) => void;
}): boolean {
  const exists = input.exists ?? existsSync;
  const rename = input.rename ?? renameSync;
  const current = join(input.appData, input.names.current);
  const legacy = join(input.appData, input.names.legacy);
  if (exists(current) || !exists(legacy)) return false;
  try {
    rename(legacy, current);
    return true;
  } catch (error) {
    input.onError?.(error);
    return false;
  }
}
