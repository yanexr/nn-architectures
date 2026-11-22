"use client";

import type { ReactNode } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

/**
 * Model page layout: the diagram as a sheet of paper on the left, the notes
 * on the right, with a draggable divider on large screens. Small screens
 * stack both.
 */
export function ModelSplit({ diagram, info }: { diagram: ReactNode; info: ReactNode }) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex-1 max-lg:!h-auto max-lg:!flex-col max-lg:[&>[data-panel]]:!flex-none lg:!h-[calc(100dvh-3.5rem)] lg:!flex-none"
    >
      <ResizablePanel id="diagram" minSize="35" className="min-w-0 p-2 max-lg:!h-[72svh] max-lg:w-full sm:p-3 lg:pr-1">
        <div className="h-full overflow-hidden rounded-2xl border border-foreground/[0.1] bg-white dark:border-foreground/10 dark:bg-[#141414]">
          {diagram}
        </div>
      </ResizablePanel>
      <ResizableHandle className="group w-3 bg-transparent after:w-3 max-lg:hidden focus-visible:ring-0">
        <div className="h-10 w-[3px] rounded-full bg-border transition-colors group-hover:bg-muted-foreground/50 group-data-[separator=active]:bg-clay group-focus-visible:bg-clay" />
      </ResizableHandle>
      <ResizablePanel
        id="info"
        defaultSize={480}
        minSize={340}
        maxSize="60"
        groupResizeBehavior="preserve-pixel-size"
        className="max-lg:!flex-none max-lg:!basis-auto"
      >
        <div className="h-full overflow-y-auto">{info}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
