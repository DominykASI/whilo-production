/**
 * The headers of `POST /v1/auth/email/start`. The account service answers a repeat of a send with
 * the same `Idempotency-Key` with the code it already accepted, so a lost response costs no second
 * code.
 */
export function emailSendHeaders(requestId: string): Record<string, string> {
  return { "Idempotency-Key": requestId };
}
