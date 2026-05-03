import { getPageContent } from "@/lib/content";
import PageEditor, { type SectionConfig } from "@/components/admin/cms/PageEditor";
import { getCloudinaryWidgetConfig } from "@/lib/settings";

const sections: SectionConfig[] = [
  {
    section: "hero",
    label: "Hero Section — the first thing visitors see",
    fields: [
      {
        key: "eyebrow",
        section: "hero",
        label: "Eyebrow Text",
        type: "text",
        placeholder: "Australia's Premier Event Décor Studio",
        hint: "Small text above the headline. Keep it short.",
      },
      { key: "headline_1", section: "hero", label: "Headline Line 1", type: "text", placeholder: "Crafting Moments" },
      {
        key: "headline_2",
        section: "hero",
        label: "Headline Line 2",
        type: "text",
        placeholder: "of Exquisite Beauty",
      },
      {
        key: "subheadline",
        section: "hero",
        label: "Subheadline",
        type: "textarea",
        placeholder: "A short description of what you do…",
      },
      {
        key: "cta_primary",
        section: "hero",
        label: "Primary Button Text",
        type: "text",
        placeholder: "Explore Our Work",
      },
      {
        key: "cta_secondary",
        section: "hero",
        label: "Secondary Button Text",
        type: "text",
        placeholder: "Request a Quote",
      },
      {
        key: "image",
        section: "hero",
        label: "Hero Background Image",
        type: "image",
        hint: "Full-width background. Use a high-quality landscape photo (minimum 1920×1080px).",
      },
    ],
  },
  {
    section: "brand_statement",
    label: "Brand Statement — the quote section",
    fields: [
      {
        key: "quote",
        section: "brand_statement",
        label: "Main Quote",
        type: "textarea",
        hint: "The large italic quote. Keep it punchy — one or two sentences max.",
      },
      { key: "body", section: "brand_statement", label: "Supporting Text", type: "textarea" },
      {
        key: "stat_1_value",
        section: "brand_statement",
        label: "Stat 1 — Number",
        type: "text",
        placeholder: "10+",
      },
      {
        key: "stat_1_label",
        section: "brand_statement",
        label: "Stat 1 — Label",
        type: "text",
        placeholder: "Years of Excellence",
      },
      {
        key: "stat_2_value",
        section: "brand_statement",
        label: "Stat 2 — Number",
        type: "text",
        placeholder: "500+",
      },
      {
        key: "stat_2_label",
        section: "brand_statement",
        label: "Stat 2 — Label",
        type: "text",
        placeholder: "Events Delivered",
      },
      {
        key: "stat_3_value",
        section: "brand_statement",
        label: "Stat 3 — Number",
        type: "text",
        placeholder: "3",
      },
      {
        key: "stat_3_label",
        section: "brand_statement",
        label: "Stat 3 — Label",
        type: "text",
        placeholder: "Cities Served",
      },
      {
        key: "stat_4_value",
        section: "brand_statement",
        label: "Stat 4 — Number",
        type: "text",
        placeholder: "5★",
      },
      {
        key: "stat_4_label",
        section: "brand_statement",
        label: "Stat 4 — Label",
        type: "text",
        placeholder: "Average Rating",
      },
    ],
  },
  {
    section: "services_intro",
    label: "Services intro (dark section header)",
    fields: [
      { key: "eyebrow", section: "services_intro", label: "Eyebrow Text", type: "text" },
      { key: "headline", section: "services_intro", label: "Headline", type: "text" },
    ],
  },
  {
    section: "about_preview",
    label: 'About Preview — the "Hi there, I\'m Vivian" section',
    fields: [
      { key: "eyebrow", section: "about_preview", label: "Eyebrow Text", type: "text" },
      {
        key: "headline",
        section: "about_preview",
        label: "Headline",
        type: "text",
        placeholder: "Hi there, I'm Vivian",
      },
      { key: "body_1", section: "about_preview", label: "First Paragraph", type: "textarea" },
      {
        key: "pullquote",
        section: "about_preview",
        label: "Pull Quote",
        type: "textarea",
        hint: "Displayed in a highlighted block. Keep it inspiring.",
      },
      { key: "body_2", section: "about_preview", label: "Second Paragraph", type: "textarea" },
      {
        key: "cta_label",
        section: "about_preview",
        label: "Button Text",
        type: "text",
        placeholder: "Meet the Full Team",
      },
      {
        key: "image",
        section: "about_preview",
        label: "Vivian's Photo",
        type: "image",
        hint: "Portrait orientation works best. Minimum 800×1000px.",
      },
    ],
  },
  {
    section: "quote_cta",
    label: "Quote CTA — the dark full-width call to action",
    fields: [
      { key: "eyebrow", section: "quote_cta", label: "Eyebrow Text", type: "text" },
      { key: "headline_1", section: "quote_cta", label: "Headline Line 1", type: "text" },
      {
        key: "headline_2",
        section: "quote_cta",
        label: "Headline Line 2 (gold)",
        type: "text",
      },
      { key: "body", section: "quote_cta", label: "Body Text", type: "textarea" },
      { key: "cta_label", section: "quote_cta", label: "Button Text", type: "text" },
      { key: "image", section: "quote_cta", label: "Background Image", type: "image" },
    ],
  },
];

export default async function HomePageCMS() {
  const [content, cloudinary] = await Promise.all([
    getPageContent("home"),
    getCloudinaryWidgetConfig(),
  ]);
  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Pages</p>
        <h1 className="font-display text-[36px] italic text-[#0F0E0C]">Home Page</h1>
        <p className="mt-1 font-body text-sm text-[#4A4843]/60">
          Changes appear on the website immediately after saving.
        </p>
      </div>
      <PageEditor
        page="home"
        sections={sections}
        initial={content}
        cloudinaryCloudName={cloudinary.cloudName || undefined}
        cloudinaryUploadPreset={cloudinary.uploadPreset}
      />
    </div>
  );
}
