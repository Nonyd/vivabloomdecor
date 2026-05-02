"use client";

import type { Enquiry } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import EnquiryStatusBadge from "@/components/admin/EnquiryStatusBadge";

const TAB_STATUSES = ["ALL", "NEW", "IN_REVIEW", "QUOTED", "BOOKED", "CLOSED", "SPAM"] as const;

type TabStatus = (typeof TAB_STATUSES)[number];

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[#4A4843]/60 font-body">{label}</span>
      <span className="text-[#0F0E0C] font-body text-right">{value}</span>
    </div>
  );
}

export default function EnquiriesClient({
  enquiries,
  selectedId,
}: {
  enquiries: Enquiry[];
  selectedId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabStatus>("ALL");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState("");

  const filtered = useMemo(() => {
    if (tab === "ALL") return enquiries;
    return enquiries.filter((e) => e.status === tab);
  }, [enquiries, tab]);

  useEffect(() => {
    if (selectedId) {
      const found = enquiries.find((e) => e.id === selectedId) ?? null;
      setSelected(found);
      if (found) setNotes(found.notes ?? "");
    }
  }, [selectedId, enquiries]);

  const patchEnquiry = useCallback(
    async (id: string, body: { status?: Enquiry["status"]; notes?: string | null }) => {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json() as Promise<Enquiry>;
    },
    []
  );

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!selected) return;
    const status = e.target.value as Enquiry["status"];
    try {
      const updated = await patchEnquiry(selected.id, { status });
      setSelected(updated);
      toast.success("Enquiry status updated");
      router.refresh();
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  }

  async function saveNotes() {
    if (!selected) return;
    try {
      await patchEnquiry(selected.id, { notes: notes || null });
      toast.success("Notes saved");
      router.refresh();
    } catch {
      toast.error("Failed to save notes.");
    }
  }

  async function convertToBooking() {
    if (!selected) return;
    try {
      const res = await fetch(`/api/enquiries/${selected.id}/convert`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { bookingId: string };
      toast.success("Booking created");
      setSelected((s) => (s ? { ...s, status: "BOOKED" } : s));
      router.push(`/admin/bookings/${data.bookingId}`);
      router.refresh();
    } catch {
      toast.error("Could not convert enquiry.");
    }
  }

  function openDetail(enquiry: Enquiry) {
    setSelected(enquiry);
    setNotes(enquiry.notes ?? "");
    const q = new URLSearchParams(searchParams.toString());
    q.set("id", enquiry.id);
    router.replace(`/admin/enquiries?${q.toString()}`, { scroll: false });
  }

  function closeDetail() {
    setSelected(null);
    setNotes("");
    const q = new URLSearchParams(searchParams.toString());
    q.delete("id");
    const s = q.toString();
    router.replace(s ? `/admin/enquiries?${s}` : "/admin/enquiries", { scroll: false });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 relative min-h-[calc(100vh-8rem)]">
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-[#EDE8DC] pb-3">
          {TAB_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTab(s)}
              className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.12em] font-body transition-colors ${
                tab === s
                  ? "bg-[#C9A96E]/20 text-[#0F0E0C]"
                  : "bg-white text-[#4A4843]/70 hover:bg-[#F8F5EE]"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-[#F8F5EE]">
              <tr className="font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843] text-left">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Event Type</th>
                <th className="px-6 py-3">Event Date</th>
                <th className="px-6 py-3">Budget</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE8DC]">
              {filtered.map((enquiry) => (
                <tr
                  key={enquiry.id}
                  className="hover:bg-[#F8F5EE] cursor-pointer font-body text-[14px] text-[#0F0E0C]"
                  onClick={() => openDetail(enquiry)}
                >
                  <td className="px-6 py-4">{enquiry.name}</td>
                  <td className="px-6 py-4 text-[#4A4843]">{enquiry.eventType}</td>
                  <td className="px-6 py-4 text-[#4A4843]">
                    {enquiry.eventDate
                      ? new Date(enquiry.eventDate).toLocaleDateString("en-AU")
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-[#4A4843]">{enquiry.budget ?? "—"}</td>
                  <td className="px-6 py-4">
                    <EnquiryStatusBadge status={enquiry.status} />
                  </td>
                  <td className="px-6 py-4 text-[#4A4843]/80 text-[13px]">
                    {new Date(enquiry.createdAt).toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        openDetail(enquiry);
                      }}
                      className="text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-0 flex justify-end pointer-events-none lg:pointer-events-auto`}
      >
        <button
          type="button"
          aria-hidden={!selected}
          className={`lg:hidden flex-1 bg-black/40 border-0 ${selected ? "pointer-events-auto" : "hidden"}`}
          onClick={closeDetail}
        />
        <div
          className={`pointer-events-auto w-full lg:w-[420px] bg-white border-l border-[#EDE8DC] overflow-y-auto transition-transform duration-300 ease-out shadow-xl lg:shadow-none max-h-screen lg:max-h-none rounded-l-2xl lg:rounded-none ${
            selected ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selected && (
            <>
              <div className="sticky top-0 bg-white border-b border-[#EDE8DC] px-6 py-4 flex justify-between items-start gap-4 z-10">
                <h3 className="font-display italic text-[#0F0E0C] text-xl">{selected.name}</h3>
                <button
                  type="button"
                  onClick={closeDetail}
                  className="text-[#4A4843] hover:text-[#0F0E0C] text-xl leading-none p-1"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-6 space-y-4">
                <DetailRow label="Email" value={selected.email} />
                <DetailRow label="Phone" value={selected.phone ?? "—"} />
                <DetailRow label="Event Type" value={selected.eventType} />
                <DetailRow
                  label="Event Date"
                  value={
                    selected.eventDate
                      ? new Date(selected.eventDate).toLocaleDateString("en-AU")
                      : "—"
                  }
                />
                <DetailRow
                  label="Guests"
                  value={selected.guestCount != null ? String(selected.guestCount) : "—"}
                />
                <DetailRow label="Budget" value={selected.budget ?? "—"} />
                <DetailRow
                  label="Received"
                  value={new Date(selected.createdAt).toLocaleDateString("en-AU")}
                />
              </div>

              <div className="px-6 pb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-body mb-2">
                  Message
                </p>
                <p className="font-body text-[14px] text-[#4A4843] leading-relaxed bg-[#F8F5EE] rounded-xl p-4">
                  {selected.message}
                </p>
              </div>

              <div className="px-6 pb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-body mb-2">
                  Status
                </p>
                <select
                  value={selected.status}
                  onChange={handleStatusChange}
                  className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2.5 font-body text-sm text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E] bg-white"
                >
                  {(["NEW", "IN_REVIEW", "QUOTED", "BOOKED", "CLOSED", "SPAM"] as const).map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="px-6 pb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-body mb-2">
                  Admin Notes
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={saveNotes}
                  rows={4}
                  placeholder="Internal notes (not visible to client)…"
                  className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2.5 font-body text-sm text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E] resize-none"
                />
                <p className="text-[11px] text-[#4A4843]/40 font-body mt-1">Auto-saves on blur</p>
              </div>

              <div className="px-6 pb-8 space-y-3">
                <button
                  type="button"
                  onClick={convertToBooking}
                  className="w-full bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase tracking-[0.15em] py-3 rounded-lg hover:bg-[#E8D5B0] transition-colors"
                >
                  Convert to Booking
                </button>
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: Your Vivabloom Enquiry")}&body=${encodeURIComponent(`Hi ${selected.name},`)}`}
                  className="block text-center border border-[#EDE8DC] text-[#4A4843] font-body text-[12px] uppercase tracking-[0.15em] py-3 rounded-lg hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all"
                >
                  Email Client
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
