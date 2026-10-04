/**
 * Curated gift ideas. Links go to an Amazon search with the partner tag from
 * AMAZON_PARTNER_TAG, so every click is affiliate revenue without the page
 * feeling like an ad.
 */
const GIFTS = [
  { emoji: "🧸", title: "Kuscheltier aus Bio-Baumwolle", q: "bio kuscheltier baby" },
  { emoji: "📚", title: "Erstes Fühlbuch", q: "fühlbuch baby" },
  { emoji: "🌙", title: "Sternenhimmel-Nachtlicht", q: "nachtlicht baby sternenhimmel" },
  { emoji: "👶", title: "Musselin-Tücher im Set", q: "mulltücher baby set" },
  { emoji: "📸", title: "Erinnerungsbuch fürs erste Jahr", q: "babyalbum erstes jahr" },
  { emoji: "🧦", title: "Erstlings-Set mit Söckchen", q: "erstausstattung baby set" },
];

export function giftLink(query: string) {
  const tag = process.env.AMAZON_PARTNER_TAG;
  const u = new URL("https://www.amazon.de/s");
  u.searchParams.set("k", query);
  if (tag) u.searchParams.set("tag", tag);
  return u.toString();
}

export function giftIdeas(count = 3, seed = "") {
  // Stable per pool so the list doesn't jump on every refresh.
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const start = h % GIFTS.length;
  return Array.from({ length: count }, (_, i) => {
    const g = GIFTS[(start + i) % GIFTS.length];
    return { ...g, href: giftLink(g.q) };
  });
}
