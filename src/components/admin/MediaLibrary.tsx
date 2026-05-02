"use client";

import type { GalleryItem } from "@prisma/client";
import Image from "next/image";
import { useMemo, useState } from "react";

export default function MediaLibrary({ items }: { items: GalleryItem[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "images" | "documents">("all");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchesQ =
        !q || it.title.toLowerCase().includes(q.toLowerCase()) || it.imageUrl.toLowerCase().includes(q);
      const isImage = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(it.imageUrl);
      if (filter === "images" && !isImage) return false;
      if (filter === "documents" && isImage) return false;
      return matchesQ;
    });
  }, [items, q, filter]);

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border border-[#EDE8DC] rounded-lg px-3 py-2 font-body text-sm max-w-xs"
        />
        <div className="inline-flex rounded-xl border border-[#EDE8DC] bg-white p-1">
          {(["all", "images", "documents"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.12em] font-body ${
                filter === f ? "bg-[#C9A96E]/20" : "text-[#4A4843]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((it) => (
          <div key={it.id} className="border border-[#EDE8DC] rounded-xl overflow-hidden bg-white">
            <div className="relative aspect-square bg-[#F8F5EE]">
              <Image src={it.imageUrl} alt={it.title} fill className="object-cover" sizes="200px" />
            </div>
            <div className="p-2 space-y-1">
              <p className="font-body text-[11px] text-[#0F0E0C] truncate">{it.title}</p>
              <button
                type="button"
                onClick={() => copyUrl(it.imageUrl)}
                className="text-[10px] uppercase tracking-[0.12em] text-[#C9A96E]"
              >
                Copy URL
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
