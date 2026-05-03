import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  date: z.string().min(1),
  endDate: z.string().optional().nullable(),
  venue: z.string().min(1),
  venueAddress: z.string().optional().nullable(),
  city: z.string().optional().default("Melbourne"),
  capacity: z.number().int().positive(),
  ticketPrice: z.number().nonnegative(),
  earlyBirdPrice: z.number().optional().nullable(),
  earlyBirdEnds: z.string().optional().nullable(),
  isFree: z.boolean().optional().default(false),
  coverImage: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
});

export async function GET() {
  const { session, response } = await requireStaffSession();
  if (!session) return response;
  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { tickets: true } } },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;
  try {
    const raw = await req.json();
    const data = createSchema.parse(raw);
    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description ?? undefined,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        venue: data.venue,
        venueAddress: data.venueAddress ?? undefined,
        city: data.city ?? "Melbourne",
        capacity: data.capacity,
        ticketPrice: data.isFree ? 0 : data.ticketPrice,
        earlyBirdPrice: data.earlyBirdPrice ?? undefined,
        earlyBirdEnds: data.earlyBirdEnds ? new Date(data.earlyBirdEnds) : undefined,
        isFree: data.isFree,
        coverImage: data.coverImage ?? undefined,
        gallery: [],
        tags: data.tags ?? [],
        published: data.published,
        featured: data.featured,
      },
    });
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    return NextResponse.json(event);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
