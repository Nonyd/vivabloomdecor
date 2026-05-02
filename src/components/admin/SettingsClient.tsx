"use client";

import type { User } from "@prisma/client";
import * as Tabs from "@radix-ui/react-tabs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type SettingsMap = Record<string, string>;

export default function SettingsClient({
  initialSettings,
  team,
  currentRole,
}: {
  initialSettings: SettingsMap;
  team: User[];
  currentRole: string;
}) {
  const router = useRouter();
  const [general, setGeneral] = useState({
    businessName: initialSettings.businessName ?? "",
    tagline: initialSettings.tagline ?? "",
    phone: initialSettings.phone ?? "",
    email: initialSettings.email ?? "",
    address: initialSettings.address ?? "",
    instagramUrl: initialSettings.instagramUrl ?? "",
    facebookUrl: initialSettings.facebookUrl ?? "",
    tiktokUrl: initialSettings.tiktokUrl ?? "",
    pinterestUrl: initialSettings.pinterestUrl ?? "",
    abn: initialSettings.abn ?? "",
  });
  const [seo, setSeo] = useState({
    defaultMetaTitle: initialSettings.defaultMetaTitle ?? "",
    defaultMetaDescription: initialSettings.defaultMetaDescription ?? "",
    ogImageUrl: initialSettings.ogImageUrl ?? "",
  });
  const [emailTab, setEmailTab] = useState({
    adminNotifyEmail: initialSettings.adminNotifyEmail ?? "",
  });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  async function savePatch(payload: SettingsMap) {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
  }

  async function saveGeneral() {
    try {
      await savePatch(general);
      toast.success("General settings saved");
      router.refresh();
    } catch {
      toast.error("Could not save.");
    }
  }

  async function saveSeo() {
    try {
      await savePatch(seo);
      toast.success("SEO settings saved");
      router.refresh();
    } catch {
      toast.error("Could not save.");
    }
  }

  async function saveEmailSettings() {
    try {
      await savePatch(emailTab);
      toast.success("Email settings saved");
      router.refresh();
    } catch {
      toast.error("Could not save.");
    }
  }

  async function sendTestEmail() {
    try {
      const to = emailTab.adminNotifyEmail || general.email;
      if (!to) {
        toast.error("Set an admin email first.");
        return;
      }
      const res = await fetch("/api/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      if (!res.ok) throw new Error();
      toast.success("Test email sent");
    } catch {
      toast.error("Could not send test email.");
    }
  }

  async function inviteUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) throw new Error();
      toast.success("Invite sent");
      setInviteEmail("");
      setInviteOpen(false);
      router.refresh();
    } catch {
      toast.error("Invite failed.");
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwd.current,
          newPassword: pwd.next,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Password updated");
      setPwd({ current: "", next: "", confirm: "" });
    } catch {
      toast.error("Could not update password.");
    }
  }

  const canInvite = currentRole === "SUPER_ADMIN" || currentRole === "ADMIN";

  return (
    <Tabs.Root defaultValue="general" className="w-full">
      <Tabs.List className="flex flex-wrap gap-2 border-b border-[#EDE8DC] pb-3 mb-8">
        {["general", "seo", "email", "team"].map((id) => (
          <Tabs.Trigger
            key={id}
            value={id}
            className="px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.12em] font-body data-[state=active]:bg-[#C9A96E]/20 data-[state=active]:text-[#0F0E0C] text-[#4A4843]"
          >
            {id === "seo" ? "SEO" : id.charAt(0).toUpperCase() + id.slice(1)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="general" className="space-y-4 max-w-2xl font-body text-sm">
        {(
          [
            ["businessName", "Business name"],
            ["tagline", "Tagline"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["address", "Address"],
            ["instagramUrl", "Instagram URL"],
            ["facebookUrl", "Facebook URL"],
            ["tiktokUrl", "TikTok URL"],
            ["pinterestUrl", "Pinterest URL"],
            ["abn", "ABN"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="block text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/70 mb-1">
              {label}
            </label>
            <input
              value={general[key]}
              onChange={(e) => setGeneral((g) => ({ ...g, [key]: e.target.value }))}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={saveGeneral}
          className="bg-[#C9A96E] text-[#0F0E0C] uppercase tracking-[0.15em] text-[12px] px-6 py-3 rounded-lg mt-4"
        >
          Save general
        </button>
      </Tabs.Content>

      <Tabs.Content value="seo" className="space-y-4 max-w-2xl font-body text-sm">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/70 mb-1">
            Default meta title (use %s for page title)
          </label>
          <input
            value={seo.defaultMetaTitle}
            onChange={(e) => setSeo((s) => ({ ...s, defaultMetaTitle: e.target.value }))}
            className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/70 mb-1">
            Default meta description
          </label>
          <textarea
            rows={3}
            value={seo.defaultMetaDescription}
            onChange={(e) => setSeo((s) => ({ ...s, defaultMetaDescription: e.target.value }))}
            className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/70 mb-1">
            OG image URL
          </label>
          <input
            value={seo.ogImageUrl}
            onChange={(e) => setSeo((s) => ({ ...s, ogImageUrl: e.target.value }))}
            className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
          />
        </div>
        <button
          type="button"
          onClick={saveSeo}
          className="bg-[#C9A96E] text-[#0F0E0C] uppercase tracking-[0.15em] text-[12px] px-6 py-3 rounded-lg"
        >
          Save SEO
        </button>
      </Tabs.Content>

      <Tabs.Content value="email" className="space-y-4 max-w-xl font-body text-sm">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/70 mb-1">
            Admin notification email
          </label>
          <input
            type="email"
            value={emailTab.adminNotifyEmail}
            onChange={(e) => setEmailTab({ adminNotifyEmail: e.target.value })}
            className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={saveEmailSettings}
            className="border border-[#EDE8DC] px-5 py-2 rounded-lg text-[12px] uppercase tracking-[0.12em]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={sendTestEmail}
            className="bg-[#C9A96E] text-[#0F0E0C] px-5 py-2 rounded-lg text-[12px] uppercase tracking-[0.12em]"
          >
            Test email
          </button>
        </div>
      </Tabs.Content>

      <Tabs.Content value="team" className="space-y-8 font-body text-sm">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="font-display italic text-xl text-[#0F0E0C]">Team</h2>
          {canInvite && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="bg-[#C9A96E] text-[#0F0E0C] px-4 py-2 rounded-lg text-[11px] uppercase tracking-[0.12em]"
            >
              Invite user
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-[#F8F5EE] text-[11px] uppercase tracking-[0.15em] text-[#4A4843] text-left">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE8DC]">
              {team.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4">{u.name}</td>
                  <td className="px-6 py-4 text-[#4A4843]">{u.email}</td>
                  <td className="px-6 py-4">{u.role}</td>
                  <td className="px-6 py-4 text-[13px] text-[#4A4843]/80">
                    {new Date(u.createdAt).toLocaleDateString("en-AU")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {inviteOpen && (
          <form
            onSubmit={inviteUser}
            className="max-w-md space-y-4 border border-[#EDE8DC] rounded-xl p-6 bg-white"
          >
            <p className="font-display italic text-lg">Invite user</p>
            <input
              type="email"
              required
              placeholder="Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "STAFF")}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
            >
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[#C9A96E] text-[#0F0E0C] py-2 rounded-lg">
                Send invite
              </button>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="border border-[#EDE8DC] px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="max-w-md space-y-4 border border-[#EDE8DC] rounded-xl p-6 bg-white">
          <p className="font-display italic text-lg">Change your password</p>
          <form onSubmit={changePassword} className="space-y-3">
            <input
              type="password"
              required
              placeholder="Current password"
              value={pwd.current}
              onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
            />
            <input
              type="password"
              required
              placeholder="New password"
              value={pwd.next}
              onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
            />
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={pwd.confirm}
              onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
              className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2"
            />
            <button type="submit" className="w-full bg-[#0F0E0C] text-ivory py-2 rounded-lg text-[12px] uppercase tracking-[0.12em]">
              Update password
            </button>
          </form>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
