"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryItem } from "@prisma/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  items: GalleryItem[];
};

export default function GalleryGrid({ items }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const [filter, setFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  const open = lightboxIndex !== null;
  const current = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  useEffect(() => {
    setLightboxIndex(null);
  }, [filter]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      gridRef.current?.querySelectorAll(".gallery-item").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }

    const grid = gridRef.current;
    if (!grid) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gallery-item",
        { opacity: 0, scale: 0.97 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: { amount: 0.8, from: "start" },
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gallery-masonry",
            start: "top 85%",
            once: true,
          },
        }
      );
    }, grid);

    return () => ctx.revert();
  }, [filtered]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft" && lightboxIndex !== null && filtered.length) {
        setLightboxIndex((lightboxIndex + filtered.length - 1) % filtered.length);
      }
      if (e.key === "ArrowRight" && lightboxIndex !== null && filtered.length) {
        setLightboxIndex((lightboxIndex + 1) % filtered.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lightboxIndex, filtered.length]);

  return (
    <>
      <div className="border-b border-[#C9A96E]/20 bg-[#F8F5EE] px-[5%] py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={cn(
                "rounded-full border px-5 py-2 font-body text-[11px] uppercase tracking-[0.2em] transition-colors",
                filter === c
                  ? "border-[#C9A96E] bg-[#C9A96E] text-[#0F0E0C]"
                  : "border-[#C9A96E]/40 text-[#4A4843] hover:border-[#C9A96E]"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={gridRef}
        className="gallery-masonry columns-1 gap-3 bg-[#F8F5EE] px-[3%] py-16 md:columns-2 lg:columns-3"
        style={{ columnGap: "12px" }}
      >
        {filtered.map((item, i) => (
          <div
            key={item.id}
            className="gallery-item group relative mb-3 cursor-pointer break-inside-avoid overflow-hidden opacity-0"
            onClick={() => setLightboxIndex(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setLightboxIndex(i);
            }}
            role="button"
            tabIndex={0}
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={80}
              loading="lazy"
              className="h-auto w-full transition-transform duration-700 group-hover:scale-105"
              style={{ height: "auto", width: "100%" }}
            />
            <div className="absolute inset-0 flex items-end bg-[#0F0E0C]/0 p-5 transition-all duration-500 group-hover:bg-[#0F0E0C]/50">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                  {item.category}
                </p>
                <span className="translate-y-2 font-display text-xl italic text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.title}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(v) => !v && setLightboxIndex(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden border-0 bg-[#0F0E0C] p-0">
          {current ? (
            <div className="relative aspect-[4/3] w-full md:aspect-video">
              <Image
                src={current.imageUrl}
                alt={current.title}
                fill
                className="object-contain p-4"
                sizes="100vw"
              />
              <button
                type="button"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                aria-label="Previous"
                onClick={() =>
                  setLightboxIndex((i) =>
                    i === null ? 0 : (i + filtered.length - 1) % filtered.length
                  )
                }
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                onClick={() =>
                  setLightboxIndex((i) => (i === null ? 0 : (i + 1) % filtered.length))
                }
                aria-label="Next"
              >
                <ChevronRight size={28} />
              </button>
              <p className="absolute bottom-4 left-0 right-0 text-center font-display text-lg italic text-white/90">
                {current.title}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
