// Read before main.tsx's first-paint writes: applySkin stamps whilo-skin on every boot.
const PRIOR_RUN_KEYS = ["whilo-skin", "whilo-installed", "whilo-email-gate", "whilo-drafts", "whilo-show-threads"];

export function hasPriorRun(store: Pick<Storage, "getItem"> | undefined): boolean {
  try {
    return PRIOR_RUN_KEYS.some((key) => store?.getItem(key) != null);
  } catch {
    return false;
  }
}
