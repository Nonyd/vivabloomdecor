import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const createSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().nullable(),
  content: z.string().min(1),
  rating: z.number().min(1).max(5),
  imageUrl: z.string().optional().nullable(),
  approved: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get("admin") === "true";

  if (admin) {
    const { session, response } = await requireStaffSession();
    if (!session) return response;
    const list = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(list);
  }

  const list = await prisma.testimonial.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const item = await prisma.testimonial.create({
      data: {
        name: data.name,
        role: data.role ?? undefined,
        content: data.content,
        rating: data.rating,
        imageUrl: data.imageUrl ?? undefined,
        approved: data.approved ?? false,
        featured: data.featured ?? false,
      },
    });

    return NextResponse.json(item);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
