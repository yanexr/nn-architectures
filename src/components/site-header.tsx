"use client";

import { Logo } from "@/components/logo";
import { Moon, PencilRuler, Search, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useEffectEvent, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { SearchDialog } from "@/components/search-dialog";
import { useResolvedTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { SearchEntry } from "@/lib/search";

const isTyping = () => {
  const el = document.activeElement as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
};

/** "/" or Ctrl/Cmd+K anywhere. */
function useSearchShortcut(onTrigger: () => void) {
  const trigger = useEffectEvent(onTrigger);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((k === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isTyping())) {
        e.preventDefault();
        trigger();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

const fieldClass =
  "group relative flex h-9 w-full max-w-[420px] items-center gap-2.5 rounded-full bg-foreground/[0.045] pr-1.5 pl-3.5 text-sm text-muted-foreground ring-1 ring-transparent transition-[background-color,box-shadow] hover:bg-foreground/[0.07] dark:bg-foreground/[0.06] dark:hover:bg-foreground/[0.09]";

function Hint() {
  return (
    <kbd className="ml-auto hidden h-6 min-w-6 items-center justify-center rounded-full px-1.5 font-mono text-[11px] text-muted-foreground ring-1 ring-border sm:inline-flex">
      /
    </kbd>
  );
}

/** On the index the field is a real input: the results below update while typing. */
function InlineSearch() {
  const router = useRouter();
  const params = useSearchParams();
  // Local value for instant typing; follows the URL when it changes elsewhere (Clear, back).
  const urlQuery = params.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const [synced, setSynced] = useState(urlQuery);
  if (urlQuery !== synced) {
    setSynced(urlQuery);
    setValue(urlQuery);
  }
  const ref = useRef<HTMLInputElement>(null);
  useSearchShortcut(() => ref.current?.focus());
  const update = (q: string) => {
    setValue(q);
    setSynced(q);
    const next = new URLSearchParams(params.toString());
    if (q) next.set("q", q);
    else next.delete("q");
    router.replace(`/${next.size ? `?${next}` : ""}`, { scroll: false });
  };
  return (
    <label className={cn(fieldClass, "cursor-text focus-within:bg-card focus-within:ring-ring/45 dark:focus-within:bg-card")}>
      <Search className="size-4 shrink-0" />
      <input
        ref={ref}
        value={value}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && (update(""), e.currentTarget.blur())}
        placeholder="Search models"
        aria-label="Search models"
        className="h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
      />
      {!value && <Hint />}
    </label>
  );
}

/** Elsewhere it is a button that opens the search dialog. */
function DialogSearch({ models }: { models: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  useSearchShortcut(() => setOpen(true));
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={fieldClass} aria-label="Search models">
        <Search className="size-4 shrink-0" />
        <span className="truncate">Search models</span>
        <Hint />
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} models={models} />
    </>
  );
}

const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-foreground/[0.06] hover:text-foreground [&_svg]:size-[17px]";

function ThemeToggle() {
  const { setTheme } = useTheme();
  const theme = useResolvedTheme();
  return (
    <button
      type="button"
      aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={iconButtonClass}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}

/** GitHub mark (Octicons, MIT): lucide no longer ships brand icons. */
function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

export function SiteHeader({ models }: { models: SearchEntry[] }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 bg-background/80 shadow-[inset_0_-1px_0_var(--border)] backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-md" aria-label="nn-architectures, all models">
          <Logo className="size-[22px] text-clay" />
          <span className="font-serif text-[19px] leading-none font-medium tracking-[-0.015em] max-sm:hidden">nn-architectures</span>
        </Link>
        <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-4">
          {pathname === "/" ? (
            <Suspense fallback={<div className={fieldClass} />}>
              <InlineSearch />
            </Suspense>
          ) : (
            <DialogSearch models={models} />
          )}
        </div>
        <nav className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <a href="https://github.com/yanexr/nn-architectures" target="_blank" rel="noreferrer" aria-label="GitHub repository" className={iconButtonClass}>
            <GitHubMark />
          </a>
          {/* Outlined, not filled: on a model page the viewer's "Edit" (this diagram) is the one primary action. */}
          <Link
            href="/editor"
            className="inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-foreground ring-1 ring-foreground/15 transition-colors ring-inset hover:bg-foreground/[0.05] hover:ring-foreground/25 max-sm:w-9 max-sm:justify-center max-sm:px-0 [&_svg]:size-4"
          >
            <PencilRuler />
            <span className="max-sm:hidden">Editor</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
