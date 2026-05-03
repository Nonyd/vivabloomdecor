"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { CLOUDINARY_UPLOAD_PRESET } from "@/lib/cloudinary-client";
import { toast } from "sonner";
import { Save, Image as ImageIcon, Type, AlignLeft } from "lucide-react";

export type FieldConfig = {
  key: string;
  section: string;
  label: string;
  type: "text" | "textarea" | "image" | "richtext";
  placeholder?: string;
  hint?: string;
};

export type SectionConfig = {
  section: string;
  label: string;
  fields: FieldConfig[];
};

interface Props {
  page: string;
  sections: SectionConfig[];
  initial: Record<string, Record<string, string>>;
  /** From Admin → Settings / env — passed to Cloudinary upload widget. */
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
}

export default function PageEditor({
  page,
  sections,
  initial,
  cloudinaryCloudName,
  cloudinaryUploadPreset,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const flat: Record<string, string> = {};
    for (const sec of sections) {
      for (const field of sec.fields) {
        flat[`${sec.section}__${field.key}`] = initial[sec.section]?.[field.key] ?? "";
      }
    }
    return flat;
  });
  const [isPending, startTransition] = useTransition();
  const [savedKey, setSavedKey] = useState<string | null>(null);

  function setValue(section: string, key: string, value: string) {
    setValues((prev) => ({ ...prev, [`${section}__${key}`]: value }));
  }

  function getValue(section: string, key: string): string {
    return values[`${section}__${key}`] ?? "";
  }

  async function saveField(section: string, key: string) {
    const value = getValue(section, key);
    startTransition(() => {
      void (async () => {
        const res = await fetch("/api/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page, section, key, value }),
        });
        if (res.ok) {
          setSavedKey(`${section}__${key}`);
          setTimeout(() => setSavedKey(null), 2000);
          toast.success("Saved!");
        } else {
          toast.error("Failed to save");
        }
      })();
    });
  }

  async function saveAll() {
    const entries = Object.entries(values).map(([flatKey, value]) => {
      const [section, key] = flatKey.split("__");
      return { page, section, key, value };
    });
    startTransition(() => {
      void (async () => {
        const res = await fetch("/api/cms/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries }),
        });
        if (res.ok) {
          toast.success("All changes saved!");
        } else {
          toast.error("Failed to save changes");
        }
      })();
    });
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="sticky top-0 z-10 -mx-8 -mt-8 mb-8 flex items-center justify-between border-b border-[#EDE8DC] bg-[#F8F5EE] px-8 py-3">
        <p className="font-body text-[13px] text-[#4A4843]/60">
          Changes save per field or use Save All below
        </p>
        <button
          type="button"
          onClick={() => void saveAll()}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-[#C9A96E] px-6 py-2.5 font-body text-[12px] uppercase tracking-[0.15em] text-[#0F0E0C] transition-colors hover:bg-[#E8D5B0] disabled:opacity-50"
        >
          <Save size={14} />
          {isPending ? "Saving…" : "Save All Changes"}
        </button>
      </div>

      {sections.map((sec) => (
        <div key={sec.section} className="overflow-hidden rounded-2xl border border-[#EDE8DC] bg-white">
          <div className="border-b border-[#EDE8DC] bg-[#F8F5EE] px-6 py-4">
            <h3 className="font-display text-[20px] italic text-[#0F0E0C]">{sec.label}</h3>
          </div>

          <div className="divide-y divide-[#EDE8DC]">
            {sec.fields.map((field) => (
              <div key={field.key} className="px-6 py-5">
                <div className="mb-2 flex items-center gap-2">
                  {field.type === "image" && <ImageIcon size={13} className="text-[#C9A96E]" />}
                  {field.type === "text" && <Type size={13} className="text-[#C9A96E]" />}
                  {field.type === "textarea" && <AlignLeft size={13} className="text-[#C9A96E]" />}
                  <label className="font-body text-[12px] uppercase tracking-[0.15em] text-[#4A4843]">
                    {field.label}
                  </label>
                  {savedKey === `${sec.section}__${field.key}` && (
                    <span className="ml-auto font-body text-[11px] text-green-600">✓ Saved</span>
                  )}
                </div>

                {field.hint && (
                  <p className="mb-2 font-body text-[11px] text-[#4A4843]/50">{field.hint}</p>
                )}

                {field.type === "text" && (
                  <div className="flex gap-2">
                    <input
                      value={getValue(sec.section, field.key)}
                      onChange={(e) => setValue(sec.section, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 rounded-lg border border-[#EDE8DC] px-4 py-2.5 font-body text-[14px] text-[#0F0E0C] transition-colors focus:border-[#C9A96E] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => void saveField(sec.section, field.key)}
                      className="whitespace-nowrap rounded-lg border border-[#EDE8DC] px-4 py-2.5 font-body text-[12px] text-[#4A4843] transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E]"
                    >
                      Save
                    </button>
                  </div>
                )}

                {field.type === "textarea" && (
                  <div className="space-y-2">
                    <textarea
                      value={getValue(sec.section, field.key)}
                      onChange={(e) => setValue(sec.section, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full resize-y rounded-lg border border-[#EDE8DC] px-4 py-3 font-body text-[14px] text-[#0F0E0C] transition-colors focus:border-[#C9A96E] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => void saveField(sec.section, field.key)}
                      className="rounded-lg border border-[#EDE8DC] px-4 py-2 font-body text-[12px] text-[#4A4843] transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E]"
                    >
                      Save
                    </button>
                  </div>
                )}

                {field.type === "image" && (
                  <div className="space-y-3">
                    {getValue(sec.section, field.key) && (
                      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-[#EDE8DC]">
                        <Image
                          src={getValue(sec.section, field.key)}
                          alt={field.label}
                          fill
                          className="object-cover"
                          sizes="800px"
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <CldUploadWidget
                        options={cloudinaryCloudName ? { cloudName: cloudinaryCloudName } : undefined}
                        uploadPreset={cloudinaryUploadPreset ?? CLOUDINARY_UPLOAD_PRESET}
                        onUpload={(result) => {
                          const info = result?.info as { secure_url?: string } | undefined;
                          const url = info?.secure_url;
                          if (!url) return;
                          setValue(sec.section, field.key, url);
                          void fetch("/api/cms", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              page,
                              section: sec.section,
                              key: field.key,
                              value: url,
                            }),
                          }).then((r) => {
                            if (r.ok) toast.success("Image updated!");
                            else toast.error("Failed to save image");
                          });
                        }}
                      >
                        {({ open }) => (
                          <button
                            type="button"
                            onClick={() => open()}
                            className="flex items-center gap-2 rounded-lg border border-[#EDE8DC] bg-[#F8F5EE] px-4 py-2.5 font-body text-[12px] text-[#4A4843] transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E]"
                          >
                            <ImageIcon size={14} />
                            Upload New Image
                          </button>
                        )}
                      </CldUploadWidget>
                      <input
                        value={getValue(sec.section, field.key)}
                        onChange={(e) => setValue(sec.section, field.key, e.target.value)}
                        placeholder="Or paste image URL…"
                        className="min-w-[120px] flex-1 rounded-lg border border-[#EDE8DC] px-3 py-2.5 font-body text-[13px] text-[#0F0E0C] focus:border-[#C9A96E] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void saveField(sec.section, field.key)}
                        className="rounded-lg border border-[#EDE8DC] px-4 py-2.5 font-body text-[12px] text-[#4A4843] transition-colors hover:border-[#C9A96E]"
                      >
                        Save
                      </button>
                    </div>
                    <p className="font-body text-[11px] text-[#4A4843]/40">
                      Upload from your computer or paste a URL. Recommended: minimum 1920×1080px for hero
                      images.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
