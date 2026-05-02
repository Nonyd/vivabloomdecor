import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogShare from "@/components/public/BlogShare";
import { prisma } from "@/lib/prisma";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let post = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  } catch {
    post = null;
  }
  return {
    title: post?.metaTitle || post?.title,
    description: post?.metaDesc || post?.excerpt || "",
  };
}

function readTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPostPage({ params }: Props) {
  let post = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  } catch {
    post = null;
  }
  if (!post || !post.published) notFound();

  const url = `https://vivabloomdecor.com.au/blog/${post.slug}`;

  return (
    <article className="min-h-screen bg-ivory pt-20">
      {post.coverImage ? (
        <div className="relative mx-auto aspect-video w-full max-w-6xl">
          <Image
            src={post.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-[720px] px-6 py-16">
        <p className="eyebrow mb-4">{(post.tags[0] as string | undefined) ?? "Journal"}</p>
        <h1 className="font-display text-4xl italic leading-tight text-onyx md:text-5xl">{post.title}</h1>
        <p className="mt-4 font-body text-sm text-charcoal/60">
          {readTime(post.content)} min read
        </p>

        <div
          className="mt-12 max-w-none font-body text-charcoal [&_h2]:font-display [&_h2]:text-3xl [&_h2]:italic [&_h2]:text-onyx [&_p]:leading-relaxed [&_p+_p]:mt-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <BlogShare url={url} title={post.title} />

        <p className="mt-10 text-center">
          <Link href="/blog" className="champagne-outline-btn">
            Back to Journal
          </Link>
        </p>
      </div>
    </article>
  );
}
