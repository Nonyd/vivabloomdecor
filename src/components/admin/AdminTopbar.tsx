"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/enquiries": "Enquiries",
  "/admin/bookings/new": "New Booking",
  "/admin/bookings": "Bookings",
  "/admin/clients": "Clients",
  "/admin/invoices/new": "New Invoice",
  "/admin/invoices": "Invoices",
  "/admin/content/gallery": "Gallery",
  "/admin/content/blog/new": "New Post",
  "/admin/content/blog": "Blog Posts",
  "/admin/content/testimonials": "Testimonials",
  "/admin/media": "Media Library",
  "/admin/settings": "Settings",
};

interface Props {
  user: { name?: string | null };
}

export default function AdminTopbar({ user }: Props) {
  const pathname = usePathname();
  const title =
    Object.entries(pageTitles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => pathname.startsWith(key))?.[1] ?? "Admin";

  return (
    <header className="h-16 bg-white border-b border-[#EDE8DC] flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <div>
        <h1 className="font-display italic text-[#0F0E0C] text-[22px]">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[12px] text-[#4A4843] font-body hidden sm:block">
          Welcome back, {user.name?.split(" ")[0]}
        </span>
      </div>
    </header>
  );
}
