import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line/70 px-4 py-8 text-center text-sm text-ink-soft">
      <p>
        Mit Liebe gemacht für werdende Eltern und alle, die sie gernhaben.
      </p>
      <p className="mt-2">
        Nur Spielpunkte, kein Echtgeld ·{" "}
        <Link href="/so-gehts" className="underline underline-offset-2">
          So funktioniert&apos;s
        </Link>
      </p>
    </footer>
  );
}
