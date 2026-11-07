declare module "@whilo/renderer-preview" {
  import type { JSX } from "@solidjs/web";

  export interface WhiloPlaygroundProps {
    variant?: "default" | "landing";
    theme?: "dark" | "light";
  }

  export function WhiloPlayground(props: WhiloPlaygroundProps): JSX.Element;
}
