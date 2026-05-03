# Vivabloom — Phase E: Full Page CMS
## Admin-controlled content for every public page — text, images, all sections

> Phases A–D complete and live on Vercel. This phase makes every piece of public-facing
> content editable from the admin dashboard. No code changes needed to update copy or images.
> The person using this (Vivian) is not technical — the UI must be dead simple.

---

## E-1 — DATABASE: PageContent table

Add to `prisma/schema.prisma`:

```prisma
model PageContent {
  id        String   @id @default(cuid())
  page      String   // "home" | "services" | "gallery" | "about" | "contact" | "quote"
  section   String   // "hero" | "brand_statement" | "services_intro" etc.
  key       String   // "headline" | "subheadline" | "image" | "body" etc.
  value     String   @db.Text
  updatedAt DateTime @updatedAt

  @@unique([page, section, key])
  @@index([page])
}
```

Run after adding:
```bash
npx prisma db push
```

---

## E-2 — SEED: Default content

Create `prisma/seed-content.ts` — seeds all default content so the site looks correct
even before Vivian edits anything:

```ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const defaultContent = [
  // ── HOME: Hero ──────────────────────────────────────────────────────────
  { page: 'home', section: 'hero', key: 'eyebrow',     value: "Australia's Premier Event Décor Studio" },
  { page: 'home', section: 'hero', key: 'headline_1',  value: 'Crafting Moments' },
  { page: 'home', section: 'hero', key: 'headline_2',  value: 'of Exquisite Beauty' },
  { page: 'home', section: 'hero', key: 'subheadline', value: 'From intimate gatherings to grand celebrations — we design unforgettable experiences that tell your story.' },
  { page: 'home', section: 'hero', key: 'cta_primary',   value: 'Explore Our Work' },
  { page: 'home', section: 'hero', key: 'cta_secondary', value: 'Request a Quote' },
  { page: 'home', section: 'hero', key: 'image',       value: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920' },

  // ── HOME: Brand Statement ────────────────────────────────────────────────
  { page: 'home', section: 'brand_statement', key: 'quote',      value: 'Every event is a story. We make it unforgettable.' },
  { page: 'home', section: 'brand_statement', key: 'body',       value: 'At Vivabloom, we believe every celebration should feel seamless, beautiful, and deeply personal. From florals to full productions, we bring your vision to life with flawless precision.' },
  { page: 'home', section: 'brand_statement', key: 'stat_1_value', value: '10+' },
  { page: 'home', section: 'brand_statement', key: 'stat_1_label', value: 'Years of Excellence' },
  { page: 'home', section: 'brand_statement', key: 'stat_2_value', value: '500+' },
  { page: 'home', section: 'brand_statement', key: 'stat_2_label', value: 'Events Delivered' },
  { page: 'home', section: 'brand_statement', key: 'stat_3_value', value: '3' },
  { page: 'home', section: 'brand_statement', key: 'stat_3_label', value: 'Cities Served' },
  { page: 'home', section: 'brand_statement', key: 'stat_4_value', value: '5★' },
  { page: 'home', section: 'brand_statement', key: 'stat_4_label', value: 'Average Rating' },

  // ── HOME: Services intro ─────────────────────────────────────────────────
  { page: 'home', section: 'services_intro', key: 'eyebrow',  value: 'What We Do' },
  { page: 'home', section: 'services_intro', key: 'headline', value: 'Our Services' },

  // ── HOME: About preview ──────────────────────────────────────────────────
  { page: 'home', section: 'about_preview', key: 'eyebrow',    value: 'The Mind Behind the Magic' },
  { page: 'home', section: 'about_preview', key: 'headline',   value: "Hi there, I'm Vivian" },
  { page: 'home', section: 'about_preview', key: 'body_1',     value: "Vivabloom was born from my obsession with detail and my love of creating truly precious moments. For me, it's never just about flowers or balloons or draping — it's about feelings, and the stories we tell." },
  { page: 'home', section: 'about_preview', key: 'pullquote',  value: '"I make every event personal. I believe in the magic of perfectly executed, deeply felt celebrations."' },
  { page: 'home', section: 'about_preview', key: 'body_2',     value: 'Every collaboration begins with listening — truly understanding your vision — then building something that makes your day feel extraordinary and entirely your own.' },
  { page: 'home', section: 'about_preview', key: 'image',      value: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800' },
  { page: 'home', section: 'about_preview', key: 'cta_label',  value: 'Meet the Full Team' },

  // ── HOME: Quote CTA ──────────────────────────────────────────────────────
  { page: 'home', section: 'quote_cta', key: 'eyebrow',    value: "Let's Create Together" },
  { page: 'home', section: 'quote_cta', key: 'headline_1', value: 'Your Dream Event' },
  { page: 'home', section: 'quote_cta', key: 'headline_2', value: 'Starts Here' },
  { page: 'home', section: 'quote_cta', key: 'body',       value: 'Every extraordinary event begins with a single conversation. Tell us your vision and we'll make it a reality.' },
  { page: 'home', section: 'quote_cta', key: 'cta_label',  value: 'Request a Quote' },
  { page: 'home', section: 'quote_cta', key: 'image',      value: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920' },

  // ── SERVICES page ────────────────────────────────────────────────────────
  { page: 'services', section: 'hero', key: 'headline',    value: 'Our Services' },
  { page: 'services', section: 'hero', key: 'subheadline', value: 'Everything you need for an extraordinary event, under one roof.' },
  { page: 'services', section: 'hero', key: 'image',       value: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920' },

  { page: 'services', section: 'floral',     key: 'title',    value: 'Floral Design' },
  { page: 'services', section: 'floral',     key: 'subtitle', value: "Nature's beauty, curated" },
  { page: 'services', section: 'floral',     key: 'body',     value: 'From lush centrepieces to breathtaking ceremony arches, our floral designs transform any space into a living work of art.' },
  { page: 'services', section: 'floral',     key: 'pricing',  value: 'Starting from $800' },
  { page: 'services', section: 'floral',     key: 'image',    value: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },

  { page: 'services', section: 'balloon',    key: 'title',    value: 'Balloon Artistry' },
  { page: 'services', section: 'balloon',    key: 'subtitle', value: 'Sculptural, joyful, bold' },
  { page: 'services', section: 'balloon',    key: 'body',     value: 'Our balloon installations go far beyond bunches — think sculptural columns, organic clouds, and custom colour-matched displays.' },
  { page: 'services', section: 'balloon',    key: 'pricing',  value: 'Starting from $400' },
  { page: 'services', section: 'balloon',    key: 'image',    value: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800' },

  { page: 'services', section: 'wedding',    key: 'title',    value: 'Wedding Styling' },
  { page: 'services', section: 'wedding',    key: 'subtitle', value: 'Your day, perfectly told' },
  { page: 'services', section: 'wedding',    key: 'body',     value: 'Full wedding styling from ceremony to reception. We work with your vision to create a cohesive, breathtaking aesthetic throughout.' },
  { page: 'services', section: 'wedding',    key: 'pricing',  value: 'Starting from $2,500' },
  { page: 'services', section: 'wedding',    key: 'image',    value: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800' },

  { page: 'services', section: 'corporate',  key: 'title',    value: 'Corporate Events' },
  { page: 'services', section: 'corporate',  key: 'subtitle', value: 'Impressions that last' },
  { page: 'services', section: 'corporate',  key: 'body',     value: 'From product launches to gala dinners, we create corporate environments that reflect your brand and impress your guests.' },
  { page: 'services', section: 'corporate',  key: 'pricing',  value: 'Starting from $1,500' },
  { page: 'services', section: 'corporate',  key: 'image',    value: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800' },

  { page: 'services', section: 'draping',    key: 'title',    value: 'Backdrop & Draping' },
  { page: 'services', section: 'draping',    key: 'subtitle', value: 'Atmosphere in every fold' },
  { page: 'services', section: 'draping',    key: 'body',     value: 'Ceiling draping, backdrop walls, fabric installations — we use fabric, light, and texture to completely transform your venue.' },
  { page: 'services', section: 'draping',    key: 'pricing',  value: 'Starting from $600' },
  { page: 'services', section: 'draping',    key: 'image',    value: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800' },

  { page: 'services', section: 'production', key: 'title',    value: 'Full Production' },
  { page: 'services', section: 'production', key: 'subtitle', value: 'End-to-end event mastery' },
  { page: 'services', section: 'production', key: 'body',     value: 'Let us handle everything. From concept to strike, our full production service covers every detail so you can be fully present on your day.' },
  { page: 'services', section: 'production', key: 'pricing',  value: 'Starting from $5,000' },
  { page: 'services', section: 'production', key: 'image',    value: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800' },

  // ── ABOUT page ───────────────────────────────────────────────────────────
  { page: 'about', section: 'hero',       key: 'headline',    value: 'The Story Behind Vivabloom' },
  { page: 'about', section: 'hero',       key: 'subheadline', value: 'A decade of luxury, a lifetime of passion.' },
  { page: 'about', section: 'hero',       key: 'image',       value: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920' },

  { page: 'about', section: 'vivian_bio', key: 'headline',    value: "Hi there, I'm Vivian" },
  { page: 'about', section: 'vivian_bio', key: 'body_1',      value: "Vivabloom was born from my obsession with detail and my love of creating truly precious moments." },
  { page: 'about', section: 'vivian_bio', key: 'body_2',      value: "With over a decade in the industry, I've had the privilege of styling hundreds of events across Melbourne and beyond." },
  { page: 'about', section: 'vivian_bio', key: 'body_3',      value: "Every collaboration begins with listening — truly understanding your vision — then building something extraordinary." },
  { page: 'about', section: 'vivian_bio', key: 'pullquote',   value: '"I make every event personal. I believe in the magic of perfectly executed, deeply felt celebrations."' },
  { page: 'about', section: 'vivian_bio', key: 'image',       value: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800' },

  { page: 'about', section: 'values',     key: 'headline',    value: 'What We Stand For' },
  { page: 'about', section: 'values',     key: 'value_1_title', value: 'Obsessive Detail' },
  { page: 'about', section: 'values',     key: 'value_1_body',  value: 'Every petal, every fold, every light placement — nothing is too small to perfect.' },
  { page: 'about', section: 'values',     key: 'value_2_title', value: 'Deep Personalisation' },
  { page: 'about', section: 'values',     key: 'value_2_body',  value: 'No two events look the same. Every design starts with your story.' },
  { page: 'about', section: 'values',     key: 'value_3_title', value: 'Flawless Execution' },
  { page: 'about', section: 'values',     key: 'value_3_body',  value: 'On the day, you relax. We handle every detail from arrival to strike.' },
  { page: 'about', section: 'values',     key: 'value_4_title', value: 'Lasting Memories' },
  { page: 'about', section: 'values',     key: 'value_4_body',  value: 'We measure success not in hours but in the memories your guests carry for years.' },

  // ── CONTACT page ─────────────────────────────────────────────────────────
  { page: 'contact', section: 'hero',    key: 'headline',    value: 'Get In Touch' },
  { page: 'contact', section: 'hero',    key: 'subheadline', value: "We'd love to hear about your upcoming event." },
  { page: 'contact', section: 'details', key: 'address',     value: 'Melbourne, Victoria, Australia' },
  { page: 'contact', section: 'details', key: 'phone',       value: '+61 3 XXXX XXXX' },
  { page: 'contact', section: 'details', key: 'email',       value: 'info@vivabloomdecor.com.au' },
  { page: 'contact', section: 'details', key: 'hours',       value: 'Mon–Fri 9am–6pm AEST' },
  { page: 'contact', section: 'details', key: 'response_time', value: 'We respond within 24 hours' },

  // ── QUOTE page ───────────────────────────────────────────────────────────
  { page: 'quote', section: 'hero', key: 'headline',    value: 'Request a Quote' },
  { page: 'quote', section: 'hero', key: 'subheadline', value: 'Tell us about your event and we\'ll craft a personalised proposal just for you.' },
]

async function main() {
  for (const item of defaultContent) {
    await prisma.pageContent.upsert({
      where:  { page_section_key: { page: item.page, section: item.section, key: item.key } },
      update: {},           // don't overwrite if already customised
      create: item,
    })
  }
  console.log(`✓ Seeded ${defaultContent.length} content items`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

Add to `package.json` scripts:
```json
"seed:content": "tsx prisma/seed-content.ts"
```

Run: `npm run seed:content`

---

## E-3 — CONTENT FETCHING UTILITY (`src/lib/content.ts`)

```ts
import { prisma } from './prisma'

