"use client";

import type { BlogPost } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import BlogEditor from "@/components/admin/BlogEditor";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function BlogPostForm({ initial }: { initial?: BlogPost | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!initial);
  const [content, setContent] = useState(initial?.content ?? "<p></p>");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [tags, setTags] = useState(initial?.tags?.join(", ") ?? "");
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(initial?.metaDesc ?? "");
  const [saving, setSaving] = useState(false);

  const derivedSlug = useMemo(() => slugify(title), [title]);

  function effectiveSlug() {
    return slugManual ? slug : derivedSlug || slug;
  }

  async function save() {
    setSaving(true);
    const payload = {
      title,
      slug: effectiveSlug(),
      content,
      excerpt: excerpt || null,
      published,
      coverImage: coverImage || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      metaTitle: metaTitle || null,
      metaDesc: metaDesc || null,
    };

    try {
      const url = initial ? `/api/blog/${initial.id}` : "/api/blog";
      const method = initial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(initial ? "Post updated" : "Post created");
      router.push("/admin/content/blog");
      router.refresh();
    } catch {
      toast.error("Could not save post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
      <div className="space-y-6">
        <Link
          href="/admin/content/blog"
          className="inline-block text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] font-body hover:underline"
        >
          ← All posts
        </Link>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 font-body mb-2">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugManual) setSlug(slugify(e.target.value));
            }}
            className="w-full border border-[#EDE8DC] rounded-lg px-4 py-3 font-body text-[#0F0E0C]"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 font-body mb-2">
            Slug
          </label>
          <div className="flex gap-2 items-center">
            <input
              value={slugManual ? slug : derivedSlug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              className="flex-1 border border-[#EDE8DC] rounded-lg px-4 py-3 font-body text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (!slugManual) setSlug(derivedSlug);
                setSlugManual((m) => !m);
              }}
              className="text-[11px] uppercase tracking-[0.12em] text-[#C9A96E] font-body whitespace-nowrap"
            >
              {slugManual ? "Auto" : "Edit"}
            </button>
          </div>
        </div>
        <BlogEditor key={initial?.id ?? "new"} content={content} onChange={setContent} />
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 font-body mb-2">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full border border-[#EDE8DC] rounded-lg px-4 py-3 font-body text-sm"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#EDE8DC] p-6 space-y-4">
          <label className="flex items-center gap-3 font-body text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-[#EDE8DC]"
            />
            Published
          </label>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 font-body mb-2">
              Cover image URL
            </label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2 text-sm font-body"
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 font-body mb-2">
              Tags (comma-separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2 text-sm font-body"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 font-body mb-2">
              Meta title
            </label>
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2 text-sm font-body"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 font-body mb-2">
              Meta description
            </label>
            <textarea
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              rows={3}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2 text-sm font-body"
            />
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase tracking-[0.15em] py-3 rounded-lg hover:bg-[#E8D5B0] disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
