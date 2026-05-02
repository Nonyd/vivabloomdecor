import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendAdminNotification, sendEnquiryConfirmation } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  eventType: z.string().min(1),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().optional(),
  venue: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(1),
  referral: z.string().optional(),
});

function buildMessage(data: z.infer<typeof schema>) {
  const parts = [data.message];
  if (data.venue) parts.push(`Venue: ${data.venue}`);
  if (data.referral) parts.push(`Referral: ${data.referral}`);
  return parts.filter(Boolean).join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const enquiry = await prisma.enquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        eventType: data.eventType,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        guestCount: data.guestCount ?? undefined,
        budget: data.budget,
        message: buildMessage(data),
      },
    });

    const eventDateFormatted = data.eventDate
      ? new Date(data.eventDate).toLocaleDateString("en-AU", { dateStyle: "long" })
      : undefined;
    sendEnquiryConfirmation(data.email, data.name, data.eventType, eventDateFormatted).catch(console.error);
    sendAdminNotification(enquiry).catch(console.error);

    return NextResponse.json({ success: true, id: enquiry.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
