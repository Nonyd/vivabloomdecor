"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const VIVIAN_IMAGE =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80";

export default function AboutPreview() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      rootRef.current?.querySelectorAll(".about-image-wrap, .about-frame, .about-text-item").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
        (el as HTMLElement).style.clipPath = "none";
      });
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-image-wrap",
        { clipPath: "inset(100% 0 0 0)", y: 20 },
        {
          clipPath: "inset(0% 0 0 0)",
          y: 0,
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: { trigger: ".about-image-wrap", start: "top 80%", once: true },
        }
      );
      gsap.fromTo(
        ".about-frame",
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.4,
          scrollTrigger: { trigger: ".about-image-wrap", start: "top 80%", once: true },
        }
      );
      gsap.fromTo(
        ".about-text-item",
        { opacity: 0, x: 24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".about-content", start: "top 80%", once: true },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="bg-[#F8F5EE] px-[5%] py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-20 lg:grid-cols-2">
        <div className="relative">
          <div className="about-image-wrap relative z-10 overflow-hidden rounded-sm" style={{ aspectRatio: "4/5", opacity: 0 }}>
            <Image
              src={VIVIAN_IMAGE}
              alt="Vivian, Founder of Vivabloom"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={85}
            />
          </div>
          <div
            className="about-frame absolute bottom-[-24px] left-6 right-[-24px] top-6 z-0 rounded-sm border border-[#C9A96E]/50"
            style={{ opacity: 0 }}
          />
        </div>

        <div className="about-content">
          <p className="about-text-item eyebrow mb-6" style={{ opacity: 0 }}>
            The Mind Behind the Magic
          </p>
          <h2
            className="about-text-item mb-2 font-display text-[52px] italic leading-tight text-[#0F0E0C]"
            style={{ opacity: 0 }}
          >
            Hi there, I&apos;m <em className="text-[#C9A96E]">Vivian</em>
          </h2>
          <div className="about-text-item my-8 h-px w-16 bg-[#C9A96E]" style={{ opacity: 0 }} />
          <p className="about-text-item mb-6 font-body text-base leading-[1.8] text-[#4A4843]" style={{ opacity: 0 }}>
            Vivabloom was born from my obsession with detail and my love of creating truly precious moments.
            For me, it&apos;s never just about flowers or balloons or draping — it&apos;s about flowers,
            feelings, and the stories we tell.
          </p>
          <blockquote className="about-text-item my-8 border-l-2 border-[#C9A96E] pl-6" style={{ opacity: 0 }}>
            <p className="font-display text-[24px] italic leading-tight text-[#0F0E0C]">
              &ldquo;I make every event personal. I believe in the magic of perfectly executed, deeply felt
              celebrations.&rdquo;
            </p>
          </blockquote>
          <p className="about-text-item mb-10 font-body text-base leading-[1.8] text-[#4A4843]" style={{ opacity: 0 }}>
            Every collaboration begins with listening — truly understanding your vision — then building
            something that makes your day feel extraordinary and entirely your own.
          </p>
          <div className="about-text-item mb-10 flex flex-wrap gap-10" style={{ opacity: 0 }}>
            {[
              { icon: "✦", label: "5-Star Experiences" },
              { icon: "✦", label: "10+ Years Practice" },
              { icon: "✦", label: "500+ Events Planned" },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-body text-[10px] uppercase tracking-[0.25em] text-[#C9A96E]">
                  {item.icon} {item.label}
                </p>
              </div>
            ))}
          </div>
          <Link href="/about" className="about-text-item champagne-outline-btn inline-block" style={{ opacity: 0 }}>
            Meet the Full Team
          </Link>
        </div>
      </div>
    </section>
  );
}