type ContentMap = Record<string, Record<string, Record<string, string>>>
// { page: { section: { key: value } } }

// Cache content in memory for the duration of a request
// Next.js fetch cache handles revalidation
export async function getPageContent(page: string): Promise<Record<string, Record<string, string>>> {
  const items = await prisma.pageContent.findMany({
    where: { page },
  })

  const map: Record<string, Record<string, string>> = {}
  for (const item of items) {
    if (!map[item.section]) map[item.section] = {}
    map[item.section][item.key] = item.value
  }
  return map
}

// Helper: get a single value with fallback
export function get(
  content: Record<string, Record<string, string>>,
  section: string,
  key: string,
  fallback = ''
): string {
  return content[section]?.[key] ?? fallback
}
```

---

## E-4 — UPDATE PUBLIC PAGES to use DB content

### Home page (`src/app/(public)/page.tsx`)

```tsx
import { getPageContent, get } from '@/lib/content'

export default async function HomePage() {
  const [content, galleryItems, testimonials] = await Promise.all([
    getPageContent('home'),
    prisma.galleryItem.findMany({ where: { featured: true }, orderBy: { order: 'asc' }, take: 8 }),
    prisma.testimonial.findMany({ where: { approved: true, featured: true }, take: 5 }),
  ])

  return (
    <main>
      <HeroSection
        eyebrow={get(content, 'hero', 'eyebrow')}
        headline1={get(content, 'hero', 'headline_1')}
        headline2={get(content, 'hero', 'headline_2')}
        subheadline={get(content, 'hero', 'subheadline')}
        ctaPrimary={get(content, 'hero', 'cta_primary')}
        ctaSecondary={get(content, 'hero', 'cta_secondary')}
        image={get(content, 'hero', 'image')}
      />
      <BrandStatement
        quote={get(content, 'brand_statement', 'quote')}
        body={get(content, 'brand_statement', 'body')}
        stats={[
          { value: get(content, 'brand_statement', 'stat_1_value'), label: get(content, 'brand_statement', 'stat_1_label') },
          { value: get(content, 'brand_statement', 'stat_2_value'), label: get(content, 'brand_statement', 'stat_2_label') },
          { value: get(content, 'brand_statement', 'stat_3_value'), label: get(content, 'brand_statement', 'stat_3_label') },
          { value: get(content, 'brand_statement', 'stat_4_value'), label: get(content, 'brand_statement', 'stat_4_label') },
        ]}
      />
      <ServicesSection
        eyebrow={get(content, 'services_intro', 'eyebrow')}
        headline={get(content, 'services_intro', 'headline')}
      />
      <GalleryPreview items={galleryItems} />
      <TestimonialsSection testimonials={testimonials} />
      <AboutPreview
        eyebrow={get(content, 'about_preview', 'eyebrow')}
        headline={get(content, 'about_preview', 'headline')}
        body1={get(content, 'about_preview', 'body_1')}
        pullquote={get(content, 'about_preview', 'pullquote')}
        body2={get(content, 'about_preview', 'body_2')}
        image={get(content, 'about_preview', 'image')}
        ctaLabel={get(content, 'about_preview', 'cta_label')}
      />
      <QuoteCTA
        eyebrow={get(content, 'quote_cta', 'eyebrow')}
        headline1={get(content, 'quote_cta', 'headline_1')}
        headline2={get(content, 'quote_cta', 'headline_2')}
        body={get(content, 'quote_cta', 'body')}
        ctaLabel={get(content, 'quote_cta', 'cta_label')}
        image={get(content, 'quote_cta', 'image')}
      />
    </main>
  )
}
```

Update each component to accept and render these props instead of hardcoded strings.
**Pattern for every component:**
```tsx
// Before (hardcoded):
<h1>Crafting Moments</h1>

