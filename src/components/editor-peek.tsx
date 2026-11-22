"use client";

import { Logo } from "@/components/logo";
import Link from "next/link";
import { DiagramThumbnail } from "@nn-diagram/viewer";
import { useMountedTheme } from "@/components/theme-provider";

const SHAPES = ["h-2.5 w-4 rounded-[2px]", "h-2.5 w-4 rounded-[4px]", "size-3 rounded-full", "size-2.5 rotate-45 rounded-[1px]", "h-2.5 w-4 rounded-full", "h-3 w-2.5 rounded-[2px]"];

/**
 * A small, live sketch of the editor for the index intro: a real diagram on
 * the canvas, everything else drawn as quiet placeholders. It sinks into the
 * section's bottom rule, so only the top of the window shows. The clip-path
 * cuts only the bottom edge, so the frame and its shadow stay whole.
 */
export function EditorPeek({ diagram }: { diagram: { source: string; url: string; file: string } | null }) {
  const theme = useMountedTheme();
  return (
    <Link
      href="/editor"
      aria-label="Open the editor"
      className="group relative hidden h-[212px] self-end rounded-t-xl outline-offset-4 lg:block"
      style={{ clipPath: "inset(-32px -32px 0 -32px)" }}
    >
      <div className="absolute inset-x-0 top-0 h-[360px] overflow-hidden rounded-t-xl border border-foreground/[0.14] bg-card shadow-[0_24px_48px_-20px_rgb(60_45_25/0.28)] transition-[translate,box-shadow] duration-300 ease-out group-hover:-translate-y-2.5 group-hover:shadow-[0_32px_56px_-18px_rgb(60_45_25/0.38)] group-focus-visible:-translate-y-2.5 dark:border-foreground/[0.12] dark:shadow-[0_24px_48px_-20px_rgb(0_0_0/0.7)] dark:group-hover:shadow-[0_32px_56px_-18px_rgb(0_0_0/0.85)]">
        {/* Title bar */}
        <div className="relative flex h-8 items-center gap-3 border-b border-border px-3">
          <Logo className="size-3 text-foreground/80" />
          <div className="flex gap-2 text-[10px] text-muted-foreground">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
          </div>
          {/* Centered on the bar, so it stays put while the button widens. */}
          <div className="absolute left-1/2 max-w-[45%] -translate-x-1/2 truncate text-[10.5px] font-medium">
            {diagram?.file.replace(/\.diagram\.jsx$/, "") ?? "untitled"}
            <span className="font-normal text-muted-foreground">.diagram.jsx</span>
          </div>
          {/* "Save" becomes the call to action: both labels share one grid
              cell; the second one widens and fades in on hover. */}
          <span className="ml-auto grid shrink-0 rounded-[5px] bg-foreground px-1.5 py-px text-[9.5px] font-medium text-background transition-colors duration-300 group-hover:bg-clay group-hover:text-white group-focus-visible:bg-clay group-focus-visible:text-white">
            <span className="col-start-1 row-start-1 transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0">Save</span>
            <span className="col-start-1 row-start-1 flex max-w-0 items-center gap-0.5 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-300 ease-out group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:max-w-16 group-focus-visible:opacity-100">
              Open editor
              <svg viewBox="0 0 16 16" className="size-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </span>
        </div>

        <div className="flex h-[calc(100%-2rem)]">
          {/* Shapes */}
          <div className="w-[76px] shrink-0 space-y-2 border-r border-border p-2">
            <div className="h-3.5 rounded-[4px] bg-muted" />
            <div className="grid grid-cols-2 gap-1">
              {SHAPES.map((shape, i) => (
                <div key={i} className="flex aspect-square items-center justify-center rounded-[5px] bg-muted/70">
                  <div className={`border border-foreground/45 ${shape}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div
            className="relative flex-1 bg-[var(--nnd-canvas-light)] dark:bg-[var(--nnd-canvas-dark)]"
            style={{ backgroundImage: "radial-gradient(circle, color-mix(in oklab, var(--foreground) 18%, transparent) 0.7px, transparent 1.1px)", backgroundSize: "10px 10px" }}
          >
            <div className="absolute top-5 left-1/2 h-[250px] w-[188px] -translate-x-1/2 shadow-[0_1px_3px_rgb(0_0_0/0.08)]">
              {diagram && theme && <DiagramThumbnail source={diagram.source} baseUrl={diagram.url} theme={theme} className="size-full" />}
              {/* Page selection */}
              <div className="pointer-events-none absolute -inset-px border border-clay">
                {["-top-[3.5px] -left-[3.5px]", "-top-[3.5px] -right-[3.5px]", "top-1/2 -left-[3.5px]", "top-1/2 -right-[3.5px]"].map((p) => (
                  <span key={p} className={`absolute size-1.5 border border-clay bg-card ${p}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Properties */}
          <div className="w-[96px] shrink-0 space-y-2.5 border-l border-border p-2.5">
            <div className="text-[9.5px] font-medium">Page</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex h-4.5 items-center rounded-[4px] bg-muted px-1 font-mono text-[7.5px] text-muted-foreground">W 640</div>
              <div className="flex h-4.5 items-center rounded-[4px] bg-muted px-1 font-mono text-[7.5px] text-muted-foreground">H 848</div>
            </div>
            <div className="h-px bg-border" />
            <div className="text-[9.5px] font-medium">Theme</div>
            <div className="flex h-4.5 rounded-[4px] bg-muted p-0.5">
              <div className="flex-1 rounded-[3px] bg-card shadow-sm" />
              <div className="flex-1" />
            </div>
            <div className="space-y-2 pt-0.5">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-1.5 w-10 rounded-full bg-muted" />
                  <div className="h-2.5 w-4 rounded-full bg-clay/85" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
