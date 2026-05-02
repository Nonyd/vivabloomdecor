"use client";

import type { Booking, User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { toast } from "sonner";
import "react-day-picker/style.css";
import { totalFromLines, type InvoiceLineRow } from "@/lib/invoice-line-items";

export default function InvoiceNewForm({
  clients,
  bookings,
}: {
  clients: Pick<User, "id" | "name" | "email">[];
  bookings: Pick<Booking, "id" | "title" | "eventDate">[];
}) {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [bookingId, setBookingId] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineRow[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [saving, setSaving] = useState<"draft" | "send" | null>(null);

  const total = useMemo(
    () => totalFromLines(lineItems.filter((l) => l.description.trim())),
    [lineItems]
  );

  function updateLine(i: number, patch: Partial<InvoiceLineRow>) {
    setLineItems((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function addLine() {
    setLineItems((rows) => [...rows, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeLine(i: number) {
    setLineItems((rows) => rows.filter((_, j) => j !== i));
  }

  async function submit(mode: "draft" | "send") {
    const lines = lineItems.filter((l) => l.description.trim());
    if (lines.length === 0) {
      toast.error("Add at least one line item.");
      return;
    }
    if (mode === "send" && !userId) {
      toast.error("Select a client to send the invoice.");
      return;
    }

    setSaving(mode);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || null,
          bookingId: bookingId || null,
          dueDate: dueDate ? dueDate.toISOString() : null,
          lineItems: { lines, notes: notes || undefined },
          status: mode === "send" ? "SENT" : "DRAFT",
          send: mode === "send",
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(mode === "send" ? "Invoice sent" : "Draft saved");
      router.push("/admin/invoices");
      router.refresh();
    } catch {
      toast.error("Could not save invoice.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <Link
        href="/admin/invoices"
        className="inline-block text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] font-body hover:underline"
      >
        ← Invoices
      </Link>

      <div className="bg-white rounded-2xl border border-[#EDE8DC] p-8 space-y-6 font-body text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 mb-1">
              Client
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2.5 bg-white"
            >
              <option value="">No client / manual billing</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ?? c.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 mb-1">
              Linked booking (optional)
            </label>
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2.5 bg-white"
            >
              <option value="">None</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {new Date(b.eventDate).toLocaleDateString("en-AU")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 mb-2">
            Due date
          </label>
          <DayPicker
            mode="single"
            selected={dueDate}
            onSelect={setDueDate}
            className="rounded-xl border border-[#EDE8DC] p-3 bg-[#F8F5EE]"
          />
          {dueDate && (
            <p className="text-[12px] text-[#4A4843]/70 mt-2">
              Selected: {format(dueDate, "PPP")}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E] mb-3">Line items</p>
          <div className="space-y-3">
            {lineItems.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <input
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) => updateLine(i, { description: e.target.value })}
                  className="col-span-12 md:col-span-5 border border-[#EDE8DC] rounded-lg px-3 py-2"
                />
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: Number(e.target.value) || 0 })}
                  className="col-span-4 md:col-span-2 border border-[#EDE8DC] rounded-lg px-3 py-2"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) || 0 })}
                  className="col-span-4 md:col-span-2 border border-[#EDE8DC] rounded-lg px-3 py-2"
                />
                <div className="col-span-3 md:col-span-2 text-right text-[13px] text-[#4A4843] py-2">
                  ${(line.quantity * line.unitPrice).toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  className="col-span-1 text-red-600 text-xs"
                  aria-label="Remove line"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLine}
            className="mt-3 text-[11px] uppercase tracking-[0.15em] text-[#C9A96E]"
          >
            + Add line item
          </button>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[#EDE8DC] pt-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/50">Total (AUD)</p>
            <p className="font-display italic text-[36px] text-[#C9A96E]">${total.toFixed(2)}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={!!saving}
              onClick={() => submit("draft")}
              className="border border-[#EDE8DC] px-5 py-3 rounded-lg text-[12px] uppercase tracking-[0.12em] hover:border-[#C9A96E]"
            >
              {saving === "draft" ? "Saving…" : "Save as Draft"}
            </button>
            <button
              type="button"
              disabled={!!saving}
              onClick={() => submit("send")}
              className="bg-[#C9A96E] text-[#0F0E0C] px-5 py-3 rounded-lg text-[12px] uppercase tracking-[0.12em] hover:bg-[#E8D5B0]"
            >
              {saving === "send" ? "Sending…" : "Save & Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
