# Vivabloom — Phase G: Admin Settings Hub
## Payment Keys · Email · Cloudinary · Social Links · Contact Details — all from the dashboard

> Extends the existing `/admin/settings` page built in Phase C.
> All credentials and site configuration are stored in the `SiteSettings` table (already exists).
> Values are encrypted at rest using AES-256. Never exposed in client bundles.
> The site reads these settings at runtime — no Vercel redeploy needed when values change.

---

## G-1 — ENCRYPTION UTILITY (`src/lib/encryption.ts`)

Payment keys and API secrets must be encrypted before storing in the DB.
Never store Stripe/PayPal secrets as plain text.

```ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const SECRET    = process.env.SETTINGS_ENCRYPTION_KEY! // 32-char hex string

export function encrypt(text: string): string {
  if (!text) return ''
  const iv         = crypto.randomBytes(16)
  const cipher     = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET, 'hex'), iv)
  const encrypted  = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag    = cipher.getAuthTag()
  // Format: iv:authTag:encrypted (all hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(stored: string): string {
  if (!stored || !stored.includes(':')) return stored
  try {
    const [ivHex, authTagHex, encryptedHex] = stored.split(':')
    const iv        = Buffer.from(ivHex, 'hex')
    const authTag   = Buffer.from(authTagHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const decipher  = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET, 'hex'), iv)
    decipher.setAuthTag(authTag)
    return decipher.update(encrypted) + decipher.final('utf8')
  } catch {
    return '' // decryption failed — key was changed or value is corrupt
  }
}

// Mark a key as sensitive so it gets encrypted on save
export const SENSITIVE_KEYS = new Set([
  'stripe_secret_key',
  'stripe_webhook_secret',
  'paypal_client_secret',
  'resend_api_key',
  'cloudinary_api_secret',
])
```

### Add to Vercel + `.env.local`:
```
SETTINGS_ENCRYPTION_KEY=
```

Generate a 32-byte hex key:
```bash
# In terminal (Mac/Linux):
openssl rand -hex 32

# In PowerShell:
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

Add the output as `SETTINGS_ENCRYPTION_KEY` in Vercel env vars.
This is the only key that MUST stay in Vercel — everything else moves to the DB.

---

## G-2 — SETTINGS SERVICE (`src/lib/settings.ts`)

Single source of truth for reading settings throughout the app:

```ts
import { prisma } from './prisma'
import { decrypt, SENSITIVE_KEYS } from './encryption'

// Cache settings for the duration of a request (Next.js request memoization)
const settingsCache = new Map<string, string>()

export async function getSetting(key: string): Promise<string> {
  // Check env first — env always wins (Vercel vars override DB)
  const envMap: Record<string, string | undefined> = {
    stripe_publishable_key:    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripe_secret_key:         process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret:     process.env.STRIPE_WEBHOOK_SECRET,
    paypal_client_id:          process.env.PAYPAL_CLIENT_ID,
    paypal_client_secret:      process.env.PAYPAL_CLIENT_SECRET,
    resend_api_key:            process.env.RESEND_API_KEY,
    cloudinary_cloud_name:     process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key:        process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret:     process.env.CLOUDINARY_API_SECRET,
  }
  if (envMap[key]) return envMap[key]!

  // Then check DB
  try {
    const record = await prisma.siteSettings.findUnique({ where: { key } })
    if (!record) return ''
    const value = SENSITIVE_KEYS.has(key) ? decrypt(record.value) : record.value
    return value
  } catch {
    return ''
  }
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  await Promise.all(keys.map(async (key) => {
    result[key] = await getSetting(key)
  }))
  return result
}

