import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const createSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z.string().url(),
  cloudinaryId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const items = await prisma.galleryItem.findMany({
      where: category ? { category } : {},
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items);
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

    const maxOrder = await prisma.galleryItem.aggregate({ _max: { order: true } });
    const order = (maxOrder._max.order ?? 0) + 1;

    const item = await prisma.galleryItem.create({
      data: {
        title: data.title,
        category: data.category,
        imageUrl: data.imageUrl,
        cloudinaryId: data.cloudinaryId ?? undefined,
        order,
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
