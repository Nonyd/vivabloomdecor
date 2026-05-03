import { getPageContent } from "@/lib/content";
import PageEditor, { type SectionConfig } from "@/components/admin/cms/PageEditor";
import { getCloudinaryWidgetConfig } from "@/lib/settings";

const sections: SectionConfig[] = [
  {
    section: "hero",
    label: "Quote Page Hero",
    fields: [
      { key: "headline", section: "hero", label: "Headline", type: "text" },
      { key: "subheadline", section: "hero", label: "Subheadline", type: "textarea" },
    ],
  },
];

export default async function QuotePageCMS() {
  const [content, cloudinary] = await Promise.all([
    getPageContent("quote"),
    getCloudinaryWidgetConfig(),
  ]);
  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Pages</p>
        <h1 className="font-display text-[36px] italic text-[#0F0E0C]">Quote Page</h1>
        <p className="mt-1 font-body text-sm text-[#4A4843]/60">Title and intro above the enquiry form.</p>
      </div>
      <PageEditor
        page="quote"
        sections={sections}
        initial={content}
        cloudinaryCloudName={cloudinary.cloudName || undefined}
        cloudinaryUploadPreset={cloudinary.uploadPreset}
      />
    </div>
  );
}
