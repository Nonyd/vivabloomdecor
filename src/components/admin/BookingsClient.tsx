"use client";

import type { Booking, User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type BookingRow = Booking & {
  user: Pick<User, "name" | "email"> | null;
};

function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const pad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function BookingsClient({ bookings }: { bookings: BookingRow[] }) {
  const router = useRouter();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const days = useMemo(
    () => monthGrid(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  );

  function prevMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  async function updateStatus(id: string, status: Booking["status"]) {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Booking updated");
      router.refresh();
    } catch {
      toast.error("Could not update booking.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-xl border border-[#EDE8DC] bg-white p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg text-[12px] uppercase tracking-[0.12em] font-body ${
              view === "list" ? "bg-[#C9A96E]/20 text-[#0F0E0C]" : "text-[#4A4843]"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg text-[12px] uppercase tracking-[0.12em] font-body ${
              view === "calendar" ? "bg-[#C9A96E]/20 text-[#0F0E0C]" : "text-[#4A4843]"
            }`}
          >
            Calendar
          </button>
        </div>
        <Link
          href="/admin/bookings/new"
          className="inline-flex items-center justify-center bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase tracking-[0.15em] px-5 py-3 rounded-lg hover:bg-[#E8D5B0] transition-colors"
        >
          New booking
        </Link>
      </div>

      {view === "list" ? (
        <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#F8F5EE] font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843] text-left">
              <tr>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Venue</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE8DC]">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#F8F5EE] font-body text-[14px]">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-[#0F0E0C] hover:text-[#C9A96E]"
                    >
                      {b.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#4A4843]">{b.user?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-[#4A4843]">
                    {new Date(b.eventDate).toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-6 py-4 text-[#4A4843]">{b.venue ?? "—"}</td>
                  <td className="px-6 py-4">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value as Booking["status"])}
                      className="border border-[#EDE8DC] rounded-lg px-2 py-1.5 text-[13px] bg-white"
                    >
                      {(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map(
                        (s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={prevMonth}
              className="px-3 py-2 rounded-lg border border-[#EDE8DC] bg-white font-body text-sm hover:border-[#C9A96E]"
              aria-label="Previous month"
            >
              ←
            </button>
            <h3 className="font-display italic text-[#0F0E0C] text-2xl">
              {currentMonth.toLocaleString("en-AU", { month: "long", year: "numeric" })}
            </h3>
            <button
              type="button"
              onClick={nextMonth}
              className="px-3 py-2 rounded-lg border border-[#EDE8DC] bg-white font-body text-sm hover:border-[#C9A96E]"
              aria-label="Next month"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-[#EDE8DC] rounded-xl overflow-hidden border border-[#EDE8DC]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="bg-[#F8F5EE] py-2 text-center text-[11px] uppercase tracking-[0.15em] text-[#4A4843] font-body"
              >
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const dayBookings = day
                ? bookings.filter(
                    (b) => new Date(b.eventDate).toDateString() === day.toDateString()
                  )
                : [];
              return (
                <div
                  key={i}
                  className={`bg-white min-h-[80px] p-2 ${!day ? "bg-[#F8F5EE]" : ""}`}
                >
                  {day && (
                    <>
                      <span
                        className={`text-[13px] font-body ${
                          day.toDateString() === new Date().toDateString()
                            ? "text-[#C9A96E] font-medium"
                            : "text-[#4A4843]"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      {dayBookings.map((b) => (
                        <Link
                          key={b.id}
                          href={`/admin/bookings/${b.id}`}
                          className="mt-1 block bg-[#C9A96E]/10 text-[#C9A96E] text-[11px] rounded px-1.5 py-0.5 font-body truncate hover:bg-[#C9A96E]/20"
                        >
                          {b.title}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
