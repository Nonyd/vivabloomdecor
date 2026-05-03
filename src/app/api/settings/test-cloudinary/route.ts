import { NextResponse } from "next/server";
import { getCloudinaryConfig } from "@/lib/cloudinary";
import { requireAdminSettingsSession } from "@/lib/admin-api";

export async function GET() {
  const { session, response } = await requireAdminSettingsSession();
  if (!session) return response;

  try {
    const cloudinary = await getCloudinaryConfig();
    const result = (await cloudinary.api.ping()) as { status?: string };
    return NextResponse.json({
      success: true,
      message: `Cloudinary connected ✓ (${result.status ?? "ok"})`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      success: false,
      message: `Cloudinary error: ${message}`,
    });
  }
}
