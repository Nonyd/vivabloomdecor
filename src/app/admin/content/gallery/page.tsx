import { prisma } from "@/lib/prisma";
import GalleryAdmin from "@/components/admin/GalleryAdmin";

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { order: "asc" } });

  return <GalleryAdmin initialItems={items} />;
}
