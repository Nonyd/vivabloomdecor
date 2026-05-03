import dynamic from "next/dynamic";
import HeroSection from "@/components/public/HeroSection";
import { prisma } from "@/lib/prisma";
import { getPageContent, get } from "@/lib/content";

const BrandStatement = dynamic(() => import("@/components/public/BrandStatement"));
const ServicesSection = dynamic(() => import("@/components/public/ServicesSection"));
const GalleryPreview = dynamic(() => import("@/components/public/GalleryPreview"), { ssr: false });
const TestimonialsSection = dynamic(() => import("@/components/public/TestimonialsSection"), {
  ssr: false,
});
const AboutPreview = dynamic(() => import("@/components/public/AboutPreview"));
const QuoteCTA = dynamic(() => import("@/components/public/QuoteCTA"));

export default async function HomePage() {
  const contentPromise = getPageContent("home");
  let galleryItems: Awaited<ReturnType<typeof prisma.galleryItem.findMany>> = [];
  let testimonials: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  try {
    [galleryItems, testimonials] = await Promise.all([
      prisma.galleryItem.findMany({
        where: { featured: true },
        orderBy: { order: "asc" },
        take: 8,
      }),
      prisma.testimonial.findMany({
        where: { approved: true, featured: true },
        take: 5,
      }),
    ]);
  } catch {
    // DB unavailable at build — render with empty sections
  }
  const content = await contentPromise;

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
        <HeroSection
          eyebrow={get(content, "hero", "eyebrow")}
          headline1={get(content, "hero", "headline_1")}
          headline2={get(content, "hero", "headline_2")}
          subheadline={get(content, "hero", "subheadline")}
          ctaPrimary={get(content, "hero", "cta_primary")}
          ctaSecondary={get(content, "hero", "cta_secondary")}
          image={get(content, "hero", "image")}
        />
        <BrandStatement
          quote={get(content, "brand_statement", "quote")}
          body={get(content, "brand_statement", "body")}
          stats={[
            {
              value: get(content, "brand_statement", "stat_1_value", "10+"),
              label: get(content, "brand_statement", "stat_1_label", "Years of Excellence"),
            },
            {
              value: get(content, "brand_statement", "stat_2_value", "500+"),
              label: get(content, "brand_statement", "stat_2_label", "Events Delivered"),
            },
            {
              value: get(content, "brand_statement", "stat_3_value", "3"),
              label: get(content, "brand_statement", "stat_3_label", "Cities Served"),
            },
            {
              value: get(content, "brand_statement", "stat_4_value", "5★"),
              label: get(content, "brand_statement", "stat_4_label", "Average Rating"),
            },
          ]}
        />
        <ServicesSection
          eyebrow={get(content, "services_intro", "eyebrow")}
          headline={get(content, "services_intro", "headline")}
        />
        <GalleryPreview items={galleryItems} />
        <TestimonialsSection testimonials={testimonials} />
        <AboutPreview
          eyebrow={get(content, "about_preview", "eyebrow")}
          headline={get(content, "about_preview", "headline")}
          body1={get(content, "about_preview", "body_1")}
          pullquote={get(content, "about_preview", "pullquote")}
          body2={get(content, "about_preview", "body_2")}
          image={get(content, "about_preview", "image")}
          ctaLabel={get(content, "about_preview", "cta_label")}
        />
        <QuoteCTA
          eyebrow={get(content, "quote_cta", "eyebrow")}
          headline1={get(content, "quote_cta", "headline_1")}
          headline2={get(content, "quote_cta", "headline_2")}
          body={get(content, "quote_cta", "body")}
          ctaLabel={get(content, "quote_cta", "cta_label")}
          image={get(content, "quote_cta", "image")}
        />
      </main>
    </>
  );
}
