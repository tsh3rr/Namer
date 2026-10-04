# Namer – das Baby-Tippspiel für Freunde & Familie

Freunde und Familie tippen mit **Spielpunkten** auf Geschlecht, Vorname, Geburtstermin,
Gewicht und Größe eines Babys. Die Prognosen bewegen sich mit jedem Tipp, ähnlich wie bei einem Prognosemarkt.
Kein Echtgeld, keine Anmeldung: Link öffnen, Namen eintippen, mitmachen.

## Funktionen

- **Onboarding**: Assistent in vier Schritten zum Anlegen (Eltern oder Freunde), danach
  direkt der Einladen-Schritt. Gäste landen auf einer Beitrittskarte mit Kurzerklärung und
  bekommen nach dem Beitritt eine kleine Tour.
- **Märkte**: LMSR-Marktmacher (`src/lib/lmsr.ts`), damit auch in kleinen Gruppen immer
  ein Preis existiert. Ein richtiger Anteil zahlt 1 Punkt. Kaufen und Verkaufen jederzeit
  bis zur Auflösung. Beim Namen dürfen alle Vorschläge ergänzen, plus „Ein anderer Name“.
- **Fairness**: Eltern sind Gastgeber und tippen nicht mit.
- **Viralität**: Einladungslink mit +100 Punkten pro neuer Person, WhatsApp/Teilen-Buttons,
  dynamische Vorschaubilder (`opengraph-image`) mit Live-Prognosen bzw. dem Ergebnis.
- **Monetarisierung**:
  - *Namer Plus* (einmalig 9,99 € pro Tipprunde, Stripe Checkout): eigene Fragen,
    Live-Modus für die Babyparty, Farbwelten, keine Werbung.
  - Geschenkideen mit Amazon-Partnerlinks.
  - Eine dezente Werbefläche (AdSense) auf kostenlosen Tipprunden; ohne AdSense eine
    Hausanzeige für Plus.

## Stack

Next.js 16 (App Router, Server Actions, Turbopack), React 19, Tailwind CSS 4,
Drizzle ORM mit libSQL (lokal SQLite-Datei, produktiv Turso), Zod, Stripe, Vitest.

## Loslegen

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # migriert die lokale DB und startet auf :3000
```

Weitere Skripte: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`,
`npm run db:generate` (nach Schemaänderungen).

Ohne `STRIPE_SECRET_KEY` schaltet die Entwicklungsumgebung Plus kostenlos frei, damit sich
die Premium-Funktionen ausprobieren lassen. In Produktion passiert das nie.

## Deployment (Vercel + Turso)

1. Turso-Datenbank anlegen, `DATABASE_URL` und `DATABASE_AUTH_TOKEN` setzen.
2. `npm run db:migrate` einmal gegen die Produktions-DB ausführen.
3. `NEXT_PUBLIC_SITE_URL`, Stripe-Schlüssel und den Webhook
   (`/api/stripe/webhook`, Event `checkout.session.completed`) eintragen.

## Marke und Sprache

Produktname und Locale stehen zentral in `src/lib/brand.ts`, damit sich der Name später
leicht tauschen lässt. Die Oberfläche ist aktuell nur auf Deutsch.
