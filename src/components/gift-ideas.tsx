import { giftIdeas } from "@/lib/gifts";

export function GiftIdeas({ seed }: { seed: string }) {
  return (
    <section className="card p-5">
      <h2 className="font-display text-xl font-semibold">Geschenkideen</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Für den Spaßpreis, die Babyparty oder einfach so.
      </p>
      <ul className="mt-4 space-y-2">
        {giftIdeas(3, seed).map((g) => (
          <li key={g.title}>
            <a
              href={g.href}
              target="_blank"
              rel="sponsored noopener"
              className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-cream"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-50 text-xl">
                {g.emoji}
              </span>
              <span className="flex-1 text-sm font-bold">{g.title}</span>
              <span className="text-ink-soft">→</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-ink-soft">
        Partnerlinks: Bei einem Kauf erhalten wir eine kleine Provision. Für
        dich ändert sich am Preis nichts.
      </p>
    </section>
  );
}
