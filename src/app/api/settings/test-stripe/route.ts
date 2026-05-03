import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireAdminSettingsSession } from "@/lib/admin-api";

export async function GET() {
  const { session, response } = await requireAdminSettingsSession();
  if (!session) return response;

  try {
    const stripe = await getStripe();
    const account = await stripe.accounts.retrieve(null);
    return NextResponse.json({
      success: true,
      message: `Connected to Stripe ✓ (${account.email ?? "account verified"})`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      success: false,
      message: `Stripe error: ${message}`,
    });
  }
}
