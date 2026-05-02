import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import SettingsClient from "@/components/admin/SettingsClient";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  const [rows, team] = await Promise.all([
    prisma.siteSettings.findMany(),
    prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "STAFF"] } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const initialSettings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <SettingsClient initialSettings={initialSettings} team={team} currentRole={session!.user.role} />
  );
}
