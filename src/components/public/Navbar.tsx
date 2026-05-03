"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconFacebook, IconInstagram } from "@/components/public/social-icons";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.397 2.966 7.397 6.931 0 4.136-2.607 7.464-6.233 7.464-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

export default function Navbar({ className }: { className?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const heroBlend =
    pathname === "/" && !scrolled ? "mix-blend-difference" : "";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full px-[5%] transition-[background-color,backdrop-filter] duration-[400ms] ease-in-out",
          scrolled
            ? "bg-[rgba(15,14,12,0.94)] backdrop-blur-[12px]"
            : "bg-transparent",
          heroBlend,
          className
        )}
      >
        <nav className="mx-auto flex h-16 items-center justify-between lg:h-20">
          <Link href="/">
            <span
              style={{ fontFamily: "var(--font-accent)" }}
              className="text-2xl tracking-wider text-white"
            >
              Vivabloom
            </span>
          </Link>

          <div className="hidden items-center gap-10 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-[11px] uppercase tracking-[0.2em] text-white/80 transition-colors duration-300 hover:text-[#C9A96E]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block">
            <Link
              href="/quote"
              className="rounded-full border border-[#C9A96E] px-6 py-2.5 font-body text-[11px] uppercase tracking-[0.2em] text-[#C9A96E] transition-all duration-300 hover:bg-[#C9A96E] hover:text-[#0F0E0C]"
            >
              Request a Quote
            </Link>
          </div>

          <button
            type="button"
            className="relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className={cn(
                "block h-0.5 w-6 bg-white transition-transform duration-300",
                open && "translate-y-2 rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-6 bg-white transition-opacity duration-300",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-6 bg-white transition-transform duration-300",
                open && "-translate-y-2 -rotate-45"
              )}
            />
          </button>
        </nav>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 flex max-h-[100dvh] flex-col overflow-x-hidden overflow-y-auto bg-[#0F0E0C] transition-opacity duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 pt-24">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block min-h-[56px] w-full max-w-md py-4 text-center font-display text-[40px] italic leading-tight text-white transition-colors active:text-[#C9A96E]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/quote"
            className="mt-4 inline-flex min-h-[44px] w-full max-w-md items-center justify-center rounded-full border border-[#C9A96E] px-8 py-4 font-body text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]"
          >
            Request a Quote
          </Link>
        </div>
        <div className="flex justify-center gap-8 pb-12 text-white/70">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <IconInstagram className="h-[22px] w-[22px]" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <IconFacebook className="h-[22px] w-[22px]" />
          </a>
          <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
            <PinterestIcon className="h-[22px] w-[22px]" />
          </a>
        </div>
      </div>
    </>
  );
}
