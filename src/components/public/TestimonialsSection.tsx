"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Testimonial } from "@prisma/client";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  testimonials: Testimonial[];
};

export default function TestimonialsSection({ testimonials }: Props) {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      if (sectionRef.current) sectionRef.current.style.opacity = "1";
      return;
    }
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".testimonials-section",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          scrollTrigger: { trigger: ".testimonials-section", start: "top 85%", once: true },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (testimonials.length === 0) {
    return (
      <section
        ref={sectionRef}
        className="testimonials-section relative overflow-hidden bg-[#0F0E0C] px-[5%] py-28"
        style={{ opacity: prefersReducedMotion() ? 1 : 0 }}
      >
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="eyebrow-light mb-8">What Our Clients Say</p>
          <p className="font-body text-white/50">Testimonials coming soon.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="testimonials-section relative overflow-hidden bg-[#0F0E0C] px-[5%] py-28"
      style={{ opacity: prefersReducedMotion() ? 1 : 0 }}
    >
      <span className="pointer-events-none absolute left-[5%] top-16 select-none font-display text-[200px] leading-none text-[#C9A96E]/5">
        &ldquo;
      </span>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="eyebrow-light mb-16">What Our Clients Say</p>

        <div className="relative min-h-[260px]">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${
                i === active ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
              }`}
            >
              <div className="mb-8 flex gap-1">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} size={16} fill="#C9A96E" className="text-[#C9A96E]" />
                ))}
              </div>
              <blockquote className="max-w-3xl font-display text-[28px] italic leading-[1.25] text-white md:text-[36px]">
                &ldquo;{t.content}&rdquo;
              </blockquote>
              <div className="mt-8 flex flex-col items-center gap-1">
                {t.imageUrl ? (
                  <Image
                    src={t.imageUrl}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="mb-2 rounded-full object-cover"
                  />
                ) : null}
                <p className="font-body text-[13px] uppercase tracking-[0.2em] text-[#C9A96E]">{t.name}</p>
                {t.role ? <p className="font-body text-[12px] text-white/40">{t.role}</p> : null}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center gap-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active ? "h-1.5 w-8 bg-[#C9A96E]" : "h-1.5 w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
