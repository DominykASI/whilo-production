/**
 * Inline artwork for the bundled plugins and for the Plugins tab icon. The tab icon and the Computer
 * Use mark are the developer's own files (svg-11 / svg-44); the flags are drawn to the same 1.5-ish
 * stroke weight as the rest of the marketplace artwork.
 */

import { Dynamic } from "@solidjs/web";
import { createMemo } from "solid-js";
import { Globe, Sigma, Scale, ChartNoAxesColumnIncreasing } from "@whilo/ui";
import type { BundledPluginIcon } from "@whilo/contracts/ipc";

export interface PluginArtProps {
  icon: BundledPluginIcon;
  /** Multi-size: class controls the box. */
  class?: string | undefined;
}

/** The Plugins tab icon: the layer stack that sits between Agents and Skills. */
export function PluginsMark(props: { class?: string | undefined }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" class={props.class} aria-hidden="true">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.3123 1.85547C15.2771 1.85547 18.391 5.73725 18.0809 10.1797C17.9647 11.8429 17.0564 13.0834 15.8231 13.5879C14.7326 14.0337 13.47 13.8674 12.4461 13.0293C11.7934 13.5786 11.0359 13.9386 10.2449 14.0049C9.32652 14.0816 8.42804 13.757 7.70197 13.0029L7.66389 12.9639C7.642 12.9408 7.61006 12.9054 7.57014 12.8633C7.49037 12.7791 7.3782 12.6616 7.24982 12.5264C6.99227 12.2551 6.66818 11.9143 6.40217 11.6367L6.34357 11.5684C6.06899 11.2168 6.099 10.707 6.42756 10.3906L6.63459 10.1904L5.89533 9.4209C5.64063 9.15629 5.64831 8.73517 5.91291 8.48047C6.17753 8.22606 6.59874 8.23452 6.85334 8.49902L7.59357 9.26758L9.38557 7.54297L8.64533 6.77344C8.39063 6.50883 8.39831 6.08771 8.66291 5.83301C8.92752 5.57835 9.34866 5.58697 9.60334 5.85156L10.3436 6.62012L10.5604 6.41309C10.9126 6.07453 11.4734 6.08657 11.8104 6.44043L13.1072 7.80371C13.8503 8.56878 14.1444 9.47864 14.0252 10.3955C13.9486 10.9833 13.7041 11.5416 13.3485 12.0479C13.9958 12.5468 14.7208 12.6019 15.3192 12.3574C16.0315 12.0661 16.6687 11.3039 16.7537 10.0869C17.0141 6.35655 14.4499 3.18555 10.3123 3.18555C6.6529 3.18579 3.49073 5.98227 3.24494 9.50195C2.97008 13.4404 5.75621 16.7634 9.99787 16.7637C11.4792 16.7637 12.9444 16.412 13.9949 15.668C14.2945 15.4561 14.7094 15.527 14.9217 15.8262C15.134 16.1259 15.0632 16.5416 14.7635 16.7539C13.4191 17.7061 11.6557 18.0938 9.99787 18.0938C4.9396 18.0934 1.5924 14.0706 1.91779 9.40918C2.21615 5.13666 6.01184 1.85571 10.3123 1.85547ZM7.67072 11.04C7.8573 11.2357 8.04954 11.4365 8.21369 11.6094C8.34275 11.7453 8.45587 11.8647 8.53596 11.9492C8.57591 11.9914 8.60776 12.0257 8.62971 12.0488L8.66389 12.084C9.12159 12.5574 9.62959 12.7208 10.1336 12.6787C10.6588 12.6348 11.2424 12.3601 11.785 11.8379C12.3336 11.3098 12.6385 10.7414 12.7059 10.2246C12.77 9.7323 12.6301 9.21889 12.1502 8.72656L12.1444 8.7207L11.1571 7.68457L7.67072 11.04Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

/** Computer Use: an app window with a cursor, drawn by the developer (svg-44). */
export function ComputerUseMark(props: { class?: string | undefined }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" class={props.class} aria-hidden="true">
      <path d="M4.00004 14C3.48337 14 3.02226 13.8889 2.61671 13.6667C2.21115 13.4389 1.89449 13.1222 1.66671 12.7167C1.44449 12.3111 1.33337 11.85 1.33337 11.3333V4.66667C1.33337 4.15 1.44449 3.68889 1.66671 3.28333C1.89449 2.87778 2.21115 2.56389 2.61671 2.34167C3.02226 2.11389 3.48337 2 4.00004 2H12C12.5167 2 12.9778 2.11389 13.3834 2.34167C13.7889 2.56389 14.1028 2.87778 14.325 3.28333C14.5528 3.68889 14.6667 4.15 14.6667 4.66667V10.6667L11.3334 14H4.00004Z" fill="rgb(223, 223, 223)" />
      <path d="M12 2C12.5167 2 12.978 2.11402 13.3835 2.3418C13.789 2.56401 14.1027 2.87773 14.3249 3.2832C14.5527 3.68876 14.6667 4.15 14.6667 4.66667V6H1.33337V4.66667C1.33337 4.15002 1.4445 3.68875 1.66671 3.2832C1.89444 2.87773 2.21113 2.56401 2.61657 2.3418C3.02213 2.11402 3.48337 2 4.00004 2H12Z" fill="rgb(0, 158, 234)" />
      <path d="M6.33337 4.00016C6.33337 3.63198 6.63185 3.3335 7.00004 3.3335H11.6667C12.0349 3.3335 12.3334 3.63198 12.3334 4.00016C12.3334 4.36835 12.0349 4.66683 11.6667 4.66683H7.00004C6.63185 4.66683 6.33337 4.36835 6.33337 4.00016Z" fill="rgb(165, 225, 255)" />
      <path d="M3.52504 4.47516C3.65837 4.60294 3.81671 4.66683 4.00004 4.66683C4.18337 4.66683 4.33893 4.60294 4.46671 4.47516C4.60004 4.34183 4.66671 4.1835 4.66671 4.00016C4.66671 3.81683 4.60004 3.66128 4.46671 3.5335C4.33893 3.40016 4.18337 3.3335 4.00004 3.3335C3.81671 3.3335 3.65837 3.40016 3.52504 3.5335C3.39726 3.66128 3.33337 3.81683 3.33337 4.00016C3.33337 4.1835 3.39726 4.34183 3.52504 4.47516Z" fill="rgb(165, 225, 255)" />
      <path d="M10.765 15.3842C10.5374 15.2566 10.3765 15.0595 10.2821 14.7931L8.40044 9.52275C8.33384 9.32295 8.31724 9.13149 8.3505 8.94829C8.38937 8.76515 8.47264 8.60969 8.6003 8.48202C8.72797 8.35435 8.88337 8.27389 9.0665 8.24062C9.2497 8.20175 9.44117 8.21842 9.64104 8.29055L14.9113 10.1722C15.1778 10.2666 15.3748 10.4303 15.5024 10.6634C15.6301 10.891 15.6578 11.1269 15.5857 11.3712C15.5191 11.6098 15.3498 11.7986 15.0778 11.9373L13.063 12.953L12.0555 14.9596C11.9168 15.2316 11.7253 15.4009 11.481 15.4675C11.2368 15.5396 10.9982 15.5119 10.765 15.3842Z" fill="rgb(0, 158, 234)" />
    </svg>
  );
}

