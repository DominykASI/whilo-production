import { Typography } from "heroui-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import type { OAuthProvider } from "@/features/auth/api/mobile-auth";
import { useSignInColors } from "@/features/auth/components/sign-in-colors";
import { ChromeGlassSheen } from "@/shared/components/chrome-glass-sheen";
import { useChromeGlass } from "@/shared/lib/chrome-glass";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

const DISC_SIZE = 56;
const DISC_GAP = 18;

/** The four Google colours, in the order the G is drawn. */
const GOOGLE_PATHS = [
  {
    fill: "#4285F4",
    d: "M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.4 5.4 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z",
  },
  {
    fill: "#34A853",
    d: "M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z",
  },
  {
    fill: "#FBBC05",
    d: "M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z",
  },
  {
    fill: "#EA4335",
    d: "M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z",
  },
] as const;

/** The GitHub mark, drawn in one colour so it reads on the glass in either theme. */
const GITHUB_PATH =
  "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12";

function GoogleMark() {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      {GOOGLE_PATHS.map((path) => (
        <Path d={path.d} fill={path.fill} key={path.fill} />
      ))}
    </Svg>
  );
}

function GitHubMark({ color }: { color: string }) {
  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Path d={GITHUB_PATH} fill={color} />
    </Svg>
  );
}

/** A glass disc. The sheen lies inside the circle, so the light stops at the rim. */
function GlassDisc({
  children,
  label,
  disabled = false,
  badge,
  onPress,
}: {
  children: ReactNode;
  label: string;
  disabled?: boolean;
  badge?: string;
  onPress: () => void;
}) {
  const glass = useChromeGlass();
  return (
    <View className="items-center gap-1.5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => {
          if (disabled) return;
          void haptics.impact("light");
          onPress();
        }}
        className="items-center justify-center overflow-hidden rounded-full"
        style={({ pressed }) => ({
          width: DISC_SIZE,
          height: DISC_SIZE,
          ...glass,
          opacity: disabled ? 0.45 : pressed ? 0.72 : 1,
          transform: [{ scale: pressed && !disabled ? 0.96 : 1 }],
        })}
      >
        <ChromeGlassSheen />
        {children}
      </Pressable>
      {badge ? (
        <View className="rounded-full bg-grouped px-2 py-0.5">
          <Typography.Paragraph type="body-xs" color="muted">
            {badge}
          </Typography.Paragraph>
        </View>
      ) : null}
    </View>
  );
}

/**
 * The state of the two browser sign-ins. `null` is a provider that has not answered yet: its disc
 * is not offered, and it says nothing it does not know.
 */
export interface SocialSignInState {
  google: boolean | null;
  github: boolean | null;
  /** An inline line under the discs, such as the provider that this deployment cannot finish. */
  note?: string | null;
  onPress: (provider: OAuthProvider) => void;
}

/**
 * The social sign-in discs under the help text. A provider that this deployment cannot finish is
 * disabled and says so with a short badge, rather than offering a button that ends nowhere.
 */
export function SocialSignInRow({ social, reduced }: { social: SocialSignInState; reduced: boolean }) {
  const { t } = useText();
  const colors = useSignInColors();
  const note = social.note ?? null;
  return (
    <View className="items-center gap-2">
      <View className="flex-row items-start justify-center" style={{ gap: DISC_GAP }}>
        <GlassDisc
          badge={social.google === false ? t("mobile.auth.social.unavailable") : undefined}
          disabled={social.google !== true}
          label={t("mobile.auth.social.google")}
          onPress={() => social.onPress("google")}
        >
          <GoogleMark />
        </GlassDisc>
        <GlassDisc
          badge={social.github === false ? t("mobile.auth.social.unavailable") : undefined}
          disabled={social.github !== true}
          label={t("mobile.auth.social.github")}
          onPress={() => social.onPress("github")}
        >
          <GitHubMark color={colors.text} />
        </GlassDisc>
      </View>
      {note ? (
        <Animated.View entering={reduced ? undefined : FadeIn.duration(160)} exiting={reduced ? undefined : FadeOut.duration(120)}>
          <Typography.Paragraph type="body-xs" style={{ color: colors.muted }}>
            {note}
          </Typography.Paragraph>
        </Animated.View>
      ) : null}
    </View>
  );
}

export const SOCIAL_SIGN_IN_SIZE = DISC_SIZE + DISC_GAP;
