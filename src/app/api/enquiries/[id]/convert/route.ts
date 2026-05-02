import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: params.id } });
    if (!enquiry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const linkedUser = await prisma.user.findUnique({
      where: { email: enquiry.email },
    });

    const booking = await prisma.booking.create({
      data: {
        title: `${enquiry.eventType} — ${enquiry.name}`,
        eventDate: enquiry.eventDate ?? new Date(),
        eventType: enquiry.eventType,
        status: "PENDING",
        userId: linkedUser?.id,
        venue: null,
      },
    });

    await prisma.enquiry.update({
      where: { id: params.id },
      data: { status: "BOOKED" },
    });

    return NextResponse.json({ bookingId: booking.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
