"use client";

import { useState } from "react";

const subjects = [
  { value: "General", label: "General" },
  { value: "Wedding", label: "Wedding" },
  { value: "Corporate", label: "Corporate" },
  { value: "Press", label: "Press" },
];

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const phone = String(fd.get("phone") ?? "");
    const subject = String(fd.get("subject") ?? "General");
    const message = String(fd.get("message") ?? "");
    setStatus("loading");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          eventType: `Contact: ${subject}`,
          message,
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("success");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-champagne/30 bg-ivory p-10 text-center">
        <p className="font-display text-2xl italic text-onyx">Message sent</p>
        <p className="mt-4 font-body text-charcoal/80">We&apos;ll reply as soon as we can — usually within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-charcoal/70">Name</label>
        <input
          name="name"
          required
          className="w-full border-b border-charcoal/20 bg-transparent py-2 font-body outline-none focus:border-champagne"
        />
      </div>
      <div>
        <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-charcoal/70">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full border-b border-charcoal/20 bg-transparent py-2 font-body outline-none focus:border-champagne"
        />
      </div>
      <div>
        <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-charcoal/70">Phone</label>
        <input
          name="phone"
          type="tel"
          className="w-full border-b border-charcoal/20 bg-transparent py-2 font-body outline-none focus:border-champagne"
        />
      </div>
      <div>
        <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-charcoal/70">Subject</label>
        <select
          name="subject"
          className="w-full border-b border-charcoal/20 bg-transparent py-2 font-body outline-none focus:border-champagne"
          defaultValue="General"
        >
          {subjects.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-charcoal/70">Message</label>
        <textarea
          name="message"
          required
          rows={6}
          className="w-full resize-y border border-charcoal/15 bg-white/50 p-4 font-body outline-none focus:border-champagne"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-champagne py-4 font-body text-[12px] uppercase tracking-[0.2em] text-onyx transition-colors hover:bg-champagne-lt disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
      {status === "error" ? (
        <p className="text-center font-body text-sm text-red-600">Something went wrong. Please try again.</p>
      ) : null}
    </form>
  );
}
