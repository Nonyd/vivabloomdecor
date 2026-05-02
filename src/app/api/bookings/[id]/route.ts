import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  eventDate: z.string().min(1).optional(),
  eventType: z.string().min(1).optional(),
  venue: z.string().optional().nullable(),
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { user: true, invoices: true },
    });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(booking);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.eventDate !== undefined && { eventDate: new Date(data.eventDate) }),
        ...(data.eventType !== undefined && { eventType: data.eventType }),
        ...(data.venue !== undefined && { venue: data.venue }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.userId !== undefined && { userId: data.userId }),
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
