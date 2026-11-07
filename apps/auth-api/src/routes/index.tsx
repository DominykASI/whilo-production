import { createFileRoute } from "@tanstack/solid-router";
import { LandingPage } from "../components/landing/LandingPage";
import { whiloHomeHead } from "../lib/site-metadata";
import { WHILO_SOFTWARE_APPLICATION } from "../lib/software-application";

export const Route = createFileRoute("/")({
  head: () => whiloHomeHead(WHILO_SOFTWARE_APPLICATION),
  component: LandingPage,
});
