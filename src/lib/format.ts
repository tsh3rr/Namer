import { LOCALE } from "./brand";

const intFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const oneFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

export const pts = (n: number) => intFmt.format(Math.round(n));
export const num1 = (n: number) => oneFmt.format(n);
export const pct = (p: number) =>
  p < 0.01 && p > 0 ? "<1 %" : `${intFmt.format(p * 100)} %`;

export function timeAgo(date: Date) {
  const s = Math.round((Date.now() - +date) / 1000);
  if (s < 60) return "gerade eben";
  const m = Math.round(s / 60);
  if (m < 60) return `vor ${m} Min.`;
  const h = Math.round(m / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.round(h / 24);
  return d === 1 ? "gestern" : `vor ${d} Tagen`;
}

export function dueDateLabel(iso: string | null) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function daysUntil(iso: string | null) {
  if (!iso) return null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Math.round((+new Date(`${iso}T00:00:00Z`) - +today) / 86_400_000);
}

/** Pastel colours for outcome bars, cycling. */
export const OUTCOME_COLORS = [
  "var(--color-blush-400)",
  "var(--color-sky-400)",
  "var(--color-sage-400)",
  "var(--color-sun-400)",
  "#b9a3d9",
  "#e7a77f",
];

export function outcomeColor(label: string, index: number) {
  if (label === "Mädchen") return "var(--color-blush-400)";
  if (label === "Junge") return "var(--color-sky-400)";
  return OUTCOME_COLORS[index % OUTCOME_COLORS.length];
}
