import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultContent: { page: string; section: string; key: string; value: string }[] = [
  { page: "home", section: "hero", key: "eyebrow", value: "Australia's Premier Event Décor Studio" },
  { page: "home", section: "hero", key: "headline_1", value: "Crafting Moments" },
  { page: "home", section: "hero", key: "headline_2", value: "of Exquisite Beauty" },
  {
    page: "home",
    section: "hero",
    key: "subheadline",
    value:
      "From intimate gatherings to grand celebrations — we design unforgettable experiences that tell your story.",
  },
  { page: "home", section: "hero", key: "cta_primary", value: "Explore Our Work" },
  { page: "home", section: "hero", key: "cta_secondary", value: "Request a Quote" },
  {
    page: "home",
    section: "hero",
    key: "image",
    value: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920",
  },
  { page: "home", section: "brand_statement", key: "quote", value: "Every event is a story. We make it unforgettable." },
  {
    page: "home",
    section: "brand_statement",
    key: "body",
    value:
      "At Vivabloom, we believe every celebration should feel seamless, beautiful, and deeply personal. From florals to full productions, we bring your vision to life with flawless precision.",
  },
  { page: "home", section: "brand_statement", key: "stat_1_value", value: "10+" },
  { page: "home", section: "brand_statement", key: "stat_1_label", value: "Years of Excellence" },
  { page: "home", section: "brand_statement", key: "stat_2_value", value: "500+" },
  { page: "home", section: "brand_statement", key: "stat_2_label", value: "Events Delivered" },
  { page: "home", section: "brand_statement", key: "stat_3_value", value: "3" },
  { page: "home", section: "brand_statement", key: "stat_3_label", value: "Cities Served" },
  { page: "home", section: "brand_statement", key: "stat_4_value", value: "5★" },
  { page: "home", section: "brand_statement", key: "stat_4_label", value: "Average Rating" },
  { page: "home", section: "services_intro", key: "eyebrow", value: "What We Do" },
  { page: "home", section: "services_intro", key: "headline", value: "Our Services" },
  { page: "home", section: "about_preview", key: "eyebrow", value: "The Mind Behind the Magic" },
  { page: "home", section: "about_preview", key: "headline", value: "Hi there, I'm Vivian" },
  {
    page: "home",
    section: "about_preview",
    key: "body_1",
    value:
      "Vivabloom was born from my obsession with detail and my love of creating truly precious moments. For me, it's never just about flowers or balloons or draping — it's about feelings, and the stories we tell.",
  },
  {
    page: "home",
    section: "about_preview",
    key: "pullquote",
    value:
      '"I make every event personal. I believe in the magic of perfectly executed, deeply felt celebrations."',
  },
  {
    page: "home",
    section: "about_preview",
    key: "body_2",
    value:
      "Every collaboration begins with listening — truly understanding your vision — then building something that makes your day feel extraordinary and entirely your own.",
  },
  {
    page: "home",
    section: "about_preview",
    key: "image",
    value: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
  },
  { page: "home", section: "about_preview", key: "cta_label", value: "Meet the Full Team" },
  { page: "home", section: "quote_cta", key: "eyebrow", value: "Let's Create Together" },
  { page: "home", section: "quote_cta", key: "headline_1", value: "Your Dream Event" },
  { page: "home", section: "quote_cta", key: "headline_2", value: "Starts Here" },
  {
    page: "home",
    section: "quote_cta",
    key: "body",
    value:
      "Every extraordinary event begins with a single conversation. Tell us your vision and we'll make it a reality.",
  },
  { page: "home", section: "quote_cta", key: "cta_label", value: "Request a Quote" },
  {
    page: "home",
    section: "quote_cta",
    key: "image",
    value: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920",
  },
  { page: "services", section: "hero", key: "headline", value: "Our Services" },
  {
    page: "services",
    section: "hero",
    key: "subheadline",
    value: "Everything you need for an extraordinary event, under one roof.",
  },
  {
    page: "services",
    section: "hero",
    key: "image",
    value: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920",
  },
  { page: "services", section: "floral", key: "title", value: "Floral Design" },
  { page: "services", section: "floral", key: "subtitle", value: "Nature's beauty, curated" },
  {
    page: "services",
    section: "floral",
    key: "body",
    value:
      "From lush centrepieces to breathtaking ceremony arches, our floral designs transform any space into a living work of art.",
  },
  { page: "services", section: "floral", key: "pricing", value: "Starting from $800" },
  {
    page: "services",
    section: "floral",
    key: "image",
    value: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  },
  { page: "services", section: "balloon", key: "title", value: "Balloon Artistry" },
  { page: "services", section: "balloon", key: "subtitle", value: "Sculptural, joyful, bold" },
  {
    page: "services",
    section: "balloon",
    key: "body",
    value:
      "Our balloon installations go far beyond bunches — think sculptural columns, organic clouds, and custom colour-matched displays.",
  },
  { page: "services", section: "balloon", key: "pricing", value: "Starting from $400" },
  {
    page: "services",
    section: "balloon",
    key: "image",
    value: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
  },
  { page: "services", section: "wedding", key: "title", value: "Wedding Styling" },
  { page: "services", section: "wedding", key: "subtitle", value: "Your day, perfectly told" },
  {
    page: "services",
    section: "wedding",
    key: "body",
    value:
      "Full wedding styling from ceremony to reception. We work with your vision to create a cohesive, breathtaking aesthetic throughout.",
  },
  { page: "services", section: "wedding", key: "pricing", value: "Starting from $2,500" },
  {
    page: "services",
    section: "wedding",
    key: "image",
    value: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
  },
  { page: "services", section: "corporate", key: "title", value: "Corporate Events" },
  { page: "services", section: "corporate", key: "subtitle", value: "Impressions that last" },
  {
    page: "services",
    section: "corporate",
    key: "body",
    value:
      "From product launches to gala dinners, we create corporate environments that reflect your brand and impress your guests.",
  },
  { page: "services", section: "corporate", key: "pricing", value: "Starting from $1,500" },
  {
    page: "services",
    section: "corporate",
    key: "image",
    value: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
  },
  { page: "services", section: "draping", key: "title", value: "Backdrop & Draping" },
  { page: "services", section: "draping", key: "subtitle", value: "Atmosphere in every fold" },
  {
    page: "services",
    section: "draping",
    key: "body",
    value:
      "Ceiling draping, backdrop walls, fabric installations — we use fabric, light, and texture to completely transform your venue.",
  },
  { page: "services", section: "draping", key: "pricing", value: "Starting from $600" },
  {
    page: "services",
    section: "draping",
    key: "image",
    value: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800",
  },
  { page: "services", section: "production", key: "title", value: "Full Production" },
  { page: "services", section: "production", key: "subtitle", value: "End-to-end event mastery" },
  {
    page: "services",
    section: "production",
    key: "body",
    value:
      "Let us handle everything. From concept to strike, our full production service covers every detail so you can be fully present on your day.",
  },
  { page: "services", section: "production", key: "pricing", value: "Starting from $5,000" },
  {
    page: "services",
    section: "production",
    key: "image",
    value: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
  },
  { page: "about", section: "hero", key: "headline", value: "The Story Behind Vivabloom" },
  { page: "about", section: "hero", key: "subheadline", value: "A decade of luxury, a lifetime of passion." },
  {
    page: "about",
    section: "hero",
    key: "image",
    value: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920",
  },
  { page: "about", section: "vivian_bio", key: "headline", value: "Hi there, I'm Vivian" },
  {
    page: "about",
    section: "vivian_bio",
    key: "body_1",
    value:
      "Vivabloom was born from my obsession with detail and my love of creating truly precious moments.",
  },
  {
    page: "about",
    section: "vivian_bio",
    key: "body_2",
    value:
      "With over a decade in the industry, I've had the privilege of styling hundreds of events across Melbourne and beyond.",
  },
  {
    page: "about",
    section: "vivian_bio",
    key: "body_3",
    value:
      "Every collaboration begins with listening — truly understanding your vision — then building something extraordinary.",
  },
  {
    page: "about",
    section: "vivian_bio",
    key: "pullquote",
    value:
      '"I make every event personal. I believe in the magic of perfectly executed, deeply felt celebrations."',
  },
  {
    page: "about",
    section: "vivian_bio",
    key: "image",
    value: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
  },
  { page: "about", section: "values", key: "headline", value: "What We Stand For" },
  { page: "about", section: "values", key: "value_1_title", value: "Obsessive Detail" },
  {
    page: "about",
    section: "values",
    key: "value_1_body",
    value: "Every petal, every fold, every light placement — nothing is too small to perfect.",
  },
  { page: "about", section: "values", key: "value_2_title", value: "Deep Personalisation" },
  {
    page: "about",
    section: "values",
    key: "value_2_body",
    value: "No two events look the same. Every design starts with your story.",
  },
  { page: "about", section: "values", key: "value_3_title", value: "Flawless Execution" },
  {
    page: "about",
    section: "values",
    key: "value_3_body",
    value: "On the day, you relax. We handle every detail from arrival to strike.",
  },
  { page: "about", section: "values", key: "value_4_title", value: "Lasting Memories" },
  {
    page: "about",
    section: "values",
    key: "value_4_body",
    value: "We measure success not in hours but in the memories your guests carry for years.",
  },
  { page: "contact", section: "hero", key: "headline", value: "Get In Touch" },
  {
    page: "contact",
    section: "hero",
    key: "subheadline",
    value: "We'd love to hear about your upcoming event.",
  },
  { page: "contact", section: "details", key: "address", value: "Melbourne, Victoria, Australia" },
  { page: "contact", section: "details", key: "phone", value: "+61 3 XXXX XXXX" },
  { page: "contact", section: "details", key: "email", value: "info@vivabloomdecor.com.au" },
  { page: "contact", section: "details", key: "hours", value: "Mon–Fri 9am–6pm AEST" },
  { page: "contact", section: "details", key: "response_time", value: "We respond within 24 hours" },
  { page: "quote", section: "hero", key: "headline", value: "Request a Quote" },
  {
    page: "quote",
    section: "hero",
    key: "subheadline",
    value: "Tell us about your event and we'll craft a personalised proposal just for you.",
  },
];

async function main() {
  for (const item of defaultContent) {
    await prisma.pageContent.upsert({
      where: {
        page_section_key: { page: item.page, section: item.section, key: item.key },
      },
      update: {},
      create: item,
    });
  }
  console.log(`✓ Seeded ${defaultContent.length} content items`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
