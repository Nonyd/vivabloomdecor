import type { Metadata } from "next";
import GalleryGrid from "@/components/public/GalleryGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Gallery — Event Décor Portfolio",
  description:
    "Browse our portfolio of luxury weddings, corporate events, birthdays, and bespoke celebrations across Melbourne and Australia.",
  alternates: { canonical: "https://vivabloomdecor.com.au/gallery" },
};

export default async function GalleryPage() {
  let items: Awaited<ReturnType<typeof prisma.galleryItem.findMany>> = [];
  try {
    items = await prisma.galleryItem.findMany({
      orderBy: { order: "asc" },
    });
  } catch {
    items = [];
  }

  return (
    <main className="min-h-screen bg-[#F8F5EE] pt-20">
      <div className="px-[5%] py-16 text-center">
        <p className="eyebrow mb-4">Portfolio</p>
        <h1 className="font-display text-5xl italic text-onyx md:text-6xl">Gallery</h1>
        <p className="mx-auto mt-4 max-w-xl font-body text-charcoal/80">
          A curated selection of our recent installations and celebrations.
        </p>
      </div>
      <GalleryGrid items={items} />
    </main>
  );
}
