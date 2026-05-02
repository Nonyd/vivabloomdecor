import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

export async function GET() {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const rows = await prisma.siteSettings.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return NextResponse.json(map);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const body = (await req.json()) as Record<string, string | number | boolean | null | undefined>;
    const entries = Object.entries(body).filter(([, v]) => v !== undefined) as [string, string][];

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.siteSettings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
