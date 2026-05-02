import Link from "next/link";
import { IconFacebook, IconInstagram } from "@/components/public/social-icons";
import NewsletterForm from "./NewsletterForm";

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.397 2.966 7.397 6.931 0 4.136-2.607 7.464-6.233 7.464-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
];

const serviceLinks = [
  { href: "/services#floral", label: "Floral Design" },
  { href: "/services#balloon", label: "Balloon Artistry" },
  { href: "/services#wedding", label: "Wedding Styling" },
  { href: "/services#corporate", label: "Corporate Events" },
  { href: "/services#draping", label: "Backdrop & Draping" },
  { href: "/services#production", label: "Full Production" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F0E0C] text-white/50">
      <div className="border-t border-[rgba(201,169,110,0.3)] px-[5%] py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-accent text-[28px] text-[#C9A96E]">Vivabloom</p>
            <p className="mt-3 font-body text-[14px] italic text-white/60">
              Where Every Moment Becomes a Memory
            </p>
            <div className="mt-6 flex gap-5 text-white/50">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#C9A96E]"
                aria-label="Instagram"
              >
                <IconInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#C9A96E]"
                aria-label="Facebook"
              >
                <IconFacebook className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#C9A96E]"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#C9A96E]"
                aria-label="Pinterest"
              >
                <PinterestIcon className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-8 font-body text-[12px] text-white/30">ABN: XX XXX XXX XXX</p>
          </div>

          <div>
            <h3 className="mb-5 font-body text-[10px] uppercase tracking-[0.3em] text-[#C9A96E]">Explore</h3>
            <ul className="space-y-2 text-[13px]">
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-[#C9A96E]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-body text-[10px] uppercase tracking-[0.3em] text-[#C9A96E]">Services</h3>
            <ul className="space-y-2 text-[13px]">
              {serviceLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-[#C9A96E]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-body text-[10px] uppercase tracking-[0.3em] text-[#C9A96E]">Get in Touch</h3>
            <ul className="space-y-3 text-[13px]">
              <li className="flex gap-2">
                <span aria-hidden>📍</span>
                <span>Melbourne, Victoria, Australia</span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden>📞</span>
                <a href="tel:+61300000000" className="transition-colors hover:text-[#C9A96E]">
                  +61 3 XXXX XXXX
                </a>
              </li>
              <li className="flex gap-2">
                <span aria-hidden>✉️</span>
                <a
                  href="mailto:info@vivabloomdecor.com.au"
                  className="transition-colors hover:text-[#C9A96E]"
                >
                  info@vivabloomdecor.com.au
                </a>
              </li>
            </ul>
            <div className="mt-8">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-7xl border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-[13px] text-white/50 md:flex-row">
            <p>© 2026 Vivabloom Decor. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="transition-colors hover:text-[#C9A96E]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-[#C9A96E]">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
