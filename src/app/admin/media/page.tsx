import { prisma } from "@/lib/prisma";
import MediaLibrary from "@/components/admin/MediaLibrary";

export default async function AdminMediaPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { updatedAt: "desc" } });
  return <MediaLibrary items={items} />;
}
