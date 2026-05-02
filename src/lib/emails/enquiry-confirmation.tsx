import { Text, Button, Section } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface Props {
  name: string;
  eventType: string;
  eventDate?: string;
}

export function EnquiryConfirmationEmail({ name, eventType, eventDate }: Props) {
  return (
    <BaseLayout preview={`We've received your enquiry, ${name} — Vivabloom`}>
      <Text style={s.eyebrow}>Enquiry Received</Text>

      <Text style={s.heading}>Thank you, {name}.</Text>

      <Text style={s.body}>
        We&apos;ve received your enquiry for a <strong>{eventType}</strong>
        {eventDate ? ` on ${eventDate}` : ""} and we&apos;re already excited.
      </Text>
      <Text style={s.body}>
        A member of our team will be in touch within{" "}
        <strong style={{ color: "#C9A96E" }}>24 hours</strong> to discuss your vision in detail.
      </Text>

      <Section style={s.summaryBox}>
        <Text style={s.summaryLabel}>Your enquiry details</Text>
        <Text style={s.summaryItem}>
          Event type: <strong>{eventType}</strong>
        </Text>
        {eventDate ? (
          <Text style={s.summaryItem}>
            Event date: <strong>{eventDate}</strong>
          </Text>
        ) : null}
      </Section>

      <Section style={{ textAlign: "center", marginTop: "40px" }}>
        <Button href="https://vivabloomdecor.com.au/gallery" style={s.button}>
          Explore Our Work
        </Button>
      </Section>

      <Text style={s.signoff}>
        With love,
        <br />
        <em style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: "#0F0E0C" }}>
          The Vivabloom Team
        </em>
      </Text>
    </BaseLayout>
  );
}

const s = {
  eyebrow: {
    fontFamily: "Arial, sans-serif",
    fontSize: "10px",
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    color: "#C9A96E",
    margin: "0 0 16px",
  },
  heading: {
    fontFamily: "Georgia, serif",
    fontSize: "36px",
    fontStyle: "italic",
    color: "#0F0E0C",
    margin: "0 0 24px",
    lineHeight: "1.2",
  },
  body: {
    fontFamily: "Arial, sans-serif",
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#4A4843",
    margin: "0 0 16px",
  },
  summaryBox: {
    backgroundColor: "#F8F5EE",
    borderLeft: "3px solid #C9A96E",
    padding: "20px 24px",
    marginTop: "32px",
    borderRadius: "0 4px 4px 0",
  },
  summaryLabel: {
    fontFamily: "Arial, sans-serif",
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#C9A96E",
    margin: "0 0 12px",
  },
  summaryItem: {
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    color: "#4A4843",
    margin: "4px 0",
  },
  button: {
    backgroundColor: "#C9A96E",
    color: "#0F0E0C",
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    padding: "14px 36px",
    borderRadius: "9999px",
    textDecoration: "none",
    display: "inline-block",
  },
  signoff: {
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    color: "#9B9589",
    marginTop: "40px",
    lineHeight: "1.8",
  },
};
