import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Selected events and styling work — Vivabloom Decor.",
};

const IMG =
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80";

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-ivory pt-20">
      <section className="relative flex min-h-[45vh] items-center justify-center overflow-hidden">
        <Image src={IMG} alt="" fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-onyx/55" />
        <div className="relative z-10 px-[5%] text-center">
          <p className="eyebrow-light mb-4">Curated work</p>
          <h1 className="font-display text-5xl italic text-white md:text-6xl">Portfolio</h1>
          <p className="mx-auto mt-6 max-w-xl font-body text-white/80">
            A snapshot of recent celebrations — explore the full gallery for category-led inspiration.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-[5%] py-20 text-center">
        <p className="font-body leading-relaxed text-charcoal">
          Case-study pages for individual events will expand here. Until then, browse every image and category in
          our gallery.
        </p>
        <Link href="/gallery" className="champagne-outline-btn mt-10 inline-block">
          Open gallery
        </Link>
      </section>
    </main>
  );
}
