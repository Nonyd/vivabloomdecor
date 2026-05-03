import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import SettingsClient from "@/components/admin/SettingsClient";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const team = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "STAFF"] } },
    orderBy: { createdAt: "asc" },
  });

  return <SettingsClient team={team} currentRole={role} />;
}
