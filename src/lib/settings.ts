import { prisma } from "@/lib/prisma";
import { decrypt, SENSITIVE_KEYS } from "@/lib/encryption";

/** Phase C keys → Phase G keys (read fallback when new key is empty). */
const LEGACY_DB_KEY: Partial<Record<string, string>> = {
  site_name: "businessName",
  site_tagline: "tagline",
  contact_phone: "phone",
  contact_email: "email",
  contact_address: "address",
  social_instagram: "instagramUrl",
  social_facebook: "facebookUrl",
  social_tiktok: "tiktokUrl",
  social_pinterest: "pinterestUrl",
  abn: "abn",
  meta_description: "defaultMetaDescription",
  admin_notification_email: "adminNotifyEmail",
};

async function readDbValue(key: string): Promise<string> {
  try {
    const record = await prisma.siteSettings.findUnique({ where: { key } });
    if (!record) return "";
    return SENSITIVE_KEYS.has(key) ? decrypt(record.value) : record.value;
  } catch {
    return "";
  }
}

export async function getSetting(key: string): Promise<string> {
  const envMap: Record<string, string | undefined> = {
    stripe_publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    paypal_client_id: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? process.env.PAYPAL_CLIENT_ID,
    paypal_client_secret: process.env.PAYPAL_CLIENT_SECRET,
    resend_api_key: process.env.RESEND_API_KEY,
    cloudinary_cloud_name:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  };
  const fromEnv = envMap[key];
  if (fromEnv) return fromEnv;

  let value = await readDbValue(key);
  if (!value) {
    const legacyKey = LEGACY_DB_KEY[key];
    if (legacyKey) {
      value = await readDbValue(legacyKey);
    }
  }
  return value;
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  await Promise.all(
    keys.map(async (key) => {
      result[key] = await getSetting(key);
    })
  );
  return result;
}

export async function getAllSettingsForAdmin(): Promise<Record<string, string>> {
  const records = await prisma.siteSettings.findMany();
  const result: Record<string, string> = {};

  for (const record of records) {
    if (SENSITIVE_KEYS.has(record.key)) {
      const decrypted = decrypt(record.value);
      result[record.key] = decrypted
        ? `${"•".repeat(Math.max(0, decrypted.length - 4))}${decrypted.slice(-4)}`
        : "";
    } else {
      result[record.key] = record.value;
    }
  }
  return result;
}

/** Unsigned widget: cloud name + preset (from DB or env). */
export async function getCloudinaryWidgetConfig(): Promise<{
  cloudName: string;
  uploadPreset: string;
}> {
  const [cloudName, preset] = await Promise.all([
    getSetting("cloudinary_cloud_name"),
    getSetting("cloudinary_upload_preset"),
  ]);
  return {
    cloudName:
      cloudName ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME ||
      "",
    uploadPreset:
      preset ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      "vivabloom_gallery",
  };
}
