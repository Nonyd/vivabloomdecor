import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Journal",
  description: "Inspiration, tips, and news from Vivabloom Decor.",
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

function readTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogIndexPage() {
  let posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>> = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    posts = [];
  }

  const [first, ...rest] = posts;

  return (
    <main className="min-h-screen bg-ivory pt-20">
      <div className="px-[5%] py-16 text-center">
        <p className="eyebrow mb-4">Editorial</p>
        <h1 className="font-display text-5xl italic text-onyx md:text-6xl">Blog</h1>
      </div>

      {first ? (
        <div className="relative mx-auto mb-16 min-h-[55vh] w-full max-w-7xl px-[5%]">
          <Link
            href={`/blog/${first.slug}`}
            className="group relative block min-h-[55vh] w-full overflow-hidden rounded-sm"
          >
            {first.coverImage ? (
              <Image
                src={first.coverImage}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-onyx" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-10 md:p-14">
              <p className="eyebrow-light mb-3 text-champagne-lt/90">
                {(first.tags[0] as string | undefined) ?? "Journal"}
              </p>
              <h2 className="max-w-3xl font-display text-4xl italic text-white md:text-5xl">{first.title}</h2>
              {first.excerpt ? (
                <p className="mt-4 max-w-2xl font-body text-white/75">{first.excerpt}</p>
              ) : null}
            </div>
          </Link>
        </div>
      ) : (
        <p className="px-[5%] pb-24 text-center font-body text-charcoal/70">No published posts yet.</p>
      )}

      {rest.length > 0 ? (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-[5%] pb-24 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <div className="relative aspect-video overflow-hidden rounded-sm bg-onyx/5">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : null}
              </div>
              <p className="eyebrow mb-2 mt-4">{(post.tags[0] as string | undefined) ?? "Journal"}</p>
              <h3 className="font-display text-2xl italic text-onyx group-hover:text-champagne">{post.title}</h3>
              {post.excerpt ? <p className="mt-2 line-clamp-3 font-body text-sm text-charcoal/80">{post.excerpt}</p> : null}
              <p className="mt-4 font-body text-[12px] text-charcoal/50">
                {formatDate(post.createdAt)} · {readTime(post.content)} min read
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </main>
  );
}
