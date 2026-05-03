import type { Enquiry, Event, Order, Ticket } from "@prisma/client";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { AdminNotificationEmail } from "@/lib/emails/admin-notification";
import { EnquiryConfirmationEmail } from "@/lib/emails/enquiry-confirmation";
import { InvoiceEmail } from "@/lib/emails/invoice-email";
import { TicketEmail } from "@/lib/emails/ticket-email";
import type { InvoiceLineRow } from "@/lib/invoice-line-items";

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function getAdminNotificationEmail() {
  return process.env.ADMIN_EMAIL ?? "info@vivabloomdecor.com.au";
}

const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "Vivabloom <hello@vivabloomdecor.com.au>";

export async function sendEnquiryConfirmation(
  to: string,
  name: string,
  eventType: string,
  eventDate?: string
) {
  if (!resend) return;
  const html = await render(
    EnquiryConfirmationEmail({ name, eventType, eventDate })
  );
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `We've received your enquiry, ${name} — Vivabloom`,
    html,
  });
}

export async function sendAdminNotification(enquiry: Enquiry) {
  if (!resend) return;
  const html = await render(
    AdminNotificationEmail({
      enquiryId: enquiry.id,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone ?? undefined,
      eventType: enquiry.eventType,
      eventDate: enquiry.eventDate?.toLocaleDateString("en-AU", { dateStyle: "long" }),
      guestCount: enquiry.guestCount ?? undefined,
      budget: enquiry.budget ?? undefined,
      message: enquiry.message,
      receivedAt: new Date().toLocaleDateString("en-AU", { dateStyle: "long" }),
    })
  );
  await resend.emails.send({
    from: fromEmail,
    to: getAdminNotificationEmail(),
    subject: `New enquiry: ${enquiry.eventType} — ${enquiry.name}`,
    html,
  });
}

export async function sendInvoiceEmail(opts: {
  to: string;
  invoiceNumber: string;
  pdfBuffer: Buffer;
  clientName?: string;
  invoiceId: string;
  dueDate: string;
  lineItems: InvoiceLineRow[];
  total: number;
}) {
  if (!resend) return;
  const displayName = opts.clientName?.trim() || "there";
  const html = await render(
    InvoiceEmail({
      invoiceNumber: opts.invoiceNumber,
      clientName: displayName,
      dueDate: opts.dueDate,
      lineItems: opts.lineItems,
      total: opts.total,
      invoiceId: opts.invoiceId,
    })
  );
  await resend.emails.send({
    from: fromEmail,
    to: opts.to,
    subject: `Invoice #${opts.invoiceNumber} from Vivabloom`,
    html,
    attachments: [
      {
        filename: `invoice-${opts.invoiceNumber}.pdf`,
        content: opts.pdfBuffer,
      },
    ],
  });
}

export async function sendTestEmail(to: string) {
  if (!resend) return { ok: false as const, message: "Resend not configured" };
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: "Vivabloom — test email",
    html: "<p>This is a test message from your Vivabloom admin settings.</p>",
  });
  return { ok: true as const };
}

export async function sendTicketEmail(opts: {
  to: string;
  name: string;
  event: Event;
  tickets: Ticket[];
  order: Order;
}) {
  if (!resend) return;
  const html = await render(
    TicketEmail({
      name: opts.name,
      event: opts.event,
      tickets: opts.tickets,
      order: opts.order,
    })
  );
  await resend.emails.send({
    from: fromEmail,
    to: opts.to,
    subject: `Your tickets for ${opts.event.title} — Vivabloom`,
    html,
  });
}

export async function sendUserInviteEmail(to: string, tempPassword: string) {
  if (!resend) return;
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: "Your Vivabloom admin account",
    html: `<p>You've been invited to the Vivabloom admin portal.</p>
      <p><strong>Email:</strong> ${to}<br/>
      <strong>Temporary password:</strong> ${tempPassword}</p>
      <p>Sign in at <a href="https://vivabloomdecor.com.au/login">vivabloomdecor.com.au/login</a> and change your password in Settings.</p>`,
  });
}
