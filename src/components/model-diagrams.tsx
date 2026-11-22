"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DiagramViewer } from "@nn-diagram/viewer";
import { useResolvedTheme } from "@/components/theme-provider";
import { BASE_PATH } from "@/lib/base-path";
import { cn } from "@/lib/utils";

export interface DiagramTab {
  title: string;
  file: string;
  url: string;
  source: string;
}

/** The diagram area of a model page: tabs when a model has several diagrams. */
export function ModelDiagrams({ diagrams, name }: { diagrams: DiagramTab[]; name: string }) {
  const [active, setActive] = useState(0);
  const theme = useResolvedTheme();
  const router = useRouter();
  const current = diagrams[active];
  if (!current) {
    return <div className="flex h-full items-center justify-center font-serif text-lg text-muted-foreground italic">No diagram yet.</div>;
  }
  const onNavigate = (link: string) => {
    if (link.startsWith("#")) {
      const i = diagrams.findIndex((d) => d.file === link.slice(1) || d.file === `${link.slice(1)}.diagram.jsx`);
      if (i >= 0) setActive(i);
    } else if (/^https?:/.test(link)) window.open(link, "_blank", "noopener");
    else router.push(link);
  };
  return (
    <div className="@container relative flex h-full flex-col">
      {diagrams.length > 1 && (
        <div
          role="tablist"
          aria-label="Diagrams"
          className={cn(
            "no-scrollbar z-10 flex shrink-0 gap-0.5 overflow-x-auto border-b border-border bg-background/90 p-1 backdrop-blur-md",
            "@3xl:absolute @3xl:top-3 @3xl:left-3 @3xl:max-w-[calc(100%-23rem)] @3xl:rounded-xl @3xl:border @3xl:shadow-[0_1px_2px_rgb(0_0_0/0.04),0_6px_20px_-6px_rgb(0_0_0/0.14)]",
          )}
        >
          {diagrams.map((d, i) => (
            <button
              key={d.file}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "h-7 shrink-0 rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-colors",
                i === active ? "bg-foreground text-background" : "text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground",
              )}
            >
              {d.title}
            </button>
          ))}
        </div>
      )}
      <div className="min-h-0 flex-1">
        <DiagramViewer
          key={current.file}
          source={current.source}
          baseUrl={current.url}
          theme={theme}
          name={`${name}-${current.file.replace(/\.diagram\.jsx$/, "")}`.toLowerCase().replace(/[^a-z0-9.-]+/g, "-")}
          editHref={`${BASE_PATH}/editor/?src=${encodeURIComponent(current.url)}`}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
