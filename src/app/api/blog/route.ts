import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1),
  coverImage: z.string().optional().nullable(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional().nullable(),
  metaDesc: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get("admin") === "true";

  if (admin) {
    const { session, response } = await requireStaffSession();
    if (!session) return response;
    const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json(posts);
  }

  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? undefined,
        content: data.content,
        coverImage: data.coverImage ?? undefined,
        published: data.published ?? false,
        featured: data.featured ?? false,
        tags: data.tags ?? [],
        metaTitle: data.metaTitle ?? undefined,
        metaDesc: data.metaDesc ?? undefined,
      },
    });

    return NextResponse.json(post);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
