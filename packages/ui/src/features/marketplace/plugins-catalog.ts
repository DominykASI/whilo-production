/**
 * The Plugins tab is local: the bundles ship inside the app (`resources/plugins/`), so its listing
 * answers from memory instead of the catalog service. The same shape the rest of the Marketplace
 * uses answers the overview, the search and the category filter.
 */
import { BUNDLED_PLUGINS, type BundledPlugin, type MarketplaceSkillQuery } from "@whilo/contracts/ipc";
import type { AppTextKey } from "@whilo/i18n";

export interface PluginGroup {
  id: BundledPlugin["group"];
  labelKey: AppTextKey;
}

/** The Plugins tab's sections, top to bottom. */
export const PLUGIN_GROUPS: readonly PluginGroup[] = [
  { id: "computer-use", labelKey: "marketplace.plugins.group.computerUse" },
  { id: "world-legal-desk", labelKey: "marketplace.plugins.group.worldLegalDesk" },
  { id: "tools", labelKey: "marketplace.plugins.group.tools" },
] as const;

const byId = new Map(BUNDLED_PLUGINS.map((plugin) => [plugin.id, plugin]));

/** The bundled plugin with this id, for a link that names one. */
export function bundledPlugin(id: string): BundledPlugin | undefined {
  return byId.get(id);
}

function matches(plugin: BundledPlugin, query: string): boolean {
  return (
    plugin.name.toLowerCase().includes(query) ||
    plugin.tagline.toLowerCase().includes(query) ||
    plugin.description.toLowerCase().includes(query) ||
    plugin.creatorName.toLowerCase().includes(query) ||
    plugin.skills.some(
      (skill) => skill.name.toLowerCase().includes(query) || skill.description.toLowerCase().includes(query),
    )
  );
}

/** The local catalog, in the shape `createMarketplaceListing` asks for. */
export function listPlugins(query: MarketplaceSkillQuery): Promise<{ items: BundledPlugin[]; nextCursor: null }> {
  const text = (query.query ?? "").trim().toLowerCase();
  let items = BUNDLED_PLUGINS.filter((plugin) => !text || matches(plugin, text));
  if (query.category) items = items.filter((plugin) => plugin.category === query.category);
  return Promise.resolve({ items: [...items], nextCursor: null });
}

export function pluginGroupsOf(plugins: readonly BundledPlugin[]): { group: PluginGroup; plugins: BundledPlugin[] }[] {
  return PLUGIN_GROUPS.map((group) => ({
    group,
    plugins: plugins.filter((plugin) => plugin.group === group.id),
  })).filter((entry) => entry.plugins.length > 0);
}
