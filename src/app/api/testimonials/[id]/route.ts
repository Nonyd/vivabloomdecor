import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const patchSchema = z.object({
  approved: z.boolean().optional(),
  featured: z.boolean().optional(),
  name: z.string().min(1).optional(),
  role: z.string().optional().nullable(),
  content: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const item = await prisma.testimonial.update({
      where: { id: params.id },
      data: {
        ...(data.approved !== undefined && { approved: data.approved }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
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

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    await prisma.testimonial.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
