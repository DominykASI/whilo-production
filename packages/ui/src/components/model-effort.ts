import type { AgentReasoningEffort } from "@whilo/contracts/ipc";
import type { AppTextKey, AppTranslate } from "@whilo/i18n";
import { currentText } from "../text";

/**
 * The reasoning effort labels live on their own so the picker and the effort track can both read
 * them without importing each other. Keeping them here breaks the import cycle between
 * `ProviderModelPicker` and `EffortTrack`.
 */

export const REASONING_LABEL = {
  none: "provider.effort.none",
  minimal: "provider.effort.minimal",
  low: "provider.effort.low",
  medium: "provider.effort.medium",
  high: "provider.effort.high",
  xhigh: "provider.effort.xhigh",
  max: "provider.effort.max",
  ultra: "provider.effort.ultra",
} as const satisfies Record<AgentReasoningEffort, AppTextKey>;

export function reasoningLabel(effort: AgentReasoningEffort, t: AppTranslate = currentText().t): string {
  return t(REASONING_LABEL[effort]);
}
