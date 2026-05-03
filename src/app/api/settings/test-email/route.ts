import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSetting } from "@/lib/settings";
import { requireStaffSession } from "@/lib/admin-api";

export async function POST() {
  const { session, response } = await requireStaffSession();
  if (!session) return response!;
  if (!session.user.email) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const apiKey = await getSetting("resend_api_key");
  const fromEmail =
    (await getSetting("email_from_address")) || "hello@vivabloomdecor.com.au";
  const fromName = (await getSetting("email_from_name")) || "Vivabloom";
  const adminEmail =
    (await getSetting("admin_notification_email")) || session.user.email;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      message: "Resend API key not configured yet",
    });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: adminEmail,
      subject: "Vivabloom — Test Email ✓",
      html: '<p style="font-family:Georgia;font-size:18px;color:#0F0E0C;">Your email settings are working correctly.</p>',
    });
    return NextResponse.json({
      success: true,
      message: `Test email sent to ${adminEmail}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      success: false,
      message: `Email error: ${message}`,
    });
  }
}
