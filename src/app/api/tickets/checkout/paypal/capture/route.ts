import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayPalToken, getPayPalBase } from "@/lib/paypal";
import { fulfillOrder } from "@/lib/tickets";

export async function POST(req: NextRequest) {
  try {
    const { paypalOrderId, eventId, quantity, name, email } = (await req.json()) as {
      paypalOrderId?: string;
      eventId?: string;
      quantity?: number;
      name?: string;
      email?: string;
    };
    if (!paypalOrderId || !eventId || !quantity || !name || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const dup = await prisma.order.findFirst({ where: { paypalOrderId } });
    if (dup) {
      return NextResponse.json({ success: true, orderId: dup.id });
    }

    const token = await getPayPalToken();
    const res = await fetch(`${await getPayPalBase()}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const capture = (await res.json()) as {
      status?: string;
      purchase_units?: { payments?: { captures?: { amount?: { value?: string } }[] } }[];
    };

    if (capture.status === "COMPLETED") {
      const paidAmount = parseFloat(
        capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? "0"
      );
      const order = await fulfillOrder({
        eventId,
        quantity,
        customerName: name,
        customerEmail: email,
        paymentProvider: "paypal",
        paypalOrderId,
        total: paidAmount,
      });
      return NextResponse.json({ success: true, orderId: order.id });
    }

    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Capture failed" }, { status: 502 });
  }
}