// Get all settings for the admin settings page
// Returns masked values for sensitive keys (show last 4 chars only)
export async function getAllSettingsForAdmin(): Promise<Record<string, string>> {
  const records = await prisma.siteSettings.findMany()
  const result: Record<string, string> = {}

  for (const record of records) {
    if (SENSITIVE_KEYS.has(record.key)) {
      // Decrypt to check it exists, then mask it
      const decrypted = decrypt(record.value)
      result[record.key] = decrypted
        ? `${'•'.repeat(Math.max(0, decrypted.length - 4))}${decrypted.slice(-4)}`
        : ''
    } else {
      result[record.key] = record.value
    }
  }
  return result
}
```

---

## G-3 — SETTINGS API (`src/app/api/settings/route.ts`)

Replace the existing settings API with this enhanced version:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt, SENSITIVE_KEYS } from '@/lib/encryption'
import { getAllSettingsForAdmin } from '@/lib/settings'

// GET — return all settings (masked sensitive values)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const settings = await getAllSettingsForAdmin()
  return NextResponse.json(settings)
}

// PATCH — save one or many settings
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: Record<string, string> = await req.json()

  await prisma.$transaction(
    Object.entries(body)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => {
        // Don't save masked placeholder values
        if (value.includes('•')) return prisma.siteSettings.upsert({
          where:  { key },
          update: {},
          create: { key, value: '' },
        })

        const storedValue = SENSITIVE_KEYS.has(key) && value
          ? encrypt(value)
          : value

        return prisma.siteSettings.upsert({
          where:  { key },
          update: { value: storedValue },
          create: { key, value: storedValue },
        })
      })
  )

  return NextResponse.json({ success: true })
}
```

---

## G-4 — UPDATE STRIPE USAGE to read from DB

Update all Stripe API routes to get the secret key from settings:

```ts
// src/lib/stripe.ts
import Stripe from 'stripe'
import { getSetting } from './settings'

let _stripe: Stripe | null = null

export async function getStripe(): Promise<Stripe> {
  const secretKey = await getSetting('stripe_secret_key')
  if (!secretKey) throw new Error('Stripe secret key not configured. Go to Admin → Settings → Payments.')

  // Re-use instance if key hasn't changed
  if (!_stripe) {
    _stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' })
  }
  return _stripe
}

export async function getStripePublishableKey(): Promise<string> {
  return getSetting('stripe_publishable_key')
}

export async function getStripeWebhookSecret(): Promise<string> {
  return getSetting('stripe_webhook_secret')
}
```

Update `src/app/api/tickets/checkout/stripe/route.ts`:
```ts
// Replace:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { ... })
// With:
const stripe = await getStripe()
```

Update `src/app/api/tickets/webhook/stripe/route.ts`:
```ts
const webhookSecret = await getStripeWebhookSecret()
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
```

---

## G-5 — UPDATE PAYPAL USAGE to read from DB

```ts
// src/lib/paypal.ts
import { getSetting } from './settings'

export async function getPayPalToken(): Promise<string> {
  const clientId     = await getSetting('paypal_client_id')
  const clientSecret = await getSetting('paypal_client_secret')

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured. Go to Admin → Settings → Payments.')
  }

  const base = await getPayPalBase()
  const res  = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

export async function getPayPalBase(): Promise<string> {
  const mode = await getSetting('paypal_mode') // "sandbox" | "live"
  return mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

export async function getPayPalClientId(): Promise<string> {
  return getSetting('paypal_client_id')
}
```

Update PayPal API routes to use `getPayPalToken()` and `getPayPalBase()` from `src/lib/paypal.ts`.

---

## G-6 — UPDATE RESEND USAGE to read from DB

```ts
// Update src/lib/email.ts
import { getSetting } from './settings'
import { Resend } from 'resend'

async function getResendClient(): Promise<Resend> {
  const apiKey = await getSetting('resend_api_key')
  if (!apiKey) throw new Error('Resend API key not configured. Go to Admin → Settings → Email.')
  return new Resend(apiKey)
}

// Replace all `resend.emails.send(...)` calls with:
const resend = await getResendClient()
await resend.emails.send(...)
```

---

## G-7 — UPDATE CLOUDINARY USAGE to read from DB

```ts
// src/lib/cloudinary.ts — update
import { getSetting } from './settings'
import { v2 as cloudinary } from 'cloudinary'

export async function getCloudinaryConfig() {
  const [cloudName, apiKey, apiSecret] = await Promise.all([
    getSetting('cloudinary_cloud_name'),
    getSetting('cloudinary_api_key'),
    getSetting('cloudinary_api_secret'),
  ])

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })
  return cloudinary
}
```

---

## G-8 — EXPANDED SETTINGS PAGE (`src/app/admin/settings/page.tsx`)

Replace the existing settings page with this fully expanded version.
Seven tabs total:

```
General | Contact & Social | Payments — Stripe | Payments — PayPal | Email | Cloudinary | Team
```

