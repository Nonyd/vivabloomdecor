import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { fulfillOrder } from "@/lib/tickets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = await getStripeWebhookSecret();
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: import("stripe").Stripe.Event;
  try {
    const stripe = await getStripe();
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as import("stripe").Stripe.Checkout.Session;
    const metadata = session.metadata;
    if (!metadata?.eventId || !metadata.quantity || !metadata.name || !metadata.email) {
      return NextResponse.json({ received: true });
    }

    const existing = await prisma.order.findFirst({
      where: { stripeSessionId: session.id },
    });
    if (existing) {
      return NextResponse.json({ received: true });
    }

    const quantity = parseInt(metadata.quantity, 10);
    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ received: true });
    }

    const pi = session.payment_intent;
    const stripePaymentId = typeof pi === "string" ? pi : pi?.id ?? null;

    try {
      await fulfillOrder({
        eventId: metadata.eventId,
        quantity,
        customerName: metadata.name,
        customerEmail: metadata.email,
        customerPhone: metadata.phone || undefined,
        paymentProvider: "stripe",
        stripeSessionId: session.id,
        stripePaymentId,
        total: (session.amount_total ?? 0) / 100,
      });
    } catch (err) {
      console.error("fulfillOrder", err);
    }
  }

  return NextResponse.json({ received: true });
}
