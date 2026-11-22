"use client";

import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { modalities, releaseYear, searchModels, type SearchEntry } from "@/lib/search";

/**
 * Model search as a dialog (centered on desktop, full screen on phones).
 * Results update while typing; arrows move, Enter opens the model.
 */
export function SearchDialog({ open, onOpenChange, models }: { open: boolean; onOpenChange: (open: boolean) => void; models: SearchEntry[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const results = useMemo(() => searchModels(models, query), [models, query]);

  const setOpen = (next: boolean) => {
    if (!next) {
      setQuery("");
      setActive(0);
    }
    onOpenChange(next);
  };
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (m: SearchEntry | undefined) => {
    if (!m) return;
    setOpen(false);
    router.push(m.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex flex-col gap-0 overflow-hidden bg-popover p-0 shadow-paper ring-foreground/10",
          "top-[12vh] translate-y-0 sm:max-w-[560px]",
          "max-sm:inset-0 max-sm:h-dvh max-sm:max-w-none max-sm:translate-x-0 max-sm:rounded-none max-sm:ring-0",
        )}
      >
        <DialogTitle className="sr-only">Search models</DialogTitle>
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search models, labs, architectures"
            role="combobox"
            aria-expanded
            aria-controls={`${id}-list`}
            aria-activedescendant={results[active] ? `${id}-${active}` : undefined}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <DialogClose className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground max-sm:hidden">
            esc
          </DialogClose>
          <DialogClose className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground sm:hidden">Cancel</DialogClose>
        </div>

        <div ref={listRef} id={`${id}-list`} role="listbox" className="min-h-0 flex-1 overflow-y-auto p-2 sm:max-h-[min(440px,60vh)]">
          <div className="label-caps px-3 pt-2 pb-1.5">{query ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : "All models"}</div>
          {results.map((m, i) => (
            <a
              key={m.href}
              id={`${id}-${i}`}
              href={m.href}
              role="option"
              aria-selected={i === active}
              data-index={i}
              data-active={i === active || undefined}
              onMouseMove={() => setActive(i)}
              onClick={(e) => {
                e.preventDefault();
                go(m);
              }}
              className="group flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors data-active:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate font-serif text-[17px] leading-6 font-medium">{m.name}</span>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{releaseYear(m.released)}</span>
                </div>
                <div className="truncate text-[13px] text-muted-foreground">
                  {m.lab}
                  {m.tags.length > 0 && <span className="text-muted-foreground/70"> · {m.tags.slice(0, 3).join(", ")}</span>}
                </div>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground max-sm:hidden">{modalities(m)}</span>
              <ArrowRight className="size-4 shrink-0 text-clay-ink opacity-0 transition-opacity group-data-active:opacity-100" />
            </a>
          ))}
          {results.length === 0 && (
            <div className="px-3 py-12 text-center">
              <div className="font-serif text-lg italic">Nothing found</div>
              <div className="mt-1 text-sm text-muted-foreground">No model matches “{query}”.</div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground max-sm:hidden">
          <span className="inline-flex items-center gap-1.5">
            <Key>↑</Key>
            <Key>↓</Key> move
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Key>
              <CornerDownLeft className="size-2.5" />
            </Key>
            open
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] bg-background px-1 font-mono text-[10px] text-foreground/70 ring-1 ring-border">
      {children}
    </kbd>
  );
}
