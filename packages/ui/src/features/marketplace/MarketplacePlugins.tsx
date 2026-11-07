import {
  Button,
  ExternalLink,
  Heading,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  SettingsSection,
  Text,
} from "@whilo/ui";
import { useText } from "@whilo/ui/text";
import { createMemo, For, Show } from "solid-js";
import type { BundledPlugin } from "@whilo/contracts/ipc";
import type { JSX } from "@solidjs/web";
import { DialogAgents, type DialogSkill } from "./MarketplaceAgentsDialog";
import { MarketplaceSearch } from "./MarketplaceSkills";
import { ListingPanel, MissingNotice } from "./MarketplaceParts";
import { PluginArt } from "./PluginArt";
import { bundledPlugin, pluginGroupsOf } from "./plugins-catalog";
import type { MarketplaceScope } from "./marketplace-view";
import { IntegrationPage } from "../settings/IntegrationLayout";

function pluginRef(plugin: BundledPlugin): DialogSkill {
  return { id: `plugin:${plugin.id}`, name: plugin.name };
}

/** One bundled plugin as a row: its mark, name, tagline and the add-to-agents action. */
function PluginRow(props: { scope: MarketplaceScope; plugin: BundledPlugin }) {
  const { t } = useText();
  const nav = () => props.scope.nav;
  return (
    <li class="marketplace-app-row marketplace-skill-row">
      <Button
        type="button"
        variant="ghost"
        class="marketplace-app-row-hit"
        aria-label={t("marketplace.open", { name: props.plugin.name })}
        onClick={() => nav().go({ kind: "plugin", id: props.plugin.id })}
      />
      <span class="marketplace-plugin-mark">
        <PluginArt icon={props.plugin.icon} class="size-6" />
      </span>
      <span class="marketplace-app-row-copy">
        <span class="marketplace-skill-name">
          <span class="marketplace-app-row-name">{props.plugin.name}</span>
        </span>
        <span class="marketplace-app-row-tagline">{props.plugin.tagline}</span>
      </span>
      <span class="marketplace-app-row-status marketplace-skill-row-actions">
        <DialogAgents model={props.scope.model} skill={pluginRef(props.plugin)} />
      </span>
    </li>
  );
}

/** The Plugins tab: what the app ships, by section, with a search across all of them. */
export function PluginsLibrary(props: { scope: MarketplaceScope; noMatch: JSX.Element }) {
  const { t, format } = useText();
  const nav = () => props.scope.nav;
  const rows = createMemo(() => pluginGroupsOf(props.scope.plugins.items()));
  return (
    <div class="marketplace-view marketplace-browse">
      <header class="marketplace-browse-head">
        <div class="marketplace-skill-head-row">
          <div class="marketplace-browse-copy">
            <Heading as="h3" size="lg" class="marketplace-browse-title">
              {t("marketplace.tab.plugins")}
            </Heading>
            <Text as="p" variant="body" tone="muted">
              {t("marketplace.description.plugins")}
            </Text>
          </div>
        </div>
        <div class="marketplace-toolbar">
          <MarketplaceSearch nav={nav()} />
        </div>
      </header>
      <div class="marketplace-stack">
        <ListingPanel
          listing={props.scope.plugins}
          loadingLabel={t("marketplace.loading.plugins")}
          count={props.scope.plugins.items().length}
          paged={false}
          empty={props.noMatch}
        >
          <For each={rows()} keyed={(entry) => entry.group.id}>
            {(entry) => (
              <section class="marketplace-app-group" aria-labelledby={`marketplace-plugins-${entry().group.id}`}>
                <h4 id={`marketplace-plugins-${entry().group.id}`} class="marketplace-app-group-title">
                  {t(entry().group.labelKey)}
                  <span class="marketplace-app-group-count">{format.number(entry().plugins.length)}</span>
                </h4>
                <ul class="marketplace-app-list marketplace-skill-list">
                  <For each={entry().plugins} keyed={(plugin) => plugin.id}>
                    {(plugin) => <PluginRow scope={props.scope} plugin={plugin()} />}
                  </For>
                </ul>
              </section>
            )}
          </For>
        </ListingPanel>
      </div>
    </div>
  );
}

/** The page for one bundled plugin: what it is, what it installs, and where its sources live. */
export function PluginPage(props: { scope: MarketplaceScope; pluginId: string }) {
  const { t } = useText();
  const model = () => props.scope.model;
  const plugin = createMemo(() => bundledPlugin(props.pluginId));
  return (
    <Show
      when={plugin()}
      fallback={
        <div class="marketplace-view">
          <MissingNotice>{t("marketplace.plugins.missing")}</MissingNotice>
        </div>
      }
    >
      {(entry) => (
        <IntegrationPage
          class="marketplace-skill-page"
          logo={
            <span class="marketplace-plugin-logo">
              <PluginArt icon={entry().icon} class="size-7" />
            </span>
          }
          name={entry().name}
          status="idle"
          statusLabel={t("marketplace.skills.status.notAdded")}
          subtitle={
            <>
              <Text as="span" variant="body-sm" tone="muted">
                {entry().creatorName} · v{entry().version}
              </Text>
              <br />
              <Text as="span" variant="body-sm" class="marketplace-app-page-tagline">
                {entry().tagline}
              </Text>
            </>
          }
          actions={<DialogAgents model={model()} skill={pluginRef(entry())} />}
        >
          <SettingsSection title={t("marketplace.plugins.about")}>
            <ItemGroup class="settings-modal-card">
              <div class="integration-card-body">
                <Text as="p" variant="body">
                  {entry().description}
                </Text>
              </div>
            </ItemGroup>
          </SettingsSection>
          <SettingsSection title={t("marketplace.plugins.skillsIncluded", { count: entry().skills.length })}>
            <ItemGroup class="settings-modal-card">
              <For each={entry().skills}>
                {(skill) => (
                  <Item>
                    <ItemMedia class="marketplace-plugin-item-icon">
                      <PluginArt icon={entry().icon} class="size-5" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{skill.name}</ItemTitle>
                      <ItemDescription>{skill.description}</ItemDescription>
                    </ItemContent>
                  </Item>
                )}
              </For>
            </ItemGroup>
          </SettingsSection>
          <Show when={entry().prompts.length > 0}>
            <SettingsSection title={t("marketplace.plugins.suggestions")}>
              <ItemGroup class="settings-modal-card">
                <div class="integration-card-body">
                  <For each={entry().prompts}>{(prompt) => <p class="marketplace-prompt">“{prompt}”</p>}</For>
                </div>
              </ItemGroup>
            </SettingsSection>
          </Show>
          <Show when={entry().links.length > 0}>
            <SettingsSection title={t("marketplace.plugins.links")}>
              <ItemGroup class="settings-modal-card">
                <For each={entry().links}>
                  {(link) => (
                    <Item>
                      <ItemContent>
                        <ItemTitle>{link.label}</ItemTitle>
                        <ItemDescription class="marketplace-link-url">{link.url}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={link.label}
                          onClick={() => model().openUrl(link.url)}
                        >
                          <ExternalLink aria-hidden="true" />
                        </Button>
                      </ItemActions>
                    </Item>
                  )}
                </For>
              </ItemGroup>
            </SettingsSection>
          </Show>
        </IntegrationPage>
      )}
    </Show>
  );
}