// After (from props):
<h1>{headline1}</h1>
```

Do the same for: **Services page**, **About page**, **Contact page**, **Quote page** — each calls `getPageContent('services')` etc. at the top and passes values to components as props.

---

## E-5 — ADMIN CMS PAGES

### Add to sidebar nav in `AdminSidebar.tsx`

Add a new top-level nav item above Content:
```tsx
{
  label: 'Pages', icon: FileEdit,
  children: [
    { href: '/admin/pages/home',     label: 'Home Page',    icon: Home },
    { href: '/admin/pages/services', label: 'Services',     icon: Sparkles },
    { href: '/admin/pages/about',    label: 'About',        icon: User },
    { href: '/admin/pages/contact',  label: 'Contact',      icon: Phone },
    { href: '/admin/pages/quote',    label: 'Quote Page',   icon: MessageSquare },
  ],
},
```

Import new icons from lucide-react: `FileEdit, Home, Sparkles, User, Phone`

---

## E-6 — CMS PAGE EDITOR COMPONENT (`src/components/admin/cms/PageEditor.tsx`)

This is the core reusable component. It receives a config describing all the fields for a page,
fetches the current values, and renders an easy-to-use form.

```tsx
'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { Save, Image as ImageIcon, Type, AlignLeft } from 'lucide-react'

