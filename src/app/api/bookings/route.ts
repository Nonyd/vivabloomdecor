import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const createSchema = z.object({
  title: z.string().min(1),
  eventDate: z.string().min(1),
  eventType: z.string().min(1),
  venue: z.string().optional().nullable(),
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
});

export async function GET() {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { eventDate: "asc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(bookings);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const booking = await prisma.booking.create({
      data: {
        title: data.title,
        eventDate: new Date(data.eventDate),
        eventType: data.eventType,
        venue: data.venue ?? undefined,
        status: data.status ?? "PENDING",
        notes: data.notes ?? undefined,
        userId: data.userId ?? undefined,
      },
    });

    return NextResponse.json(booking);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
