import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return <BlogPostForm initial={post} />;
}
