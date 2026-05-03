"use client";

import { useEffect, useRef } from "react";
import AnimatedHeading from "@/components/public/AnimatedHeading";
import BrandDividerReveal from "@/components/public/BrandDividerReveal";
import ScrollReveal from "@/components/public/ScrollReveal";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

export type BrandStat = { value: string; label: string };

const defaultStats: BrandStat[] = [
  { value: "10+", label: "Years of Excellence" },
  { value: "500+", label: "Events Delivered" },
  { value: "3", label: "Cities Served" },
  { value: "5★", label: "Average Rating" },
];

function parseCounterParts(value: string): { target: number; suffix: string } | null {
  const m = value.match(/^(\d+)(.*)$/);
  if (!m) return null;
  return { target: parseInt(m[1], 10), suffix: m[2] ?? "" };
}

export type BrandStatementProps = {
  quote?: string;
  body?: string;
  stats?: BrandStat[];
};

export default function BrandStatement({
  quote = "Every event is a story.\nWe make it unforgettable.",
  body = "At Vivabloom, we believe every celebration should feel seamless, beautiful, and deeply personal. From florals to full productions, we bring your vision to life with flawless precision.",
  stats = defaultStats,
}: BrandStatementProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const els = sectionRef.current?.querySelectorAll(".stat-value");
      stats.forEach((stat, i) => {
        const parsed = parseCounterParts(stat.value);
        if (!parsed || !els?.[i]) return;
        (els[i] as HTMLElement).textContent = `${parsed.target}${parsed.suffix}`;
      });
      return;
    }

    const counters = sectionRef.current?.querySelectorAll(".stat-value") ?? [];
    const ctx = gsap.context(() => {
      counters.forEach((el) => {
        const target = el.getAttribute("data-target") ?? "";
        const suffix = el.getAttribute("data-suffix") ?? "";
        const isNumeric = /^\d+$/.test(target);
        if (!isNumeric) return;

        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: parseInt(target, 10),
              duration: 1.8,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${Math.round(obj.val)}${suffix}`;
              },
            });
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [stats]);

  return (
    <section ref={sectionRef} className="bg-[#F8F5EE] px-[5%] py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_auto]">
        <div>
          <ScrollReveal>
            <span className="-mb-8 block font-display text-[120px] leading-none text-[#C9A96E]/20">
              &ldquo;
            </span>
            <AnimatedHeading
              tag="h2"
              className="brand-quote max-w-2xl whitespace-pre-line font-display italic leading-[1.1] text-[#0F0E0C] md:text-[52px]"
            >
              {quote}
            </AnimatedHeading>
          </ScrollReveal>
          <BrandDividerReveal />
          <ScrollReveal delay={100}>
            <p className="max-w-lg font-body text-base leading-relaxed text-[#4A4843]">{body}</p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={150} className="w-full max-w-md lg:max-w-none">
          <div className="grid grid-cols-2 gap-px rounded-sm border border-[#C9A96E]/20 bg-[#C9A96E]/20">
            {stats.map((stat) => {
              const parsed = parseCounterParts(stat.value);
              return (
                <div key={stat.label} className="bg-[#F8F5EE] p-8 text-center md:p-10">
                  <p
                    className="stat-value font-display text-[52px] italic leading-none text-[#0F0E0C]"
                    {...(parsed
                      ? {
                          "data-target": String(parsed.target),
                          "data-suffix": parsed.suffix,
                        }
                      : {})}
                  >
                    {parsed ? `0${parsed.suffix}` : stat.value}
                  </p>
                  <p className="mt-2 font-body text-[10px] uppercase tracking-[0.25em] text-[#C9A96E]">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
