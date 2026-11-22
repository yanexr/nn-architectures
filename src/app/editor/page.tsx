import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorClient } from "./editor-client";

export const metadata: Metadata = { title: "Editor — nn-architectures" };

export default function EditorPage() {
  return (
    <div className="app-fullscreen editor-theme fixed inset-0">
      <Suspense>
        <EditorClient />
      </Suspense>
    </div>
  );
}
