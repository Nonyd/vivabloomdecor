import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillOrder } from "@/lib/tickets";

export async function POST(req: NextRequest) {
  const { eventId, quantity, name, email } = (await req.json()) as {
    eventId?: string;
    quantity?: number;
    name?: string;
    email?: string;
  };
  if (!eventId || !quantity || !name || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event?.isFree) {
    return NextResponse.json({ error: "Not a free event" }, { status: 400 });
  }

  const spotsLeft = event.capacity - event.ticketsSold;
  const qty = Math.min(Math.max(1, quantity), 10, spotsLeft);
  if (qty < 1) {
    return NextResponse.json({ error: "Sold out" }, { status: 400 });
  }

  const order = await fulfillOrder({
    eventId,
    quantity: qty,
    customerName: name,
    customerEmail: email,
    paymentProvider: "free",
    total: 0,
  });

  return NextResponse.json({ success: true, orderId: order.id });
}