export type FieldConfig = {
  key:         string
  section:     string
  label:       string
  type:        'text' | 'textarea' | 'image' | 'richtext'
  placeholder?: string
  hint?:       string
}

export type SectionConfig = {
  section: string
  label:   string
  fields:  FieldConfig[]
}

interface Props {
  page:     string
  sections: SectionConfig[]
  initial:  Record<string, Record<string, string>> // { section: { key: value } }
}

export default function PageEditor({ page, sections, initial }: Props) {
  // Flat state: "section__key" -> value
  const [values, setValues] = useState<Record<string, string>>(() => {
    const flat: Record<string, string> = {}
    for (const sec of sections) {
      for (const field of sec.fields) {
        flat[`${sec.section}__${field.key}`] = initial[sec.section]?.[field.key] ?? ''
      }
    }
    return flat
  })
  const [isPending, startTransition] = useTransition()
  const [savedKey, setSavedKey] = useState<string | null>(null)

  function setValue(section: string, key: string, value: string) {
    setValues(prev => ({ ...prev, [`${section}__${key}`]: value }))
  }

  function getValue(section: string, key: string): string {
    return values[`${section}__${key}`] ?? ''
  }

  async function saveField(section: string, key: string) {
    const value = getValue(section, key)
    startTransition(async () => {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, section, key, value }),
      })
      if (res.ok) {
        setSavedKey(`${section}__${key}`)
        setTimeout(() => setSavedKey(null), 2000)
        toast.success('Saved!')
      } else {
        toast.error('Failed to save')
      }
    })
  }

  async function saveAll() {
    const entries = Object.entries(values).map(([flatKey, value]) => {
      const [section, key] = flatKey.split('__')
      return { page, section, key, value }
    })
    startTransition(async () => {
      const res = await fetch('/api/cms/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      if (res.ok) {
        toast.success('All changes saved!')
      } else {
        toast.error('Failed to save changes')
      }
    })
  }

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Save all button — sticky top */}
      <div className="sticky top-0 z-10 bg-[#F8F5EE] py-3 flex items-center justify-between
                      border-b border-[#EDE8DC] -mx-8 px-8 -mt-8 mb-8">
        <p className="font-body text-[13px] text-[#4A4843]/60">
          Changes save per field or use Save All below
        </p>
        <button onClick={saveAll} disabled={isPending}
          className="flex items-center gap-2 bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px]
                     uppercase tracking-[0.15em] px-6 py-2.5 rounded-lg hover:bg-[#E8D5B0]
                     transition-colors disabled:opacity-50">
          <Save size={14} />
          {isPending ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>

      {/* Sections */}
      {sections.map((sec) => (
        <div key={sec.section} className="bg-white rounded-2xl border border-[#EDE8DC] overflow-hidden">

          {/* Section header */}
          <div className="px-6 py-4 border-b border-[#EDE8DC] bg-[#F8F5EE]">
            <h3 className="font-display italic text-[#0F0E0C] text-[20px]">{sec.label}</h3>
          </div>

          {/* Fields */}
          <div className="divide-y divide-[#EDE8DC]">
            {sec.fields.map((field) => (
              <div key={field.key} className="px-6 py-5">

                {/* Field label + hint */}
                <div className="flex items-center gap-2 mb-2">
                  {field.type === 'image'    && <ImageIcon size={13} className="text-[#C9A96E]" />}
                  {field.type === 'text'     && <Type       size={13} className="text-[#C9A96E]" />}
                  {field.type === 'textarea' && <AlignLeft  size={13} className="text-[#C9A96E]" />}
                  <label className="font-body text-[12px] uppercase tracking-[0.15em] text-[#4A4843]">
                    {field.label}
                  </label>
                  {savedKey === `${sec.section}__${field.key}` && (
                    <span className="text-green-600 text-[11px] font-body ml-auto">✓ Saved</span>
                  )}
                </div>

                {field.hint && (
                  <p className="font-body text-[11px] text-[#4A4843]/50 mb-2">{field.hint}</p>
                )}

                {/* Text input */}
                {field.type === 'text' && (
                  <div className="flex gap-2">
                    <input
                      value={getValue(sec.section, field.key)}
                      onChange={e => setValue(sec.section, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 border border-[#EDE8DC] rounded-lg px-4 py-2.5 font-body
                                 text-[14px] text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E]
                                 transition-colors"
                    />
                    <button onClick={() => saveField(sec.section, field.key)}
                      className="px-4 py-2.5 border border-[#EDE8DC] rounded-lg text-[12px]
                                 font-body text-[#4A4843] hover:border-[#C9A96E] hover:text-[#C9A96E]
                                 transition-colors whitespace-nowrap">
                      Save
                    </button>
                  </div>
                )}

                {/* Textarea */}
                {field.type === 'textarea' && (
                  <div className="space-y-2">
                    <textarea
                      value={getValue(sec.section, field.key)}
                      onChange={e => setValue(sec.section, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full border border-[#EDE8DC] rounded-lg px-4 py-3 font-body
                                 text-[14px] text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E]
                                 transition-colors resize-y"
                    />
                    <button onClick={() => saveField(sec.section, field.key)}
                      className="px-4 py-2 border border-[#EDE8DC] rounded-lg text-[12px]
                                 font-body text-[#4A4843] hover:border-[#C9A96E] hover:text-[#C9A96E]
                                 transition-colors">
                      Save
                    </button>
                  </div>
                )}

                {/* Image field */}
                {field.type === 'image' && (
                  <div className="space-y-3">
                    {/* Current image preview */}
                    {getValue(sec.section, field.key) && (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#EDE8DC]">
                        <Image
                          src={getValue(sec.section, field.key)}
                          alt={field.label}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {/* Upload button */}
                    <div className="flex gap-2">
                      <CldUploadWidget
                        uploadPreset="vivabloom_gallery"
                        onUpload={(result) => {
                          const url = (result.info as any).secure_url
                          setValue(sec.section, field.key, url)
                          // Auto-save on upload
                          fetch('/api/cms', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ page, section: sec.section, key: field.key, value: url }),
                          }).then(() => toast.success('Image updated!'))
                        }}
                      >
                        {({ open }) => (
                          <button onClick={() => open()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#F8F5EE] border
                                       border-[#EDE8DC] rounded-lg font-body text-[12px] text-[#4A4843]
                                       hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors">
                            <ImageIcon size={14} />
                            Upload New Image
                          </button>
                        )}
                      </CldUploadWidget>
                      {/* Or paste URL */}
                      <input
                        value={getValue(sec.section, field.key)}
                        onChange={e => setValue(sec.section, field.key, e.target.value)}
                        placeholder="Or paste image URL…"
                        className="flex-1 border border-[#EDE8DC] rounded-lg px-3 py-2.5 font-body
                                   text-[13px] text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E]"
                      />
                      <button onClick={() => saveField(sec.section, field.key)}
                        className="px-4 py-2.5 border border-[#EDE8DC] rounded-lg text-[12px]
                                   font-body text-[#4A4843] hover:border-[#C9A96E] transition-colors">
                        Save
                      </button>
                    </div>
                    <p className="font-body text-[11px] text-[#4A4843]/40">
                      Upload from your computer or paste a URL. Recommended: minimum 1920×1080px for hero images.
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## E-7 — INDIVIDUAL PAGE CMS ROUTES

### Home Page CMS (`src/app/admin/pages/home/page.tsx`)

```tsx
import { getPageContent } from '@/lib/content'
import PageEditor, { SectionConfig } from '@/components/admin/cms/PageEditor'

const sections: SectionConfig[] = [
  {
    section: 'hero',
    label:   'Hero Section — the first thing visitors see',
    fields: [
      { key: 'eyebrow',     section: 'hero', label: 'Eyebrow Text',    type: 'text',     placeholder: "Australia's Premier Event Décor Studio", hint: 'Small text above the headline. Keep it short.' },
      { key: 'headline_1',  section: 'hero', label: 'Headline Line 1', type: 'text',     placeholder: 'Crafting Moments' },
      { key: 'headline_2',  section: 'hero', label: 'Headline Line 2', type: 'text',     placeholder: 'of Exquisite Beauty' },
      { key: 'subheadline', section: 'hero', label: 'Subheadline',     type: 'textarea', placeholder: 'A short description of what you do…' },
      { key: 'cta_primary',   section: 'hero', label: 'Primary Button Text',   type: 'text', placeholder: 'Explore Our Work' },
      { key: 'cta_secondary', section: 'hero', label: 'Secondary Button Text', type: 'text', placeholder: 'Request a Quote' },
      { key: 'image', section: 'hero', label: 'Hero Background Image', type: 'image', hint: 'Full-width background. Use a high-quality landscape photo (minimum 1920×1080px).' },
    ],
  },
  {
    section: 'brand_statement',
    label:   'Brand Statement — the quote section',
    fields: [
      { key: 'quote', section: 'brand_statement', label: 'Main Quote', type: 'textarea', hint: 'The large italic quote. Keep it punchy — one or two sentences max.' },
      { key: 'body',  section: 'brand_statement', label: 'Supporting Text', type: 'textarea' },
      { key: 'stat_1_value', section: 'brand_statement', label: 'Stat 1 — Number', type: 'text', placeholder: '10+' },
      { key: 'stat_1_label', section: 'brand_statement', label: 'Stat 1 — Label', type: 'text', placeholder: 'Years of Excellence' },
      { key: 'stat_2_value', section: 'brand_statement', label: 'Stat 2 — Number', type: 'text', placeholder: '500+' },
      { key: 'stat_2_label', section: 'brand_statement', label: 'Stat 2 — Label', type: 'text', placeholder: 'Events Delivered' },
      { key: 'stat_3_value', section: 'brand_statement', label: 'Stat 3 — Number', type: 'text', placeholder: '3' },
      { key: 'stat_3_label', section: 'brand_statement', label: 'Stat 3 — Label', type: 'text', placeholder: 'Cities Served' },
      { key: 'stat_4_value', section: 'brand_statement', label: 'Stat 4 — Number', type: 'text', placeholder: '5★' },
      { key: 'stat_4_label', section: 'brand_statement', label: 'Stat 4 — Label', type: 'text', placeholder: 'Average Rating' },
    ],
  },
  {
    section: 'about_preview',
    label:   'About Preview — the "Hi there, I\'m Vivian" section',
    fields: [
      { key: 'eyebrow',   section: 'about_preview', label: 'Eyebrow Text', type: 'text' },
      { key: 'headline',  section: 'about_preview', label: 'Headline',     type: 'text', placeholder: "Hi there, I'm Vivian" },
      { key: 'body_1',    section: 'about_preview', label: 'First Paragraph',  type: 'textarea' },
      { key: 'pullquote', section: 'about_preview', label: 'Pull Quote',        type: 'textarea', hint: 'Displayed in a highlighted block. Keep it inspiring.' },
      { key: 'body_2',    section: 'about_preview', label: 'Second Paragraph', type: 'textarea' },
      { key: 'cta_label', section: 'about_preview', label: 'Button Text',      type: 'text', placeholder: 'Meet the Full Team' },
      { key: 'image',     section: 'about_preview', label: 'Vivian\'s Photo',  type: 'image', hint: 'Portrait orientation works best. Minimum 800×1000px.' },
    ],
  },
  {
    section: 'quote_cta',
    label:   'Quote CTA — the dark full-width call to action',
    fields: [
      { key: 'eyebrow',    section: 'quote_cta', label: 'Eyebrow Text',    type: 'text' },
      { key: 'headline_1', section: 'quote_cta', label: 'Headline Line 1', type: 'text' },
      { key: 'headline_2', section: 'quote_cta', label: 'Headline Line 2 (gold)', type: 'text' },
      { key: 'body',       section: 'quote_cta', label: 'Body Text',       type: 'textarea' },
      { key: 'cta_label',  section: 'quote_cta', label: 'Button Text',     type: 'text' },
      { key: 'image',      section: 'quote_cta', label: 'Background Image', type: 'image' },
    ],
  },
]

export default async function HomePageCMS() {
  const content = await getPageContent('home')
  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Pages</p>
        <h1 className="font-display italic text-[#0F0E0C] text-[36px]">Home Page</h1>
        <p className="font-body text-[#4A4843]/60 text-sm mt-1">
          Changes appear on the website immediately after saving.
        </p>
      </div>
      <PageEditor page="home" sections={sections} initial={content} />
    </div>
  )
}
```

### Services Page CMS (`src/app/admin/pages/services/page.tsx`)

```tsx
const sections: SectionConfig[] = [
  {
    section: 'hero',
    label: 'Services Hero Banner',
    fields: [
      { key: 'headline',    section: 'hero', label: 'Headline',    type: 'text' },
      { key: 'subheadline', section: 'hero', label: 'Subheadline', type: 'textarea' },
      { key: 'image',       section: 'hero', label: 'Background Image', type: 'image' },
    ],
  },
  {
    section: 'floral',
    label: 'Service 1 — Floral Design',
    fields: [
      { key: 'title',    section: 'floral', label: 'Service Name',   type: 'text' },
      { key: 'subtitle', section: 'floral', label: 'Tagline',        type: 'text',     hint: 'Short phrase shown on the card' },
      { key: 'body',     section: 'floral', label: 'Description',    type: 'textarea' },
      { key: 'pricing',  section: 'floral', label: 'Starting Price', type: 'text',     placeholder: 'Starting from $800' },
      { key: 'image',    section: 'floral', label: 'Service Image',  type: 'image' },
    ],
  },
  // Repeat same pattern for: balloon, wedding, corporate, draping, production
  // (copy the floral block, change section name and label for each)
  {
    section: 'balloon',
    label: 'Service 2 — Balloon Artistry',
    fields: [
      { key: 'title',    section: 'balloon', label: 'Service Name',   type: 'text' },
      { key: 'subtitle', section: 'balloon', label: 'Tagline',        type: 'text' },
      { key: 'body',     section: 'balloon', label: 'Description',    type: 'textarea' },
      { key: 'pricing',  section: 'balloon', label: 'Starting Price', type: 'text' },
      { key: 'image',    section: 'balloon', label: 'Service Image',  type: 'image' },
    ],
  },
  {
    section: 'wedding',
    label: 'Service 3 — Wedding Styling',
    fields: [
      { key: 'title',    section: 'wedding', label: 'Service Name',   type: 'text' },
      { key: 'subtitle', section: 'wedding', label: 'Tagline',        type: 'text' },
      { key: 'body',     section: 'wedding', label: 'Description',    type: 'textarea' },
      { key: 'pricing',  section: 'wedding', label: 'Starting Price', type: 'text' },
      { key: 'image',    section: 'wedding', label: 'Service Image',  type: 'image' },
    ],
  },
  {
    section: 'corporate',
    label: 'Service 4 — Corporate Events',
    fields: [
      { key: 'title',    section: 'corporate', label: 'Service Name',   type: 'text' },
      { key: 'subtitle', section: 'corporate', label: 'Tagline',        type: 'text' },
      { key: 'body',     section: 'corporate', label: 'Description',    type: 'textarea' },
      { key: 'pricing',  section: 'corporate', label: 'Starting Price', type: 'text' },
      { key: 'image',    section: 'corporate', label: 'Service Image',  type: 'image' },
    ],
  },
  {
    section: 'draping',
    label: 'Service 5 — Backdrop & Draping',
    fields: [
      { key: 'title',    section: 'draping', label: 'Service Name',   type: 'text' },
      { key: 'subtitle', section: 'draping', label: 'Tagline',        type: 'text' },
      { key: 'body',     section: 'draping', label: 'Description',    type: 'textarea' },
      { key: 'pricing',  section: 'draping', label: 'Starting Price', type: 'text' },
      { key: 'image',    section: 'draping', label: 'Service Image',  type: 'image' },
    ],
  },
  {
    section: 'production',
    label: 'Service 6 — Full Production',
    fields: [
      { key: 'title',    section: 'production', label: 'Service Name',   type: 'text' },
      { key: 'subtitle', section: 'production', label: 'Tagline',        type: 'text' },
      { key: 'body',     section: 'production', label: 'Description',    type: 'textarea' },
      { key: 'pricing',  section: 'production', label: 'Starting Price', type: 'text' },
      { key: 'image',    section: 'production', label: 'Service Image',  type: 'image' },
    ],
  },
]

export default async function ServicesPageCMS() {
  const content = await getPageContent('services')
  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Pages</p>
        <h1 className="font-display italic text-[#0F0E0C] text-[36px]">Services Page</h1>
        <p className="font-body text-[#4A4843]/60 text-sm mt-1">Edit each service card — name, description, pricing, and image.</p>
      </div>
      <PageEditor page="services" sections={sections} initial={content} />
    </div>
  )
}
```

### About Page CMS (`src/app/admin/pages/about/page.tsx`)

```tsx
const sections: SectionConfig[] = [
  {
    section: 'hero',
    label: 'About Hero Banner',
    fields: [
      { key: 'headline',    section: 'hero', label: 'Headline',    type: 'text' },
      { key: 'subheadline', section: 'hero', label: 'Subheadline', type: 'text' },
      { key: 'image',       section: 'hero', label: 'Background Image', type: 'image' },
    ],
  },
  {
    section: 'vivian_bio',
    label: "Vivian's Bio",
    fields: [
      { key: 'headline',  section: 'vivian_bio', label: 'Headline',          type: 'text' },
      { key: 'body_1',    section: 'vivian_bio', label: 'First Paragraph',   type: 'textarea' },
      { key: 'body_2',    section: 'vivian_bio', label: 'Second Paragraph',  type: 'textarea' },
      { key: 'body_3',    section: 'vivian_bio', label: 'Third Paragraph',   type: 'textarea' },
      { key: 'pullquote', section: 'vivian_bio', label: 'Pull Quote',        type: 'textarea' },
      { key: 'image',     section: 'vivian_bio', label: "Vivian's Portrait", type: 'image' },
    ],
  },
  {
    section: 'values',
    label: 'Our Values',
    fields: [
      { key: 'headline',      section: 'values', label: 'Section Headline', type: 'text' },
      { key: 'value_1_title', section: 'values', label: 'Value 1 — Title',  type: 'text' },
      { key: 'value_1_body',  section: 'values', label: 'Value 1 — Text',   type: 'textarea' },
      { key: 'value_2_title', section: 'values', label: 'Value 2 — Title',  type: 'text' },
      { key: 'value_2_body',  section: 'values', label: 'Value 2 — Text',   type: 'textarea' },
      { key: 'value_3_title', section: 'values', label: 'Value 3 — Title',  type: 'text' },
      { key: 'value_3_body',  section: 'values', label: 'Value 3 — Text',   type: 'textarea' },
      { key: 'value_4_title', section: 'values', label: 'Value 4 — Title',  type: 'text' },
      { key: 'value_4_body',  section: 'values', label: 'Value 4 — Text',   type: 'textarea' },
    ],
  },
]
```

### Contact Page CMS (`src/app/admin/pages/contact/page.tsx`)

```tsx
const sections: SectionConfig[] = [
  {
    section: 'hero',
    label: 'Contact Hero',
    fields: [
      { key: 'headline',    section: 'hero', label: 'Headline',    type: 'text' },
      { key: 'subheadline', section: 'hero', label: 'Subheadline', type: 'text' },
    ],
  },
  {
    section: 'details',
    label: 'Contact Details',
    fields: [
      { key: 'address',       section: 'details', label: 'Address',       type: 'text', hint: 'Shown with a location pin icon' },
      { key: 'phone',         section: 'details', label: 'Phone Number',  type: 'text' },
      { key: 'email',         section: 'details', label: 'Email Address', type: 'text' },
      { key: 'hours',         section: 'details', label: 'Business Hours', type: 'text', placeholder: 'Mon–Fri 9am–6pm AEST' },
      { key: 'response_time', section: 'details', label: 'Response Time Note', type: 'text', placeholder: 'We respond within 24 hours' },
    ],
  },
]
```

---

## E-8 — API ROUTES FOR CMS

### `src/app/api/cms/route.ts` — save single field
```ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  page:    z.string().min(1),
  section: z.string().min(1),
  key:     z.string().min(1),
  value:   z.string(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = schema.parse(await req.json())

  await prisma.pageContent.upsert({
    where:  { page_section_key: { page: body.page, section: body.section, key: body.key } },
    update: { value: body.value },
    create: body,
  })

  return NextResponse.json({ success: true })
}
```

### `src/app/api/cms/batch/route.ts` — save all fields at once
```ts
const batchSchema = z.object({
  entries: z.array(z.object({
    page:    z.string(),
    section: z.string(),
    key:     z.string(),
    value:   z.string(),
  }))
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { entries } = batchSchema.parse(await req.json())

  await prisma.$transaction(
    entries.map(e =>
      prisma.pageContent.upsert({
        where:  { page_section_key: { page: e.page, section: e.section, key: e.key } },
        update: { value: e.value },
        create: e,
      })
    )
  )

  return NextResponse.json({ success: true })
}
```

---

## E-9 — REVALIDATION

After saving, the public pages need to refresh. Add to both API routes after the DB save:

```ts
import { revalidatePath } from 'next/cache'

// After prisma upsert:
const pathMap: Record<string, string> = {
  home:     '/',
  services: '/services',
  about:    '/about',
  contact:  '/contact',
  quote:    '/quote',
}
revalidatePath(pathMap[body.page] ?? '/')
```

This tells Next.js to regenerate that page immediately so changes appear live within seconds.

---

## E-10 — RUN CONTENT SEED

After deploying:
```bash
npm run seed:content
```

Or run against Neon directly from PowerShell:
```powershell
$env:DATABASE_URL="postgresql://neondb_owner:npg_EU4dqF0YeMCf@ep-blue-dew-abq9zha1.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
npx tsx prisma/seed-content.ts
```

---

## E-11 — CHECKLIST

- [ ] `PageContent` table created (`db push`)
- [ ] Content seed runs without error
- [ ] Admin → Pages → Home Page: all fields visible and editable
- [ ] Edit hero headline → Save → public homepage updates within 5 seconds
- [ ] Upload a new hero image → preview appears in admin → live on site
- [ ] Services page: all 6 service blocks editable with images
- [ ] About page: Vivian bio + values all editable
- [ ] Contact page: phone/email/address editable
- [ ] Save All button saves every field on the page in one click
- [ ] Individual Save buttons work per field
- [ ] Toast confirmation appears on every save
- [ ] Unauthorized users cannot access `/api/cms`
- [ ] `npm run build` passes
