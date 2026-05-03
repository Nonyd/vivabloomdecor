import { getPageContent } from "@/lib/content";
import PageEditor, { type SectionConfig } from "@/components/admin/cms/PageEditor";

const serviceFields = (section: string, label: string): SectionConfig => ({
  section,
  label,
  fields: [
    { key: "title", section, label: "Service Name", type: "text" },
    { key: "subtitle", section, label: "Tagline", type: "text", hint: "Short phrase shown on the card" },
    { key: "body", section, label: "Description", type: "textarea" },
    {
      key: "pricing",
      section,
      label: "Starting Price",
      type: "text",
      placeholder: "Starting from $800",
    },
    { key: "image", section, label: "Service Image", type: "image" },
  ],
});

const sections: SectionConfig[] = [
  {
    section: "hero",
    label: "Services Hero Banner",
    fields: [
      { key: "headline", section: "hero", label: "Headline", type: "text" },
      { key: "subheadline", section: "hero", label: "Subheadline", type: "textarea" },
      { key: "image", section: "hero", label: "Background Image", type: "image" },
    ],
  },
  serviceFields("floral", "Service 1 — Floral Design"),
  serviceFields("balloon", "Service 2 — Balloon Artistry"),
  serviceFields("wedding", "Service 3 — Wedding Styling"),
  serviceFields("corporate", "Service 4 — Corporate Events"),
  serviceFields("draping", "Service 5 — Backdrop & Draping"),
  serviceFields("production", "Service 6 — Full Production"),
];

export default async function ServicesPageCMS() {
  const content = await getPageContent("services");
  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Pages</p>
        <h1 className="font-display text-[36px] italic text-[#0F0E0C]">Services Page</h1>
        <p className="mt-1 font-body text-sm text-[#4A4843]/60">
          Edit each service card — name, description, pricing, and image.
        </p>
      </div>
      <PageEditor page="services" sections={sections} initial={content} />
    </div>
  );
}
