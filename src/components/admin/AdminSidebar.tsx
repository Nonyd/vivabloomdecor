"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Users,
  FileText,
  Image,
  Star,
  Settings,
  Edit3,
  ChevronDown,
  LogOut,
  GalleryHorizontal,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  {
    label: "Content",
    icon: Edit3,
    children: [
      { href: "/admin/content/gallery", label: "Gallery", icon: GalleryHorizontal },
      { href: "/admin/content/blog", label: "Blog Posts", icon: BookOpen },
      { href: "/admin/content/testimonials", label: "Testimonials", icon: Star },
    ],
  },
  { href: "/admin/media", label: "Media Library", icon: Image },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const [contentOpen, setContentOpen] = useState(pathname.startsWith("/admin/content"));
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F0E0C] w-64 flex-shrink-0">
      <div className="px-6 py-7 border-b border-white/5">
        <Link href="/" className="font-accent text-[#C9A96E] text-2xl tracking-wider">
          Vivabloom
        </Link>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-body mt-1">
          Admin Portal
        </p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if ("children" in item && item.children) {
            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setContentOpen(!contentOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} />
                    <span className="font-body text-[13px]">{item.label}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${contentOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {contentOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/5 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-body transition-all ${
                          isActive(child.href)
                            ? "text-[#C9A96E] bg-[#C9A96E]/10"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <child.icon size={14} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (!("href" in item) || !item.href) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-body transition-all relative ${
                isActive(item.href, item.exact)
                  ? "text-[#C9A96E] bg-[#C9A96E]/10"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive(item.href, item.exact) && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C9A96E] rounded-full" />
              )}
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] text-sm font-body">
            {user.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-body truncate">{user.name}</p>
            <p className="text-white/30 text-[11px] font-body truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white/30 hover:text-[#C9A96E] transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex">
        <SidebarContent />
      </div>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#0F0E0C] p-2 rounded-lg text-white"
        aria-label="Open menu"
      >
        ☰
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="flex-1 bg-black/50 border-0 cursor-default"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
