import { NextResponse } from "next/server";
import { getPayPalToken, getPayPalBase } from "@/lib/paypal";
import { requireAdminSettingsSession } from "@/lib/admin-api";

export async function GET() {
  const { session, response } = await requireAdminSettingsSession();
  if (!session) return response;

  try {
    await getPayPalToken();
    const base = await getPayPalBase();
    const mode = base.includes("sandbox") ? "Sandbox" : "Live";
    return NextResponse.json({
      success: true,
      message: `PayPal ${mode} connected ✓`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      success: false,
      message: `PayPal error: ${message}`,
    });
  }
}
