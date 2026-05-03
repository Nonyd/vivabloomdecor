import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt, SENSITIVE_KEYS } from "@/lib/encryption";
import { getAllSettingsForAdmin } from "@/lib/settings";
import { requireAdminSettingsSession } from "@/lib/admin-api";

export async function GET() {
  const { session, response } = await requireAdminSettingsSession();
  if (!session) return response;

  try {
    const settings = await getAllSettingsForAdmin();
    return NextResponse.json(settings);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, response } = await requireAdminSettingsSession();
  if (!session) return response;

  try {
    const body = (await req.json()) as Record<string, string>;

    const entries = Object.entries(body).filter(([, value]) => value !== undefined);

    const operations = entries
      .map(([key, value]) => {
        if (SENSITIVE_KEYS.has(key) && value.includes("•")) {
          return null;
        }

        const storedValue =
          SENSITIVE_KEYS.has(key) && value ? encrypt(value) : value;

        return prisma.siteSettings.upsert({
          where: { key },
          update: { value: storedValue },
          create: { key, value: storedValue },
        });
      })
      .filter((op): op is NonNullable<typeof op> => op !== null);

    if (operations.length) {
      await prisma.$transaction(operations);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
