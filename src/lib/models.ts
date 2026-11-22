/**
 * Loads models from the content folder (no database):
 *
 *   content/models/<lab>/<model>/model.json      metadata
 *   content/models/<lab>/<model>/README.md       "how it works" (Markdown + LaTeX)
 *   content/models/<lab>/<model>/*.diagram.jsx   diagrams listed in model.json
 */
import "server-only";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { parseSize, type ParsedSize } from "./sizes";
import { BASE_PATH } from "./base-path";
import type { SearchEntry } from "./search";

// Pages and the /content route are prerendered at build time, so the content
// folder does not need to be traced into the server bundle.
export const CONTENT_DIR = resolve(/*turbopackIgnore: true*/ process.env.CONTENT_DIR ?? join(process.cwd(), "content"));
const MODELS_DIR = join(CONTENT_DIR, "models");

export interface ModelLinks {
  huggingface?: string;
  github?: string;
  blog?: string;
  paper?: string;
  website?: string;
}

export interface ModelJson {
  name: string;
  lab: string;
  /** ISO date (YYYY-MM-DD, or YYYY-MM). */
  released: string;
  /** e.g. ["124M", "1.5B"] or ["120B-A4B"] for MoE. */
  sizes: string[];
  input: string[];
  output: string[];
  summary?: string;
  tags?: string[];
  license?: string;
  links?: ModelLinks;
  diagrams?: { file: string; title?: string }[];
}

export interface DiagramEntry {
  title: string;
  file: string;
  /** URL of the raw file, served by the /content route. */
  url: string;
  source: string;
}

export interface Model extends ModelJson {
  labSlug: string;
  modelSlug: string;
  href: string;
  parsedSizes: ParsedSize[];
  readme: string;
  diagrams: DiagramEntry[];
}

function readModel(labSlug: string, modelSlug: string): Model | null {
  const dir = join(MODELS_DIR, labSlug, modelSlug);
  const metaPath = join(dir, "model.json");
  if (!existsSync(metaPath)) return null;
  const meta = JSON.parse(readFileSync(metaPath, "utf8")) as ModelJson;
  const readmePath = join(dir, "README.md");
  const listed: { file: string; title?: string }[] =
    meta.diagrams ?? readdirSync(dir).filter((f) => f.endsWith(".diagram.jsx")).map((file) => ({ file }));
  const diagrams = listed
    .filter((d) => existsSync(join(dir, d.file)))
    .map((d) => ({
      title: d.title ?? d.file.replace(/\.diagram\.jsx$/, ""),
      file: d.file,
      url: `${BASE_PATH}/content/models/${labSlug}/${modelSlug}/${d.file}`,
      source: readFileSync(join(dir, d.file), "utf8"),
    }));
  return {
    ...meta,
    labSlug,
    modelSlug,
    href: `/${labSlug}/${modelSlug}`,
    parsedSizes: (meta.sizes ?? []).map(parseSize),
    readme: existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "",
    diagrams,
  };
}

export function getAllModels(): Model[] {
  if (!existsSync(MODELS_DIR)) return [];
  const models: Model[] = [];
  for (const lab of readdirSync(MODELS_DIR)) {
    if (!statSync(join(MODELS_DIR, lab)).isDirectory()) continue;
    for (const model of readdirSync(join(MODELS_DIR, lab))) {
      const m = readModel(lab, model);
      if (m) models.push(m);
    }
  }
  return models.sort((a, b) => b.released.localeCompare(a.released) || a.name.localeCompare(b.name));
}

export function getModel(labSlug: string, modelSlug: string): Model | null {
  if (!/^[\w.-]+$/.test(labSlug) || !/^[\w.-]+$/.test(modelSlug)) return null;
  return readModel(labSlug, modelSlug);
}

/** All files below the content folder (for the raw file route). */
export function listContentFiles(dir = CONTENT_DIR, prefix: string[] = []): string[][] {
  if (!existsSync(dir)) return [];
  const out: string[][] = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listContentFiles(full, [...prefix, entry]));
    else out.push([...prefix, entry]);
  }
  return out;
}

export function contentPath(parts: string[]): string | null {
  const full = resolve(/*turbopackIgnore: true*/ CONTENT_DIR, ...parts);
  return full.startsWith(CONTENT_DIR + sep) && existsSync(full) ? full : null;
}

/** The small client-side index used by search. */
export function toSearchEntry(m: Model): SearchEntry {
  return {
    name: m.name,
    lab: m.lab,
    href: m.href,
    released: m.released,
    summary: m.summary ?? "",
    tags: m.tags ?? [],
    sizes: m.sizes ?? [],
    input: m.input,
    output: m.output,
  };
}
