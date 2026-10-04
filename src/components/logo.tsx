import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  // A little cloud with a star: dreamy, not cartoonish.
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path
        d="M11 30a7 7 0 0 1-1.2-13.9A9.5 9.5 0 0 1 28.4 13 7.5 7.5 0 0 1 29 30Z"
        fill="var(--color-blush-200)"
      />
      <path
        d="M11 30a7 7 0 0 1-1.2-13.9A9.5 9.5 0 0 1 28.4 13 7.5 7.5 0 0 1 29 30Z"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m20 15.5 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4Z"
        fill="var(--color-sun-400)"
        stroke="var(--color-ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2">
      <LogoMark className="size-8 transition group-hover:rotate-[-6deg]" />
      <span className="font-display text-2xl font-semibold tracking-tight">
        {BRAND.wordmark}
      </span>
    </Link>
  );
}
