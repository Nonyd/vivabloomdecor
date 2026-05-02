import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Calendar, DollarSign, Clock } from "lucide-react";
import EnquiryStatusBadge from "@/components/admin/EnquiryStatusBadge";

export default async function AdminDashboard() {
  const [newEnquiries, confirmedBookings, revenue, pendingInvoices, recentEnquiries, upcomingBookings] =
    await Promise.all([
      prisma.enquiry.count({ where: { status: "NEW", createdAt: { gte: startOfWeek() } } }),
      prisma.booking.count({
        where: { status: "CONFIRMED", eventDate: { gte: startOfMonth() } },
      }),
      prisma.invoice.aggregate({
        where: { status: "PAID", paidAt: { gte: startOfMonth() } },
        _sum: { amount: true },
      }),
      prisma.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] } } }),
      prisma.enquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.booking.findMany({
        where: { eventDate: { gte: new Date() }, status: { not: "CANCELLED" } },
        orderBy: { eventDate: "asc" },
        take: 5,
        include: { user: { select: { name: true } } },
      }),
    ]);

  const stats = [
    {
      label: "New Enquiries",
      sublabel: "This week",
      value: newEnquiries,
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Confirmed",
      sublabel: "This month",
      value: confirmedBookings,
      icon: Calendar,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Revenue",
      sublabel: "This month",
      value: `$${(revenue._sum.amount ?? 0).toLocaleString("en-AU")}`,
      icon: DollarSign,
      color: "text-[#C9A96E]",
      bg: "bg-[#C9A96E]/10",
    },
    {
      label: "Pending",
      sublabel: "Invoices due",
      value: pendingInvoices,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-[#EDE8DC]">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="font-display italic text-[#0F0E0C] text-[32px] leading-none">{stat.value}</p>
            <p className="font-body text-[13px] text-[#4A4843] mt-1">{stat.label}</p>
            <p className="font-body text-[11px] text-[#4A4843]/50 mt-0.5">{stat.sublabel}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8DC]">
            <h2 className="font-display italic text-[#0F0E0C] text-[20px]">Recent Enquiries</h2>
            <Link
              href="/admin/enquiries"
              className="text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] font-body hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#EDE8DC]">
            {recentEnquiries.map((enquiry) => (
              <Link
                key={enquiry.id}
                href={`/admin/enquiries?id=${enquiry.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8F5EE] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#C9A96E]/10 flex items-center justify-center text-[#C9A96E] text-sm font-body flex-shrink-0">
                  {enquiry.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[14px] text-[#0F0E0C] truncate">{enquiry.name}</p>
                  <p className="font-body text-[12px] text-[#4A4843]/60 truncate">{enquiry.eventType}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <EnquiryStatusBadge status={enquiry.status} />
                  <p className="font-body text-[11px] text-[#4A4843]/40">
                    {formatDistanceToNow(enquiry.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8DC]">
            <h2 className="font-display italic text-[#0F0E0C] text-[20px]">Upcoming</h2>
            <Link
              href="/admin/bookings"
              className="text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] font-body hover:underline"
            >
              Calendar →
            </Link>
          </div>
          <div className="divide-y divide-[#EDE8DC]">
            {upcomingBookings.length === 0 && (
              <p className="px-6 py-8 text-center text-[#4A4843]/40 text-sm font-body">
                No upcoming bookings
              </p>
            )}
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#F8F5EE] rounded-xl p-2 text-center min-w-[48px]">
                    <p className="font-body text-[10px] uppercase tracking-wider text-[#C9A96E]">
                      {booking.eventDate.toLocaleString("en-AU", { month: "short" })}
                    </p>
                    <p className="font-display italic text-[#0F0E0C] text-[22px] leading-none">
                      {booking.eventDate.getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-[14px] text-[#0F0E0C]">{booking.title}</p>
                    <p className="font-body text-[12px] text-[#4A4843]/60">{booking.eventType}</p>
                    {booking.user && (
                      <p className="font-body text-[11px] text-[#4A4843]/40 mt-0.5">{booking.user.name}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/admin/content/blog/new", label: "+ New Blog Post" },
          { href: "/admin/content/gallery", label: "+ Upload Gallery" },
          { href: "/admin/invoices/new", label: "+ Create Invoice" },
          { href: "/admin/bookings/new", label: "+ New Booking" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white border border-[#EDE8DC] rounded-xl px-4 py-3.5 text-center font-body text-[12px] uppercase tracking-[0.15em] text-[#4A4843] hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function startOfWeek() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
