"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          eventType,
          eventDate: new Date(eventDate).toISOString(),
          venue: venue || null,
        }),
      });
      if (!res.ok) throw new Error();
      const b = (await res.json()) as { id: string };
      toast.success("Booking created");
      router.push(`/admin/bookings/${b.id}`);
      router.refresh();
    } catch {
      toast.error("Could not create booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <Link
        href="/admin/bookings"
        className="inline-block text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] font-body hover:underline mb-6"
      >
        ← Back
      </Link>
      <div className="bg-white rounded-2xl border border-[#EDE8DC] p-8">
        <h1 className="font-display italic text-2xl text-[#0F0E0C] mb-6">New booking</h1>
        <form onSubmit={handleSubmit} className="space-y-4 font-body text-sm">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 mb-1">
              Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 mb-1">
              Event type
            </label>
            <input
              required
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 mb-1">
              Event date
            </label>
            <input
              required
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-[#4A4843]/70 mb-1">
              Venue
            </label>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2.5"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A96E] text-[#0F0E0C] uppercase tracking-[0.15em] text-[12px] py-3 rounded-lg hover:bg-[#E8D5B0] disabled:opacity-50"
          >
            {loading ? "Saving…" : "Create booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
