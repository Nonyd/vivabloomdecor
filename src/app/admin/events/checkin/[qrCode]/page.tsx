import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import CheckInAction from "@/components/admin/CheckInAction";

export const dynamic = "force-dynamic";

export default async function CheckInPage({ params }: { params: { qrCode: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let ticket = null;
  try {
    ticket = await prisma.ticket.findUnique({
      where: { qrCode: params.qrCode },
      include: { event: true, order: true },
    });
  } catch {
    ticket = null;
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-6xl">❌</div>
          <h1 className="font-display text-2xl italic text-red-600">Invalid Ticket</h1>
          <p className="mt-2 font-body text-sm text-[#4A4843]">This QR code is not valid.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-6 ${ticket.used ? "bg-orange-50" : "bg-green-50"}`}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
        {ticket.used ? (
          <>
            <div className="mb-4 text-6xl">⚠️</div>
            <h1 className="mb-2 font-display text-2xl italic text-orange-600">Already Used</h1>
            <p className="font-body text-sm text-[#4A4843]">
              This ticket was checked in at{" "}
              {ticket.usedAt ? format(ticket.usedAt, "h:mm a, d MMM yyyy") : "an earlier time"}.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 text-6xl">✅</div>
            <h1 className="mb-2 font-display text-[28px] italic text-green-600">Valid Ticket</h1>
          </>
        )}

        <div className="mt-4 space-y-2 rounded-xl bg-[#F8F5EE] p-4 text-left">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#C9A96E]">Event</p>
            <p className="font-body text-[14px] text-[#0F0E0C]">{ticket.event.title}</p>
          </div>
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#C9A96E]">Attendee</p>
            <p className="font-body text-[14px] text-[#0F0E0C]">{ticket.attendeeName}</p>
            <p className="font-body text-[12px] text-[#4A4843]/60">{ticket.attendeeEmail}</p>
          </div>
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#C9A96E]">Ticket #</p>
            <p className="font-body text-[13px] text-[#0F0E0C]">{ticket.ticketNumber}</p>
          </div>
        </div>

        {!ticket.used ? (
          <CheckInAction ticketId={ticket.id} checkedInBy={session.user?.email ?? "staff"} />
        ) : null}
      </div>
    </div>
  );
}
