import { prisma } from "@/lib/prisma";
import GalleryAdmin from "@/components/admin/GalleryAdmin";
import { getCloudinaryWidgetConfig } from "@/lib/settings";

export default async function AdminGalleryPage() {
  const [items, cloudinary] = await Promise.all([
    prisma.galleryItem.findMany({ orderBy: { order: "asc" } }),
    getCloudinaryWidgetConfig(),
  ]);

  return (
    <GalleryAdmin
      initialItems={items}
      cloudinaryCloudName={cloudinary.cloudName || undefined}
      cloudinaryUploadPreset={cloudinary.uploadPreset}
    />
  );
}
