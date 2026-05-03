"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckInAction({
  ticketId,
  checkedInBy,
}: {
  ticketId: string;
  checkedInBy: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function checkIn() {
    setLoading(true);
    try {
      await fetch("/api/tickets/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, checkedInBy }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void checkIn()}
      disabled={loading}
      className="mt-6 w-full rounded-xl bg-green-600 py-4 font-body text-lg uppercase tracking-[0.15em] text-white transition-colors hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? "Checking in…" : "✓ Check In Attendee"}
    </button>
  );
}
