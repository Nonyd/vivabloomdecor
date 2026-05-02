"use client";

import type { BlogPost } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function togglePublished(post: BlogPost, published: boolean) {
    setBusyId(post.id);
    try {
      const res = await fetch(`/api/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error();
      toast.success(published ? "Published" : "Unpublished");
      router.refresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead className="bg-[#F8F5EE] font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843] text-left">
          <tr>
            <th className="px-6 py-3">Title</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Created</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EDE8DC]">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-[#F8F5EE] font-body text-[14px]">
              <td className="px-6 py-4 text-[#0F0E0C]">{post.title}</td>
              <td className="px-6 py-4">
                <button
                  type="button"
                  disabled={busyId === post.id}
                  onClick={() => togglePublished(post, !post.published)}
                  className={`text-[11px] uppercase tracking-[0.12em] px-3 py-1 rounded-full border ${
                    post.published
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-[#EDE8DC] bg-[#F8F5EE] text-[#4A4843]"
                  }`}
                >
                  {post.published ? "Published" : "Draft"}
                </button>
              </td>
              <td className="px-6 py-4 text-[#4A4843]/80 text-[13px]">
                {new Date(post.createdAt).toLocaleDateString("en-AU")}
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/admin/content/blog/${post.id}`}
                  className="text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
