"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useSyncExternalStore, type ComponentProps } from "react";

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}

const subscribe = () => () => {};

/** false on the server and during hydration, true afterwards. */
function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/** "light" | "dark" after hydration (the server always renders light). */
export function useResolvedTheme(): "light" | "dark" {
  const { resolvedTheme } = useTheme();
  return useMounted() && resolvedTheme === "dark" ? "dark" : "light";
}

/** Like useResolvedTheme, but undefined until mounted (for client-only widgets that read the theme themselves). */
export function useMountedTheme(): "light" | "dark" | undefined {
  const { resolvedTheme } = useTheme();
  if (!useMounted()) return undefined;
  return resolvedTheme === "dark" ? "dark" : "light";
}