```tsx
'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Globe, Phone, CreditCard, Mail, Image as ImageIcon,
  Users, Eye, EyeOff, CheckCircle, AlertCircle, Save,
} from 'lucide-react'

const TABS = [
  { id: 'general',   label: 'General',         icon: Globe },
  { id: 'contact',   label: 'Contact & Social', icon: Phone },
  { id: 'stripe',    label: 'Stripe',           icon: CreditCard },
  { id: 'paypal',    label: 'PayPal',           icon: CreditCard },
  { id: 'email',     label: 'Email (Resend)',   icon: Mail },
  { id: 'cloudinary',label: 'Cloudinary',       icon: ImageIcon },
  { id: 'team',      label: 'Team',             icon: Users },
]

export default function SettingsPage() {
  const [tab, setTab]         = useState('general')
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { setSettings(data); setLoading(false) })
  }, [])

  function update(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function save(keys: string[]) {
    setSaving(true)
    const payload = Object.fromEntries(keys.map(k => [k, settings[k] ?? '']))
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) toast.success('Settings saved!')
    else        toast.error('Failed to save settings')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex gap-8 max-w-6xl">

      {/* Sidebar tabs */}
      <div className="w-52 flex-shrink-0">
        <nav className="space-y-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                          font-body text-[13px] transition-all ${
                            tab === t.id
                              ? 'bg-[#C9A96E]/10 text-[#C9A96E]'
                              : 'text-[#4A4843] hover:bg-white hover:text-[#0F0E0C]'
                          }`}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="flex-1">

        {/* ── GENERAL ───────────────────────────────────────────────── */}
        {tab === 'general' && (
          <SettingsSection
            title="General"
            description="Basic site information"
            onSave={() => save(['site_name','site_tagline','abn','meta_description'])}
            saving={saving}
          >
            <Field label="Business Name"    hint="Shown in browser tab and emails">
              <Input value={settings.site_name ?? ''} onChange={v => update('site_name', v)} />
            </Field>
            <Field label="Tagline"          hint="Used in footer and emails">
              <Input value={settings.site_tagline ?? ''} onChange={v => update('site_tagline', v)} />
            </Field>
            <Field label="ABN"              hint="Australian Business Number">
              <Input value={settings.abn ?? ''} onChange={v => update('abn', v)} placeholder="XX XXX XXX XXX" />
            </Field>
            <Field label="Default Meta Description" hint="Used for SEO on pages without a custom description">
              <Textarea value={settings.meta_description ?? ''} onChange={v => update('meta_description', v)} />
            </Field>
          </SettingsSection>
        )}

        {/* ── CONTACT & SOCIAL ──────────────────────────────────────── */}
        {tab === 'contact' && (
          <SettingsSection
            title="Contact & Social"
            description="Shown on the website, footer, and contact page"
            onSave={() => save([
              'contact_phone','contact_email','contact_address','contact_city',
              'contact_hours','social_instagram','social_facebook',
              'social_tiktok','social_pinterest','google_maps_embed',
            ])}
            saving={saving}
          >
            <Field label="Phone Number">
              <Input value={settings.contact_phone ?? ''} onChange={v => update('contact_phone', v)} placeholder="+61 3 XXXX XXXX" />
            </Field>
            <Field label="Email Address">
              <Input value={settings.contact_email ?? ''} onChange={v => update('contact_email', v)} placeholder="info@vivabloomdecor.com.au" />
            </Field>
            <Field label="Street Address">
              <Input value={settings.contact_address ?? ''} onChange={v => update('contact_address', v)} />
            </Field>
            <Field label="City">
              <Input value={settings.contact_city ?? ''} onChange={v => update('contact_city', v)} placeholder="Melbourne, Victoria, Australia" />
            </Field>
            <Field label="Business Hours">
              <Input value={settings.contact_hours ?? ''} onChange={v => update('contact_hours', v)} placeholder="Mon–Fri 9am–6pm AEST" />
            </Field>

            <div className="border-t border-[#EDE8DC] pt-5 mt-2">
              <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C9A96E] mb-4">
                Social Media Links
              </p>
              {[
                { key: 'social_instagram', label: 'Instagram URL',  placeholder: 'https://instagram.com/vivabloomdecor' },
                { key: 'social_facebook',  label: 'Facebook URL',   placeholder: 'https://facebook.com/vivabloomdecor' },
                { key: 'social_tiktok',    label: 'TikTok URL',     placeholder: 'https://tiktok.com/@vivabloomdecor' },
                { key: 'social_pinterest', label: 'Pinterest URL',  placeholder: 'https://pinterest.com/vivabloomdecor' },
              ].map(s => (
                <Field key={s.key} label={s.label}>
                  <Input value={settings[s.key] ?? ''} onChange={v => update(s.key, v)} placeholder={s.placeholder} />
                </Field>
              ))}
            </div>

            <Field label="Google Maps Embed URL" hint="Paste the src URL from Google Maps → Share → Embed a map">
              <Input value={settings.google_maps_embed ?? ''} onChange={v => update('google_maps_embed', v)} placeholder="https://www.google.com/maps/embed?pb=..." />
            </Field>
          </SettingsSection>
        )}

        {/* ── STRIPE ────────────────────────────────────────────────── */}
        {tab === 'stripe' && (
          <SettingsSection
            title="Stripe"
            description="Card payments and Afterpay. Get these from dashboard.stripe.com → Developers → API Keys"
            onSave={() => save([
              'stripe_publishable_key','stripe_secret_key',
              'stripe_webhook_secret','stripe_afterpay_enabled',
            ])}
            saving={saving}
          >
            <StatusBanner
              configured={!!(settings.stripe_secret_key)}
              label="Stripe"
              helpUrl="https://dashboard.stripe.com/developers"
            />

            <Field label="Publishable Key" hint="Starts with pk_live_ or pk_test_">
              <Input value={settings.stripe_publishable_key ?? ''} onChange={v => update('stripe_publishable_key', v)} placeholder="pk_live_..." />
            </Field>
            <Field label="Secret Key" hint="Starts with sk_live_ or sk_test_ — stored encrypted" secret>
              <SecretInput value={settings.stripe_secret_key ?? ''} onChange={v => update('stripe_secret_key', v)} placeholder="sk_live_..." />
            </Field>
            <Field label="Webhook Secret" hint="From Stripe Dashboard → Developers → Webhooks. Starts with whsec_" secret>
              <SecretInput value={settings.stripe_webhook_secret ?? ''} onChange={v => update('stripe_webhook_secret', v)} placeholder="whsec_..." />
            </Field>

            <div className="bg-[#F8F5EE] rounded-xl p-4 border border-[#EDE8DC]">
              <p className="font-body text-[12px] text-[#4A4843] font-medium mb-1">Webhook URL to add in Stripe:</p>
              <code className="font-mono text-[13px] text-[#C9A96E] break-all">
                https://vivabloomdecor.com.au/api/tickets/webhook/stripe
              </code>
              <p className="font-body text-[11px] text-[#4A4843]/50 mt-2">
                Event to listen for: <code>checkout.session.completed</code>
              </p>
            </div>

            <Field label="Afterpay / Clearpay">
              <div className="flex items-center gap-3">
                <Toggle
                  value={settings.stripe_afterpay_enabled === 'true'}
                  onChange={v => update('stripe_afterpay_enabled', String(v))}
                />
                <span className="font-body text-[13px] text-[#4A4843]">
                  Enable Afterpay at checkout
                </span>
              </div>
              <p className="font-body text-[11px] text-[#4A4843]/50 mt-1">
                Also enable Afterpay/Clearpay in your Stripe Dashboard → Settings → Payment Methods
              </p>
            </Field>

            <TestButton
              label="Test Stripe Connection"
              onClick={async () => {
                const res = await fetch('/api/settings/test-stripe')
                const { success, message } = await res.json()
                success ? toast.success(message) : toast.error(message)
              }}
            />
          </SettingsSection>
        )}

        {/* ── PAYPAL ────────────────────────────────────────────────── */}
        {tab === 'paypal' && (
          <SettingsSection
            title="PayPal"
            description="PayPal checkout. Get credentials from developer.paypal.com → Apps & Credentials"
            onSave={() => save(['paypal_client_id','paypal_client_secret','paypal_mode'])}
            saving={saving}
          >
            <StatusBanner
              configured={!!(settings.paypal_client_id)}
              label="PayPal"
              helpUrl="https://developer.paypal.com"
            />

            <Field label="Mode">
              <div className="flex gap-3">
                {['sandbox', 'live'].map(mode => (
                  <button key={mode}
                    onClick={() => update('paypal_mode', mode)}
                    className={`flex-1 py-2.5 rounded-lg border font-body text-[13px] uppercase
                                tracking-[0.15em] transition-all ${
                                  settings.paypal_mode === mode
                                    ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                                    : 'border-[#EDE8DC] text-[#4A4843] hover:border-[#C9A96E]'
                                }`}>
                    {mode}
                  </button>
                ))}
              </div>
              <p className="font-body text-[11px] text-[#4A4843]/50 mt-1">
                Use Sandbox for testing, switch to Live when ready for real payments
              </p>
            </Field>

            <Field label="Client ID">
              <Input value={settings.paypal_client_id ?? ''} onChange={v => update('paypal_client_id', v)} placeholder="AaBb..." />
            </Field>
            <Field label="Client Secret" secret>
              <SecretInput value={settings.paypal_client_secret ?? ''} onChange={v => update('paypal_client_secret', v)} placeholder="EeFf..." />
            </Field>

            <TestButton
              label="Test PayPal Connection"
              onClick={async () => {
                const res = await fetch('/api/settings/test-paypal')
                const { success, message } = await res.json()
                success ? toast.success(message) : toast.error(message)
              }}
            />
          </SettingsSection>
        )}

        {/* ── EMAIL (RESEND) ────────────────────────────────────────── */}
        {tab === 'email' && (
          <SettingsSection
            title="Email — Resend"
            description="Transactional emails for enquiries, invoices, and tickets. Get API key from resend.com"
            onSave={() => save(['resend_api_key','email_from_name','email_from_address','admin_notification_email'])}
            saving={saving}
          >
            <StatusBanner
              configured={!!(settings.resend_api_key)}
              label="Resend"
              helpUrl="https://resend.com/api-keys"
            />

            <Field label="Resend API Key" hint="Starts with re_ — stored encrypted" secret>
              <SecretInput value={settings.resend_api_key ?? ''} onChange={v => update('resend_api_key', v)} placeholder="re_..." />
            </Field>
            <Field label="From Name" hint="Name shown in the recipient's inbox">
              <Input value={settings.email_from_name ?? 'Vivabloom'} onChange={v => update('email_from_name', v)} placeholder="Vivabloom" />
            </Field>
            <Field label="From Email Address" hint="Must be a verified domain in Resend">
              <Input value={settings.email_from_address ?? ''} onChange={v => update('email_from_address', v)} placeholder="hello@vivabloomdecor.com.au" />
            </Field>
            <Field label="Admin Notification Email" hint="Where new enquiry alerts are sent">
              <Input value={settings.admin_notification_email ?? ''} onChange={v => update('admin_notification_email', v)} placeholder="info@vivabloomdecor.com.au" />
            </Field>

            <TestButton
              label="Send Test Email"
              onClick={async () => {
                const res = await fetch('/api/settings/test-email', { method: 'POST' })
                const { success, message } = await res.json()
                success ? toast.success(message) : toast.error(message)
              }}
            />
          </SettingsSection>
        )}

        {/* ── CLOUDINARY ────────────────────────────────────────────── */}
        {tab === 'cloudinary' && (
          <SettingsSection
            title="Cloudinary"
            description="Image and media hosting. Get credentials from cloudinary.com → Settings → API Keys"
            onSave={() => save(['cloudinary_cloud_name','cloudinary_api_key','cloudinary_api_secret','cloudinary_upload_preset'])}
            saving={saving}
          >
            <StatusBanner
              configured={!!(settings.cloudinary_cloud_name)}
              label="Cloudinary"
              helpUrl="https://console.cloudinary.com"
            />

            <Field label="Cloud Name">
              <Input value={settings.cloudinary_cloud_name ?? ''} onChange={v => update('cloudinary_cloud_name', v)} placeholder="dgtfr3qht" />
            </Field>
            <Field label="API Key">
              <Input value={settings.cloudinary_api_key ?? ''} onChange={v => update('cloudinary_api_key', v)} placeholder="674462817234378" />
            </Field>
            <Field label="API Secret" secret>
              <SecretInput value={settings.cloudinary_api_secret ?? ''} onChange={v => update('cloudinary_api_secret', v)} placeholder="oLy8-..." />
            </Field>
            <Field label="Upload Preset" hint="Create an unsigned preset in Cloudinary → Settings → Upload">
              <Input value={settings.cloudinary_upload_preset ?? 'vivabloom_gallery'} onChange={v => update('cloudinary_upload_preset', v)} placeholder="vivabloom_gallery" />
            </Field>

            <TestButton
              label="Test Cloudinary Connection"
              onClick={async () => {
                const res = await fetch('/api/settings/test-cloudinary')
                const { success, message } = await res.json()
                success ? toast.success(message) : toast.error(message)
              }}
            />
          </SettingsSection>
        )}

        {/* ── TEAM (unchanged from Phase C) ─────────────────────────── */}
        {tab === 'team' && (
          <div>
            {/* Keep existing team management UI from Phase C */}
            <p className="font-body text-[#4A4843]">Team management — same as Phase C implementation.</p>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SettingsSection({ title, description, children, onSave, saving }: {
  title: string; description: string; children: React.ReactNode;
  onSave: () => void; saving: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display italic text-[#0F0E0C] text-[28px]">{title}</h2>
          <p className="font-body text-[#4A4843]/60 text-sm mt-1">{description}</p>
        </div>
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-2 bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px]
                     uppercase tracking-[0.15em] px-5 py-2.5 rounded-lg hover:bg-[#E8D5B0]
                     transition-colors disabled:opacity-50 flex-shrink-0 ml-4">
          <Save size={13} />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-[#EDE8DC] divide-y divide-[#EDE8DC]">
        {children}
      </div>
    </div>
  )
}

function Field({ label, hint, children, secret }: {
  label: string; hint?: string; children: React.ReactNode; secret?: boolean
}) {
  return (
    <div className="px-6 py-5">
      <label className="flex items-center gap-1.5 font-body text-[11px] uppercase
                        tracking-[0.15em] text-[#4A4843]/60 mb-2">
        {label}
        {secret && <span className="text-[10px] bg-[#F8F5EE] text-[#C9A96E] px-1.5 py-0.5 rounded">Encrypted</span>}
      </label>
      {children}
      {hint && <p className="font-body text-[11px] text-[#4A4843]/40 mt-1.5">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-[#EDE8DC] rounded-lg px-4 py-2.5 font-body text-[14px]
                 text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E] transition-colors" />
  )
}

function Textarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
      className="w-full border border-[#EDE8DC] rounded-lg px-4 py-2.5 font-body text-[14px]
                 text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E] transition-colors resize-y" />
  )
}

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  const isMasked = value.includes('•')

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#EDE8DC] rounded-lg px-4 py-2.5 pr-10 font-body
                   text-[14px] text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E]
                   transition-colors font-mono"
      />
      <button type="button" onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A4843]/40 hover:text-[#4A4843]">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      {isMasked && (
        <p className="font-body text-[11px] text-[#4A4843]/40 mt-1">
          Key is saved. Type a new value to replace it.
        </p>
      )}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        value ? 'bg-[#C9A96E]' : 'bg-[#EDE8DC]'
      }`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
        value ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  )
}

function StatusBanner({ configured, label, helpUrl }: { configured: boolean; label: string; helpUrl: string }) {
  return (
    <div className={`mx-6 mt-5 rounded-xl px-4 py-3 flex items-center gap-3 ${
      configured ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
    }`}>
      {configured
        ? <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
        : <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
      }
      <p className="font-body text-[13px] text-[#4A4843] flex-1">
        {configured
          ? `${label} is configured and active`
          : `${label} is not configured yet`
        }
      </p>
      <a href={helpUrl} target="_blank" rel="noopener noreferrer"
        className="font-body text-[11px] text-[#C9A96E] uppercase tracking-[0.15em] hover:underline flex-shrink-0">
        Get Keys →
      </a>
    </div>
  )
}

function TestButton({ label, onClick }: { label: string; onClick: () => Promise<void> }) {
  const [testing, setTesting] = useState(false)
  return (
    <div className="px-6 pb-5">
      <button
        onClick={async () => { setTesting(true); await onClick(); setTesting(false) }}
        disabled={testing}
        className="border border-[#EDE8DC] text-[#4A4843] font-body text-[12px] uppercase
                   tracking-[0.15em] px-5 py-2.5 rounded-lg hover:border-[#C9A96E]
                   hover:text-[#C9A96E] transition-all disabled:opacity-50">
        {testing ? 'Testing…' : label}
      </button>
    </div>
  )
}
```

