export type PublicServiceItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bullets: string[];
  pricingFrom: string;
};

export const publicServices: PublicServiceItem[] = [
  {
    id: "floral",
    title: "Floral Design",
    subtitle: "Nature\u2019s beauty, curated",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    bullets: [
      "Bespoke arrangements tailored to your palette and venue",
      "Seasonal blooms sourced for longevity and impact",
      "On-site styling and refresh for the full event duration",
    ],
    pricingFrom: "Starting from $1,200",
  },
  {
    id: "balloon",
    title: "Balloon Artistry",
    subtitle: "Sculptural, joyful, bold",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    bullets: [
      "Custom arches, garlands, and statement installations",
      "Premium finishes that photograph beautifully",
      "Safe, refined builds for indoor and outdoor venues",
    ],
    pricingFrom: "Starting from $850",
  },
  {
    id: "wedding",
    title: "Wedding Styling",
    subtitle: "Your day, perfectly told",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    bullets: [
      "Ceremony to reception cohesion across every detail",
      "Timeline-aware setup with a calm, coordinated team",
      "Editorial aesthetics grounded in how your day feels",
    ],
    pricingFrom: "Starting from $3,500",
  },
  {
    id: "corporate",
    title: "Corporate Events",
    subtitle: "Impressions that last",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
    bullets: [
      "Brand-forward concepts for launches, galas, and conferences",
      "Scalable production with clear run-of-show alignment",
      "Polished environments that elevate stakeholder experiences",
    ],
    pricingFrom: "Starting from $2,800",
  },
  {
    id: "draping",
    title: "Backdrop & Draping",
    subtitle: "Atmosphere in every fold",
    image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80",
    bullets: [
      "Layered textiles, lighting, and structure for depth",
      "Solutions for challenging spaces and quick turnarounds",
      "Photo-ready focal points guests remember",
    ],
    pricingFrom: "Starting from $1,500",
  },
  {
    id: "production",
    title: "Full Production",
    subtitle: "End-to-end event mastery",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    bullets: [
      "Concept through bump-out with one accountable partner",
      "Vendor coordination, styling, and on-site direction",
      "Premium execution for complex timelines and guest flows",
    ],
    pricingFrom: "Starting from $8,000",
  },
];
