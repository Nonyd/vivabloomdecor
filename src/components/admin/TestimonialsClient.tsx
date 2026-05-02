"use client";

import type { Testimonial } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function TestimonialsClient({ initial }: { initial: Testimonial[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState("");

  async function patch(id: string, body: Partial<{ approved: boolean; featured: boolean }>) {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Updated");
      router.refresh();
    } catch {
      toast.error("Update failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      router.refresh();
    } catch {
      toast.error("Delete failed");
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role: role || null,
          content,
          rating,
          imageUrl: imageUrl || null,
          approved: true,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Testimonial added");
      setOpen(false);
      setName("");
      setRole("");
      setContent("");
      setRating(5);
      setImageUrl("");
      router.refresh();
    } catch {
      toast.error("Could not add testimonial.");
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase tracking-[0.15em] px-5 py-3 rounded-lg hover:bg-[#E8D5B0]"
      >
        Add Testimonial
      </button>

      <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#F8F5EE] font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843] text-left">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3">Approved</th>
              <th className="px-6 py-3">Featured</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE8DC]">
            {initial.map((t) => (
              <tr key={t.id} className="font-body text-[14px] hover:bg-[#F8F5EE]">
                <td className="px-6 py-4 text-[#0F0E0C]">{t.name}</td>
                <td className="px-6 py-4 text-[#4A4843]">{t.role ?? "—"}</td>
                <td className="px-6 py-4">{t.rating} ★</td>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={t.approved}
                    onChange={(e) => patch(t.id, { approved: e.target.checked })}
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={t.featured}
                    onChange={(e) => patch(t.id, { featured: e.target.checked })}
                  />
                </td>
                <td className="px-6 py-4 text-[13px] text-[#4A4843]/80">
                  {new Date(t.createdAt).toLocaleDateString("en-AU")}
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    className="text-red-600 text-[12px] uppercase tracking-[0.12em]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl border-champagne/25 bg-onyx p-6 text-ivory">
          <h2 className="font-display italic text-xl text-champagne">Add testimonial</h2>
          <form onSubmit={add} className="space-y-4 pt-2 font-body text-sm">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/70 mb-1">
                Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-onyx px-3 py-2 text-ivory placeholder:text-ivory/40"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/70 mb-1">
                Role
              </label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-onyx px-3 py-2 text-ivory placeholder:text-ivory/40"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/70 mb-1">
                Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-lg border border-white/15 bg-onyx px-3 py-2 text-ivory placeholder:text-ivory/40"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/70 mb-1">
                Quote
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-onyx px-3 py-2 text-ivory placeholder:text-ivory/40"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/70 mb-1">
                Image URL (optional)
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-onyx px-3 py-2 text-ivory placeholder:text-ivory/40"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#C9A96E] text-[#0F0E0C] uppercase tracking-[0.15em] text-[12px] py-3 rounded-lg"
            >
              Save
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
