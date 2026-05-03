import Link from "next/link";
import EventNewForm from "@/components/admin/events/EventNewForm";

export default function NewEventPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/events" className="font-body text-[12px] text-[#4A4843]/60 hover:text-[#C9A96E]">
          ← Events
        </Link>
        <h1 className="mt-2 font-display text-[36px] italic text-[#0F0E0C]">New Event</h1>
      </div>
      <EventNewForm />
    </div>
  );
}
