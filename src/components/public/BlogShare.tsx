"use client";

import { useState } from "react";

type Props = {
  url: string;
  title: string;
};

export default function BlogShare({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const shareText = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-12 flex flex-wrap gap-3 border-t border-charcoal/10 pt-10">
      <span className="font-body text-[11px] uppercase tracking-[0.2em] text-charcoal/50">Share</span>
      <button
        type="button"
        className="rounded-full border border-champagne/40 px-4 py-2 font-body text-[11px] uppercase tracking-[0.15em] text-onyx hover:bg-champagne/10"
        onClick={copy}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${shareText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-champagne/40 px-4 py-2 font-body text-[11px] uppercase tracking-[0.15em] hover:bg-champagne/10"
      >
        X / Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-champagne/40 px-4 py-2 font-body text-[11px] uppercase tracking-[0.15em] hover:bg-champagne/10"
      >
        Facebook
      </a>
    </div>
  );
}
