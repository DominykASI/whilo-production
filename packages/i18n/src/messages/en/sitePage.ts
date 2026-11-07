import { defineMessages } from "../../message";

/**
 * The public web pages that do one task: join a server, return from Slack or Discord, return from
 * billing, report a hosted site, and the load error page. `apps/auth-api` renders
 * them on the server in the visitor's language.
 */
export const messages = defineMessages("sitePage", {
  "sitePage.error.title": "This page could not load",
  "sitePage.error.body":
    "Check your connection and reload the page. If it still does not load, go back to the home page.",
  "sitePage.error.reload": "Reload page",
  "sitePage.error.home": "Back to home",
  "sitePage.join.title": "Join an Whilo server",
  "sitePage.join.description": "Open a private server invitation in Whilo.",
  "sitePage.join.eyebrow": "Private invitation",
  "sitePage.join.intro":
    "Open this invitation in Whilo. The app checks the server and asks you to confirm before it connects.",
  "sitePage.join.invalid":
    "This invitation link is not valid or is not complete. Ask the server owner for a new invitation.",
  "sitePage.join.open": "Open Whilo",
  "sitePage.join.browser": "Open in browser",
  // {browser} and {download} are links. Their text is browserLink and downloadLink.
  "sitePage.join.noApp": "No app? {browser} or {download}.",
  "sitePage.join.noAppMobile": "No app? {browser}.",
  "sitePage.join.browserLink": "Join in this browser",
  "sitePage.join.downloadLink": "download Whilo",
  // {open} is the label of the button that did not open Whilo.
  "sitePage.join.notOpened":
    "If Whilo is on this computer, start it, then press {open} again. If it is not, download it first.",
  // {open} is the label of the button above this note.
  "sitePage.join.mobile":
    "If Whilo is installed, tap {open}. You can also paste this link into Add server in the app.",
  "sitePage.join.email": "If the invitation came by email, sign in to Whilo with that email address.",
  // {name} is Slack or Discord on all the connect keys.
  "sitePage.connect.title": "Return to Whilo",
  "sitePage.connect.failedTitle": "The connection did not finish",
  "sitePage.connect.openApp": "Open Whilo",
  "sitePage.connect.tryAgainApp": "Try again in Whilo",
  "sitePage.connect.tryAgainBrowser": "Try again in browser",
  "sitePage.connect.doneInWebClient": "Your Whilo tab finishes the {name} connection. You can close this tab.",
  "sitePage.connect.doneInApp": "Whilo finishes the {name} connection on your computer.",
  "sitePage.connect.failure.cancelled": "The {name} connection was cancelled. Nothing changed.",
  "sitePage.connect.failure.expired": "The {name} sign-in expired. Start the connection again.",
  "sitePage.connect.failure.exchange": "{name} did not confirm the connection. Try again.",
  "sitePage.connect.failure.enterprise": "Connect one Slack workspace, not a whole organization.",
  "sitePage.connect.failure.takenSlack":
    "Another Whilo server already answers this Slack workspace. Disconnect it on that server, then try again.",
  "sitePage.connect.failure.takenDiscord":
    "Another Whilo server already answers this Discord server. Disconnect it on that server, then try again.",
  "sitePage.connect.failure.unavailable": "Whilo cannot connect to {name} now. Try again later.",
  "sitePage.connect.failure.tabClosed":
    "The Whilo tab that started the {name} connection did not answer. Open Whilo in your browser and connect {name} again.",
  "sitePage.connect.failure.failed": "{name} did not finish the connection. Try again.",
  // {marketplace}, {apps} and {connect} are the names of these screens and that button in the app.
  "sitePage.connect.restartHint": "In Whilo, open {marketplace}, then {apps}, then {name}, and select {connect}.",
  "sitePage.connect.notOpened":
    "Start Whilo, then try again. If Whilo is not on this computer, download it and connect {name} from the app.",
  "sitePage.openApp.title": "Nothing opened?",
  "sitePage.openApp.dismiss": "Not now",
  "sitePage.billing.pageTitle": "Whilo billing",
  "sitePage.billing.updatedTitle": "Billing updated",
  "sitePage.billing.updatedBody": "Go back to Whilo. You can close this page.",
  "sitePage.billing.cancelledTitle": "Checkout cancelled",
  "sitePage.billing.cancelledBody": "Nothing was charged. Go back to Whilo.",
  "sitePage.report.pageTitle": "Report a hosted site — Whilo",
  "sitePage.report.title": "Report a hosted site",
  "sitePage.report.intro": "Send a report about harmful or unlawful content on an openbot.site address.",
  "sitePage.report.hostnameLabel": "Site address",
  "sitePage.report.hostnameMissing": "Enter the site address",
  "sitePage.report.reasonLabel": "Reason",
  "sitePage.report.reason.phishing": "Phishing",
  "sitePage.report.reason.malware": "Malware",
  "sitePage.report.reason.abuse": "Abuse",
  "sitePage.report.reason.copyright": "Copyright",
  "sitePage.report.reason.other": "Other",
  "sitePage.report.detailsLabel": "Details",
  "sitePage.report.optional": "Optional",
  "sitePage.report.detailsPlaceholder": "What is wrong with this site?",
  "sitePage.report.send": "Send report",
  "sitePage.report.sending": "Sending…",
  "sitePage.report.tooMany": "Too many reports. Try again later.",
  "sitePage.report.sendFailed": "Could not send the report. Try again.",
  // {email} is the contact address. The page shows it as a link.
  "sitePage.report.writeTo": "You can also write to {email}.",
  "sitePage.report.sentTitle": "Report sent",
  "sitePage.report.sentBody": "Thanks. We received your report.",
  "sitePage.report.home": "Go to the home page",
  "sitePage.pricing.title": "Whilo pricing",
  "sitePage.pricing.description":
    "Hosted servers and a license for teams. Whilo is free for personal use on your own computer.",
  "sitePage.pricing.heading": "Pricing",
  "sitePage.pricing.enterprise.title": "Enterprise",
  // {count} is the largest number of members that the page sells, such as 25.
  "sitePage.pricing.enterprise.body":
    "Larger servers, more than {count} members, or anything else you need. With enterprise support.",
  "sitePage.pricing.enterprise.contact": "Contact sales",
  "sitePage.pricing.unavailable": "Payments are not available yet. This page will show the prices again when they are.",
  "sitePage.billing.pendingTitle": "Payment in progress",
  "sitePage.billing.pendingBody":
    "We are confirming your payment. This can take a moment. Go back to Whilo to see your server, or wait and try again.",
  "sitePage.billing.unavailableTitle": "Payments are not available",
  "sitePage.billing.unavailableBody":
    "The payment service is not set up yet, so we cannot confirm anything. Nothing was charged. Go back to Whilo.",
  // The public Marketplace on openbot.run. The tab and category names are the app's `marketplace.*` keys.
  "sitePage.marketplace.agents.title": "Agents — Whilo Marketplace",
  "sitePage.marketplace.agents.description":
    "Agents that people made in Whilo. Add one to Whilo with its skills and routines.",
  "sitePage.marketplace.skills.title": "Skills — Whilo Marketplace",
  "sitePage.marketplace.skills.description": "Skills that an Whilo agent can use. Add one to Whilo.",
  "sitePage.marketplace.apps.title": "Apps — Whilo Marketplace",
  "sitePage.marketplace.apps.description":
    "Apps and tools that an Whilo agent can use. Open an app in Whilo, and decide there what it connects to.",
  // {name} is the name of an agent or a skill.
  "sitePage.marketplace.agentTitle": "{name} — Whilo agent",
  "sitePage.marketplace.skillTitle": "{name} — Whilo skill",
  // The text of the share image for screen readers. {creator} is the name of the person who made it.
  "sitePage.marketplace.agentImageAlt": "{name}, an Whilo agent by {creator}",
  "sitePage.marketplace.skillImageAlt": "{name}, an Whilo skill by {creator}",
  "sitePage.marketplace.categories": "Categories",
  "sitePage.marketplace.allCategories": "All",
  "sitePage.marketplace.searchAgents": "Search agents",
  "sitePage.marketplace.searchSkills": "Search skills",
  "sitePage.marketplace.searchApps": "Search apps",
  "sitePage.marketplace.featured": "Featured",
  "sitePage.marketplace.results": "Results",
  "sitePage.marketplace.seeAll": "See all",
  "sitePage.marketplace.add": "Add",
  // {name} is the name of the person who made the agent or the skill.
  "sitePage.marketplace.by": "by {name}",
  // A screen reader reads this after the name of a verified agent or skill.
  "sitePage.marketplace.verifiedName": ", verified by Whilo",
  // A screen reader reads this when a search or a category changes the list.
  "sitePage.marketplace.shownAgents": "Agents shown: {shown} of {total}",
  "sitePage.marketplace.shownSkills": "Skills shown: {shown} of {total}",
  "sitePage.marketplace.shownApps": "Apps shown: {shown} of {total}",
  "sitePage.marketplace.emptyAgentsCategory": "No agents in this category yet.",
  "sitePage.marketplace.emptySkillsCategory": "No skills in this category yet.",
  // {query} is the text in the search field.
  "sitePage.marketplace.emptyAgentsQuery": "No agents match “{query}”.",
  "sitePage.marketplace.emptySkillsQuery": "No skills match “{query}”.",
  "sitePage.marketplace.emptyApps": "No app matches.",
  "sitePage.marketplace.breadcrumb": "Breadcrumb",
  "sitePage.marketplace.addToWhilo": "Add to Whilo",
  // Shows after "Add to Whilo" did not open the app.
  "sitePage.marketplace.addFromApp": "{name} is added from inside Whilo. Get the app, then open this link again.",
  // {platform} is macOS, Windows or Linux.
  "sitePage.marketplace.downloadFor": "Download for {platform}",
  "sitePage.marketplace.copyLink": "Copy link",
  "sitePage.marketplace.copied": "Copied",
  "sitePage.marketplace.trust.agentReviewed":
    "Made by another Whilo user. Whilo reviewed it before it went live. It can act on your behalf once added.",
  "sitePage.marketplace.trust.agentPending":
    "Shared by its creator before Whilo reviewed it. It can act on your behalf once added.",
  "sitePage.marketplace.trust.skillReviewed": "Made by another Whilo user. Whilo reviewed it before it went live.",
  "sitePage.marketplace.source.verified": "Verified by Whilo",
  "sitePage.marketplace.source.reviewed": "Reviewed by Whilo",
  "sitePage.marketplace.source.pending": "Not reviewed yet",
  "sitePage.marketplace.information": "Information",
  "sitePage.marketplace.fact.creator": "Creator",
  "sitePage.marketplace.fact.source": "Source",
  "sitePage.marketplace.fact.category": "Category",
  "sitePage.marketplace.fact.version": "Version",
  "sitePage.marketplace.fact.updated": "Updated",
  // {version} is a number, such as 3.
  "sitePage.marketplace.skillVersion": "Version {version}",
  // A routine that the agent brings switched off. It runs only after the user switches it on.
  "sitePage.marketplace.routineOff": "Starts off",
  "sitePage.marketplace.missing.title": "Not in the Marketplace",
  "sitePage.marketplace.missing.body": "The creator removed it, Whilo did not approve it, or the link is wrong.",
  "sitePage.marketplace.missing.open": "Open the Marketplace",
});
