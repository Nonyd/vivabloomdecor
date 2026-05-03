/**
 * Client-side Cloudinary settings for CldUploadWidget.
 * Create an unsigned upload preset in Cloudinary (Settings → Upload → Upload presets)
 * and set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to its name, or name the preset
 * `vivabloom_gallery` to use the default.
 */
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "vivabloom_gallery";
