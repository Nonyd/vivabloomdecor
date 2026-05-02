"use client";

import { useEffect, useRef } from "react";
import AnimatedHeading from "@/components/public/AnimatedHeading";
import BrandDividerReveal from "@/components/public/BrandDividerReveal";
import ScrollReveal from "@/components/public/ScrollReveal";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

const stats = [
  { label: "Years of Excellence", target: 10, suffix: "+" },
  { label: "Events Delivered", target: 500, suffix: "+" },
  { label: "Cities Served", target: 3, suffix: "" },
  { label: "Average Rating", display: "5★", target: null as number | null },
];

export default function BrandStatement() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const els = sectionRef.current?.querySelectorAll(".stat-value");
      stats.forEach((stat, i) => {
        if (stat.target === null || !els?.[i]) return;
        (els[i] as HTMLElement).textContent = `${stat.target}${stat.suffix}`;
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
  }, []);

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
              {"Every event is a story.\nWe make it unforgettable."}
            </AnimatedHeading>
          </ScrollReveal>
          <BrandDividerReveal />
          <ScrollReveal delay={100}>
            <p className="max-w-lg font-body text-base leading-relaxed text-[#4A4843]">
              At Vivabloom, we believe every celebration should feel seamless, beautiful, and deeply personal.
              From florals to full productions, we bring your vision to life with flawless precision.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={150} className="w-full max-w-md lg:max-w-none">
          <div className="grid grid-cols-2 gap-px rounded-sm border border-[#C9A96E]/20 bg-[#C9A96E]/20">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#F8F5EE] p-8 text-center md:p-10">
                <p
                  className="stat-value font-display text-[52px] italic leading-none text-[#0F0E0C]"
                  {...(stat.target !== null
                    ? {
                        "data-target": String(stat.target),
                        "data-suffix": stat.suffix,
                      }
                    : {})}
                >
                  {stat.display ?? `0${stat.suffix}`}
                </p>
                <p className="mt-2 font-body text-[10px] uppercase tracking-[0.25em] text-[#C9A96E]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
