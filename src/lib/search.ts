/** Client-safe model index used by the header search and the gallery. */

export interface SearchEntry {
  name: string;
  lab: string;
  href: string;
  released: string;
  summary: string;
  tags: string[];
  sizes: string[];
  input: string[];
  output: string[];
}

/** Every whitespace-separated term must appear somewhere in the model's text. */
export function matchesQuery(m: SearchEntry, query: string): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = [m.name, m.lab, m.summary, ...m.tags, ...m.sizes, ...m.input, ...m.output].join(" ").toLowerCase();
  return terms.every((t) => hay.includes(t));
}

/** Ranks name and lab hits above hits in the summary. */
export function searchModels<T extends SearchEntry>(models: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return models;
  const score = (m: T) => {
    const name = m.name.toLowerCase();
    if (name === q) return 0;
    if (name.startsWith(q)) return 1;
    if (name.includes(q)) return 2;
    if (m.lab.toLowerCase().includes(q)) return 3;
    if (m.tags.some((t) => t.toLowerCase().includes(q))) return 4;
    return 5;
  };
  return models
    .filter((m) => matchesQuery(m, q))
    .map((m, i) => ({ m, i, s: score(m) }))
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map((x) => x.m);
}

export const releaseYear = (d: string) => d.slice(0, 4);

export function formatRelease(d: string, month: "short" | "long" = "short"): string {
  const date = new Date(d.length === 7 ? `${d}-01` : d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en", { year: "numeric", month, ...(d.length > 7 && month === "long" ? { day: "numeric" } : {}) });
}

/** "124M – 1.5B" for a family, the single label otherwise. */
export function sizeRange(sizes: { label: string; total: number | null }[]): string {
  if (sizes.length <= 1) return sizes[0]?.label ?? "";
  const known = sizes.filter((s) => s.total !== null);
  if (known.length < 2) return sizes.map((s) => s.label).join(", ");
  const sorted = [...known].sort((a, b) => a.total! - b.total!);
  return `${sorted[0].label} – ${sorted[sorted.length - 1].label}`;
}

export const modalities = (m: { input: string[]; output: string[] }) => `${m.input.join(" + ")} → ${m.output.join(" + ")}`;
