import { withRequestLog } from "./support-log";

/**
 * The browser's own `fetch`. `expo/fetch` is the streaming implementation for the native runtimes; on
 * web it hands a request to a wrapper the browser build does not provide, and every sign-in request
 * failed before it left the page. The browser fetch is the same API, so only this import differs.
 */
export const fetch = withRequestLog(globalThis.fetch.bind(globalThis));
