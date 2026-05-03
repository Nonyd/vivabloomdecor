import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  date: z.string().optional(),
  endDate: z.string().optional().nullable(),
  venue: z.string().optional(),
  venueAddress: z.string().optional().nullable(),
  city: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  ticketPrice: z.number().nonnegative().optional(),
  earlyBirdPrice: z.number().optional().nullable(),
  earlyBirdEnds: z.string().optional().nullable(),
  isFree: z.boolean().optional(),
  coverImage: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      tickets: { orderBy: { createdAt: "desc" } },
      _count: { select: { tickets: true } },
    },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;
  try {
    const body = patchSchema.parse(await req.json());
    const existing = await prisma.event.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.endDate !== undefined && {
          endDate: body.endDate ? new Date(body.endDate) : null,
        }),
        ...(body.venue !== undefined && { venue: body.venue }),
        ...(body.venueAddress !== undefined && { venueAddress: body.venueAddress }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.capacity !== undefined && { capacity: body.capacity }),
        ...(body.ticketPrice !== undefined && { ticketPrice: body.ticketPrice }),
        ...(body.earlyBirdPrice !== undefined && { earlyBirdPrice: body.earlyBirdPrice }),
        ...(body.earlyBirdEnds !== undefined && {
          earlyBirdEnds: body.earlyBirdEnds ? new Date(body.earlyBirdEnds) : null,
        }),
        ...(body.isFree !== undefined && { isFree: body.isFree }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.published !== undefined && { published: body.published }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath(`/events/${existing.slug}`);
    return NextResponse.json(event);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
