import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ServicesSection from "@/components/public/ServicesSection";
import { publicServices } from "@/lib/public-services";

export const metadata: Metadata = {
  title: "Our Services — Luxury Event Décor",
  description:
    "Floral design, balloon artistry, wedding styling, corporate events, backdrop & draping, and full event production. Melbourne & Australia-wide.",
  alternates: { canonical: "https://vivabloomdecor.com.au/services" },
};

const HERO =
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80";

export default function ServicesPage() {
  return (
    <main className="bg-ivory">
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden pt-20">
        <Image src={HERO} alt="" fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-[#0F0E0C]/65" />
        <div className="relative z-10 px-[5%] text-center">
          <p className="eyebrow-light mb-4">What We Do</p>
          <h1 className="font-display text-5xl italic text-white md:text-7xl">Services</h1>
        </div>
      </section>

      <ServicesSection hideHeader />

      <div className="space-y-24 bg-[#F8F5EE] px-[5%] py-24">
        {publicServices.map((service, index) => (
          <section
            key={service.id}
            id={service.id}
            className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20"
          >
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-sm lg:aspect-[5/4] ${
                index % 2 === 1 ? "lg:order-2" : ""
              }`}
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className={index % 2 === 1 ? "lg:order-1" : ""}>
              <p className="eyebrow mb-3">{service.subtitle}</p>
              <h2 className="mb-6 font-display text-4xl italic text-onyx md:text-5xl">{service.title}</h2>
              <ul className="mb-8 space-y-3 font-body text-charcoal">
                {service.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-champagne">✦</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mb-8 font-body text-sm uppercase tracking-[0.2em] text-champagne">{service.pricingFrom}</p>
              <Link
                href="/quote"
                className="inline-block rounded-full bg-champagne px-10 py-4 font-body text-[12px] uppercase tracking-[0.2em] text-onyx transition-colors hover:bg-champagne-lt"
              >
                Request a Quote
              </Link>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
