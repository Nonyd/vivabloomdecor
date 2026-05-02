import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const STAFF_ROLES = ["ADMIN", "SUPER_ADMIN", "STAFF"] as const;

export async function requireStaffSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const role = session.user.role;
  if (!STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number])) {
    return { session: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}
