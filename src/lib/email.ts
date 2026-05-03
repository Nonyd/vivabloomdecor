import type { Enquiry, Event, Order, Ticket } from "@prisma/client";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { AdminNotificationEmail } from "@/lib/emails/admin-notification";
import { EnquiryConfirmationEmail } from "@/lib/emails/enquiry-confirmation";
import { InvoiceEmail } from "@/lib/emails/invoice-email";
import { TicketEmail } from "@/lib/emails/ticket-email";
import type { InvoiceLineRow } from "@/lib/invoice-line-items";
import { getSetting } from "@/lib/settings";

async function getResendClient(): Promise<Resend | null> {
  const apiKey = await getSetting("resend_api_key");
  if (!apiKey) return null;
  return new Resend(apiKey);
}

async function getFromHeader(): Promise<string> {
  const name = (await getSetting("email_from_name")) || "Vivabloom";
  const addr = (await getSetting("email_from_address")) || "hello@vivabloomdecor.com.au";
  return `${name} <${addr}>`;
}

export async function getAdminNotificationEmail(): Promise<string> {
  const v = await getSetting("admin_notification_email");
  if (v) return v;
  return process.env.ADMIN_EMAIL ?? "info@vivabloomdecor.com.au";
}

export async function sendEnquiryConfirmation(
  to: string,
  name: string,
  eventType: string,
  eventDate?: string
) {
  const resend = await getResendClient();
  if (!resend) return;
  const html = await render(
    EnquiryConfirmationEmail({ name, eventType, eventDate })
  );
  await resend.emails.send({
    from: await getFromHeader(),
    to,
    subject: `We've received your enquiry, ${name} — Vivabloom`,
    html,
  });
}

export async function sendAdminNotification(enquiry: Enquiry) {
  const resend = await getResendClient();
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
    from: await getFromHeader(),
    to: await getAdminNotificationEmail(),
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
  const resend = await getResendClient();
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
    from: await getFromHeader(),
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
  const resend = await getResendClient();
  if (!resend) return { ok: false as const, message: "Resend API key not configured yet" };
  await resend.emails.send({
    from: await getFromHeader(),
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
  const resend = await getResendClient();
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
    from: await getFromHeader(),
    to: opts.to,
    subject: `Your tickets for ${opts.event.title} — Vivabloom`,
    html,
  });
}

export async function sendUserInviteEmail(to: string, tempPassword: string) {
  const resend = await getResendClient();
  if (!resend) return;
  await resend.emails.send({
    from: await getFromHeader(),
    to,
    subject: "Your Vivabloom admin account",
    html: `<p>You've been invited to the Vivabloom admin portal.</p>
      <p><strong>Email:</strong> ${to}<br/>
      <strong>Temporary password:</strong> ${tempPassword}</p>
      <p>Sign in at <a href="https://vivabloomdecor.com.au/login">vivabloomdecor.com.au/login</a> and change your password in Settings.</p>`,
  });
}
