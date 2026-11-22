"use client";

import { DEFAULT_LIBRARY, DiagramEditor, type DiagramEditorProps } from "@nn-diagram/editor";
import { ML_LIBRARY } from "@/lib/ml-library";

const LIBRARIES = [...DEFAULT_LIBRARY, ...ML_LIBRARY];

/** The generic editor plus the site's neural-network sections. */
export function SiteEditor(props: DiagramEditorProps) {
  return <DiagramEditor libraries={LIBRARIES} {...props} />;
}
