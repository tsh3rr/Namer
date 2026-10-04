"use client";

import { useState } from "react";

export function ShareButtons({
  url,
  text,
  compact = false,
}: {
  url: string;
  text: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const full = `${text} ${url}`;

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text, url });
        return;
      } catch {
        // User cancelled; fall through to copying.
      }
    }
    copy();
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-4"}`}>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(full)}`}
        target="_blank"
        rel="noopener"
        className="btn bg-[#25D366] text-white shadow-soft hover:brightness-105"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
        </svg>
        WhatsApp
      </a>
      <button type="button" onClick={nativeShare} className="btn-soft">
        Teilen
      </button>
      <button type="button" onClick={copy} className="btn-ghost">
        {copied ? "Kopiert ✓" : "Link kopieren"}
      </button>
    </div>
  );
}

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex gap-2">
        <input readOnly value={value} className="input font-mono text-xs" onFocus={(e) => e.target.select()} />
        <button
          type="button"
          className="btn-soft shrink-0"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
        >
          {copied ? "✓" : "Kopieren"}
        </button>
      </div>
    </div>
  );
}
