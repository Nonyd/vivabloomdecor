import type { ReactNode } from "react";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;
  if (!["ADMIN", "SUPER_ADMIN", "STAFF"].includes(role)) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-[#F8F5EE] overflow-hidden">
      <AdminSidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminTopbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
