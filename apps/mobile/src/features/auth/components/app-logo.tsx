import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import Svg, { Path, Rect } from "react-native-svg";
import { useCSSVariable } from "uniwind";

import { type AppLogoAnimation, useAppLogoMotion } from "@/features/auth/components/use-app-logo-motion";
import { useText } from "@/shared/lib/text";

export interface AppLogoProps {
  animation?: AppLogoAnimation;
  interactive?: boolean;
  size?: number;
}

const VIEWBOX_SIZE = 240;
const MARK_CENTER_X = 120;
const MARK_CENTER_Y = 130;
/** The `W` is one thick rounded stroke, so the two valleys read as one ribbon rather than four lines. */
const MARK_PATH = "M52 96 L86 164 L120 116 L154 164 L188 96";
const MARK_STROKE_WIDTH = 30;
/** Each sparkle is a four-point star centered on the given coordinates, sized by its arm length. */
const SPARKLES = [
  { cx: 192, cy: 62, arm: 15 },
  { cx: 50, cy: 182, arm: 13 },
] as const;

/** A four-point star: each arm is a curve that pinches at the center, so the points stay sharp. */
function sparklePath(cx: number, cy: number, arm: number): string {
  const waist = arm * 0.16;
  return [
    `M${cx} ${cy - arm}`,
    `Q${cx + waist} ${cy - waist} ${cx + arm} ${cy}`,
    `Q${cx + waist} ${cy + waist} ${cx} ${cy + arm}`,
    `Q${cx - waist} ${cy + waist} ${cx - arm} ${cy}`,
    `Q${cx - waist} ${cy - waist} ${cx} ${cy - arm}`,
    "Z",
  ].join(" ");
}

function resolveColor(value: string | number | undefined, fallback: string): string {
  return String(value ?? fallback);
}

export function AppLogo({ animation = "none", interactive = false, size = VIEWBOX_SIZE }: AppLogoProps) {
  const { t } = useText();
  const backgroundColor = resolveColor(useCSSVariable("--whilo-logo-production"), "#d6adf2");
  const eyeColor = resolveColor(useCSSVariable("--whilo-logo-eye"), "#040007");
  const { handlePressIn, leftEyeAnimatedStyle, rightEyeAnimatedStyle } = useAppLogoMotion({ animation, size });
  const eyeLayerStyle = {
    height: size,
    left: 0,
    position: "absolute" as const,
    top: 0,
    width: size,
  };

  const logo = (
    <View
      style={{ height: size, width: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}>
        <Rect width={VIEWBOX_SIZE} height={VIEWBOX_SIZE} rx={50} ry={50} fill={backgroundColor} />
      </Svg>

      <Animated.View
        pointerEvents="none"
        style={[
          eyeLayerStyle,
          { transformOrigin: [(MARK_CENTER_X * size) / VIEWBOX_SIZE, (MARK_CENTER_Y * size) / VIEWBOX_SIZE, 0] },
          leftEyeAnimatedStyle,
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}>
          <Path
            d={MARK_PATH}
            fill="none"
            stroke={eyeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={MARK_STROKE_WIDTH}
          />
          {SPARKLES.map((sparkle) => (
            <Path key={sparkle.cx} d={sparklePath(sparkle.cx, sparkle.cy, sparkle.arm)} fill={eyeColor} />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );

  if (!interactive) return logo;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("mobile.auth.logo.animate")}
      accessibilityHint={t("mobile.auth.logo.animateHint")}
      onPressIn={handlePressIn}
      pressRetentionOffset={12}
    >
      {logo}
    </Pressable>
  );
}
