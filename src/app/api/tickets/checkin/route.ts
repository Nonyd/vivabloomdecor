import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STAFF = ["ADMIN", "SUPER_ADMIN", "STAFF"] as const;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !STAFF.includes(session.user.role as (typeof STAFF)[number])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ticketId, checkedInBy } = (await req.json()) as {
    ticketId?: string;
    checkedInBy?: string;
  };
  if (!ticketId) {
    return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      used: true,
      usedAt: new Date(),
      checkedInBy: checkedInBy ?? session.user.email ?? "staff",
    },
  });

  return NextResponse.json({ success: true });
}
