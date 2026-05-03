import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuccessPage({ params }: { params: { slug: string } }) {
  let event: { title: string } | null = null;
  try {
    event = await prisma.event.findFirst({
      where: { slug: params.slug },
      select: { title: true },
    });
  } catch {
    event = null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F0E0C] px-6">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#C9A96E]/30 text-3xl text-[#C9A96E]">
          ✓
        </div>
        <p className="eyebrow-light mb-4">Booking Confirmed</p>
        <h1 className="mb-4 font-display text-[56px] italic leading-tight text-white">See you there!</h1>
        <p className="mb-10 font-body leading-relaxed text-white/60">
          Your tickets for <strong className="text-white">{event?.title ?? "this event"}</strong> are on their way.
          Check your inbox — each ticket includes a QR code for entry.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/events" className="champagne-outline-btn inline-block text-center">
            Browse More Events
          </Link>
          <Link
            href="/"
            className="py-3 font-body text-[11px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
