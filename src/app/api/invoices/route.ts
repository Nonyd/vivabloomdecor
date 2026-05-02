import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffSession } from "@/lib/admin-api";
import { InvoicePDFDocument } from "@/lib/invoice-pdf";
import {
  parseInvoiceLineItems,
  totalFromLines,
  type InvoiceLinePayload,
} from "@/lib/invoice-line-items";
import { sendInvoiceEmail } from "@/lib/email";

const createSchema = z.object({
  userId: z.string().optional().nullable(),
  bookingId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  lineItems: z.object({
    lines: z.array(
      z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
      })
    ),
    notes: z.string().optional(),
  }),
  status: z.enum(["DRAFT", "SENT"]).optional(),
  send: z.boolean().optional(),
});

export async function GET() {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(invoices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const payload: InvoiceLinePayload = data.lineItems;
    const amount = totalFromLines(payload.lines);

    const count = await prisma.invoice.count();
    const number = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const status = data.send ? "SENT" : data.status ?? "DRAFT";

    const invoice = await prisma.invoice.create({
      data: {
        number,
        amount,
        status,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        lineItems: JSON.parse(JSON.stringify(payload)) as object,
        userId: data.userId ?? undefined,
        bookingId: data.bookingId ?? undefined,
      },
      include: { user: true },
    });

    const shouldSend = data.send === true && invoice.user?.email;

    if (shouldSend) {
      const buf = await renderToBuffer(
        createElement(InvoicePDFDocument, {
          invoice,
          client: invoice.user,
        }) as Parameters<typeof renderToBuffer>[0]
      );
      const payload = parseInvoiceLineItems(invoice.lineItems);
      await sendInvoiceEmail({
        to: invoice.user!.email!,
        invoiceNumber: invoice.number,
        pdfBuffer: Buffer.from(buf),
        clientName: invoice.user?.name ?? undefined,
        invoiceId: invoice.id,
        dueDate:
          invoice.dueDate?.toLocaleDateString("en-AU", { dateStyle: "long" }) ?? "—",
        lineItems: payload.lines,
        total: invoice.amount,
      });
    }

    return NextResponse.json(invoice);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
