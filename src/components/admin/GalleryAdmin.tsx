"use client";

import type { GalleryItem } from "@prisma/client";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { CLOUDINARY_UPLOAD_PRESET } from "@/lib/cloudinary-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const categories = ["Wedding", "Corporate", "Birthday", "Floral", "Balloon", "General"];

export default function GalleryAdmin({
  initialItems,
  cloudinaryCloudName,
  cloudinaryUploadPreset,
}: {
  initialItems: GalleryItem[];
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  async function refresh() {
    const res = await fetch("/api/gallery");
    if (res.ok) {
      const data = (await res.json()) as GalleryItem[];
      setItems(data);
    }
    router.refresh();
  }

  async function updateTitle(id: string, title: string) {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      toast.success("Title updated");
      await refresh();
    } catch {
      toast.error("Could not update title.");
    }
  }

  async function updateCategory(id: string, category: string) {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) throw new Error();
      toast.success("Category updated");
      await refresh();
    } catch {
      toast.error("Could not update category.");
    }
  }

  async function updateFeatured(id: string, featured: boolean) {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      });
      if (!res.ok) throw new Error();
      toast.success("Updated");
      await refresh();
    } catch {
      toast.error("Could not update.");
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this image from the gallery?")) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      await refresh();
    } catch {
      toast.error("Could not delete.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-body text-sm text-[#4A4843] max-w-xl">
          In Cloudinary, create an unsigned upload preset (or set{" "}
          <code className="text-xs bg-[#EDE8DC]/80 px-1 rounded">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code>{" "}
          to your preset name). Also set{" "}
          <code className="text-xs bg-[#EDE8DC]/80 px-1 rounded">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>.
        </p>
        <CldUploadWidget
          options={cloudinaryCloudName ? { cloudName: cloudinaryCloudName } : undefined}
          uploadPreset={cloudinaryUploadPreset ?? CLOUDINARY_UPLOAD_PRESET}
          onUpload={async (result) => {
            const info = result?.info as
              | { secure_url?: string; public_id?: string; original_filename?: string }
              | undefined;
            if (!info?.secure_url) return;
            await fetch("/api/gallery", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: info.original_filename ?? "Upload",
                category: "General",
                imageUrl: info.secure_url,
                cloudinaryId: info.public_id,
              }),
            });
            toast.success("Image added");
            await refresh();
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase tracking-[0.15em] px-5 py-3 rounded-lg hover:bg-[#E8D5B0]"
            >
              Upload Images
            </button>
          )}
        </CldUploadWidget>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative group rounded-xl overflow-hidden border border-[#EDE8DC] bg-white"
          >
            <div className="relative aspect-square">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-[#0F0E0C]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <input
                  defaultValue={item.title}
                  onBlur={(e) => updateTitle(item.id, e.target.value)}
                  className="bg-transparent text-white font-body text-sm border-b border-white/30 focus:outline-none w-full mb-2"
                />
                <select
                  defaultValue={item.category}
                  onChange={(e) => updateCategory(item.id, e.target.value)}
                  className="bg-transparent text-white/90 font-body text-xs focus:outline-none mb-3 border border-white/20 rounded px-1"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="text-[#0F0E0C]">
                      {c}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-white/80 font-body text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.featured}
                      onChange={(e) => updateFeatured(item.id, e.target.checked)}
                    />
                    Featured
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="text-red-400 hover:text-red-300 font-body text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
