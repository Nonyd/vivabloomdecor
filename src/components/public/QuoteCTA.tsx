"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const CTA_BG = "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920&q=80";

export default function QuoteCTA() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      root.querySelectorAll(".quote-cta-heading span").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".quote-cta-heading span",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".quote-cta-heading", start: "top 85%", once: true },
        }
      );

      gsap.to(".quote-cta-bg", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ".quote-cta-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="quote-cta-section relative overflow-hidden py-36">
      <Image
        src={CTA_BG}
        alt=""
        fill
        sizes="100vw"
        quality={85}
        className="quote-cta-bg object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#0F0E0C]/80" />

      <div className="relative z-10 mx-auto max-w-3xl px-[5%] text-center">
        <p className="eyebrow-light mb-6">Let&apos;s Create Together</p>
        <h2 className="quote-cta-heading mb-6 font-display text-[56px] italic leading-tight md:text-[72px]">
          <span className="block text-white" style={{ opacity: 0 }}>
            Your Dream Event
          </span>
          <span className="block text-[#C9A96E]" style={{ opacity: 0 }}>
            Starts Here
          </span>
        </h2>
        <p className="mx-auto mb-12 max-w-xl font-body text-lg font-light leading-relaxed text-white/70">
          Every extraordinary event begins with a single conversation. Tell us your vision and we&apos;ll make
          it a reality.
        </p>
        <Link
          href="/quote"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#C9A96E] px-12 py-5 font-body text-[12px] uppercase tracking-[0.2em] text-[#0F0E0C] transition-all duration-300 hover:bg-[#E8D5B0]"
        >
          Request a Quote
        </Link>
      </div>
    </section>
  );
}
