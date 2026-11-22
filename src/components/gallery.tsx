"use client";

import { ArrowDownUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DiagramThumbnail } from "@nn-diagram/viewer";
import { useResolvedTheme } from "@/components/theme-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SIZE_BUCKETS, type ParsedSize } from "@/lib/sizes";
import { matchesQuery, modalities, releaseYear, sizeRange, type SearchEntry } from "@/lib/search";

export interface GalleryModel extends SearchEntry {
  parsedSizes: ParsedSize[];
  preview: { source: string; url: string } | null;
}

type Sort = "newest" | "oldest" | "name" | "size";
const SORTS: { id: Sort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "name", label: "Name" },
  { id: "size", label: "Largest" },
];

type FacetId = "input" | "output" | "size" | "tag";
type Selection = Record<FacetId, Set<string>>;
const EMPTY: Selection = { input: new Set(), output: new Set(), size: new Set(), tag: new Set() };

/** Option values of a model for one facet. */
function valuesOf(m: GalleryModel, facet: FacetId): string[] {
  if (facet === "input") return m.input;
  if (facet === "output") return m.output;
  if (facet === "tag") return m.tags;
  return SIZE_BUCKETS.filter((b) => m.parsedSizes.some((s) => s.total !== null && b.test(s.total))).map((b) => b.id);
}

function passes(m: GalleryModel, sel: Selection, except?: FacetId) {
  return (Object.keys(sel) as FacetId[]).every((f) => f === except || !sel[f].size || valuesOf(m, f).some((v) => sel[f].has(v)));
}

/* --------------------------------------------------------------- filters */

