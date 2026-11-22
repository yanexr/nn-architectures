/**
 * Generators for library snippets that would be tedious to write by hand:
 * networks of neurons, token rows and hidden-state vectors. They emit plain
 * diagram JSX (circles, boxes, lines), so everything stays editable after
 * inserting. Coordinates are on the 4 px grid.
 */

const snap = (n: number) => Math.round(n / 4) * 4;

export interface NetworkOptions {
  /** Neuron diameter. */
  size?: number;
  /** Horizontal distance between layer centers. */
  gapX?: number;
  /** Vertical distance between neuron centers. */
  gapY?: number;
  /** Variant per layer (default: inputs green, hidden blue, outputs orange). */
  variants?: string[];
  /** Label under each layer. */
  labels?: string[];
  /** Labels inside the neurons, per layer (e.g. ["$x_1$", "$x_2$"]). */
  inner?: (string[] | undefined)[];
  /** Id prefix of the group; neuron ids are `<prefix>-<layer><index>` (a1, a2, b1 …). */
  id?: string;
  /** Arrow heads on the connections. */
  heads?: boolean;
}

const LAYER_LETTERS = "abcdefghijklmnopqrstuvwxyz";

/** A dense network: a group of circles with a straight line between every pair of neurons in adjacent layers. */
export function network(layers: number[], opts: NetworkOptions = {}): string {
  const { size = 24, gapX = 64, gapY = 32, heads = false, id = "net" } = opts;
  const variants = opts.variants ?? layers.map((_, i) => (i === 0 ? "green" : i === layers.length - 1 ? "orange" : "blue"));
  const tallest = Math.max(...layers);
  const height = (tallest - 1) * gapY + size;
  const labelH = opts.labels ? 24 : 0;
  const width = (layers.length - 1) * gapX + size;
  const nid = (l: number, i: number) => `${id}-${LAYER_LETTERS[l]}${i + 1}`;
  const lines: string[] = [];
  layers.forEach((n, l) => {
    const x = l * gapX;
    const top = snap(((tallest - n) * gapY) / 2);
    for (let i = 0; i < n; i++) {
      const label = opts.inner?.[l]?.[i];
      const y = top + i * gapY;
      const props = `id="${nid(l, i)}" x={${x}} y={${y}} w={${size}} h={${size}} shape="ellipse" variant="${variants[l] ?? "default"}"`;
      lines.push(label ? `  <Box ${props}>${label}</Box>` : `  <Box ${props} />`);
    }
  });
  layers.slice(0, -1).forEach((n, l) => {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < layers[l + 1]; j++) {
        lines.push(`  <Arrow from="${nid(l, i)}" to="${nid(l + 1, j)}" route="straight"${heads ? "" : ' head="none"'} variant="muted" />`);
      }
    }
  });
  opts.labels?.forEach((label, l) => {
    const w = 64;
    lines.push(`  <Text x={${snap(l * gapX + size / 2 - w / 2)}} y={${height + 4}} w={${w}} h={20} variant="label" className="justify-center">${label}</Text>`);
  });
  const left = opts.labels ? Math.min(0, snap(size / 2 - 32)) : 0;
  const right = Math.max(width, opts.labels ? snap((layers.length - 1) * gapX + size / 2 + 32) : width);
  // Labels may stick out of the group on the left: shift everything so the group starts at 0.
  const body = left < 0 ? lines.map((line) => shiftX(line, -left)).join("\n") : lines.join("\n");
  return `<Group id="${id}" x={0} y={0} w={${right - left}} h={${height + labelH}}>\n${body}\n</Group>`;
}

function shiftX(line: string, dx: number): string {
  return line.replace(/ x=\{(-?\d+)\}/, (_, x) => ` x={${Number(x) + dx}}`);
}

/**
 * A row (or column) of token squares, as editable boxes in a group.
 * `pattern`: a color name per token, "..." for an ellipsis, "|" for a small gap.
 */
export function tokens(pattern: string[], opts: { size?: number; gap?: number; vertical?: boolean; id?: string; x?: number; y?: number } = {}): string {
  const { size = 12, gap = 4, vertical = false, x: gx = 0, y: gy = 0 } = opts;
  const out: string[] = [];
  let pos = 0;
  for (const p of pattern) {
    if (p === "|") {
      pos += gap * 2;
      continue;
    }
    const [x, y] = vertical ? [0, pos] : [pos, 0];
    if (p === "...") {
      const [w, h] = vertical ? [size, 16] : [16, size];
      out.push(`  <Text x={${x}} y={${y}} w={${w}} h={${h}} variant="label" className="justify-center">${vertical ? "⋮" : "…"}</Text>`);
      pos += (vertical ? h : w) + gap;
      continue;
    }
    out.push(`  <Box x={${x}} y={${y}} w={${size}} h={${size}} variant="${p}" className="rounded-[2px]" />`);
    pos += size + gap;
  }
  const length = pos - gap;
  const [w, h] = vertical ? [size, length] : [length, size];
  return `<Group${opts.id ? ` id="${opts.id}"` : ""} x={${gx}} y={${gy}} w={${w}} h={${h}}>\n${out.join("\n")}\n</Group>`;
}

