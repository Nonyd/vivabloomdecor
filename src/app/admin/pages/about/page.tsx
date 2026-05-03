import { getPageContent } from "@/lib/content";
import PageEditor, { type SectionConfig } from "@/components/admin/cms/PageEditor";

const sections: SectionConfig[] = [
  {
    section: "hero",
    label: "About Hero Banner",
    fields: [
      { key: "headline", section: "hero", label: "Headline", type: "text" },
      { key: "subheadline", section: "hero", label: "Subheadline", type: "text" },
      { key: "image", section: "hero", label: "Background Image", type: "image" },
    ],
  },
  {
    section: "vivian_bio",
    label: "Vivian's Bio",
    fields: [
      { key: "headline", section: "vivian_bio", label: "Headline", type: "text" },
      { key: "body_1", section: "vivian_bio", label: "First Paragraph", type: "textarea" },
      { key: "body_2", section: "vivian_bio", label: "Second Paragraph", type: "textarea" },
      { key: "body_3", section: "vivian_bio", label: "Third Paragraph", type: "textarea" },
      { key: "pullquote", section: "vivian_bio", label: "Pull Quote", type: "textarea" },
      { key: "image", section: "vivian_bio", label: "Vivian's Portrait", type: "image" },
    ],
  },
  {
    section: "values",
    label: "Our Values",
    fields: [
      { key: "headline", section: "values", label: "Section Headline", type: "text" },
      { key: "value_1_title", section: "values", label: "Value 1 — Title", type: "text" },
      { key: "value_1_body", section: "values", label: "Value 1 — Text", type: "textarea" },
      { key: "value_2_title", section: "values", label: "Value 2 — Title", type: "text" },
      { key: "value_2_body", section: "values", label: "Value 2 — Text", type: "textarea" },
      { key: "value_3_title", section: "values", label: "Value 3 — Title", type: "text" },
      { key: "value_3_body", section: "values", label: "Value 3 — Text", type: "textarea" },
      { key: "value_4_title", section: "values", label: "Value 4 — Title", type: "text" },
      { key: "value_4_body", section: "values", label: "Value 4 — Text", type: "textarea" },
    ],
  },
];

export default async function AboutPageCMS() {
  const content = await getPageContent("about");
  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Pages</p>
        <h1 className="font-display text-[36px] italic text-[#0F0E0C]">About Page</h1>
        <p className="mt-1 font-body text-sm text-[#4A4843]/60">Hero, founder story, and values.</p>
      </div>
      <PageEditor page="about" sections={sections} initial={content} />
    </div>
  );
}
