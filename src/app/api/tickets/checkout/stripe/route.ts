import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getSetting } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const { eventId, quantity, name, email, phone } = (await req.json()) as {
      eventId?: string;
      quantity?: number;
      name?: string;
      email?: string;
      phone?: string;
    };

    if (!eventId || !quantity || !name || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, published: true },
    });
    if (!event || event.isFree) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const spotsLeft = event.capacity - event.ticketsSold;
    if (quantity > spotsLeft || quantity < 1) {
      return NextResponse.json({ error: "Not enough tickets available" }, { status: 400 });
    }

    const now = new Date();
    const useEarlyBird =
      event.earlyBirdPrice != null &&
      event.earlyBirdEnds != null &&
      now < event.earlyBirdEnds;
    const price = useEarlyBird ? event.earlyBirdPrice! : event.ticketPrice;

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://vivabloomdecor.com.au";
    const stripe = await getStripe();
    const afterpayRaw = await getSetting("stripe_afterpay_enabled");
    const afterpayEnabled = afterpayRaw === "" || afterpayRaw === "true";
    const paymentMethodTypes = afterpayEnabled
      ? (["card", "afterpay_clearpay"] as const)
      : (["card"] as const);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: [...paymentMethodTypes],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "aud",
            unit_amount: Math.round(price * 100),
            product_data: {
              name: `${event.title} — Ticket`,
              description: `${quantity} ticket${quantity > 1 ? "s" : ""} · ${event.date.toLocaleDateString("en-AU")}`,
              images: event.coverImage ? [event.coverImage] : [],
            },
          },
          quantity,
        },
      ],
      metadata: {
        eventId,
        quantity: String(quantity),
        name,
        email,
        phone: phone ?? "",
      },
      success_url: `${baseUrl}/events/${event.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/events/${event.slug}`,
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 503 });
  }
}
