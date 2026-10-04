import type { MarketKind } from "./db/schema";
import { LOCALE } from "./brand";

export type MarketTemplate = {
  kind: Exclude<MarketKind, "custom">;
  title: string;
  question: string;
  description: string;
  emoji: string;
  liquidity: number;
  allowNewOutcomes: boolean;
};

export const MARKET_TEMPLATES: MarketTemplate[] = [
  {
    kind: "gender",
    title: "Geschlecht",
    question: "Junge oder Mädchen?",
    description: "Der Klassiker.",
    emoji: "🎀",
    liquidity: 120,
    allowNewOutcomes: false,
  },
  {
    kind: "name",
    title: "Vorname",
    question: "Wie wird das Baby heißen?",
    description: "Alle dürfen Namen vorschlagen.",
    emoji: "✍️",
    liquidity: 80,
    allowNewOutcomes: true,
  },
  {
    kind: "date",
    title: "Geburtstermin",
    question: "Wann kommt das Baby?",
    description: "Früher, pünktlich oder später?",
    emoji: "📅",
    liquidity: 100,
    allowNewOutcomes: false,
  },
  {
    kind: "weight",
    title: "Gewicht",
    question: "Wie schwer wird das Baby?",
    description: "Geburtsgewicht in Gramm.",
    emoji: "⚖️",
    liquidity: 100,
    allowNewOutcomes: false,
  },
  {
    kind: "length",
    title: "Größe",
    question: "Wie groß wird das Baby?",
    description: "Körperlänge bei der Geburt.",
    emoji: "📏",
    liquidity: 100,
    allowNewOutcomes: false,
  },
];

export const CATCH_ALL_NAME = "Ein anderer Name";

export function templateFor(kind: MarketKind) {
  return MARKET_TEMPLATES.find((t) => t.kind === kind);
}

export function emojiFor(kind: MarketKind) {
  return templateFor(kind)?.emoji ?? "✨";
}

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return dateFmt.format(d);
}

/** Default outcomes for a template. `dueDate` personalises the date buckets. */
export function defaultOutcomes(
  kind: MarketTemplate["kind"],
  opts: { dueDate?: string | null; nameIdeas?: string[] } = {},
): { label: string; isCatchAll?: boolean }[] {
  switch (kind) {
    case "gender":
      return [{ label: "Mädchen" }, { label: "Junge" }];
    case "name":
      return [
        ...(opts.nameIdeas ?? []).map((label) => ({ label })),
        { label: CATCH_ALL_NAME, isCatchAll: true },
      ];
    case "date": {
      const due = opts.dueDate;
      if (!due)
        return [
          { label: "Mehr als 1 Woche zu früh" },
          { label: "1–7 Tage zu früh" },
          { label: "Genau am Termin" },
          { label: "1–7 Tage zu spät" },
          { label: "Mehr als 1 Woche zu spät" },
        ];
      return [
        { label: `Vor dem ${addDays(due, -7)}` },
        { label: `${addDays(due, -7)} – ${addDays(due, -1)}` },
        { label: `${addDays(due, 0)} (ET)` },
        { label: `${addDays(due, 1)} – ${addDays(due, 7)}` },
        { label: `Nach dem ${addDays(due, 7)}` },
      ];
    }
    case "weight":
      return [
        { label: "unter 3.000 g" },
        { label: "3.000 – 3.499 g" },
        { label: "3.500 – 3.999 g" },
        { label: "4.000 g und mehr" },
      ];
    case "length":
      return [
        { label: "unter 50 cm" },
        { label: "50 – 51 cm" },
        { label: "52 – 53 cm" },
        { label: "54 cm und mehr" },
      ];
  }
}

export function labelKey(label: string) {
  return label
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/** Tidy a user-entered first name: trim, collapse spaces, capitalise. */
export function cleanName(raw: string) {
  const s = raw.trim().replace(/\s+/g, " ").slice(0, 30);
  return s
    .split(/([ -])/)
    .map((part) =>
      part.length > 1 ? part[0].toLocaleUpperCase(LOCALE) + part.slice(1) : part,
    )
    .join("");
}
