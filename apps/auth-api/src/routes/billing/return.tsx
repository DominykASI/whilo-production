import { AppLogo } from "@whilo/brand";
import { readFirstTouch } from "@whilo/contracts/first-touch";
import { isDynamicRecord, isOneOf, isString } from "@whilo/contracts/runtime-values";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, onCleanup, onSettled, Show } from "solid-js";
import { billingReturnText } from "../../components/transactional/page-text";
import { TransactionalPage } from "../../components/transactional/TransactionalPage";
import { BILLING_RETURN_KINDS, type BillingReturnKind, landingAnalytics } from "../../lib/analytics";
import { loadPageText } from "../../lib/page-text";

/**
 * The `checkout` search parameter is the Stripe Checkout Session id when the page came back from a
 * checkout. The return page asks the Worker about that session: only a webhook-confirmed payment
 * renders as paid, and a session that the Worker cannot confirm yet renders as pending. The page
 * never claims success before the webhook confirmed.
 */
const CHECKOUT_SESSION_PATTERN = /^cs_[A-Za-z0-9_]{1,250}$/u;

/** The page that Stripe Checkout and the Customer Portal open when a desktop user goes back. */
export const Route = createFileRoute("/billing/return")({
  headers: () => ({
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  }),
  // A cancelled Checkout comes back with `cancelled=1`, and the router reads a number from the query.
  // The router also validates the search that it wrote, so `true` must stay true. A page that was
  // not cancelled keeps the key out of its URL. `kind` names the Stripe page that closed; an older
  // account service sends no `kind`, and an unknown value is dropped. `checkout` is the Stripe
  // Checkout Session id when the page came back from a checkout instead of the Customer Portal.
  validateSearch: (value): { cancelled?: true; kind?: BillingReturnKind; checkout?: string } => {
    if (!isDynamicRecord(value)) return {};
    const cancelled = value.cancelled === 1 || value.cancelled === "1" || value.cancelled === true;
    const checkout = value.checkout;
    return {
      ...(cancelled ? { cancelled: true } : {}),
      ...(isOneOf(BILLING_RETURN_KINDS, value.kind) ? { kind: value.kind } : {}),
      ...(isString(checkout) && CHECKOUT_SESSION_PATTERN.test(checkout) ? { checkout } : {}),
    };
  },
  loader: ({ context }) => loadPageText(context.locale, billingReturnText),
  head: ({ loaderData }) => ({
    meta: [
      ...(loaderData ? [{ title: loaderData.text.pageTitle }] : []),
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: BillingReturn,
});

/**
 * After a desktop checkout, sends the Checkout Session ID with the first website visit of this
 * browser, so that reports can name the source of the account. The ID is then removed from the URL.
 * The validated `checkout` search parameter is the same session, so the poll below does not need
 * the URL parameter after this call.
 */
function sendCheckoutAttribution(): void {
  const url = new URL(window.location.href);
  const sessionId = url.searchParams.get("checkout");
  if (!sessionId) return;
  url.searchParams.delete("checkout");
  window.history.replaceState(window.history.state, "", url);
  const firstTouch = readFirstTouch(() => window.localStorage, Date.now());
  if (!firstTouch) return;
  void fetch("/api/browser/checkout-attribution", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    keepalive: true,
    // The page has no referrer; the account service still needs the Origin header of this site.
    referrerPolicy: "same-origin",
    headers: { "Content-Type": "application/json", "X-Whilo-Browser": "1" },
    body: JSON.stringify({ sessionId, firstTouch }),
  }).catch(() => undefined);
}

function BillingReturn() {
  const search = Route.useSearch();
  const page = Route.useLoaderData();
  const text = () => page().text;
  // Paid is true only when the Worker confirmed the payment. While a checkout is pending it keeps
  // polling, and while billing is not configured it stays null and the page says so.
  const [paid, setPaid] = createSignal<boolean | null>(null);

  // The browser polls the Worker about the checkout session. The payment is confirmed only when a
  // webhook event was applied for it, so the page never claims success before that.
  // The session is read once, before sendCheckoutAttribution() strips it from the URL.
  checkCheckout();
  function checkCheckout() {
    const session = search().checkout;
    if (!session) {
      setPaid(null);
      return;
    }
    setPaid(null);
    let cancelled = false;
    const url = `/v1/stripe/webhook/session?session=${encodeURIComponent(session)}`;
    function tick() {
      if (cancelled) return;
      void fetch(url, { method: "GET", credentials: "same-origin", cache: "no-store" })
        .then((response) => response.json())
        .then((value) => {
          if (cancelled) return;
          if (isDynamicRecord(value) && value.status === "confirmed") {
            setPaid(true);
            return;
          }
          if (!cancelled) window.setTimeout(tick, 2_000);
        })
        .catch(() => {
          if (!cancelled) window.setTimeout(tick, 4_000);
        });
    }
    tick();
    onCleanup(() => {
      cancelled = true;
    });
  }

  onSettled(() => {
    sendCheckoutAttribution();
    return landingAnalytics.startBillingReturn(document, window.location.hostname, {
      cancelled: search().cancelled === true,
      kind: search().kind,
    });
  });
  // A Customer Portal return has no checkout session to confirm, so it stays on its own text.
  const confirmed = () => search().kind === "portal" || paid() === true;
  const pending = () => search().kind !== "portal" && paid() !== true;

  return (
    <TransactionalPage titleId="billing-return-title" lang={page().lang}>
      <AppLogo variant="production" class="join-card-logo" />
      <Show
        when={search().cancelled}
        fallback={
          <Show
            when={confirmed()}
            fallback={
              <Show when={pending()}>
                <h1 id="billing-return-title">{text().pendingTitle}</h1>
                <p class="join-card-copy">{text().pendingBody}</p>
              </Show>
            }
          >
            <h1 id="billing-return-title">{text().updatedTitle}</h1>
            <p class="join-card-copy">{text().updatedBody}</p>
          </Show>
        }
      >
        <h1 id="billing-return-title">{text().cancelledTitle}</h1>
        <p class="join-card-copy">{text().cancelledBody}</p>
      </Show>
    </TransactionalPage>
  );
}
