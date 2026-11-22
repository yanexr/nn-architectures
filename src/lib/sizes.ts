/**
 * Parameter-count labels: "124M", "1.5B", "8x7B", "120B-A4B" (MoE total and
 * active), "671B-A37B", "3B+4B" (extra frozen parts).
 */

export interface ParsedSize {
  label: string;
  /** Total parameters. */
  total: number | null;
  /** Active parameters per token (MoE). */
  active: number | null;
}

const UNIT: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };

function amount(s: string): number | null {
  const m = /^(\d+(?:\.\d+)?)\s*([KMBT])$/i.exec(s.trim());
  return m ? Number(m[1]) * UNIT[m[2].toUpperCase()] : null;
}

export function parseSize(label: string): ParsedSize {
  const clean = label.replace(/\s+/g, "");
  const moe = /^(.+?)-?A(\d+(?:\.\d+)?[KMBT])$/i.exec(clean);
  if (moe) return { label, total: amount(moe[1]), active: amount(moe[2]) };
  const experts = /^(\d+)x(\d+(?:\.\d+)?[KMBT])$/i.exec(clean);
  if (experts) {
    const per = amount(experts[2]);
    return { label, total: per !== null ? per * Number(experts[1]) : null, active: null };
  }
  const sum = clean.split("+").map(amount);
  if (sum.length > 1 && sum.every((n) => n !== null)) return { label, total: sum[0], active: null };
  return { label, total: amount(clean), active: null };
}

export function formatCount(n: number): string {
  for (const [unit, v] of [["T", 1e12], ["B", 1e9], ["M", 1e6], ["K", 1e3]] as const) {
    if (n >= v) return `${Math.round((n / v) * 10) / 10}${unit}`;
  }
  return String(n);
}

export const SIZE_BUCKETS = [
  { id: "lt1b", label: "< 1B", test: (n: number) => n < 1e9 },
  { id: "1-10b", label: "1–10B", test: (n: number) => n >= 1e9 && n < 10e9 },
  { id: "10-100b", label: "10–100B", test: (n: number) => n >= 10e9 && n < 100e9 },
  { id: "gt100b", label: "≥ 100B", test: (n: number) => n >= 100e9 },
] as const;
