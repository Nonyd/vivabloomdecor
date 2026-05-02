import dynamic from "next/dynamic";
import HeroSection from "@/components/public/HeroSection";
import { prisma } from "@/lib/prisma";

const BrandStatement = dynamic(() => import("@/components/public/BrandStatement"));
const ServicesSection = dynamic(() => import("@/components/public/ServicesSection"));
const GalleryPreview = dynamic(() => import("@/components/public/GalleryPreview"), { ssr: false });
const TestimonialsSection = dynamic(() => import("@/components/public/TestimonialsSection"), {
  ssr: false,
});
const AboutPreview = dynamic(() => import("@/components/public/AboutPreview"));
const QuoteCTA = dynamic(() => import("@/components/public/QuoteCTA"));

export default async function HomePage() {
  let galleryItems: Awaited<ReturnType<typeof prisma.galleryItem.findMany>> = [];
  let testimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  try {
    galleryItems = await prisma.galleryItem.findMany({
      where: { featured: true },
      orderBy: { order: "asc" },
      take: 8,
    });
    testimonials = await prisma.testimonial.findMany({
      where: { approved: true, featured: true },
      take: 5,
    });
  } catch {
    // DB unavailable at build — render with empty sections
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Vivabloom Decor",
    description: "Luxury event and wedding décor studio in Melbourne, Australia",
    url: "https://vivabloomdecor.com.au",
    telephone: "+61-3-XXXX-XXXX",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Melbourne",
      addressRegion: "VIC",
      addressCountry: "AU",
    },
    geo: { "@type": "GeoCoordinates", latitude: -37.8136, longitude: 144.9631 },
    priceRange: "$$$",
    hasMap: "https://maps.google.com/?q=Melbourne+VIC",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <HeroSection />
        <BrandStatement />
        <ServicesSection />
        <GalleryPreview items={galleryItems} />
        <TestimonialsSection testimonials={testimonials} />
        <AboutPreview />
        <QuoteCTA />
      </main>
    </>
  );
}
