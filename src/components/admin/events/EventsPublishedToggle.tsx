"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventsPublishedToggle({
  eventId,
  published,
}: {
  eventId: string;
  published: boolean;
}) {
  const [value, setValue] = useState(published);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function toggle() {
    setPending(true);
    const next = !value;
    setValue(next);
    try {
      await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });
      router.refresh();
    } catch {
      setValue(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={pending}
      className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.1em] ${
        value ? "bg-green-100 text-green-800" : "bg-[#EDE8DC] text-[#4A4843]"
      }`}
    >
      {value ? "Live" : "Draft"}
    </button>
  );
}
