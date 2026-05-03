import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const { eventId, quantity, name, email } = (await req.json()) as {
      eventId?: string;
      quantity?: number;
      name?: string;
      email?: string;
    };
    if (!eventId || !quantity || !name || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, published: true },
    });
    if (!event || event.isFree) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const spotsLeft = event.capacity - event.ticketsSold;
    if (quantity > spotsLeft) {
      return NextResponse.json({ error: "Not enough tickets" }, { status: 400 });
    }

    const price = event.ticketPrice;
    const total = (price * quantity).toFixed(2);
    const token = await getPayPalAccessToken();

    const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "AUD", value: total },
            description: `${quantity}× ticket(s) to ${event.title}`,
            custom_id: JSON.stringify({ eventId, quantity, name, email }),
          },
        ],
      }),
    });
    const order = (await res.json()) as { id?: string; message?: string };
    if (!order.id) {
      console.error(order);
      return NextResponse.json({ error: order.message ?? "PayPal error" }, { status: 502 });
    }
    return NextResponse.json({ orderId: order.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "PayPal unavailable" }, { status: 503 });
  }
}
