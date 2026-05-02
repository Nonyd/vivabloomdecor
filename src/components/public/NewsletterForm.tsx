"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block font-body text-[10px] uppercase tracking-[0.25em] text-white/50">
        Stay inspired
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="min-w-0 flex-1 border-b border-white/20 bg-transparent py-2 font-body text-[13px] text-white/80 outline-none placeholder:text-white/30 focus:border-[#C9A96E]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 font-body text-[11px] uppercase tracking-[0.2em] text-[#C9A96E] transition-colors hover:text-[#E8D5B0] disabled:opacity-50"
        >
          {status === "loading" ? "…" : "Subscribe →"}
        </button>
      </div>
      {status === "done" ? (
        <p className="font-body text-[12px] text-[#C9A96E]">You&apos;re on the list.</p>
      ) : null}
      {status === "error" ? (
        <p className="font-body text-[12px] text-red-400/90">Something went wrong. Try again.</p>
      ) : null}
    </form>
  );
}