/** `n` copies of a color: tokens([...repeat("amber", 4), "...", ...repeat("amber", 2)]). */
export const repeat = (value: string, n: number) => Array.from({ length: n }, () => value);

/**
 * A hidden-state vector drawn as circles in a rounded box (DeepSeek-V3
 * style): `[4, 4]` gives ○○○○ ⋯ ○○○○. `variant` colors the circles.
 */
export function vector(groups: number[], opts: { id?: string; x?: number; y?: number; dot?: number; variant?: string; boxVariant?: string } = {}): string {
  const { dot = 12, x = 0, y = 0 } = opts;
  const pad = 4;
  const gap = 4;
  const parts: string[] = [];
  let pos = pad;
  groups.forEach((n, g) => {
    if (g > 0) {
      parts.push(`  <Text x={${pos}} y={${pad}} w={16} h={${dot}} variant="label" className="justify-center">⋯</Text>`);
      pos += 16 + gap;
    }
    for (let i = 0; i < n; i++) {
      parts.push(`  <Box x={${pos}} y={${pad}} w={${dot}} h={${dot}} shape="ellipse"${opts.variant ? ` variant="${opts.variant}"` : ""} />`);
      pos += dot + gap;
    }
  });
  const w = snap(pos - gap + pad);
  const h = dot + pad * 2;
  const box = opts.boxVariant ? ` variant="${opts.boxVariant}"` : "";
  return `<Box${opts.id ? ` id="${opts.id}"` : ""} x={${x}} y={${y}} w={${w}} h={${h}}${box} className="rounded-full">\n${parts.join("\n")}\n</Box>`;
}

/** Wraps several snippets in a fragment. */
export const fragment = (...parts: string[]) => `<>\n${parts.join("\n")}\n</>`;

/** Re-indents a snippet (cosmetic: snippets are re-serialized on insert anyway). */
export const indent = (snippet: string, n = 1) => snippet.replace(/^/gm, "  ".repeat(n));

/**
 * The positional-encoding symbol of the Transformer figure: a circle with an
 * S-shaped wave from edge to edge. The wave is two half circles of half the
 * circle's diameter, so it meets the outline tangentially (no gap, no kink).
 * Each half circle is four quadratic segments; a curved arrow's `via` points
 * are those control points (the curve runs through the midpoints between
 * them). `size` is the outer diameter; the outline is 1 px, centered 0.5 px in.
 */
export function posEncoding(opts: { id?: string; x?: number; y?: number; size?: number } = {}): string {
  const { x = 0, y = 0, size = 24 } = opts;
  const edge = 0.5;
  const c = size / 2;
  const r = (size - 2 * edge) / 4;
  const k = r / Math.cos(Math.PI / 8);
  const f = (n: number) => Math.round(n * 100) / 100;
  const pts: number[][] = [];
  // Upper half circle around (edge + r, c), from the left edge to the center: 157.5°, 112.5°, 67.5°, 22.5°.
  for (const deg of [157.5, 112.5, 67.5, 22.5]) {
    const a = (deg * Math.PI) / 180;
    pts.push([f(edge + r + k * Math.cos(a)), f(c - k * Math.sin(a))]);
  }
  // Lower half circle around (size - edge - r, c), from the center to the right edge.
  for (const deg of [202.5, 247.5, 292.5, 337.5]) {
    const a = (deg * Math.PI) / 180;
    pts.push([f(size - edge - r + k * Math.cos(a)), f(c - k * Math.sin(a))]);
  }
  const via = pts.map(([px, py]) => `[${px}, ${py}]`).join(", ");
  const color = 'className="text-gray-800 dark:text-gray-300"';
  return `<Box${opts.id ? ` id="${opts.id}"` : ""} x={${x}} y={${y}} w={${size}} h={${size}} shape="ellipse" className="border-gray-800 dark:border-gray-300">
  <Arrow from={[${edge}, ${c}]} to={[${f(size - edge)}, ${c}]} via={[${via}]} route="curved" head="none" ${color} />
</Box>`;
}
