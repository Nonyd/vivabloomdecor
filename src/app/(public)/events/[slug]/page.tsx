import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import Image from "next/image";
import TicketPurchaseFlow, { type SerializableEvent } from "@/components/events/TicketPurchaseFlow";

export const dynamic = "force-dynamic";

function toSerializable(event: {
  id: string;
  title: string;
  slug: string;
  date: Date;
  ticketPrice: number;
  earlyBirdPrice: number | null;
  earlyBirdEnds: Date | null;
  isFree: boolean;
  coverImage: string | null;
  capacity: number;
  ticketsSold: number;
}): SerializableEvent {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    date: event.date.toISOString(),
    ticketPrice: event.ticketPrice,
    earlyBirdPrice: event.earlyBirdPrice,
    earlyBirdEnds: event.earlyBirdEnds?.toISOString() ?? null,
    isFree: event.isFree,
    coverImage: event.coverImage,
    capacity: event.capacity,
    ticketsSold: event.ticketsSold,
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  let event = null;
  try {
    event = await prisma.event.findFirst({
      where: { slug: params.slug, published: true },
    });
  } catch {
    notFound();
  }
  if (!event) notFound();

  const spotsLeft = event.capacity - event.ticketsSold;
  const soldOut = spotsLeft <= 0;

  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      <div className="relative h-[55vh] min-h-[400px] overflow-hidden">
        {event.coverImage ? (
          <Image src={event.coverImage} alt={event.title} fill className="object-cover" sizes="100vw" priority />
        ) : (
          <div className="h-full w-full bg-[#0F0E0C]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C] via-[#0F0E0C]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-[5%] pb-12">
          <p className="eyebrow-light mb-3">{format(new Date(event.date), "EEEE, d MMMM yyyy")}</p>
          <h1 className="font-display text-[56px] italic leading-tight text-white md:text-[72px]">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-[5%] py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
          <div>
            <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { icon: Calendar, label: "Date", value: format(new Date(event.date), "d MMM yyyy") },
                { icon: Clock, label: "Time", value: format(new Date(event.date), "h:mm a") },
                { icon: MapPin, label: "Venue", value: event.venue },
                { icon: Users, label: "Capacity", value: `${event.capacity} guests` },
              ].map((info) => (
                <div key={info.label} className="rounded-xl border border-[#EDE8DC] bg-white p-4">
                  <info.icon size={16} className="mb-2 text-[#C9A96E]" />
                  <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#4A4843]/50">{info.label}</p>
                  <p className="mt-0.5 font-body text-[14px] font-medium text-[#0F0E0C]">{info.value}</p>
                </div>
              ))}
            </div>

            <div className="prose prose-lg font-body text-[#4A4843]">
              <h2 className="font-display text-[32px] italic text-[#0F0E0C]">About This Event</h2>
              <p className="leading-relaxed">{event.description ?? "Details coming soon."}</p>
            </div>

            {event.venueAddress ? (
              <div className="mt-10 rounded-2xl border border-[#EDE8DC] bg-white p-6">
                <h3 className="mb-3 font-display text-[22px] italic text-[#0F0E0C]">Venue</h3>
                <p className="font-body text-[#4A4843]">{event.venue}</p>
                <p className="font-body text-sm text-[#4A4843]/60">{event.venueAddress}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.venueAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block font-body text-[12px] uppercase tracking-[0.15em] text-[#C9A96E] hover:underline"
                >
                  View on Maps →
                </a>
              </div>
            ) : null}
          </div>

          <div className="self-start lg:sticky lg:top-24">
            <TicketPurchaseFlow event={toSerializable(event)} spotsLeft={spotsLeft} soldOut={soldOut} />
          </div>
        </div>
      </div>
    </main>
  );
}
