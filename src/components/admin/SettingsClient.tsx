"use client";

import type { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Globe,
  Phone,
  CreditCard,
  Mail,
  Image as ImageIcon,
  Users,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "contact", label: "Contact & Social", icon: Phone },
  { id: "stripe", label: "Stripe", icon: CreditCard },
  { id: "paypal", label: "PayPal", icon: CreditCard },
  { id: "email", label: "Email (Resend)", icon: Mail },
  { id: "cloudinary", label: "Cloudinary", icon: ImageIcon },
  { id: "team", label: "Team", icon: Users },
] as const;

type SettingsMap = Record<string, string>;

export default function SettingsClient({
  team,
  currentRole,
}: {
  team: User[];
  currentRole: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("general");
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: SettingsMap) => {
        if (!data.paypal_mode) data.paypal_mode = "sandbox";
        if (data.stripe_afterpay_enabled === undefined || data.stripe_afterpay_enabled === "") {
          data.stripe_afterpay_enabled = "true";
        }
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Could not load settings");
        setLoading(false);
      });
  }, []);

  function update(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function save(keys: string[]) {
    setSaving(true);
    const payload = Object.fromEntries(keys.map((k) => [k, settings[k] ?? ""]));
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Settings saved!");
      const r = await fetch("/api/settings");
      if (r.ok) {
        const data = (await r.json()) as SettingsMap;
        if (!data.paypal_mode) data.paypal_mode = "sandbox";
        if (data.stripe_afterpay_enabled === undefined || data.stripe_afterpay_enabled === "") {
          data.stripe_afterpay_enabled = "true";
        }
        setSettings(data);
      }
      router.refresh();
    } else {
      toast.error("Failed to save settings");
    }
  }

  const canInvite = currentRole === "SUPER_ADMIN" || currentRole === "ADMIN";
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C9A96E] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl gap-8">
      <div className="w-52 flex-shrink-0">
        <nav className="space-y-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-body text-[13px] transition-all ${
                tab === t.id
                  ? "bg-[#C9A96E]/10 text-[#C9A96E]"
                  : "text-[#4A4843] hover:bg-white hover:text-[#0F0E0C]"
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1">
        {tab === "general" && (
          <SettingsSection
            title="General"
            description="Basic site information"
            onSave={() => save(["site_name", "site_tagline", "abn", "meta_description"])}
            saving={saving}
          >
            <Field label="Business Name" hint="Shown in browser tab and emails">
              <Input
                value={settings.site_name ?? ""}
                onChange={(v) => update("site_name", v)}
              />
            </Field>
            <Field label="Tagline" hint="Used in footer and emails">
              <Input
                value={settings.site_tagline ?? ""}
                onChange={(v) => update("site_tagline", v)}
              />
            </Field>
            <Field label="ABN" hint="Australian Business Number">
              <Input
                value={settings.abn ?? ""}
                onChange={(v) => update("abn", v)}
                placeholder="XX XXX XXX XXX"
              />
            </Field>
            <Field label="Default Meta Description" hint="Used for SEO on pages without a custom description">
              <Textarea
                value={settings.meta_description ?? ""}
                onChange={(v) => update("meta_description", v)}
              />
            </Field>
          </SettingsSection>
        )}

        {tab === "contact" && (
          <SettingsSection
            title="Contact & Social"
            description="Shown on the website, footer, and contact page"
            onSave={() =>
              save([
                "contact_phone",
                "contact_email",
                "contact_address",
                "contact_city",
                "contact_hours",
                "social_instagram",
                "social_facebook",
                "social_tiktok",
                "social_pinterest",
                "google_maps_embed",
              ])
            }
            saving={saving}
          >
            <Field label="Phone Number">
              <Input
                value={settings.contact_phone ?? ""}
                onChange={(v) => update("contact_phone", v)}
                placeholder="+61 3 XXXX XXXX"
              />
            </Field>
            <Field label="Email Address">
              <Input
                value={settings.contact_email ?? ""}
                onChange={(v) => update("contact_email", v)}
                placeholder="info@vivabloomdecor.com.au"
              />
            </Field>
            <Field label="Street Address">
              <Input
                value={settings.contact_address ?? ""}
                onChange={(v) => update("contact_address", v)}
              />
            </Field>
            <Field label="City">
              <Input
                value={settings.contact_city ?? ""}
                onChange={(v) => update("contact_city", v)}
                placeholder="Melbourne, Victoria, Australia"
              />
            </Field>
            <Field label="Business Hours">
              <Input
                value={settings.contact_hours ?? ""}
                onChange={(v) => update("contact_hours", v)}
                placeholder="Mon–Fri 9am–6pm AEST"
              />
            </Field>

            <div className="mt-2 border-t border-[#EDE8DC] pt-5">
              <p className="mb-4 font-body text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                Social Media Links
              </p>
              {(
                [
                  {
                    key: "social_instagram",
                    label: "Instagram URL",
                    placeholder: "https://instagram.com/vivabloomdecor",
                  },
                  {
                    key: "social_facebook",
                    label: "Facebook URL",
                    placeholder: "https://facebook.com/vivabloomdecor",
                  },
                  {
                    key: "social_tiktok",
                    label: "TikTok URL",
                    placeholder: "https://tiktok.com/@vivabloomdecor",
                  },
                  {
                    key: "social_pinterest",
                    label: "Pinterest URL",
                    placeholder: "https://pinterest.com/vivabloomdecor",
                  },
                ] as const
              ).map((s) => (
                <Field key={s.key} label={s.label}>
                  <Input
                    value={settings[s.key] ?? ""}
                    onChange={(v) => update(s.key, v)}
                    placeholder={s.placeholder}
                  />
                </Field>
              ))}
            </div>

            <Field
              label="Google Maps Embed URL"
              hint="Paste the src URL from Google Maps → Share → Embed a map"
            >
              <Input
                value={settings.google_maps_embed ?? ""}
                onChange={(v) => update("google_maps_embed", v)}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </Field>
          </SettingsSection>
        )}

        {tab === "stripe" && (
          <SettingsSection
            title="Stripe"
            description="Card payments and Afterpay. Get these from dashboard.stripe.com → Developers → API Keys"
            onSave={() =>
              save([
                "stripe_publishable_key",
                "stripe_secret_key",
                "stripe_webhook_secret",
                "stripe_afterpay_enabled",
              ])
            }
            saving={saving}
          >
            <div className="px-6 pt-5">
              <StatusBanner
                configured={!!settings.stripe_secret_key}
                label="Stripe"
                helpUrl="https://dashboard.stripe.com/developers"
              />
            </div>

            <Field label="Publishable Key" hint="Starts with pk_live_ or pk_test_">
              <Input
                value={settings.stripe_publishable_key ?? ""}
                onChange={(v) => update("stripe_publishable_key", v)}
                placeholder="pk_live_..."
              />
            </Field>
            <Field label="Secret Key" hint="Starts with sk_live_ or sk_test_ — stored encrypted" secret>
              <SecretInput
                value={settings.stripe_secret_key ?? ""}
                onChange={(v) => update("stripe_secret_key", v)}
                placeholder="sk_live_..."
              />
            </Field>
            <Field
              label="Webhook Secret"
              hint="From Stripe Dashboard → Developers → Webhooks. Starts with whsec_"
              secret
            >
              <SecretInput
                value={settings.stripe_webhook_secret ?? ""}
                onChange={(v) => update("stripe_webhook_secret", v)}
                placeholder="whsec_..."
              />
            </Field>

            <div className="mx-6 mb-2 rounded-xl border border-[#EDE8DC] bg-[#F8F5EE] p-4">
              <p className="mb-1 font-body text-[12px] font-medium text-[#4A4843]">
                Webhook URL to add in Stripe:
              </p>
              <code className="break-all font-mono text-[13px] text-[#C9A96E]">
                https://vivabloomdecor.com.au/api/tickets/webhook/stripe
              </code>
              <p className="mt-2 font-body text-[11px] text-[#4A4843]/50">
                Event to listen for: <code>checkout.session.completed</code>
              </p>
            </div>

            <Field label="Afterpay / Clearpay">
              <div className="flex items-center gap-3">
                <Toggle
                  value={settings.stripe_afterpay_enabled === "true"}
                  onChange={(v) => update("stripe_afterpay_enabled", String(v))}
                />
                <span className="font-body text-[13px] text-[#4A4843]">Enable Afterpay at checkout</span>
              </div>
              <p className="mt-1 font-body text-[11px] text-[#4A4843]/50">
                Also enable Afterpay/Clearpay in your Stripe Dashboard → Settings → Payment Methods
              </p>
            </Field>

            <TestButton
              label="Test Stripe Connection"
              onClick={async () => {
                const res = await fetch("/api/settings/test-stripe");
                const json = (await res.json()) as { success?: boolean; message?: string };
                if (json.success) toast.success(json.message);
                else toast.error(json.message);
              }}
            />
          </SettingsSection>
        )}

        {tab === "paypal" && (
          <SettingsSection
            title="PayPal"
            description="PayPal checkout. Get credentials from developer.paypal.com → Apps & Credentials"
            onSave={() => save(["paypal_client_id", "paypal_client_secret", "paypal_mode"])}
            saving={saving}
          >
            <div className="px-6 pt-5">
              <StatusBanner
                configured={!!settings.paypal_client_id}
                label="PayPal"
                helpUrl="https://developer.paypal.com"
              />
            </div>

            <Field label="Mode">
              <div className="flex gap-3">
                {(["sandbox", "live"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => update("paypal_mode", mode)}
                    className={`flex-1 rounded-lg border py-2.5 font-body text-[13px] uppercase tracking-[0.15em] transition-all ${
                      settings.paypal_mode === mode
                        ? "border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]"
                        : "border-[#EDE8DC] text-[#4A4843] hover:border-[#C9A96E]"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="mt-1 font-body text-[11px] text-[#4A4843]/50">
                Use Sandbox for testing, switch to Live when ready for real payments
              </p>
            </Field>

            <Field label="Client ID">
              <Input
                value={settings.paypal_client_id ?? ""}
                onChange={(v) => update("paypal_client_id", v)}
                placeholder="AaBb..."
              />
            </Field>
            <Field label="Client Secret" secret>
              <SecretInput
                value={settings.paypal_client_secret ?? ""}
                onChange={(v) => update("paypal_client_secret", v)}
                placeholder="EeFf..."
              />
            </Field>

            <TestButton
              label="Test PayPal Connection"
              onClick={async () => {
                const res = await fetch("/api/settings/test-paypal");
                const json = (await res.json()) as { success?: boolean; message?: string };
                if (json.success) toast.success(json.message);
                else toast.error(json.message);
              }}
            />
          </SettingsSection>
        )}

        {tab === "email" && (
          <SettingsSection
            title="Email — Resend"
            description="Transactional emails for enquiries, invoices, and tickets. Get API key from resend.com"
            onSave={() =>
              save([
                "resend_api_key",
                "email_from_name",
                "email_from_address",
                "admin_notification_email",
              ])
            }
            saving={saving}
          >
            <div className="px-6 pt-5">
              <StatusBanner
                configured={!!settings.resend_api_key}
                label="Resend"
                helpUrl="https://resend.com/api-keys"
              />
            </div>

            <Field label="Resend API Key" hint="Starts with re_ — stored encrypted" secret>
              <SecretInput
                value={settings.resend_api_key ?? ""}
                onChange={(v) => update("resend_api_key", v)}
                placeholder="re_..."
              />
            </Field>
            <Field label="From Name" hint="Name shown in the recipient's inbox">
              <Input
                value={settings.email_from_name ?? "Vivabloom"}
                onChange={(v) => update("email_from_name", v)}
                placeholder="Vivabloom"
              />
            </Field>
            <Field label="From Email Address" hint="Must be a verified domain in Resend">
              <Input
                value={settings.email_from_address ?? ""}
                onChange={(v) => update("email_from_address", v)}
                placeholder="hello@vivabloomdecor.com.au"
              />
            </Field>
            <Field label="Admin Notification Email" hint="Where new enquiry alerts are sent">
              <Input
                value={settings.admin_notification_email ?? ""}
                onChange={(v) => update("admin_notification_email", v)}
                placeholder="info@vivabloomdecor.com.au"
              />
            </Field>

            <TestButton
              label="Send Test Email"
              onClick={async () => {
                const res = await fetch("/api/settings/test-email", { method: "POST" });
                const json = (await res.json()) as { success?: boolean; message?: string };
                if (json.success) toast.success(json.message);
                else toast.error(json.message);
              }}
            />
          </SettingsSection>
        )}

        {tab === "cloudinary" && (
          <SettingsSection
            title="Cloudinary"
            description="Image and media hosting. Get credentials from cloudinary.com → Settings → API Keys"
            onSave={() =>
              save([
                "cloudinary_cloud_name",
                "cloudinary_api_key",
                "cloudinary_api_secret",
                "cloudinary_upload_preset",
              ])
            }
            saving={saving}
          >
            <div className="px-6 pt-5">
              <StatusBanner
                configured={!!settings.cloudinary_cloud_name}
                label="Cloudinary"
                helpUrl="https://console.cloudinary.com"
              />
            </div>

            <Field label="Cloud Name">
              <Input
                value={settings.cloudinary_cloud_name ?? ""}
                onChange={(v) => update("cloudinary_cloud_name", v)}
                placeholder="dgtfr3qht"
              />
            </Field>
            <Field label="API Key">
              <Input
                value={settings.cloudinary_api_key ?? ""}
                onChange={(v) => update("cloudinary_api_key", v)}
                placeholder="674462817234378"
              />
            </Field>
            <Field label="API Secret" secret>
              <SecretInput
                value={settings.cloudinary_api_secret ?? ""}
                onChange={(v) => update("cloudinary_api_secret", v)}
                placeholder="oLy8-..."
              />
            </Field>
            <Field label="Upload Preset" hint="Create an unsigned preset in Cloudinary → Settings → Upload">
              <Input
                value={settings.cloudinary_upload_preset ?? "vivabloom_gallery"}
                onChange={(v) => update("cloudinary_upload_preset", v)}
                placeholder="vivabloom_gallery"
              />
            </Field>

            <TestButton
              label="Test Cloudinary Connection"
              onClick={async () => {
                const res = await fetch("/api/settings/test-cloudinary");
                const json = (await res.json()) as { success?: boolean; message?: string };
                if (json.success) toast.success(json.message);
                else toast.error(json.message);
              }}
            />
          </SettingsSection>
        )}

        {tab === "team" && (
          <div className="space-y-8 font-body text-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-xl italic text-[#0F0E0C]">Team</h2>
              {canInvite && (
                <button
                  type="button"
                  onClick={() => setInviteOpen(true)}
                  className="rounded-lg bg-[#C9A96E] px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#0F0E0C]"
                >
                  Invite user
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#EDE8DC] bg-white">
              <table className="w-full min-w-[640px]">
                <thead className="bg-[#F8F5EE] text-left text-[11px] uppercase tracking-[0.15em] text-[#4A4843]">
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
                className="max-w-md space-y-4 rounded-xl border border-[#EDE8DC] bg-white p-6"
              >
                <p className="font-display text-lg italic">Invite user</p>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "STAFF")}
                  className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-[#C9A96E] py-2 text-[#0F0E0C]">
                    Send invite
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteOpen(false)}
                    className="rounded-lg border border-[#EDE8DC] px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="max-w-md space-y-4 rounded-xl border border-[#EDE8DC] bg-white p-6">
              <p className="font-display text-lg italic">Change your password</p>
              <form onSubmit={changePassword} className="space-y-3">
                <input
                  type="password"
                  required
                  placeholder="Current password"
                  value={pwd.current}
                  onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                  className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
                />
                <input
                  type="password"
                  required
                  placeholder="New password"
                  value={pwd.next}
                  onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                  className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
                />
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={pwd.confirm}
                  onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                  className="w-full rounded-lg border border-[#EDE8DC] px-3 py-2"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#0F0E0C] py-2 text-[12px] uppercase tracking-[0.12em] text-ivory"
                >
                  Update password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
  onSave,
  saving,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-[28px] italic text-[#0F0E0C]">{title}</h2>
          <p className="mt-1 font-body text-sm text-[#4A4843]/60">{description}</p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="ml-4 flex flex-shrink-0 items-center gap-2 rounded-lg bg-[#C9A96E] px-5 py-2.5 font-body text-[12px] uppercase tracking-[0.15em] text-[#0F0E0C] transition-colors hover:bg-[#E8D5B0] disabled:opacity-50"
        >
          <Save size={13} />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      <div className="divide-y divide-[#EDE8DC] rounded-2xl border border-[#EDE8DC] bg-white">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  secret,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  secret?: boolean;
}) {
  return (
    <div className="px-6 py-5">
      <label className="mb-2 flex items-center gap-1.5 font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/60">
        {label}
        {secret && (
          <span className="rounded bg-[#F8F5EE] px-1.5 py-0.5 text-[10px] text-[#C9A96E]">Encrypted</span>
        )}
      </label>
      {children}
      {hint ? <p className="mt-1.5 font-body text-[11px] text-[#4A4843]/40">{hint}</p> : null}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[#EDE8DC] px-4 py-2.5 font-body text-[14px] text-[#0F0E0C] transition-colors focus:border-[#C9A96E] focus:outline-none"
    />
  );
}

function Textarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full resize-y rounded-lg border border-[#EDE8DC] px-4 py-2.5 font-body text-[14px] text-[#0F0E0C] transition-colors focus:border-[#C9A96E] focus:outline-none"
    />
  );
}

function SecretInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const isMasked = value.includes("•");

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#EDE8DC] px-4 py-2.5 pr-10 font-mono text-[14px] text-[#0F0E0C] transition-colors focus:border-[#C9A96E] focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A4843]/40 hover:text-[#4A4843]"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      {isMasked ? (
        <p className="mt-1 font-body text-[11px] text-[#4A4843]/40">Key is saved. Type a new value to replace it.</p>
      ) : null}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-[#C9A96E]" : "bg-[#EDE8DC]"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function StatusBanner({
  configured,
  label,
  helpUrl,
}: {
  configured: boolean;
  label: string;
  helpUrl: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        configured ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      {configured ? (
        <CheckCircle size={16} className="flex-shrink-0 text-green-600" />
      ) : (
        <AlertCircle size={16} className="flex-shrink-0 text-amber-600" />
      )}
      <p className="flex-1 font-body text-[13px] text-[#4A4843]">
        {configured ? `${label} is configured and active` : `${label} is not configured yet`}
      </p>
      <a
        href={helpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 font-body text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] hover:underline"
      >
        Get Keys →
      </a>
    </div>
  );
}

function TestButton({ label, onClick }: { label: string; onClick: () => Promise<void> }) {
  const [testing, setTesting] = useState(false);
  return (
    <div className="px-6 pb-5">
      <button
        type="button"
        onClick={async () => {
          setTesting(true);
          await onClick();
          setTesting(false);
        }}
        disabled={testing}
        className="rounded-lg border border-[#EDE8DC] px-5 py-2.5 font-body text-[12px] uppercase tracking-[0.15em] text-[#4A4843] transition-all hover:border-[#C9A96E] hover:text-[#C9A96E] disabled:opacity-50"
      >
        {testing ? "Testing…" : label}
      </button>
    </div>
  );
}
