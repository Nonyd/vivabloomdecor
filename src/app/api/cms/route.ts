import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const schema = z.object({
  page: z.string().min(1),
  section: z.string().min(1),
  key: z.string().min(1),
  value: z.string(),
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

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await prisma.pageContent.upsert({
    where: {
      page_section_key: { page: body.page, section: body.section, key: body.key },
    },
    update: { value: body.value },
    create: body,
  });

  revalidatePath(pathMap[body.page] ?? "/");

  return NextResponse.json({ success: true });
}
