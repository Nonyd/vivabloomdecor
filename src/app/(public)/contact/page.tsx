import type { Metadata } from "next";
import { IconFacebook, IconInstagram } from "@/components/public/social-icons";
import ContactForm from "@/components/public/ContactForm";

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

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-ivory pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-[5%] py-16 lg:grid-cols-[40%_60%] lg:gap-20">
        <div>
          <p className="eyebrow mb-4">Studio</p>
          <h1 className="mb-10 font-display text-5xl italic text-onyx md:text-6xl">Contact</h1>

          <ul className="space-y-6 font-body text-charcoal">
            <li className="flex gap-3">
              <span className="text-champagne">📍</span>
              <span>Melbourne, Victoria, Australia</span>
            </li>
            <li className="flex gap-3">
              <span className="text-champagne">📞</span>
              <a href="tel:+61300000000" className="hover:text-champagne">
                +61 3 XXXX XXXX
              </a>
            </li>
            <li className="flex gap-3">
              <span className="text-champagne">✉️</span>
              <a href="mailto:info@vivabloomdecor.com.au" className="hover:text-champagne">
                info@vivabloomdecor.com.au
              </a>
            </li>
          </ul>

          <div className="mt-10 flex gap-6 text-charcoal">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IconInstagram className="h-[22px] w-[22px] hover:text-champagne" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <IconFacebook className="h-[22px] w-[22px] hover:text-champagne" />
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <PinterestIcon className="h-[22px] w-[22px] hover:text-champagne" />
            </a>
          </div>

          <div className="mt-12 aspect-video w-full overflow-hidden rounded-sm border border-charcoal/10">
            <iframe
              title="Melbourne map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d805184.0437066072!2d144.59965462922837!3d-37.97168704876687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad646b5d2e4f503%3A0xa568d2d5a379e35a!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sau!4v1710000000000!5m2!1sen!2sau"
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
