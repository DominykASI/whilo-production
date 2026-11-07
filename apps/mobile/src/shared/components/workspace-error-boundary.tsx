import { Button, Typography } from "heroui-native";
import { useThemeColor } from "heroui-native/hooks";
import Layers3 from "lucide-react-native/icons/layers";
import { Component, type PropsWithChildren, type ReactNode } from "react";
import { View } from "react-native";
import { supportLog, supportLogValue } from "@/features/support/model/support-log";
import { useText } from "@/shared/lib/text";

/** The empty home, with a retry: what the group shows when a screen cannot draw. */
function WorkspaceFailure({ retry }: { retry: () => void }) {
  const { t } = useText();
  const muted = String(useThemeColor("muted"));
  return (
    <View className="flex-1 items-center justify-center gap-5 bg-background px-8 py-16">
      <View className="size-16 items-center justify-center rounded-3xl bg-control">
        <Layers3 color={muted} size={28} strokeWidth={1.6} />
      </View>
      <View className="items-center gap-1.5">
        <Typography.Heading type="h4">{t("mobile.agent.home.noServers")}</Typography.Heading>
        <Typography.Paragraph align="center" className="text-text-secondary">
          {t("mobile.agent.home.noServersBody")}
        </Typography.Paragraph>
      </View>
      <Button size="md" variant="secondary" onPress={retry}>
        <Button.Label>{t("common.tryAgain")}</Button.Label>
      </Button>
    </View>
  );
}

interface WorkspaceErrorBoundaryState {
  failed: boolean;
}

/**
 * Keeps one screen that cannot draw from blanking the whole page. React unmounts everything under
 * the root when a render or an effect throws and no boundary catches it, which shows a white page
 * with no way back. The group shows the empty home instead, and `Retry` mounts the tree again.
 */
export class WorkspaceErrorBoundary extends Component<PropsWithChildren, WorkspaceErrorBoundaryState> {
  state: WorkspaceErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): WorkspaceErrorBoundaryState {
    return { failed: true };
  }

  /** The log keeps the failure for the support screen, since the screen that threw is gone. */
  componentDidCatch(error: unknown): void {
    supportLog.add("error", "app", `Screen failed: ${supportLogValue(error)}`);
  }

  /** A new mount of the children gives the failing read another try. */
  retry = (): void => this.setState({ failed: false });

  render(): ReactNode {
    if (this.state.failed) return <WorkspaceFailure retry={this.retry} />;
    return this.props.children;
  }
}
