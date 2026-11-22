"use client";

import dynamic from "next/dynamic";
import { EditorLoader } from "@nn-diagram/editor/loader";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useMountedTheme } from "@/components/theme-provider";
import { BASE_PATH } from "@/lib/base-path";

// The editor is browser-only (File System Access API, pointer interactions).
const DiagramEditor = dynamic(() => import("./site-editor").then((m) => m.SiteEditor), {
  ssr: false,
  loading: () => <EditorLoader />,
});

export function EditorClient() {
  const params = useSearchParams();
  const src = params.get("src") ?? undefined;
  // Undefined until mounted: the editor then reads the theme from <html> itself, so it never flashes light.
  const theme = useMountedTheme();
  const { setTheme } = useTheme();
  return <DiagramEditor src={src} homeHref={`${BASE_PATH}/`} theme={theme} onThemeChange={setTheme} />;
}
