import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";
import { sendUserInviteEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "STAFF"]),
});

export async function POST(req: NextRequest) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  const sessionRole = session.user.role;
  if (sessionRole !== "SUPER_ADMIN" && sessionRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, role: newRole } = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const tempPassword = randomBytes(9).toString("base64url").slice(0, 12);
    const hashed = await bcrypt.hash(tempPassword, 12);

    await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        password: hashed,
        role: newRole,
      },
    });

    await sendUserInviteEmail(email, tempPassword);

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
