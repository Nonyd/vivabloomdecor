"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EventNewForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [capacity, setCapacity] = useState("50");
  const [ticketPrice, setTicketPrice] = useState("99");
  const [isFree, setIsFree] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || slugify(title),
          description: description || null,
          date: new Date(date).toISOString(),
          venue,
          venueAddress: venueAddress || null,
          capacity: parseInt(capacity, 10) || 1,
          ticketPrice: isFree ? 0 : parseFloat(ticketPrice) || 0,
          isFree,
          coverImage: coverImage || null,
          published,
        }),
      });
      if (!res.ok) {
        toast.error("Could not save event");
        return;
      }
      const ev = (await res.json()) as { id: string };
      toast.success("Event created");
      router.push(`/admin/events/${ev.id}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="max-w-xl space-y-4 rounded-2xl border border-[#EDE8DC] bg-white p-6">
      <div>
        <label className="mb-1 block font-body text-[11px] uppercase text-[#4A4843]/60">Title</label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block font-body text-[11px] uppercase text-[#4A4843]/60">Slug</label>
        <input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          required
          className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block font-body text-[11px] uppercase text-[#4A4843]/60">Date &amp; time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block font-body text-[11px] uppercase text-[#4A4843]/60">Venue</label>
        <input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
          className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block font-body text-[11px] uppercase text-[#4A4843]/60">Venue address (optional)</label>
        <input
          value={venueAddress}
          onChange={(e) => setVenueAddress(e.target.value)}
          className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-body text-[11px] uppercase text-[#4A4843]/60">Capacity</label>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block font-body text-[11px] uppercase text-[#4A4843]/60">Ticket price (AUD)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            disabled={isFree}
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2 disabled:opacity-50"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 font-body text-sm text-[#4A4843]">
        <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
        Free event
      </label>
      <div>
        <label className="mb-1 block font-body text-[11px] uppercase text-[#4A4843]/60">Cover image URL</label>
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block font-body text-[11px] uppercase text-[#4A4843]/60">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
        />
      </div>
      <label className="flex items-center gap-2 font-body text-sm text-[#4A4843]">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published on website
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#C9A96E] py-3 font-body text-[12px] uppercase tracking-[0.15em] text-[#0F0E0C] disabled:opacity-50"
      >
        {pending ? "Saving…" : "Create Event"}
      </button>
    </form>
  );
}