function Facet({
  label,
  options,
  selected,
  counts,
  onToggle,
  className,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: Set<string>;
  counts: Map<string, number>;
  onToggle: (id: string) => void;
  className?: string;
}) {
  if (!options.length) return null;
  return (
    <div role="group" aria-label={label} className={cn("flex min-w-0 items-center gap-3 lg:flex-col lg:items-start lg:gap-2", className)}>
      <span className="label-caps w-24 shrink-0 lg:w-auto">{label}</span>
      <div className="no-scrollbar fade-x -my-1 flex min-w-0 gap-1 overflow-x-auto py-1 pr-6 lg:flex-wrap lg:overflow-visible lg:pr-0">
        {options.map((o) => {
          const on = selected.has(o.id);
          const n = counts.get(o.id) ?? 0;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              disabled={!on && n === 0}
              onClick={() => onToggle(o.id)}
              className={cn(
                "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] whitespace-nowrap transition-colors",
                on
                  ? "bg-foreground text-background"
                  : "text-foreground/80 ring-1 ring-border ring-inset hover:bg-foreground/[0.05] hover:text-foreground disabled:opacity-35 disabled:hover:bg-transparent",
              )}
            >
              {o.label}
              <span className={cn("font-mono text-[10.5px] tabular-nums", on ? "text-background/60" : "text-muted-foreground")}>{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- cards */

/** Renders the thumbnail only once the card scrolls into view. */
function LazyThumb({ source, url }: { source: string; url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const theme = useResolvedTheme();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="absolute inset-0">
      {visible && <DiagramThumbnail source={source} baseUrl={url} theme={theme} className="size-full p-[6%]" />}
    </div>
  );
}

function ModelCard({ m }: { m: GalleryModel }) {
  const sizes = sizeRange(m.parsedSizes);
  return (
    <Link href={m.href} className="group flex flex-col rounded-2xl outline-offset-4">
      {/* The plate: the diagram on its own paper. Hover only changes the frame, nothing moves. */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-paper ring-1 ring-foreground/[0.08] transition-[box-shadow] duration-200 group-hover:ring-foreground/25 dark:bg-[#141414] dark:ring-foreground/10 dark:group-hover:ring-foreground/30">
        {m.preview ? <LazyThumb source={m.preview.source} url={m.preview.url} /> : null}
        <span className="absolute right-3 bottom-3 rounded-full bg-background/90 px-2.5 py-1 text-[12px] font-medium opacity-0 shadow-sm ring-1 ring-border backdrop-blur transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          Open diagram →
        </span>
      </div>
      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-[22px] leading-7 font-medium tracking-[-0.015em] decoration-clay decoration-1 underline-offset-[5px] group-hover:underline">
            {m.name}
          </h2>
          <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">{releaseYear(m.released)}</span>
        </div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">{m.lab}</div>
        {m.summary && <p className="mt-2.5 line-clamp-2 text-[14px] leading-relaxed text-foreground/75">{m.summary}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3 font-mono text-[11px] text-muted-foreground">
          {sizes && <span className="text-foreground/80">{sizes}</span>}
          {sizes && <span aria-hidden>·</span>}
          <span>{modalities(m)}</span>
        </div>
      </div>
    </Link>
  );
}

/* --------------------------------------------------------------- gallery */

export function Gallery({ models }: { models: GalleryModel[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const q = (params.get("q") ?? "").trim();
  const [sel, setSel] = useState<Selection>(EMPTY);
  const [sort, setSort] = useState<Sort>("newest");

  const options = useMemo(() => {
    const uniq = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b)).map((id) => ({ id, label: id }));
    return {
      input: uniq(models.flatMap((m) => m.input)),
      output: uniq(models.flatMap((m) => m.output)),
      size: SIZE_BUCKETS.map((b) => ({ id: b.id, label: b.label })),
      tag: uniq(models.flatMap((m) => m.tags)),
    };
  }, [models]);

  const searched = useMemo(() => models.filter((m) => matchesQuery(m, q)), [models, q]);

  // Counts per option given the search and the other facets.
  const counts = useMemo(() => {
    const out = {} as Record<FacetId, Map<string, number>>;
    for (const f of Object.keys(EMPTY) as FacetId[]) {
      const map = new Map<string, number>();
      for (const m of searched) if (passes(m, sel, f)) for (const v of new Set(valuesOf(m, f))) map.set(v, (map.get(v) ?? 0) + 1);
      out[f] = map;
    }
    return out;
  }, [searched, sel]);

  const filtered = useMemo(() => {
    const list = searched.filter((m) => passes(m, sel));
    const maxSize = (m: GalleryModel) => Math.max(0, ...m.parsedSizes.map((s) => s.total ?? 0));
    if (sort === "oldest") list.sort((a, b) => a.released.localeCompare(b.released));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "size") list.sort((a, b) => maxSize(b) - maxSize(a));
    return list;
  }, [searched, sel, sort]);

  const toggle = (f: FacetId) => (id: string) =>
    setSel((s) => {
      const next = new Set(s[f]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...s, [f]: next };
    });
  const anyFilter = Object.values(sel).some((s) => s.size > 0);
  const clearAll = () => {
    setSel(EMPTY);
    if (q) router.replace("/", { scroll: false });
  };

  return (
    <div>
      <div className="flex flex-col gap-2.5 border-b border-border py-5 lg:flex-row lg:gap-x-10 lg:py-6">
        <Facet label="Input" options={options.input} selected={sel.input} counts={counts.input} onToggle={toggle("input")} />
        <Facet label="Output" options={options.output} selected={sel.output} counts={counts.output} onToggle={toggle("output")} />
        <Facet label="Parameters" options={options.size} selected={sel.size} counts={counts.size} onToggle={toggle("size")} />
        <Facet label="Architecture" options={options.tag} selected={sel.tag} counts={counts.tag} onToggle={toggle("tag")} className="lg:flex-1" />
      </div>

      <div className="flex min-h-14 items-center gap-3 py-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-serif text-[17px] text-foreground italic">{filtered.length}</span> {filtered.length === 1 ? "model" : "models"}
          {q && (
            <>
              {" "}
              matching <span className="text-foreground">“{q}”</span>
            </>
          )}
        </p>
        {(anyFilter || q) && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <X className="size-3.5" /> Clear
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="ml-auto inline-flex h-8 items-center gap-2 rounded-full px-3 text-[13px] text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground aria-expanded:bg-foreground/[0.05]">
            <ArrowDownUp className="size-3.5" />
            <span>
              Sort: <span className="text-foreground">{SORTS.find((s) => s.id === sort)?.label}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 shadow-paper">
            <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as Sort)}>
              {SORTS.map((s) => (
                <DropdownMenuRadioItem key={s.id} value={s.id} className="h-8 rounded-lg px-2.5">
                  {s.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-x-6 gap-y-12 pt-2 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <ModelCard key={m.href} m={m} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="pb-24 text-center">
          <div className="font-serif text-2xl italic">Nothing here yet</div>
          <p className="mt-2 text-sm text-muted-foreground">No model matches this search and these filters.</p>
          <button type="button" onClick={clearAll} className="mt-5 h-9 rounded-full px-4 text-sm font-medium ring-1 ring-border hover:bg-foreground/[0.05]">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
