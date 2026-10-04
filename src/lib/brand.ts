/**
 * Brand and locale live in one place so the product name (still being
 * decided) and later EU locales can be swapped without touching pages.
 */
export const BRAND = {
  name: "Namer",
  wordmark: "namer",
  plusName: "Namer Plus",
  tagline: "Das Baby-Tippspiel für Freunde & Familie",
} as const;

export const LOCALE = "de-DE";
export const CURRENCY = "EUR";
