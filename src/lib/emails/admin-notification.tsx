import { Text, Button, Section, Row, Column } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface Props {
  enquiryId: string;
  name: string;
  email: string;
  phone?: string;
  eventType: string;
  eventDate?: string;
  guestCount?: number;
  budget?: string;
  message: string;
  receivedAt: string;
}

export function AdminNotificationEmail(props: Props) {
  return (
    <BaseLayout preview={`New enquiry from ${props.name} — ${props.eventType}`}>
      <Text style={s.eyebrow}>New Enquiry</Text>
      <Text style={s.heading}>{props.name} wants to talk.</Text>

      <Section style={s.grid}>
        <Field label="Name" value={props.name} />
        <Field label="Email" value={props.email} />
        <Field label="Phone" value={props.phone ?? "—"} />
        <Field label="Event type" value={props.eventType} />
        <Field label="Event date" value={props.eventDate ?? "—"} />
        <Field label="Guests" value={props.guestCount?.toString() ?? "—"} />
        <Field label="Budget" value={props.budget ?? "—"} />
        <Field label="Received" value={props.receivedAt} />
      </Section>

      <Text style={s.messageLabel}>Their message</Text>
      <Section style={s.messageBox}>
        <Text style={s.messageText}>&ldquo;{props.message}&rdquo;</Text>
      </Section>

      <Section style={{ textAlign: "center", marginTop: "36px" }}>
        <Button
          href={`https://vivabloomdecor.com.au/admin/enquiries?id=${props.enquiryId}`}
          style={s.button}
        >
          View in Dashboard →
        </Button>
      </Section>
    </BaseLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ marginBottom: "8px" }}>
      <Column style={{ width: "120px" }}>
        <Text style={s.fieldLabel}>{label}</Text>
      </Column>
      <Column>
        <Text style={s.fieldValue}>{value}</Text>
      </Column>
    </Row>
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
    fontSize: "32px",
    fontStyle: "italic",
    color: "#0F0E0C",
    margin: "0 0 32px",
    lineHeight: "1.2",
  },
  grid: {
    backgroundColor: "#F8F5EE",
    padding: "24px",
    borderRadius: "4px",
    marginBottom: "24px",
  },
  fieldLabel: {
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    color: "#9B9589",
    margin: "0",
  },
  fieldValue: {
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    color: "#0F0E0C",
    margin: "0",
  },
  messageLabel: {
    fontFamily: "Arial, sans-serif",
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#C9A96E",
    margin: "0 0 8px",
  },
  messageBox: {
    borderLeft: "3px solid #C9A96E",
    paddingLeft: "20px",
  },
  messageText: {
    fontFamily: "Georgia, serif",
    fontSize: "16px",
    fontStyle: "italic",
    color: "#4A4843",
    lineHeight: "1.7",
    margin: "0",
  },
  button: {
    backgroundColor: "#0F0E0C",
    color: "#C9A96E",
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    padding: "14px 32px",
    borderRadius: "9999px",
    textDecoration: "none",
  },
};
