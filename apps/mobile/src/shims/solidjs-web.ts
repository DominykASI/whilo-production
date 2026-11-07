// See solid-js.ts. None of these functions run when the native adapter uses BotEngine.
function unsupportedSolidWebUi(): never {
  throw new Error("The web renderer from bloub is not available in the native app.");
}

// `template()` is the one web helper bloub calls while its module is still being evaluated: it builds
// the static `<svg>` strings for the SVG bot at the top level of the bundle. The native adapter renders
// `BotEngine` and never mounts that UI, so the templates are built and then never used. The call itself
// happens on import, so it must not throw; the returned builder does, if it is ever reached.
function inertSolidWebTemplate(): () => never {
  return unsupportedSolidWebUi;
}

export const Dynamic = unsupportedSolidWebUi;
export const mergeProps = unsupportedSolidWebUi;
export const ssr = unsupportedSolidWebUi;
export const ssrAttribute = unsupportedSolidWebUi;
export const ssrClassName = unsupportedSolidWebUi;
export const ssrGroup = unsupportedSolidWebUi;
export const ssrHydrationKey = unsupportedSolidWebUi;
export const ssrStyle = unsupportedSolidWebUi;

// The rest of bloub's web renderer. These only run inside a component, which the native adapter
// never mounts, but they still need to be callable so nothing on the import path fails.
export const className = unsupportedSolidWebUi;
export const createComponent = unsupportedSolidWebUi;
export const effect = unsupportedSolidWebUi;
export const insert = unsupportedSolidWebUi;
export const memo = unsupportedSolidWebUi;
export const ref = unsupportedSolidWebUi;
export const setAttribute = unsupportedSolidWebUi;
export const style = unsupportedSolidWebUi;
export const template = inertSolidWebTemplate;

const escapeHtml = unsupportedSolidWebUi;

export { escapeHtml as escape };
