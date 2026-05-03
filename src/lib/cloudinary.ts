import { v2 as cloudinary } from "cloudinary";
import { getSetting } from "@/lib/settings";

export async function getCloudinaryConfig() {
  const [cloudName, apiKey, apiSecret] = await Promise.all([
    getSetting("cloudinary_cloud_name"),
    getSetting("cloudinary_api_key"),
    getSetting("cloudinary_api_secret"),
  ]);
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return cloudinary;
}
