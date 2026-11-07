/**
 * The browser has no Reduce Transparency setting. `react-native-web` has no
 * `AccessibilityInfo.isReduceTransparencyEnabled`, so the native module called a function that does
 * not exist while a screen subscribed, and the exception blanked the whole page.
 *
 * No browser window draws Liquid Glass either (`isLiquidGlassAvailable()` answers false on web), so
 * glass controls draw solid there and the answer is always false.
 */
export function useReducedTransparency(): boolean {
  return false;
}
