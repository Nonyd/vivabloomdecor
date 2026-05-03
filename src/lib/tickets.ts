import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/email";
import type { Order, Ticket } from "@prisma/client";

export type FulfillOrderParams = {
  eventId: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentProvider: string;
  stripeSessionId?: string;
  stripePaymentId?: string | null;
  paypalOrderId?: string;
  total: number;
};

export async function fulfillOrder(params: FulfillOrderParams): Promise<Order> {
  const event = await prisma.event.findUnique({ where: { id: params.eventId } });
  if (!event) throw new Error("Event not found");

  const orderNumber = `VB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      total: params.total,
      status: "PAID",
      paymentProvider: params.paymentProvider,
      stripeSessionId: params.stripeSessionId,
      stripePaymentId: params.stripePaymentId ?? undefined,
      paypalOrderId: params.paypalOrderId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      items: {
        create: {
          quantity: params.quantity,
          price: params.quantity > 0 ? params.total / params.quantity : 0,
          eventId: params.eventId,
        },
      },
    },
  });

  const tickets: Ticket[] = [];
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://vivabloomdecor.com.au";

  for (let i = 0; i < params.quantity; i++) {
    const qrCode = crypto.randomUUID();
    const ticketNumber = `${orderNumber}-${String(i + 1).padStart(2, "0")}`;
    const checkInUrl = `${baseUrl}/admin/events/checkin/${qrCode}`;
    const qrCodeImage = await QRCode.toDataURL(checkInUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#0F0E0C", light: "#FFFFFF" },
      errorCorrectionLevel: "H",
    });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        qrCode,
        qrCodeImage,
        eventId: params.eventId,
        orderId: order.id,
        attendeeName: params.customerName,
        attendeeEmail: params.customerEmail,
      },
    });
    tickets.push(ticket);
  }

  await prisma.event.update({
    where: { id: params.eventId },
    data: { ticketsSold: { increment: params.quantity } },
  });

  void sendTicketEmail({
    to: params.customerEmail,
    name: params.customerName,
    event,
    tickets,
    order,
  }).catch(console.error);

  return order;
}
