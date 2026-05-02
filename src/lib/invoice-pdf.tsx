import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Invoice, User } from "@prisma/client";
import { parseInvoiceLineItems } from "@/lib/invoice-line-items";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0F0E0C",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  logo: {
    fontSize: 22,
    color: "#C9A96E",
    letterSpacing: 2,
  },
  invoiceLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#4A4843",
  },
  invoiceNumber: {
    fontSize: 18,
    marginTop: 4,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  blockLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#C9A96E",
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EDE8DC",
    paddingBottom: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  th: { flex: 1, fontSize: 9, letterSpacing: 1, color: "#4A4843" },
  tr: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F8F5EE" },
  td: { flex: 1, fontSize: 10 },
  tdRight: { width: 70, textAlign: "right", fontSize: 10 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
    gap: 16,
  },
  totalLabel: { fontSize: 11, letterSpacing: 2 },
  totalValue: { fontSize: 14, color: "#C9A96E", fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#4A4843",
  },
});

export function InvoicePDFDocument({
  invoice,
  client,
}: {
  invoice: Invoice;
  client: Pick<User, "name" | "email"> | null;
}) {
  const { lines, notes } = parseInvoiceLineItems(invoice.lineItems);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Vivabloom</Text>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.blockLabel}>BILL TO</Text>
            <Text>{client?.name ?? "Client"}</Text>
            <Text style={{ marginTop: 4 }}>{client?.email ?? ""}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.blockLabel}>DETAILS</Text>
            <Text>
              Due:{" "}
              {invoice.dueDate
                ? new Date(invoice.dueDate).toLocaleDateString("en-AU")
                : "—"}
            </Text>
            <Text style={{ marginTop: 4 }}>Status: {invoice.status}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 2 }]}>DESCRIPTION</Text>
          <Text style={styles.th}>QTY</Text>
          <Text style={styles.th}>PRICE</Text>
          <Text style={[styles.th, { width: 70, textAlign: "right" }]}>TOTAL</Text>
        </View>

        {lines.map((line, i) => (
          <View key={i} style={styles.tr}>
            <Text style={[styles.td, { flex: 2 }]}>{line.description}</Text>
            <Text style={styles.td}>{line.quantity}</Text>
            <Text style={styles.td}>${line.unitPrice.toFixed(2)}</Text>
            <Text style={styles.tdRight}>${(line.quantity * line.unitPrice).toFixed(2)}</Text>
          </View>
        ))}

        {notes ? (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.blockLabel}>NOTES</Text>
            <Text>{notes}</Text>
          </View>
        ) : null}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL DUE (AUD)</Text>
          <Text style={styles.totalValue}>${invoice.amount.toFixed(2)}</Text>
        </View>

        <Text style={styles.footer} fixed>
          vivabloomdecor.com.au · Luxury event décor · Melbourne, Victoria
        </Text>
      </Page>
    </Document>
  );
}
