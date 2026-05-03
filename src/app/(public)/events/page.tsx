import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Upcoming Events | Vivabloom",
  description:
    "Browse and book tickets to upcoming Vivabloom events in Melbourne and Australia.",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof prisma.event.findMany>> = [];
  try {
    events = await prisma.event.findMany({
      where: { published: true, status: { not: "CANCELLED" } },
      orderBy: { date: "asc" },
    });
  } catch {
    events = [];
  }

  const upcoming = events.filter((e) => e.status === "UPCOMING" || e.status === "ONGOING");

  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      <div className="bg-[#0F0E0C] px-[5%] py-28 text-center">
        <p className="eyebrow-light mb-4">Events & Experiences</p>
        <h1 className="font-display text-[64px] italic leading-tight text-white">Upcoming Events</h1>
        <p className="mx-auto mt-4 max-w-lg font-body text-white/60">
          Join us for intimate workshops, styled showcase events, and exclusive celebrations.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-[5%] py-20">
        {upcoming.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-3xl italic text-[#0F0E0C]">No upcoming events yet</p>
            <p className="mt-3 font-body text-[#4A4843]/60">Check back soon or subscribe to our newsletter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EventCard({ event }: { event: { id: string; title: string; slug: string; date: Date; description: string | null; venue: string; city: string; capacity: number; ticketsSold: number; ticketPrice: number; isFree: boolean; coverImage: string | null } }) {
  const spotsLeft = event.capacity - event.ticketsSold;
  const soldOut = spotsLeft <= 0;
  const almostGone = spotsLeft > 0 && spotsLeft <= 10;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group overflow-hidden rounded-2xl border border-[#EDE8DC] bg-white transition-all duration-300 hover:border-[#C9A96E] hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#EDE8DC]">
            <Calendar size={40} className="text-[#C9A96E]/40" />
          </div>
        )}
        <div className="absolute right-4 top-4 rounded-full bg-[#0F0E0C]/80 px-3 py-1.5 font-body text-[13px] text-[#C9A96E] backdrop-blur-sm">
          {event.isFree ? "Free" : `$${event.ticketPrice}`}
        </div>
        {soldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0F0E0C]/60">
            <span className="rounded-full bg-white px-4 py-2 font-body text-[12px] uppercase tracking-[0.2em] text-[#0F0E0C]">
              Sold Out
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <Calendar size={13} className="text-[#C9A96E]" />
          <span className="font-body text-[12px] uppercase tracking-[0.15em] text-[#C9A96E]">
            {format(new Date(event.date), "EEE, d MMM yyyy · h:mm a")}
          </span>
        </div>
        <h2 className="mb-2 font-display text-[24px] italic leading-tight text-[#0F0E0C] transition-colors group-hover:text-[#C9A96E]">
          {event.title}
        </h2>
        <div className="mb-4 flex items-center gap-1.5">
          <MapPin size={13} className="text-[#4A4843]/50" />
          <span className="font-body text-[13px] text-[#4A4843]/60">
            {event.venue}, {event.city}
          </span>
        </div>
        {event.description ? (
          <p className="mb-4 line-clamp-2 font-body text-[14px] leading-relaxed text-[#4A4843]">{event.description}</p>
        ) : null}
        <div className="flex items-center justify-between border-t border-[#EDE8DC] pt-4">
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-[#4A4843]/50" />
            {almostGone ? (
              <span className="font-body text-[12px] text-orange-500">Only {spotsLeft} left!</span>
            ) : null}
            {!almostGone && !soldOut ? (
              <span className="font-body text-[12px] text-[#4A4843]/50">{spotsLeft} spots available</span>
            ) : null}
          </div>
          {!soldOut ? (
            <span className="font-body text-[11px] uppercase tracking-[0.15em] text-[#C9A96E]">Book Now →</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