---

## G-9 — TEST API ROUTES

### `src/app/api/settings/test-stripe/route.ts`
```ts
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const stripe  = await getStripe()
    const account = await stripe.accounts.retrieve()
    return NextResponse.json({
      success: true,
      message: `Connected to Stripe ✓ (${account.email ?? 'account verified'})`,
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: `Stripe error: ${err.message}`,
    })
  }
}
```

### `src/app/api/settings/test-paypal/route.ts`
```ts
import { getPayPalToken, getPayPalBase } from '@/lib/paypal'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const token = await getPayPalToken()
    const base  = await getPayPalBase()
    const mode  = base.includes('sandbox') ? 'Sandbox' : 'Live'
    return NextResponse.json({
      success: true,
      message: `PayPal ${mode} connected ✓`,
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: `PayPal error: ${err.message}`,
    })
  }
}
```

### `src/app/api/settings/test-cloudinary/route.ts`
```ts
import { getCloudinaryConfig } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cloudinary = await getCloudinaryConfig()
    const result     = await cloudinary.api.ping()
    return NextResponse.json({
      success: true,
      message: `Cloudinary connected ✓ (${result.status})`,
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: `Cloudinary error: ${err.message}`,
    })
  }
}
```

### `src/app/api/settings/test-email/route.ts` (update existing)
```ts
import { getSetting } from '@/lib/settings'
import { Resend } from 'resend'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey  = await getSetting('resend_api_key')
  const fromEmail = await getSetting('email_from_address') || 'hello@vivabloomdecor.com.au'
  const fromName  = await getSetting('email_from_name') || 'Vivabloom'
  const adminEmail = await getSetting('admin_notification_email') || session.user.email!

  if (!apiKey) {
    return NextResponse.json({ success: false, message: 'Resend API key not configured yet' })
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from:    `${fromName} <${fromEmail}>`,
      to:      adminEmail,
      subject: 'Vivabloom — Test Email ✓',
      html:    '<p style="font-family:Georgia;font-size:18px;color:#0F0E0C;">Your email settings are working correctly.</p>',
    })
    return NextResponse.json({ success: true, message: `Test email sent to ${adminEmail}` })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: `Email error: ${err.message}` })
  }
}
```

