"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteSchema, type QuoteFormData } from "@/lib/validations/quote";
import { cn } from "@/lib/utils";

const BG =
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80";

const eventTypes = [
  "Wedding",
  "Corporate",
  "Birthday / Celebration",
  "Proposal",
  "Other",
];

export default function QuotePageClient() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState<{ name: string } | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      eventType: "",
      eventDate: "",
      guestCount: "",
      venue: "",
      name: "",
      email: "",
      phone: "",
      budget: "",
      message: "",
      referral: "",
    },
  });

  async function nextStep() {
    if (step === 1) {
      const ok = await trigger(["eventType"]);
      if (ok) setStep(2);
    } else if (step === 2) {
      const ok = await trigger(["name", "email"]);
      if (ok) setStep(3);
    }
  }

  async function onSubmit(data: QuoteFormData) {
    const guestN =
      data.guestCount?.trim() !== "" && data.guestCount !== undefined
        ? Number(data.guestCount)
        : undefined;
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        guestCount: Number.isFinite(guestN) ? guestN : undefined,
      }),
    });
    if (!res.ok) throw new Error("submit");
    setDone({ name: data.name });
  }

  if (done) {
    return (
      <div className="relative min-h-screen bg-[#0F0E0C] px-[5%] py-24 text-center">
        <div className="py-20">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A96E] text-2xl text-[#C9A96E]">
            ✓
          </div>
          <h2 className="font-display text-[48px] italic text-white">Thank You, {done.name}!</h2>
          <p className="mx-auto mt-4 max-w-md font-body text-white/60">
            We&apos;ve received your enquiry and will be in touch within 24 hours.
          </p>
          <Link href="/" className="champagne-outline-btn mt-10 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0F0E0C] pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <Image src={BG} alt="" fill className="object-cover" sizes="100vw" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-[5%] pb-24">
        <p className="eyebrow-light mb-4 text-center">Enquiry</p>
        <h1 className="mb-4 text-center font-display text-4xl italic text-white md:text-5xl">Request a quote</h1>
        <p className="mb-12 text-center font-body text-sm text-white/50">
          Share a few details — we&apos;ll follow up with tailored next steps.
        </p>

        <div className="mb-16 flex items-center justify-center gap-0">
          {["Event Details", "Your Contact", "Your Vision"].map((label, i) => (
            <div key={label} className="flex items-center">
              <div className={`flex flex-col items-center ${i < step ? "opacity-100" : "opacity-40"}`}>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border text-xs font-body",
                    i + 1 === step
                      ? "border-[#C9A96E] bg-[#C9A96E] text-[#0F0E0C]"
                      : i + 1 < step
                        ? "border-[#C9A96E] bg-[#C9A96E]/20 text-[#C9A96E]"
                        : "border-white/20 text-white/40"
                  )}
                >
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span className="mt-2 hidden font-body text-[10px] uppercase tracking-[0.2em] text-white/60 sm:block">
                  {label}
                </span>
              </div>
              {i < 2 ? (
                <div className={`mx-4 h-px w-16 md:w-24 ${i + 1 < step ? "bg-[#C9A96E]" : "bg-white/10"}`} />
              ) : null}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-sm border border-white/10 bg-[#0F0E0C]/80 p-8 backdrop-blur-md md:p-10"
        >
          {step === 1 ? (
            <>
              <div>
                <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-white/50">
                  Event type
                </label>
                <select
                  {...register("eventType")}
                  className="min-h-[48px] w-full border-b border-white/20 bg-transparent py-3 font-body text-white outline-none focus:border-[#C9A96E]"
                >
                  <option value="">Select…</option>
                  {eventTypes.map((t) => (
                    <option key={t} value={t} className="bg-onyx text-onyx">
                      {t}
                    </option>
                  ))}
                </select>
                {errors.eventType ? (
                  <p className="mt-1 font-body text-xs text-red-400">{errors.eventType.message}</p>
                ) : null}
              </div>
              <div>
                <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-white/50">
                  Event date (optional)
                </label>
                <input
                  type="date"
                  {...register("eventDate")}
                  className="min-h-[48px] w-full border-b border-white/20 bg-transparent py-3 font-body text-white outline-none focus:border-[#C9A96E]"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-white/50">
                  Guest count
                </label>
                <input
                  type="number"
                  min={1}
                  {...register("guestCount")}
                  className="min-h-[48px] w-full border-b border-white/20 bg-transparent py-3 font-body text-white outline-none focus:border-[#C9A96E]"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-white/50">
                  Venue (optional)
                </label>
                <input
                  {...register("venue")}
                  className="min-h-[48px] w-full border-b border-white/20 bg-transparent py-3 font-body text-white outline-none focus:border-[#C9A96E]"
                />
              </div>
              <button
                type="button"
                onClick={nextStep}
                className="w-full min-w-0 rounded-full bg-[#C9A96E] py-4 font-body text-[12px] uppercase tracking-[0.2em] text-[#0F0E0C] transition-colors hover:bg-[#E8D5B0]"
              >
                Continue
              </button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div>
                <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-white/50">Name</label>
                <input
                  {...register("name")}
                  className="min-h-[48px] w-full border-b border-white/20 bg-transparent py-3 font-body text-white outline-none focus:border-[#C9A96E]"
                />
                {errors.name ? <p className="mt-1 font-body text-xs text-red-400">{errors.name.message}</p> : null}
              </div>
              <div>
                <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-white/50">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="min-h-[48px] w-full border-b border-white/20 bg-transparent py-3 font-body text-white outline-none focus:border-[#C9A96E]"
                />
                {errors.email ? <p className="mt-1 font-body text-xs text-red-400">{errors.email.message}</p> : null}
              </div>
              <div>
                <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-white/50">Phone</label>
                <input
                  {...register("phone")}
                  className="min-h-[48px] w-full border-b border-white/20 bg-transparent py-3 font-body text-white outline-none focus:border-[#C9A96E]"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-white/50">Budget</label>
                <input
                  {...register("budget")}
                  placeholder="Rough range is fine"
                  className="min-h-[48px] w-full border-b border-white/20 bg-transparent py-3 font-body text-white outline-none placeholder:text-white/30 focus:border-[#C9A96E]"
                />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full flex-1 rounded-full border border-white/30 py-4 font-body text-[12px] uppercase tracking-[0.2em] text-white/80 hover:bg-white/5 sm:w-auto"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full flex-1 rounded-full bg-[#C9A96E] py-4 font-body text-[12px] uppercase tracking-[0.2em] text-[#0F0E0C] hover:bg-[#E8D5B0] sm:w-auto"
                >
                  Continue
                </button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div>
                <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-white/50">
                  Tell us about your vision
                </label>
                <textarea
                  {...register("message")}
                  rows={6}
                  className="w-full resize-y border border-white/15 bg-white/5 p-4 font-body text-white outline-none focus:border-[#C9A96E]"
                />
                {errors.message ? (
                  <p className="mt-1 font-body text-xs text-red-400">{errors.message.message}</p>
                ) : null}
              </div>
              <div>
                <label className="mb-2 block font-body text-[11px] uppercase tracking-[0.2em] text-white/50">
                  How did you hear about us?
                </label>
                <input
                  {...register("referral")}
                  className="min-h-[48px] w-full border-b border-white/20 bg-transparent py-3 font-body text-white outline-none focus:border-[#C9A96E]"
                />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full flex-1 rounded-full border border-white/30 py-4 font-body text-[12px] uppercase tracking-[0.2em] text-white/80 hover:bg-white/5 sm:w-auto"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-full flex-1 rounded-full bg-[#C9A96E] py-4 font-body text-[12px] uppercase tracking-[0.2em] text-[#0F0E0C] hover:bg-[#E8D5B0] sm:w-auto"
                >
                  Submit
                </button>
              </div>
            </>
          ) : null}
        </form>
      </div>
    </div>
  );
}
