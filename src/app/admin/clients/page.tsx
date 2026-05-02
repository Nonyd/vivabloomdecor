import { prisma } from "@/lib/prisma";

export default async function AdminClientsPage() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead className="bg-[#F8F5EE] font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843] text-left">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EDE8DC] font-body text-[14px]">
          {clients.map((c) => (
            <tr key={c.id} className="hover:bg-[#F8F5EE]">
              <td className="px-6 py-4 text-[#0F0E0C]">{c.name ?? "—"}</td>
              <td className="px-6 py-4 text-[#4A4843]">{c.email}</td>
              <td className="px-6 py-4 text-[13px] text-[#4A4843]/80">
                {new Date(c.createdAt).toLocaleDateString("en-AU")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {clients.length === 0 && (
        <p className="p-8 text-center font-body text-[#4A4843]/60 text-sm">No clients yet.</p>
      )}
    </div>
  );
}
