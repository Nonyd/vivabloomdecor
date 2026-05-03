import { Text, Section, Img } from "@react-email/components";
import { BaseLayout } from "@/lib/emails/base-layout";

interface TicketEmailProps {
  name: string;
  event: {
    title: string;
    date: Date | string;
    venue: string;
    venueAddress?: string | null;
  };
  tickets: { id: string; ticketNumber: string; qrCodeImage?: string | null }[];
  order: { orderNumber: string };
}

export function TicketEmail({ name, event, tickets, order }: TicketEmailProps) {
  const d = typeof event.date === "string" ? new Date(event.date) : event.date;
  return (
    <BaseLayout preview={`Your ticket${tickets.length > 1 ? "s" : ""} for ${event.title} — Vivabloom`}>
      <Text style={s.eyebrow}>Your Ticket{tickets.length > 1 ? "s" : ""}</Text>
      <Text style={s.heading}>You&apos;re in, {name}!</Text>
      <Text style={s.body}>
        Here {tickets.length > 1 ? "are your tickets" : "is your ticket"} for <strong>{event.title}</strong>.
        Present the QR code at the door for entry.
      </Text>

      <Section style={s.eventBox}>
        <Text style={s.eventTitle}>{event.title}</Text>
        <Text style={s.eventDetail}>
          📅 {d.toLocaleDateString("en-AU", { dateStyle: "full" })}
        </Text>
        <Text style={s.eventDetail}>🕐 {d.toLocaleTimeString("en-AU", { timeStyle: "short" })}</Text>
        <Text style={s.eventDetail}>
          📍 {event.venue}
          {event.venueAddress ? `, ${event.venueAddress}` : ""}
        </Text>
      </Section>

      {tickets.map((ticket, i) => (
        <Section key={ticket.id} style={s.ticketBox}>
          <Text style={s.ticketLabel}>
            Ticket {i + 1} of {tickets.length}
          </Text>
          <Text style={s.ticketNumber}>{ticket.ticketNumber}</Text>
          {ticket.qrCodeImage ? (
            <Img
              src={ticket.qrCodeImage}
              alt="QR Code"
              width={180}
              height={180}
              style={{ margin: "16px auto", display: "block" }}
            />
          ) : null}
          <Text style={s.ticketHint}>Show this QR code at the entrance</Text>
        </Section>
      ))}

      <Text style={s.orderRef}>Order reference: {order.orderNumber}</Text>
    </BaseLayout>
  );
}

const s = {
  eyebrow: {
    fontFamily: "Arial",
    fontSize: "10px",
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    color: "#C9A96E",
    margin: "0 0 16px",
  },
  heading: {
    fontFamily: "Georgia",
    fontSize: "36px",
    fontStyle: "italic",
    color: "#0F0E0C",
    margin: "0 0 16px",
  },
  body: {
    fontFamily: "Arial",
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#4A4843",
    margin: "0 0 24px",
  },
  eventBox: {
    backgroundColor: "#F8F5EE",
    borderLeft: "3px solid #C9A96E",
    padding: "20px 24px",
    marginBottom: "24px",
  },
  eventTitle: {
    fontFamily: "Georgia",
    fontSize: "22px",
    fontStyle: "italic",
    color: "#0F0E0C",
    margin: "0 0 12px",
  },
  eventDetail: {
    fontFamily: "Arial",
    fontSize: "14px",
    color: "#4A4843",
    margin: "4px 0",
  },
  ticketBox: {
    backgroundColor: "#0F0E0C",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
    textAlign: "center" as const,
  },
  ticketLabel: {
    fontFamily: "Arial",
    fontSize: "10px",
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.4)",
    margin: "0 0 8px",
  },
  ticketNumber: {
    fontFamily: "Georgia",
    fontSize: "20px",
    fontStyle: "italic",
    color: "#C9A96E",
    margin: "0 0 16px",
  },
  ticketHint: {
    fontFamily: "Arial",
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    margin: "12px 0 0",
  },
  orderRef: {
    fontFamily: "Arial",
    fontSize: "11px",
    color: "#9B9589",
    textAlign: "center" as const,
    marginTop: "24px",
  },
};
