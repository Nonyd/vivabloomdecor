"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publicServices } from "@/lib/public-services";
import AnimatedHeading from "@/components/public/AnimatedHeading";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

function ServiceCard({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle: string;
  image: string;
}) {
  return (
    <Link
      href="/services"
      className="service-card group relative block overflow-hidden opacity-0"
      style={{ height: "clamp(320px, 50vw, 480px)" }}
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        quality={85}
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C] via-[#0F0E0C]/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-90" />
      <div className="absolute bottom-0 left-0 right-0 translate-y-3 p-8 transition-transform duration-500 group-hover:translate-y-0">
        <p className="mb-2 font-body text-[10px] uppercase tracking-[0.3em] text-[#C9A96E] opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
          {subtitle}
        </p>
        <h3 className="font-display text-[32px] italic leading-tight text-white">{title}</h3>
        <div className="mt-3 flex items-center gap-2 opacity-0 transition-opacity delay-150 duration-300 group-hover:opacity-100">
          <span className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">Explore</span>
          <ArrowRight size={14} className="text-[#C9A96E]" />
        </div>
      </div>
    </Link>
  );
}

export type ServicesSectionProps = {
  hideHeader?: boolean;
  eyebrow?: string;
  headline?: string;
};

export default function ServicesSection({
  hideHeader,
  eyebrow = "What We Do",
  headline = "Our Services",
}: ServicesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      sectionRef.current?.querySelectorAll(".service-card").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
      });
      return;
    }

    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".service-card",
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".services-grid",
            start: "top 80%",
            once: true,
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0F0E0C]">
      {!hideHeader ? (
        <div className="px-[5%] pb-16 pt-24 text-center">
          <p className="mb-4 font-body text-[10px] uppercase tracking-[0.35em] text-[#C9A96E]">{eyebrow}</p>
          <AnimatedHeading tag="h2" className="font-display text-[56px] italic leading-tight text-white">
            {headline}
          </AnimatedHeading>
        </div>
      ) : (
        <div className="pt-8" />
      )}
      <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {publicServices.map((service) => (
          <ServiceCard key={service.id} title={service.title} subtitle={service.subtitle} image={service.image} />
        ))}
      </div>
    </section>
  );
}
