import type { Metadata } from "next";
import { IconFacebook, IconInstagram } from "@/components/public/social-icons";
import ContactForm from "@/components/public/ContactForm";
import { getPageContent, get } from "@/lib/content";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Vivabloom. We'd love to hear about your upcoming event.",
  alternates: { canonical: "https://vivabloomdecor.com.au/contact" },
};

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

export default async function ContactPage() {
  const content = await getPageContent("contact");
  const cfg = await getSettings([
    "contact_phone",
    "contact_email",
    "contact_address",
    "contact_city",
    "contact_hours",
    "google_maps_embed",
    "social_instagram",
    "social_facebook",
    "social_tiktok",
    "social_pinterest",
  ]);

  const address =
    [cfg.contact_address, cfg.contact_city].filter(Boolean).join(", ") ||
    get(content, "details", "address", "Melbourne, Victoria, Australia");
  const phone = cfg.contact_phone || get(content, "details", "phone", "+61 3 XXXX XXXX");
  const email = cfg.contact_email || get(content, "details", "email", "info@vivabloomdecor.com.au");
  const hours = cfg.contact_hours || get(content, "details", "hours");
  const responseTime = get(content, "details", "response_time");
  const telHref = phone.replace(/\s/g, "");
  const mapSrc =
    cfg.google_maps_embed ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d805184.0437066072!2d144.59965462922837!3d-37.97168704876687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad646b5d2e4f503%3A0xa568d2d5a379e35a!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sau!4v1710000000000!5m2!1sen!2sau";

  const ig = cfg.social_instagram || "https://instagram.com";
  const fb = cfg.social_facebook || "https://facebook.com";
  const tt = cfg.social_tiktok || "https://tiktok.com";
  const pi = cfg.social_pinterest || "https://pinterest.com";

  return (
    <main className="min-h-screen bg-ivory pt-20">
      <div className="border-b border-champagne/15 bg-[#0F0E0C] px-[5%] py-16 text-center">
        <p className="eyebrow-light mb-3">Studio</p>
        <h1 className="font-display text-5xl italic text-white md:text-6xl">
          {get(content, "hero", "headline", "Get In Touch")}
        </h1>
        {get(content, "hero", "subheadline") ? (
          <p className="mx-auto mt-4 max-w-lg font-body text-white/65">
            {get(content, "hero", "subheadline")}
          </p>
        ) : null}
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-[5%] py-16 lg:grid-cols-[40%_60%] lg:gap-20">
        <div>
          <p className="eyebrow mb-4">Reach us</p>
          <h2 className="mb-10 font-display text-3xl italic text-onyx md:text-4xl">Contact</h2>

          <ul className="space-y-6 font-body text-charcoal">
            <li className="flex gap-3">
              <span className="text-champagne">📍</span>
              <span>{address}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-champagne">📞</span>
              <a href={`tel:${telHref}`} className="hover:text-champagne">
                {phone}
              </a>
            </li>
            <li className="flex gap-3">
              <span className="text-champagne">✉️</span>
              <a href={`mailto:${email}`} className="hover:text-champagne">
                {email}
              </a>
            </li>
            {hours ? (
              <li className="flex gap-3">
                <span className="text-champagne">🕐</span>
                <span>{hours}</span>
              </li>
            ) : null}
            {responseTime ? (
              <li className="flex gap-3">
                <span className="text-champagne">💬</span>
                <span>{responseTime}</span>
              </li>
            ) : null}
          </ul>

          <div className="mt-10 flex gap-6 text-charcoal">
            <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IconInstagram className="h-[22px] w-[22px] hover:text-champagne" />
            </a>
            <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <IconFacebook className="h-[22px] w-[22px] hover:text-champagne" />
            </a>
            <a href={tt} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TikTokIcon className="h-[22px] w-[22px] hover:text-champagne" />
            </a>
            <a href={pi} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <PinterestIcon className="h-[22px] w-[22px] hover:text-champagne" />
            </a>
          </div>

          <div className="mt-12 aspect-video w-full overflow-hidden rounded-sm border border-charcoal/10">
            <iframe
              title="Studio map"
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="rounded-sm border border-champagne/20 bg-white/40 p-8 shadow-sm md:p-12">
          <h2 className="mb-8 font-display text-2xl italic text-onyx">Send a note</h2>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
