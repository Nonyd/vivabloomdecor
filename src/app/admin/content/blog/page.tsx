import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BlogListClient from "@/components/admin/BlogListClient";

export default async function AdminBlogListPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-body text-[#4A4843] text-sm max-w-xl">
          Manage blog posts, publishing status, and SEO fields from the editor.
        </p>
        <Link
          href="/admin/content/blog/new"
          className="inline-flex items-center justify-center bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase tracking-[0.15em] px-5 py-3 rounded-lg hover:bg-[#E8D5B0] transition-colors"
        >
          + New Post
        </Link>
      </div>
      <BlogListClient posts={posts} />
    </div>
  );
}