/** Chrome: the three-colour ring and the blue dot. */
export function ChromeMark(props: { class?: string | undefined }) {
  return (
    <svg viewBox="0 0 24 24" class={props.class} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="#EA4335" stroke-width="3.6"
        stroke-dasharray="18.85 56.55" stroke-dashoffset="31.4" transform="rotate(-90 12 12)" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="#FBBC05" stroke-width="3.6"
        stroke-dasharray="18.85 56.55" stroke-dashoffset="12.6" transform="rotate(-90 12 12)" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="#34A853" stroke-width="3.6"
        stroke-dasharray="18.85 56.55" stroke-dashoffset="-6.3" transform="rotate(-90 12 12)" />
      <circle cx="12" cy="12" r="4.6" fill="#4285F4" stroke="var(--surface-elevated, #fff)" stroke-width="1.4" />
    </svg>
  );
}

/** Brazil: green field, yellow lozenge, blue disc. */
export function FlagBrMark(props: { class?: string | undefined }) {
  return (
    <svg viewBox="0 0 20 14" class={props.class} aria-hidden="true">
      <rect width="20" height="14" rx="2" fill="#009B3A" />
      <path d="M10 2.1 17.2 7 10 11.9 2.8 7Z" fill="#FEDF00" />
      <circle cx="10" cy="7" r="2.65" fill="#002776" />
    </svg>
  );
}

/** Spain: red, yellow, red. */
export function FlagEsMark(props: { class?: string | undefined }) {
  return (
    <svg viewBox="0 0 20 14" class={props.class} aria-hidden="true">
      <rect width="20" height="14" rx="2" fill="#AA151B" />
      <rect y="3.5" width="20" height="7" fill="#F1BF00" />
    </svg>
  );
}

export function BrowserMark(props: { class?: string | undefined }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" class={props.class} aria-hidden="true">
      <rect x="1.8" y="3.2" width="16.4" height="13.6" rx="2.4" stroke="currentColor" stroke-width="1.6" />
      <path d="M1.8 6.4h16.4" stroke="currentColor" stroke-width="1.6" />
      <circle cx="4.4" cy="4.8" r="0.55" fill="currentColor" />
      <circle cx="6.8" cy="4.8" r="0.55" fill="currentColor" />
    </svg>
  );
}

export function LatexMark(props: { class?: string | undefined }) {
  return <Sigma class={props.class} aria-hidden="true" />;
}

export function VisualizeMark(props: { class?: string | undefined }) {
  return <ChartNoAxesColumnIncreasing class={props.class} aria-hidden="true" />;
}

export function WorldLegalMark(props: { class?: string | undefined }) {
  return <Globe class={props.class} aria-hidden="true" />;
}

/** Globe with a scale badge for the World Legal Desk card: the desk itself. */
export function WorldLegalDeskMark(props: { class?: string | undefined }) {
  return (
    <span class={["world-legal-desk-mark", props.class].filter(Boolean).join(" ")} aria-hidden="true">
      <Globe class="size-full" />
      <Scale class="world-legal-desk-mark-scale" stroke-width="2.4" />
    </span>
  );
}

/** Renders the mark of a bundled plugin by its icon id. */
export function PluginArt(props: PluginArtProps) {
  const mark = createMemo(() => {
    switch (props.icon) {
      case "browser":
        return BrowserMark;
      case "chrome":
        return ChromeMark;
      case "computer-use":
        return ComputerUseMark;
      case "latex":
        return LatexMark;
      case "visualize":
        return VisualizeMark;
      case "mundo-legal-br":
        return FlagBrMark;
      case "mundo-legal-es":
        return FlagEsMark;
      case "mundo-legal-desk":
        return WorldLegalDeskMark;
    }
  });
  return <Dynamic component={mark()} class={props.class} />;
}
