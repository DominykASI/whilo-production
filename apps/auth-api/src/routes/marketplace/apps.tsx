import { createFileRoute, redirect } from "@tanstack/solid-router";
import { MARKETPLACE_APPS_ROUTE } from "../../lib/marketplace-routes";

/** The apps moved to the site root, where the marketing pages live. Old links move there for good. */
export const Route = createFileRoute("/marketplace/apps")({
  loader: () => {
    throw redirect({ to: MARKETPLACE_APPS_ROUTE, statusCode: 301 });
  },
});
