import { getPageContent } from "@/lib/content";
import PageEditor, { type SectionConfig } from "@/components/admin/cms/PageEditor";

const sections: SectionConfig[] = [
  {
    section: "hero",
    label: "Contact Hero",
    fields: [
      { key: "headline", section: "hero", label: "Headline", type: "text" },
      { key: "subheadline", section: "hero", label: "Subheadline", type: "text" },
    ],
  },
  {
    section: "details",
    label: "Contact Details",
    fields: [
      {
        key: "address",
        section: "details",
        label: "Address",
        type: "text",
        hint: "Shown with a location pin icon",
      },
      { key: "phone", section: "details", label: "Phone Number", type: "text" },
      { key: "email", section: "details", label: "Email Address", type: "text" },
      {
        key: "hours",
        section: "details",
        label: "Business Hours",
        type: "text",
        placeholder: "Mon–Fri 9am–6pm AEST",
      },
      {
        key: "response_time",
        section: "details",
        label: "Response Time Note",
        type: "text",
        placeholder: "We respond within 24 hours",
      },
    ],
  },
];

export default async function ContactPageCMS() {
  const content = await getPageContent("contact");
  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Pages</p>
        <h1 className="font-display text-[36px] italic text-[#0F0E0C]">Contact Page</h1>
        <p className="mt-1 font-body text-sm text-[#4A4843]/60">Hero copy and studio contact details.</p>
      </div>
      <PageEditor page="contact" sections={sections} initial={content} />
    </div>
  );
}
