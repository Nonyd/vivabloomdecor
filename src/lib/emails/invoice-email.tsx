import { Text, Button, Section, Row, Column, Hr } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  invoiceNumber: string;
  clientName: string;
  dueDate: string;
  lineItems: LineItem[];
  total: number;
  invoiceId: string;
}

export function InvoiceEmail({
  invoiceNumber,
  clientName,
  dueDate,
  lineItems,
  total,
  invoiceId,
}: Props) {
  return (
    <BaseLayout preview={`Invoice #${invoiceNumber} from Vivabloom — Due ${dueDate}`}>
      <Text style={s.eyebrow}>Invoice #{invoiceNumber}</Text>
      <Text style={s.heading}>Hi {clientName},</Text>
      <Text style={s.body}>
        Please find your invoice attached. Payment is due by{" "}
        <strong style={{ color: "#C9A96E" }}>{dueDate}</strong>.
      </Text>

      <Section style={s.table}>
        <Row style={s.tableHeader}>
          <Column style={{ width: "60%" }}>
            <Text style={s.colHead}>Description</Text>
          </Column>
          <Column style={{ width: "15%" }}>
            <Text style={{ ...s.colHead, textAlign: "center" }}>Qty</Text>
          </Column>
          <Column style={{ width: "25%" }}>
            <Text style={{ ...s.colHead, textAlign: "right" }}>Amount</Text>
          </Column>
        </Row>
        <Hr style={{ borderColor: "#C9A96E", opacity: 0.3, margin: 0 }} />

        {lineItems.map((item, i) => (
          <Row key={i} style={s.tableRow}>
            <Column style={{ width: "60%" }}>
              <Text style={s.cell}>{item.description}</Text>
            </Column>
            <Column style={{ width: "15%" }}>
              <Text style={{ ...s.cell, textAlign: "center" }}>{item.quantity}</Text>
            </Column>
            <Column style={{ width: "25%" }}>
              <Text style={{ ...s.cell, textAlign: "right" }}>
                ${(item.quantity * item.unitPrice).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
              </Text>
            </Column>
          </Row>
        ))}

        <Hr style={{ borderColor: "#EDE8DC", margin: 0 }} />

        <Row style={{ padding: "16px 0 0" }}>
          <Column style={{ width: "75%" }}>
            <Text style={s.totalLabel}>Total Due</Text>
          </Column>
          <Column style={{ width: "25%" }}>
            <Text style={s.totalAmount}>
              ${total.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ textAlign: "center", marginTop: "40px" }}>
        <Button
          href={`https://vivabloomdecor.com.au/api/invoices/${invoiceId}/pdf`}
          style={s.button}
        >
          Download PDF Invoice
        </Button>
      </Section>

      <Text style={s.note}>
        If you have any questions about this invoice, reply to this email or call us directly.
        We&apos;re always happy to help.
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
    fontSize: "32px",
    fontStyle: "italic",
    color: "#0F0E0C",
    margin: "0 0 16px",
  },
  body: {
    fontFamily: "Arial, sans-serif",
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#4A4843",
    margin: "0 0 32px",
  },
  table: {
    backgroundColor: "#F8F5EE",
    padding: "24px",
    borderRadius: "4px",
  },
  tableHeader: {
    marginBottom: "12px",
  },
  tableRow: {
    padding: "10px 0",
    borderBottom: "1px solid #EDE8DC",
  },
  colHead: {
    fontFamily: "Arial, sans-serif",
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#9B9589",
    margin: "0 0 12px",
  },
  cell: {
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    color: "#0F0E0C",
    margin: "10px 0",
  },
  totalLabel: {
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#9B9589",
    margin: "0",
    textAlign: "right" as const,
  },
  totalAmount: {
    fontFamily: "Georgia, serif",
    fontSize: "28px",
    fontStyle: "italic",
    color: "#0F0E0C",
    margin: "0",
    textAlign: "right" as const,
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
  },
  note: {
    fontFamily: "Arial, sans-serif",
    fontSize: "13px",
    color: "#9B9589",
    lineHeight: "1.6",
    marginTop: "32px",
  },
};
