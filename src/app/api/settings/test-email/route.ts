import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaffSession } from "@/lib/admin-api";
import { sendTestEmail } from "@/lib/email";

const schema = z.object({
  to: z.string().email(),
});

export async function POST(req: NextRequest) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const body = await req.json();
    const { to } = schema.parse(body);
    const result = await sendTestEmail(to);
    if (!result.ok) {
      return NextResponse.json({ error: result.message ?? "Email not sent" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
