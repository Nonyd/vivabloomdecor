import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const patchSchema = z.object({
  status: z
    .enum(["NEW", "IN_REVIEW", "QUOTED", "BOOKED", "CLOSED", "SPAM"])
    .optional(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const enquiry = await prisma.enquiry.update({
      where: { id: params.id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return NextResponse.json(enquiry);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
