import Link from "next/link";
import { prisma } from "@/lib/prisma";

function statusClasses(status: string) {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-600";
    case "SENT":
      return "bg-blue-50 text-blue-700";
    case "PAID":
      return "bg-green-50 text-green-700";
    case "OVERDUE":
      return "bg-red-50 text-red-700";
    case "CANCELLED":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link
          href="/admin/invoices/new"
          className="inline-flex bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase tracking-[0.15em] px-5 py-3 rounded-lg hover:bg-[#E8D5B0]"
        >
          + New Invoice
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-x-auto">
        <table className="w-full min-w-[880px]">
          <thead className="bg-[#F8F5EE] font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843] text-left">
            <tr>
              <th className="px-6 py-3">Invoice #</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Due Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE8DC]">
            {invoices.map((inv) => (
              <tr key={inv.id} className="font-body text-[14px] hover:bg-[#F8F5EE]">
                <td className="px-6 py-4 text-[#0F0E0C]">{inv.number}</td>
                <td className="px-6 py-4 text-[#4A4843]">
                  {inv.user?.name ?? inv.user?.email ?? "—"}
                </td>
                <td className="px-6 py-4">${inv.amount.toLocaleString("en-AU")}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full ${statusClasses(inv.status)}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#4A4843]/80 text-[13px]">
                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-AU") : "—"}
                </td>
                <td className="px-6 py-4">
                  <a
                    href={`/api/invoices/${inv.id}/pdf`}
                    className="text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] hover:underline"
                  >
                    PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
