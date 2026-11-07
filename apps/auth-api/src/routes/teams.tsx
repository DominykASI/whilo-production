import { createFileRoute } from "@tanstack/solid-router";
import { TeamsPage } from "../components/teams/TeamsPage";
import { WHILO_SOCIAL_IMAGE_ALT, WHILO_SOCIAL_IMAGE_URL, WHILO_X_HANDLE } from "../lib/site-metadata";
import { TEAMS_PAGE_META, TEAMS_ROUTE } from "../lib/teams-page";

export const Route = createFileRoute("/teams")({
  head: ({ match }) => {
    const url = new URL(TEAMS_ROUTE, match.context.siteUrl).toString();
    const { title, description } = TEAMS_PAGE_META;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Whilo" },
        { property: "og:locale", content: "en_US" },
        { property: "og:url", content: url },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: WHILO_SOCIAL_IMAGE_URL },
        { property: "og:image:alt", content: WHILO_SOCIAL_IMAGE_ALT },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: WHILO_X_HANDLE },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: WHILO_SOCIAL_IMAGE_URL },
        { name: "twitter:image:alt", content: WHILO_SOCIAL_IMAGE_ALT },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: TeamsPage,
});
