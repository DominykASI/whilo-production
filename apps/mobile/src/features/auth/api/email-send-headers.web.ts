/**
 * A browser may send only the headers that the account service's CORS preflight lists, and that
 * list is `authorization, content-type, x-whilo-client, x-requested-with`. A send carrying
 * `Idempotency-Key` was therefore refused before it left the page — `fetch` rejected with
 * "TypeError: Failed to fetch" and the screen showed "Whilo could not reach the account service" —
 * while the same send without the header was answered with the challenge. The resend timer already
 * keeps one code per address on this screen, and the account service's own wait (`code_recently_sent`
 * with `Retry-After`) covers a repeat, so the browser build sends the request the preflight allows.
 */
export function emailSendHeaders(_requestId: string): Record<string, string> {
  return {};
}
