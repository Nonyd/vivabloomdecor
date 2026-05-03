import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage({ params }: { params: { id: string } }) {
  let event = null;
  try {
    event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { tickets: { orderBy: { createdAt: "desc" } } },
    });
  } catch {
    notFound();
  }
  if (!event) notFound();

  const revenue = await prisma.order.aggregate({
    where: {
      status: "PAID",
      items: { some: { eventId: event.id } },
    },
    _sum: { total: true },
  });

  return (
    <div>
      <Link href="/admin/events" className="font-body text-[12px] text-[#4A4843]/60 hover:text-[#C9A96E]">
        ← Events
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[36px] italic text-[#0F0E0C]">{event.title}</h1>
          <p className="mt-1 font-body text-sm text-[#4A4843]/60">
            {format(event.date, "PPpp")} · {event.venue} · {event.status} ·{" "}
            {event.published ? "Published" : "Draft"}
          </p>
        </div>
        <a
          href={`/events/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-[#EDE8DC] px-4 py-2 font-body text-[12px] text-[#4A4843] hover:border-[#C9A96E]"
        >
          View public page
        </a>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#EDE8DC] bg-white p-5">
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[#C9A96E]">Tickets sold</p>
          <p className="mt-1 font-display text-3xl italic text-[#0F0E0C]">
            {event.ticketsSold} / {event.capacity}
          </p>
        </div>
        <div className="rounded-2xl border border-[#EDE8DC] bg-white p-5">
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[#C9A96E]">Revenue (paid orders)</p>
          <p className="mt-1 font-display text-3xl italic text-[#0F0E0C]">
            ${(revenue._sum.total ?? 0).toFixed(0)} AUD
          </p>
        </div>
        <div className="rounded-2xl border border-[#EDE8DC] bg-white p-5">
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[#C9A96E]">Check-in</p>
          <p className="mt-2 font-body text-sm text-[#4A4843]/70">
            Scan QR codes from ticket emails. URL pattern:{" "}
            <code className="text-xs">/admin/events/checkin/[code]</code>
          </p>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-[#EDE8DC] bg-white">
        <h2 className="border-b border-[#EDE8DC] bg-[#F8F5EE] px-4 py-3 font-display text-lg italic text-[#0F0E0C]">
          Tickets
        </h2>
        <table className="w-full text-left font-body text-[13px]">
          <thead className="text-[11px] uppercase tracking-[0.1em] text-[#4A4843]/50">
            <tr>
              <th className="px-4 py-2">Ticket #</th>
              <th className="px-4 py-2">Attendee</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Check-in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE8DC]">
            {event.tickets.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-2">{t.ticketNumber}</td>
                <td className="px-4 py-2">{t.attendeeName ?? "—"}</td>
                <td className="px-4 py-2 text-[#4A4843]/80">{t.attendeeEmail ?? "—"}</td>
                <td className="px-4 py-2">
                  {t.used ? (
                    <span className="text-orange-600">Used {t.usedAt ? format(t.usedAt, "d MMM h:mm a") : ""}</span>
                  ) : (
                    <span className="text-green-700">Valid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {event.tickets.length === 0 ? (
          <p className="p-6 text-center font-body text-sm text-[#4A4843]/60">No tickets yet.</p>
        ) : null}
      </div>
    </div>
  );
}
