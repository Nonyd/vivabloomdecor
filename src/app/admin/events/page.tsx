import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import EventsPublishedToggle from "@/components/admin/events/EventsPublishedToggle";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  let events: Awaited<ReturnType<typeof prisma.event.findMany>> = [];
  try {
    events = await prisma.event.findMany({
      orderBy: { date: "desc" },
      include: { _count: { select: { tickets: true } } },
    });
  } catch {
    events = [];
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Events</p>
          <h1 className="font-display text-[36px] italic text-[#0F0E0C]">Events &amp; Tickets</h1>
          <p className="mt-1 font-body text-sm text-[#4A4843]/60">Create events, track sales, and check in guests.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-lg bg-[#C9A96E] px-5 py-2.5 font-body text-[12px] uppercase tracking-[0.15em] text-[#0F0E0C] hover:bg-[#E8D5B0]"
        >
          + New Event
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#EDE8DC] bg-white">
        <table className="w-full text-left font-body text-[13px]">
          <thead className="border-b border-[#EDE8DC] bg-[#F8F5EE] text-[11px] uppercase tracking-[0.12em] text-[#4A4843]/60">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Tickets</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE8DC]">
            {events.map((e) => {
              const pct = e.capacity > 0 ? Math.min(100, (e.ticketsSold / e.capacity) * 100) : 0;
              return (
                <tr key={e.id} className="text-[#0F0E0C]">
                  <td className="px-4 py-3 font-medium">{e.title}</td>
                  <td className="px-4 py-3 text-[#4A4843]">{format(e.date, "d MMM yyyy")}</td>
                  <td className="px-4 py-3 text-[#4A4843]">{e.venue}</td>
                  <td className="px-4 py-3">
                    <div className="mb-1 flex justify-between text-[11px] text-[#4A4843]/70">
                      <span>
                        {e.ticketsSold} / {e.capacity}
                      </span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#EDE8DC]">
                      <div className="h-full bg-[#C9A96E]" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#4A4843]">{e.status}</td>
                  <td className="px-4 py-3">
                    <EventsPublishedToggle eventId={e.id} published={e.published} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/events/${e.id}`} className="text-[#C9A96E] hover:underline">
                      Manage
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {events.length === 0 ? (
          <p className="p-8 text-center font-body text-[#4A4843]/60">No events yet. Create one to get started.</p>
        ) : null}
      </div>
    </div>
  );
}
