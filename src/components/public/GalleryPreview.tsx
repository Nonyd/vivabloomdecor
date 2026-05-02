"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryItem } from "@prisma/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import AnimatedHeading from "@/components/public/AnimatedHeading";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  items: GalleryItem[];
};

export default function GalleryPreview({ items }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const masonryRef = useRef<HTMLDivElement>(null);

  const open = lightboxIndex !== null;
  const current = lightboxIndex !== null ? items[lightboxIndex] : null;

  useEffect(() => {
    if (prefersReducedMotion()) {
      masonryRef.current?.querySelectorAll(".gallery-item").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }

    const grid = masonryRef.current;
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
            trigger: ".gallery-preview-masonry",
            start: "top 85%",
            once: true,
          },
        }
      );
    }, grid);

    return () => ctx.revert();
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft" && lightboxIndex !== null) {
        setLightboxIndex((lightboxIndex + items.length - 1) % items.length);
      }
      if (e.key === "ArrowRight" && lightboxIndex !== null) {
        setLightboxIndex((lightboxIndex + 1) % items.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lightboxIndex, items.length]);

  return (
    <>
      <div className="bg-[#F8F5EE] px-[5%] py-24 text-center">
        <p className="eyebrow mb-4">Our Work</p>
        <AnimatedHeading tag="h2" className="font-display text-[56px] italic text-[#0F0E0C]">
          A Glimpse of the Magic
        </AnimatedHeading>
      </div>

      <div
        ref={masonryRef}
        className={cn(
          "gallery-preview-masonry columns-1 gap-3 bg-[#F8F5EE] px-[3%] pb-24",
          "md:columns-2 lg:columns-3"
        )}
        style={{ columnGap: "12px" }}
      >
        {items.map((item, i) => (
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
              quality={i < 3 ? 85 : 80}
              loading={i < 3 ? undefined : "lazy"}
              priority={i < 3}
              className="h-auto w-full transition-transform duration-700 group-hover:scale-105"
              style={{ height: "auto", width: "100%" }}
            />
            <div className="absolute inset-0 flex items-end bg-[#0F0E0C]/0 p-5 transition-all duration-500 group-hover:bg-[#0F0E0C]/50">
              <span className="translate-y-2 font-display text-xl italic text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {item.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pb-24 text-center">
        <Link href="/gallery" className="champagne-outline-btn">
          View Full Gallery
        </Link>
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
                    i === null ? 0 : (i + items.length - 1) % items.length
                  )
                }
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                aria-label="Next"
                onClick={() =>
                  setLightboxIndex((i) => (i === null ? 0 : (i + 1) % items.length))
                }
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
