import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const batchSchema = z.object({
  entries: z.array(
    z.object({
      page: z.string(),
      section: z.string(),
      key: z.string(),
      value: z.string(),
    })
  ),
});

const pathMap: Record<string, string> = {
  home: "/",
  services: "/services",
  about: "/about",
  contact: "/contact",
  quote: "/quote",
};

export async function POST(req: NextRequest) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  let parsed: z.infer<typeof batchSchema>;
  try {
    parsed = batchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { entries } = parsed;
  if (entries.length === 0) {
    return NextResponse.json({ error: "No entries" }, { status: 400 });
  }

  await prisma.$transaction(
    entries.map((e) =>
      prisma.pageContent.upsert({
        where: {
          page_section_key: { page: e.page, section: e.section, key: e.key },
        },
        update: { value: e.value },
        create: e,
      })
    )
  );

  const pages = Array.from(new Set(entries.map((e) => e.page)));
  for (const page of pages) {
    revalidatePath(pathMap[page] ?? "/");
  }

  return NextResponse.json({ success: true });
}
