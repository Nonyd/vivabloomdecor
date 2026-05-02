export type InvoiceLineRow = { description: string; quantity: number; unitPrice: number };

export type InvoiceLinePayload = { lines: InvoiceLineRow[]; notes?: string };

export function parseInvoiceLineItems(raw: unknown): InvoiceLinePayload {
  if (Array.isArray(raw)) {
    return { lines: raw as InvoiceLineRow[] };
  }
  if (
    raw &&
    typeof raw === "object" &&
    "lines" in raw &&
    Array.isArray((raw as InvoiceLinePayload).lines)
  ) {
    return raw as InvoiceLinePayload;
  }
  return { lines: [] };
}

export function totalFromLines(lines: InvoiceLineRow[]): number {
  return lines.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);
}
