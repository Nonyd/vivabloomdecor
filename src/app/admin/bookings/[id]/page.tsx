import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { user: true, invoices: true },
  });

  if (!booking) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/bookings"
        className="inline-block text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] font-body hover:underline"
      >
        ← Back to bookings
      </Link>
      <div className="bg-white rounded-2xl border border-[#EDE8DC] p-8">
        <h1 className="font-display italic text-[#0F0E0C] text-3xl">{booking.title}</h1>
        <p className="font-body text-[#4A4843] mt-2">
          {new Date(booking.eventDate).toLocaleDateString("en-AU", { dateStyle: "full" })}
        </p>
        <dl className="mt-8 space-y-3 font-body text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[#4A4843]/70">Type</dt>
            <dd className="text-[#0F0E0C]">{booking.eventType}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#4A4843]/70">Status</dt>
            <dd className="text-[#0F0E0C]">{booking.status.replace("_", " ")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#4A4843]/70">Venue</dt>
            <dd className="text-[#0F0E0C]">{booking.venue ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#4A4843]/70">Client</dt>
            <dd className="text-[#0F0E0C]">{booking.user?.name ?? booking.user?.email ?? "—"}</dd>
          </div>
        </dl>
        {booking.notes && (
          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-body mb-2">
              Notes
            </p>
            <p className="font-body text-[14px] text-[#4A4843] whitespace-pre-wrap">{booking.notes}</p>
          </div>
        )}
        {booking.invoices.length > 0 && (
          <div className="mt-8 border-t border-[#EDE8DC] pt-6">
            <p className="font-display italic text-lg mb-3">Invoices</p>
            <ul className="space-y-2 font-body text-sm">
              {booking.invoices.map((inv) => (
                <li key={inv.id}>
                  <Link href={`/admin/invoices`} className="text-[#C9A96E] hover:underline">
                    #{inv.number} — ${inv.amount.toLocaleString("en-AU")} ({inv.status})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