---

## G-10 — UPDATE PUBLIC SITE to read contact details from DB

Update Footer and Contact page to use settings from DB instead of hardcoded values:

```ts
// In Footer.tsx (server component) — add at top:
import { getSettings } from '@/lib/settings'

const contact = await getSettings([
  'contact_phone', 'contact_email', 'contact_address', 'contact_city',
  'social_instagram', 'social_facebook', 'social_tiktok', 'social_pinterest',
])

// Then use contact.contact_phone etc. instead of hardcoded values
```

Same pattern for the Contact page — replace hardcoded details with DB values.

---

## G-11 — CHECKLIST

```bash
# 1. Generate encryption key
openssl rand -hex 32
# Add as SETTINGS_ENCRYPTION_KEY in Vercel + .env.local

# 2. Deploy
npm run build   # must pass
```

- [ ] `SETTINGS_ENCRYPTION_KEY` added to Vercel env vars
- [ ] Admin → Settings loads all 7 tabs without error
- [ ] General tab: save business name → appears in footer
- [ ] Contact tab: update phone number → appears on contact page immediately
- [ ] Social links: update Instagram URL → footer icon links correctly
- [ ] Stripe tab: shows ❌ "not configured" banner when empty
- [ ] Stripe tab: paste keys → save → shows ✅ "configured" banner
- [ ] "Test Stripe Connection" → toast shows account email
- [ ] Secret fields: show masked value (••••1234) after save
- [ ] Secret fields: type new value → saves + re-encrypts
- [ ] PayPal tab: sandbox/live mode toggle saves correctly
- [ ] "Test PayPal Connection" → toast confirms connection
- [ ] Email tab: "Send Test Email" → email arrives in inbox
- [ ] Cloudinary tab: save credentials → "Test Cloudinary" → ping succeeds
- [ ] Gallery upload still works after Cloudinary credentials moved to DB
- [ ] Ticket checkout uses Stripe keys from DB (not just env vars)
- [ ] `npm run build` passes clean
```

---

*After Phase G, Vivian can configure the entire platform from the admin dashboard — no Vercel access needed for day-to-day operations. Phase E (eCommerce shop) remains as the final optional phase.*
