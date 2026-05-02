import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Vivabloom — Meet the Team",
  description:
    "Meet Vivian and the Vivabloom team. A decade of luxury event décor, 500+ events, and a passion for creating unforgettable celebrations.",
  alternates: { canonical: "https://vivabloomdecor.com.au/about" },
};

const HERO =
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80";

const VIVIAN =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&q=80";

const team = [
  {
    name: "Vivian",
    role: "Founder & Creative Director",
    bio: "Obsessed with detail and the emotional arc of a celebration — from first sketch to final bow.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
  },
  {
    name: "Alex Morgan",
    role: "Lead Stylist",
    bio: "Transforms briefs into cohesive environments with calm leadership on the floor.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
  },
  {
    name: "Sam Rivera",
    role: "Production Manager",
    bio: "Keeps timelines, vendors, and installs aligned so you can stay present in the moment.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
  },
];

const values = [
  {
    title: "Precision",
    body: "Every stem, fold, and finish is considered — nothing is accidental.",
  },
  {
    title: "Warmth",
    body: "Luxury that feels inviting, never cold — celebrations are for people first.",
  },
  {
    title: "Story",
    body: "Your narrative drives the design; we amplify it with craft and care.",
  },
  {
    title: "Trust",
    body: "Transparent planning and dependable delivery, from enquiry to pack-down.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-ivory">
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden pt-20">
        <Image src={HERO} alt="" fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-[#0F0E0C]/60" />
        <div className="relative z-10 px-[5%] text-center">
          <p className="eyebrow-light mb-4">Our Story</p>
          <h1 className="font-display text-5xl italic text-white md:text-7xl">The Story Behind Vivabloom</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-[5%] py-24 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
          <Image src={VIVIAN} alt="Vivian" fill className="object-cover object-top" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
        <div>
          <p className="eyebrow mb-6">Founder</p>
          <h2 className="mb-6 font-display text-4xl italic text-onyx md:text-5xl">
            Vivian — <span className="text-champagne">vision, heart, and craft</span>
          </h2>
          <div className="space-y-6 font-body leading-[1.85] text-charcoal">
            <p>
              Vivabloom began as a quiet promise: that milestone moments deserve environments as considered as
              the feelings inside them. What started as intimate floral work has grown into full-scale
              styling and production — always with the same through-line of listening first.
            </p>
            <p>
              Today we partner with couples, brands, and families who want their events to feel editorial yet
              deeply personal. We bring Melbourne-based artistry with a warm, meticulous touch.
            </p>
            <p>
              Whether it&apos;s a single statement arch or a multi-day program, we show up with clarity,
              kindness, and an uncompromising eye.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F5EE] px-[5%] py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow mb-4 text-center">People</p>
          <h2 className="mb-16 text-center font-display text-4xl italic text-onyx md:text-5xl">The Team</h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {team.map((m) => (
              <div key={m.name} className="text-center">
                <div className="relative mx-auto mb-6 aspect-[3/4] max-w-[280px] overflow-hidden rounded-sm">
                  <Image src={m.image} alt={m.name} fill className="object-cover" sizes="280px" />
                </div>
                <h3 className="font-display text-2xl italic text-onyx">{m.name}</h3>
                <p className="mt-2 font-body text-[11px] uppercase tracking-[0.2em] text-champagne">{m.role}</p>
                <p className="mt-4 font-body text-sm leading-relaxed text-charcoal/90">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-[5%] py-24">
        <p className="eyebrow mb-4 text-center">Principles</p>
        <h2 className="mb-16 text-center font-display text-4xl italic text-onyx md:text-5xl">What We Stand For</h2>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-sm border border-champagne/25 bg-ivory p-10 shadow-sm"
            >
              <p className="mb-4 text-2xl text-champagne">✦</p>
              <h3 className="font-display text-2xl italic text-onyx">{v.title}</h3>
              <p className="mt-4 font-body leading-relaxed text-charcoal">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-champagne/20 bg-onyx px-[5%] py-16">
        <p className="eyebrow-light mb-10 text-center">Press &amp; Awards</p>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-12 opacity-50 grayscale transition-all hover:grayscale-0">
          {["Vogue Living", "The Age", "Melbourne Bride", "Event Style Co."].map((name) => (
            <span key={name} className="font-display text-xl italic text-white/80">
              {name}
            </span>
          ))}
        </div>
      </section>

      <section className="px-[5%] py-24 text-center">
        <p className="eyebrow mb-4">Next step</p>
        <h2 className="mb-8 font-display text-3xl italic text-onyx md:text-4xl">Ready to plan something unforgettable?</h2>
        <Link href="/quote" className="champagne-outline-btn inline-block">
          Request a Quote
        </Link>
      </section>
    </main>
  );
}
