/**
 * Writes one diagram per editor library section (default and ML sections),
 * every item in a grid with its label, plus the media files they use.
 * Render the result to check the library visually:
 *
 *   pnpm gallery <out-dir>
 *   pnpm nn-diagram render <out-dir>
 */
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { getSpec, parseFragment, type ChildNode, type ElementNode } from "@nn-diagram/format";
import { DEFAULT_LIBRARY, type LibrarySection } from "@nn-diagram/editor";
import { ML_LIBRARY } from "../src/lib/ml-library";

const out = resolve(process.argv[2] ?? "library-gallery");
mkdirSync(out, { recursive: true });
const media = resolve(import.meta.dirname, "../public/media");
for (const f of readdirSync(media)) if (!f.endsWith(".md")) copyFileSync(join(media, f), join(out, f));

const n = (v: unknown) => (typeof v === "number" ? v : 0);

/** Bounds of a snippet: its top-level shapes and the free points of its arrows. */
function bounds(nodes: ChildNode[]) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const c of nodes) {
    if (c.kind !== "element") continue;
    const el = c as ElementNode;
    if (getSpec(el.name)?.kind === "shape") {
      xs.push(n(el.props.x), n(el.props.x) + n(el.props.w || 80));
      ys.push(n(el.props.y), n(el.props.y) + n(el.props.h || 20));
    } else if (el.name === "Arrow") {
      for (const p of [el.props.from, el.props.to, ...((el.props.via as unknown[]) ?? [])]) {
        if (Array.isArray(p)) {
          xs.push(n(p[0]));
          ys.push(n(p[1]));
        }
      }
    }
  }
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

const snap = (v: number) => Math.ceil(v / 4) * 4;

function gallery(section: LibrarySection): string {
  const maxW = section.size === "large" ? 1400 : 1000;
  const parts: string[] = [];
  let x = 24;
  let y = 56;
  let rowH = 0;
  let width = 0;
  for (const it of section.items) {
    const text = it.snippet.replace(/^<>\n?|\n?<\/>$/g, "");
    const b = bounds(parseFragment(it.snippet));
    // Wide enough for the caption too (uppercase, letter-spaced: about 9 px per character).
    const w = snap(Math.max(b.w, 96, it.label.length * 9));
    const h = snap(b.h);
    if (x + w > maxW && x > 24) {
      x = 24;
      y += rowH + 56;
      rowH = 0;
    }
    parts.push(`<Text x={${x}} y={${y - 24}} variant="caption">${it.label.replace(/[{}<>&]/g, "")}</Text>`);
    parts.push(`<Group x={${x - snap(b.x)}} y={${y - snap(b.y)}} w={${w + snap(b.x)}} h={${h + snap(b.y)}}>\n${text}\n</Group>`);
    x += w + 40;
    rowH = Math.max(rowH, h);
    width = Math.max(width, x);
  }
  return `<Diagram width={${width + 24}} height={${y + rowH + 32}} grid={4} title="${section.title}">\n<Text x={24} y={8} variant="heading">${section.title.replace(/&/g, "&amp;")}</Text>\n${parts.join("\n")}\n</Diagram>\n`;
}

for (const section of [...DEFAULT_LIBRARY, ...ML_LIBRARY]) {
  writeFileSync(join(out, `${section.id}.diagram.jsx`), gallery(section));
}
console.log(`Wrote ${DEFAULT_LIBRARY.length + ML_LIBRARY.length} galleries to ${out}`);
