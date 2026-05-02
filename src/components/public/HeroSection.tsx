"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = heroRef.current;
    if (prefersReducedMotion()) {
      section?.querySelectorAll(".hero-eyebrow, .hero-headline, .hero-sub, .hero-ctas, .hero-scroll-indicator").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
      });
      return;
    }
    if (!section) return;
    const img = heroImageRef.current;
    if (!img) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-eyebrow",
        { opacity: 0, y: 16, letterSpacing: "0.5em" },
        { opacity: 1, y: 0, letterSpacing: "0.35em", duration: 1 }
      )
        .fromTo(
          ".hero-headline",
          { opacity: 0, y: 40, skewY: 2 },
          { opacity: 1, y: 0, skewY: 0, duration: 1.2, stagger: 0.1 },
          "-=0.6"
        )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.8"
        )
        .fromTo(
          ".hero-ctas",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.6"
        )
        .fromTo(
          ".hero-scroll-indicator",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          "-=0.2"
        );

      gsap.to(img, {
        yPercent: 25,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[700px] items-center justify-center overflow-hidden"
      style={{ height: "100vh" }}
    >
      <div ref={heroImageRef} className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Luxury event décor by Vivabloom"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
          style={{ transform: "scale(1.05)" }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15,14,12,0.25) 0%, rgba(15,14,12,0.55) 60%, rgba(15,14,12,0.75) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <p
          className="hero-eyebrow mb-6 font-body text-[11px] uppercase tracking-[0.35em] text-[#C9A96E]"
          style={{ opacity: 0 }}
        >
          Australia&apos;s Premier Event Décor Studio
        </p>

        <h1 className="hero-headline-text font-display font-medium italic leading-[0.92] text-white">
          <span className="hero-headline block" style={{ opacity: 0 }}>
            Crafting Moments
          </span>
          <span className="hero-headline block text-[#E8D5B0]" style={{ opacity: 0 }}>
            of Exquisite Beauty
          </span>
        </h1>

        <p
          className="hero-sub mx-auto mt-8 max-w-[520px] font-body text-lg font-light leading-relaxed text-white/75"
          style={{ opacity: 0 }}
        >
          From intimate gatherings to grand celebrations — we design unforgettable experiences that tell
          your story.
        </p>

        <div className="hero-ctas mt-10 flex flex-wrap items-center justify-center gap-5" style={{ opacity: 0 }}>
          <Link
            href="/gallery"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#C9A96E] px-8 py-4 font-body text-[12px] uppercase tracking-[0.2em] text-[#0F0E0C] transition-all duration-300 hover:bg-[#E8D5B0]"
          >
            Explore Our Work
          </Link>
          <Link
            href="/quote"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/60 px-8 py-4 font-body text-[12px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-white hover:bg-white/10"
          >
            Request a Quote
          </Link>
        </div>
      </div>

      <div
        className="hero-scroll-indicator absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        style={{ opacity: 0 }}
      >
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
        <div
          className="h-12 w-px bg-gradient-to-b from-[#C9A96E] to-transparent"
          style={{ animation: "scrollLine 1.5s ease-in-out infinite" }}
        />
      </div>
    </section>
  );
}
