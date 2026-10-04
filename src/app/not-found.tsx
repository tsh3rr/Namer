import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl">🍼</div>
      <h1 className="mt-4 font-display text-3xl font-semibold">Hier ist (noch) nichts</h1>
      <p className="mt-2 text-ink-soft">Diese Babywette gibt es nicht. Vielleicht ist der Link unvollständig?</p>
      <Link href="/" className="btn-primary mt-6">Zur Startseite</Link>
    </main>
  );
}
