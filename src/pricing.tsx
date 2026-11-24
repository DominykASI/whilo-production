import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { PageBoundary } from "@/components/PageBoundary";
import { PricingSite } from "@/components/plans/PricingSite";
import { applyFont, readFont } from "@/lib/fonts";
import "@/styles.css";

// A public page: it keeps the person's font choice but never the app's skin, so the marketing art stays dark for everyone.
applyFont(readFont());
document.documentElement.setAttribute("data-skin", "midnight");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PageBoundary>
      <PricingSite />
    </PageBoundary>
  </StrictMode>,
);
