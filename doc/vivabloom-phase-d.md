# Vivabloom — Phase D: Polish, Performance & Pre-Deploy
## GSAP Animations · Email Templates · Mobile Audit · Lighthouse · Vercel Deploy Config

> Phases A, B, C complete and passing build. This is the final polish phase before go-live.
> Do NOT change data models, API routes, or admin logic unless a section explicitly says to.
> Every change here is additive or corrective — nothing structural.

---

## D-1 — GSAP SCROLL ANIMATIONS (public site)

### Install check
```bash
# Already installed in Phase B — verify:
npm ls gsap @gsap/react
```

### Create animation utility (`src/lib/gsap.ts`)

Centralise all GSAP setup so plugins are only registered once:

```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}

export { gsap, ScrollTrigger, SplitText }
```

> Note: `SplitText` is a Club GSAP plugin. If not licensed, remove SplitText usage below
> and fall back to the CSS `animate-fade-up` approach already in globals.css. All SplitText
> sections below include a CSS fallback comment.

### D-1a — Hero: text entrance (HeroSection.tsx)

Replace the CSS `animate-fade-up` approach with a GSAP timeline for the hero entrance.
This gives precise stagger control and a more cinematic feel.

In `HeroSection.tsx`, add inside `useEffect`:

```ts
import { gsap, ScrollTrigger } from '@/lib/gsap'

useEffect(() => {
  const ctx = gsap.context(() => {

    // ── Hero entrance timeline ──────────────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo('.hero-eyebrow',
      { opacity: 0, y: 16, letterSpacing: '0.5em' },
      { opacity: 1, y: 0,  letterSpacing: '0.35em', duration: 1 }
    )
    .fromTo('.hero-headline',
      { opacity: 0, y: 40, skewY: 2 },
      { opacity: 1, y: 0,  skewY: 0, duration: 1.2, stagger: 0.1 },
      '-=0.6'
    )
    .fromTo('.hero-sub',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0,  duration: 0.8 },
      '-=0.8'
    )
    .fromTo('.hero-ctas',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0,  duration: 0.6 },
      '-=0.6'
    )
    .fromTo('.hero-scroll-indicator',
      { opacity: 0 },
      { opacity: 1, duration: 0.6 },
      '-=0.2'
    )

    // ── Hero parallax ───────────────────────────────────────────────────
    gsap.to(heroImageRef.current, {
      yPercent: 25,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end:   'bottom top',
        scrub: 1.5,
      },
    })

  }, heroRef)

  return () => ctx.revert()
}, [])
```

Add the class names to the corresponding elements in JSX:
- Eyebrow `<p>` → add `hero-eyebrow` (remove `animate-fade-up` inline style)
- Both headline lines → add `hero-headline` to each `<span>` or `<br>`-separated element
- Subheadline `<p>` → add `hero-sub`
- CTA wrapper `<div>` → add `hero-ctas`
- Scroll indicator `<div>` → add `hero-scroll-indicator`

Set initial opacity: `style={{ opacity: 0 }}` on each so no flash before GSAP fires.

### D-1b — Section headings: split-line reveal

Create `src/components/public/AnimatedHeading.tsx`:

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface Props {
  children: string
  tag?: 'h1' | 'h2' | 'h3'
  className?: string
  delay?: number
}

export default function AnimatedHeading({ children, tag: Tag = 'h2', className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // CSS fallback if SplitText not available
    gsap.fromTo(el,
      { opacity: 0, y: 32 },
      {
        opacity: 1, y: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      }
    )
  }, [delay])

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  )
}
```

Use `<AnimatedHeading>` in place of plain `<h2>` for all major section headings:
- BrandStatement quote
- ServicesSection heading
- GalleryPreview heading
- TestimonialsSection label
- AboutPreview heading
- QuoteCTA heading

### D-1c — Service cards: staggered entrance

In `ServicesSection.tsx`, wrap the grid in a `useEffect`:

```ts
useEffect(() => {
  gsap.fromTo('.service-card',
    { opacity: 0, y: 48 },
    {
      opacity: 1, y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.services-grid',
        start: 'top 80%',
        once: true,
      },
    }
  )
}, [])
```

Add class `service-card` to each `ServiceCard` outer element, `services-grid` to the grid container.
Set initial: `className="... opacity-0"` on each card, GSAP sets opacity to 1.

### D-1d — Stats counter animation (BrandStatement)

Animate the stat numbers counting up when they enter the viewport:

```ts
// In BrandStatement — make it a client component, add:
useEffect(() => {
  const counters = document.querySelectorAll('.stat-value')
  counters.forEach((el) => {
    const target = el.getAttribute('data-target') ?? '0'
    const isNumeric = /^\d+$/.test(target)
    if (!isNumeric) return // skip '5★', '3'

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          { val: 0 },
          {
            val: parseInt(target),
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.round(this.targets()[0].val).toString() + '+'
            },
          }
        )
      },
    })
  })
}, [])
```

Add `data-target="10"` / `data-target="500"` to the stat value elements.
For non-numeric stats (`5★`, `3`), still add the class but without `data-target` — they'll just render static.

### D-1e — Gallery items: fade-in on load

In `GalleryGrid.tsx`:

```ts
useEffect(() => {
  gsap.fromTo('.gallery-item',
    { opacity: 0, scale: 0.97 },
    {
      opacity: 1, scale: 1,
      duration: 0.5,
      stagger: { amount: 0.8, from: 'start' },
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.gallery-masonry',
        start: 'top 85%',
        once: true,
      },
    }
  )
}, [items]) // re-run when filter changes
```

Add `gallery-item` to each item wrapper div, `gallery-masonry` to the columns container.

### D-1f — About image reveal

In `AboutPreview.tsx` (convert to client component):

```ts
useEffect(() => {
  // Image slides up + clip reveal
  gsap.fromTo('.about-image-wrap',
    { clipPath: 'inset(100% 0 0 0)', y: 20 },
    {
      clipPath: 'inset(0% 0 0 0)', y: 0,
      duration: 1.2,
      ease: 'power3.inOut',
      scrollTrigger: { trigger: '.about-image-wrap', start: 'top 80%', once: true },
    }
  )
  // Decorative frame fades in with delay
  gsap.fromTo('.about-frame',
    { opacity: 0, scale: 0.96 },
    {
      opacity: 1, scale: 1,
      duration: 0.8, delay: 0.4,
      scrollTrigger: { trigger: '.about-image-wrap', start: 'top 80%', once: true },
    }
  )
  // Text content staggered
  gsap.fromTo('.about-text-item',
    { opacity: 0, x: 24 },
    {
      opacity: 1, x: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.about-content', start: 'top 80%', once: true },
    }
  )
}, [])
```

Add class names: `about-image-wrap`, `about-frame`, `about-content`, `about-text-item` (on eyebrow, h2, divider, paragraphs, pullquote, stats, CTA — each separately).

### D-1g — Testimonials: entrance animation

```ts
// On section enter, animate the first testimonial in:
gsap.fromTo('.testimonials-section',
  { opacity: 0 },
  {
    opacity: 1, duration: 0.8,
    scrollTrigger: { trigger: '.testimonials-section', start: 'top 85%', once: true },
  }
)
```

### D-1h — QuoteCTA section parallax

```ts
gsap.to('.quote-cta-bg',
  {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.quote-cta-section',
      start: 'top bottom',
      end:   'bottom top',
      scrub: 1,
    },
  }
)
```

Add `quote-cta-bg` to the `<Image>` inside QuoteCTA, `quote-cta-section` to the `<section>`.

### D-1i — ScrollTrigger cleanup

All GSAP effects using ScrollTrigger must be wrapped in `gsap.context()` and cleaned up:

```ts
useEffect(() => {
  const ctx = gsap.context(() => {
    // all gsap calls here
  }, sectionRef) // scope to this component's DOM
  return () => ctx.revert() // kills all animations + ScrollTriggers on unmount
}, [])
```

This is required on **every** component that uses GSAP to prevent memory leaks on navigation.

### D-1j — Reduced motion respect

Add to `src/lib/gsap.ts`:
```ts
export const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
```

Guard every GSAP block:
```ts
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

useEffect(() => {
  if (prefersReducedMotion) return // skip all animations
  const ctx = gsap.context(() => { /* ... */ }, ref)
  return () => ctx.revert()
}, [])
```

---

## D-2 — EMAIL TEMPLATES (visual design)

All email templates live in `src/lib/emails/`. They use Resend's React Email renderer.

### Install
```bash
npm install @react-email/components
```

### D-2a — Base layout (`src/lib/emails/base-layout.tsx`)

```tsx
import {
  Html, Head, Preview, Body, Container, Section,
  Row, Column, Text, Img, Hr, Link,
} from '@react-email/components'

interface BaseLayoutProps {
  preview: string
  children: React.ReactNode
}

const baseUrl = 'https://vivabloomdecor.com.au'

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        {/* Header */}
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>Vivabloom</Text>
            <Text style={styles.tagline}>Luxury Event & Wedding Décor</Text>
          </Section>

          {/* Gold divider */}
          <Hr style={styles.divider} />

          {/* Content */}
          <Section style={styles.content}>
            {children}
          </Section>

          {/* Gold divider */}
          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Melbourne, Victoria, Australia
            </Text>
            <Text style={styles.footerText}>
              <Link href={`${baseUrl}`} style={styles.footerLink}>vivabloomdecor.com.au</Link>
              {' · '}
              <Link href={`${baseUrl}/privacy`} style={styles.footerLink}>Privacy</Link>
            </Text>
            <Text style={styles.footerSmall}>
              © {new Date().getFullYear()} Vivabloom Decor. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#F8F5EE',
    fontFamily: 'Georgia, serif',
    margin: 0,
    padding: '32px 0',
  },
  container: {
    backgroundColor: '#FFFFFF',
    maxWidth: '600px',
    margin: '0 auto',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#0F0E0C',
    padding: '36px 48px',
    textAlign: 'center' as const,
  },
  logo: {
    fontFamily: 'Georgia, serif',
    fontSize: '32px',
    fontStyle: 'italic',
    color: '#C9A96E',
    margin: 0,
    letterSpacing: '2px',
  },
  tagline: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '10px',
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.4)',
    margin: '8px 0 0',
  },
  divider: {
    borderColor: '#C9A96E',
    borderWidth: '1px',
    margin: 0,
    opacity: 0.4,
  },
  content: {
    padding: '48px',
  },
  footer: {
    padding: '24px 48px 36px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    color: '#9B9589',
    margin: '4px 0',
  },
  footerLink: {
    color: '#C9A96E',
    textDecoration: 'none',
  },
  footerSmall: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '11px',
    color: '#C5BEB4',
    marginTop: '12px',
  },
}
```

### D-2b — Enquiry confirmation (`src/lib/emails/enquiry-confirmation.tsx`)

Sent to the client immediately after they submit the quote form.

```tsx
import { Text, Button, Section } from '@react-email/components'
import { BaseLayout } from './base-layout'

interface Props {
  name: string
  eventType: string
  eventDate?: string
}

export function EnquiryConfirmationEmail({ name, eventType, eventDate }: Props) {
  return (
    <BaseLayout preview={`We've received your enquiry, ${name} — Vivabloom`}>

      {/* Eyebrow */}
      <Text style={s.eyebrow}>Enquiry Received</Text>

      {/* Headline */}
      <Text style={s.heading}>Thank you, {name}.</Text>

      {/* Body */}
      <Text style={s.body}>
        We've received your enquiry for a <strong>{eventType}</strong>
        {eventDate ? ` on ${eventDate}` : ''} and we're already excited.
      </Text>
      <Text style={s.body}>
        A member of our team will be in touch within{' '}
        <strong style={{ color: '#C9A96E' }}>24 hours</strong> to discuss
        your vision in detail.
      </Text>

      {/* Summary box */}
      <Section style={s.summaryBox}>
        <Text style={s.summaryLabel}>Your enquiry details</Text>
        <Text style={s.summaryItem}>Event type: <strong>{eventType}</strong></Text>
        {eventDate && (
          <Text style={s.summaryItem}>Event date: <strong>{eventDate}</strong></Text>
        )}
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: 'center', marginTop: '40px' }}>
        <Button href="https://vivabloomdecor.com.au/gallery" style={s.button}>
          Explore Our Work
        </Button>
      </Section>

      {/* Sign-off */}
      <Text style={s.signoff}>
        With love,<br />
        <em style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#0F0E0C' }}>
          The Vivabloom Team
        </em>
      </Text>

    </BaseLayout>
  )
}

const s = {
  eyebrow: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '10px',
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    color: '#C9A96E',
    margin: '0 0 16px',
  },
  heading: {
    fontFamily: 'Georgia, serif',
    fontSize: '36px',
    fontStyle: 'italic',
    color: '#0F0E0C',
    margin: '0 0 24px',
    lineHeight: '1.2',
  },
  body: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '15px',
    lineHeight: '1.7',
    color: '#4A4843',
    margin: '0 0 16px',
  },
  summaryBox: {
    backgroundColor: '#F8F5EE',
    borderLeft: '3px solid #C9A96E',
    padding: '20px 24px',
    marginTop: '32px',
    borderRadius: '0 4px 4px 0',
  },
  summaryLabel: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    color: '#C9A96E',
    margin: '0 0 12px',
  },
  summaryItem: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    color: '#4A4843',
    margin: '4px 0',
  },
  button: {
    backgroundColor: '#C9A96E',
    color: '#0F0E0C',
    fontFamily: 'Arial, sans-serif',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    padding: '14px 36px',
    borderRadius: '9999px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  signoff: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    color: '#9B9589',
    marginTop: '40px',
    lineHeight: '1.8',
  },
}
```

### D-2c — Admin notification (`src/lib/emails/admin-notification.tsx`)

Sent to `info@vivabloomdecor.com.au` for every new enquiry.

```tsx
import { Text, Button, Section, Row, Column } from '@react-email/components'
import { BaseLayout } from './base-layout'

interface Props {
  enquiryId: string
  name: string
  email: string
  phone?: string
  eventType: string
  eventDate?: string
  guestCount?: number
  budget?: string
  message: string
  receivedAt: string
}

export function AdminNotificationEmail(props: Props) {
  return (
    <BaseLayout preview={`New enquiry from ${props.name} — ${props.eventType}`}>

      <Text style={s.eyebrow}>New Enquiry</Text>
      <Text style={s.heading}>
        {props.name} wants to talk.
      </Text>

      {/* Detail grid */}
      <Section style={s.grid}>
        <Field label="Name"       value={props.name} />
        <Field label="Email"      value={props.email} />
        <Field label="Phone"      value={props.phone ?? '—'} />
        <Field label="Event type" value={props.eventType} />
        <Field label="Event date" value={props.eventDate ?? '—'} />
        <Field label="Guests"     value={props.guestCount?.toString() ?? '—'} />
        <Field label="Budget"     value={props.budget ?? '—'} />
        <Field label="Received"   value={props.receivedAt} />
      </Section>

      {/* Message */}
      <Text style={s.messageLabel}>Their message</Text>
      <Section style={s.messageBox}>
        <Text style={s.messageText}>"{props.message}"</Text>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: 'center', marginTop: '36px' }}>
        <Button
          href={`https://vivabloomdecor.com.au/admin/enquiries?id=${props.enquiryId}`}
          style={s.button}>
          View in Dashboard →
        </Button>
      </Section>

    </BaseLayout>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ marginBottom: '8px' }}>
      <Column style={{ width: '120px' }}>
        <Text style={s.fieldLabel}>{label}</Text>
      </Column>
      <Column>
        <Text style={s.fieldValue}>{value}</Text>
      </Column>
    </Row>
  )
}

const s = {
  eyebrow: { fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '3px',
             textTransform: 'uppercase' as const, color: '#C9A96E', margin: '0 0 16px' },
  heading: { fontFamily: 'Georgia, serif', fontSize: '32px', fontStyle: 'italic',
             color: '#0F0E0C', margin: '0 0 32px', lineHeight: '1.2' },
  grid:    { backgroundColor: '#F8F5EE', padding: '24px', borderRadius: '4px', marginBottom: '24px' },
  fieldLabel: { fontFamily: 'Arial, sans-serif', fontSize: '11px', letterSpacing: '1px',
                textTransform: 'uppercase' as const, color: '#9B9589', margin: '0' },
  fieldValue: { fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#0F0E0C', margin: '0' },
  messageLabel: { fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '2px',
                  textTransform: 'uppercase' as const, color: '#C9A96E', margin: '0 0 8px' },
  messageBox: { borderLeft: '3px solid #C9A96E', paddingLeft: '20px' },
  messageText: { fontFamily: 'Georgia, serif', fontSize: '16px', fontStyle: 'italic',
                 color: '#4A4843', lineHeight: '1.7', margin: '0' },
  button: { backgroundColor: '#0F0E0C', color: '#C9A96E', fontFamily: 'Arial, sans-serif',
            fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const,
            padding: '14px 32px', borderRadius: '9999px', textDecoration: 'none' },
}
```

### D-2d — Invoice email (`src/lib/emails/invoice-email.tsx`)

```tsx
import { Text, Button, Section, Row, Column, Hr } from '@react-email/components'
import { BaseLayout } from './base-layout'

interface LineItem { description: string; quantity: number; unitPrice: number }

interface Props {
  invoiceNumber: string
  clientName: string
  dueDate: string
  lineItems: LineItem[]
  total: number
  invoiceId: string
}

export function InvoiceEmail({ invoiceNumber, clientName, dueDate, lineItems, total, invoiceId }: Props) {
  return (
    <BaseLayout preview={`Invoice #${invoiceNumber} from Vivabloom — Due ${dueDate}`}>

      <Text style={s.eyebrow}>Invoice #{invoiceNumber}</Text>
      <Text style={s.heading}>Hi {clientName},</Text>
      <Text style={s.body}>
        Please find your invoice attached. Payment is due by{' '}
        <strong style={{ color: '#C9A96E' }}>{dueDate}</strong>.
      </Text>

      {/* Line items */}
      <Section style={s.table}>
        {/* Header row */}
        <Row style={s.tableHeader}>
          <Column style={{ width: '60%' }}><Text style={s.colHead}>Description</Text></Column>
          <Column style={{ width: '15%' }}><Text style={{ ...s.colHead, textAlign: 'center' }}>Qty</Text></Column>
          <Column style={{ width: '25%' }}><Text style={{ ...s.colHead, textAlign: 'right' }}>Amount</Text></Column>
        </Row>
        <Hr style={{ borderColor: '#C9A96E', opacity: 0.3, margin: 0 }} />

        {/* Items */}
        {lineItems.map((item, i) => (
          <Row key={i} style={s.tableRow}>
            <Column style={{ width: '60%' }}>
              <Text style={s.cell}>{item.description}</Text>
            </Column>
            <Column style={{ width: '15%' }}>
              <Text style={{ ...s.cell, textAlign: 'center' }}>{item.quantity}</Text>
            </Column>
            <Column style={{ width: '25%' }}>
              <Text style={{ ...s.cell, textAlign: 'right' }}>
                ${(item.quantity * item.unitPrice).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
              </Text>
            </Column>
          </Row>
        ))}

        <Hr style={{ borderColor: '#EDE8DC', margin: 0 }} />

        {/* Total row */}
        <Row style={{ padding: '16px 0 0' }}>
          <Column style={{ width: '75%' }}>
            <Text style={s.totalLabel}>Total Due</Text>
          </Column>
          <Column style={{ width: '25%' }}>
            <Text style={s.totalAmount}>
              ${total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: 'center', marginTop: '40px' }}>
        <Button href={`https://vivabloomdecor.com.au/api/invoices/${invoiceId}/pdf`} style={s.button}>
          Download PDF Invoice
        </Button>
      </Section>

      <Text style={s.note}>
        If you have any questions about this invoice, reply to this email or call us directly.
        We&apos;re always happy to help.
      </Text>

    </BaseLayout>
  )
}

const s = {
  eyebrow:     { fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '3px',
                 textTransform: 'uppercase' as const, color: '#C9A96E', margin: '0 0 16px' },
  heading:     { fontFamily: 'Georgia, serif', fontSize: '32px', fontStyle: 'italic',
                 color: '#0F0E0C', margin: '0 0 16px' },
  body:        { fontFamily: 'Arial, sans-serif', fontSize: '15px', lineHeight: '1.7',
                 color: '#4A4843', margin: '0 0 32px' },
  table:       { backgroundColor: '#F8F5EE', padding: '24px', borderRadius: '4px' },
  tableHeader: { marginBottom: '12px' },
  tableRow:    { padding: '10px 0', borderBottom: '1px solid #EDE8DC' },
  colHead:     { fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '2px',
                 textTransform: 'uppercase' as const, color: '#9B9589', margin: '0 0 12px' },
  cell:        { fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#0F0E0C', margin: '10px 0' },
  totalLabel:  { fontFamily: 'Arial, sans-serif', fontSize: '12px', letterSpacing: '2px',
                 textTransform: 'uppercase' as const, color: '#9B9589', margin: '0', textAlign: 'right' as const },
  totalAmount: { fontFamily: 'Georgia, serif', fontSize: '28px', fontStyle: 'italic',
                 color: '#0F0E0C', margin: '0', textAlign: 'right' as const },
  button:      { backgroundColor: '#C9A96E', color: '#0F0E0C', fontFamily: 'Arial, sans-serif',
                 fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const,
                 padding: '14px 36px', borderRadius: '9999px', textDecoration: 'none' },
  note:        { fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#9B9589',
                 lineHeight: '1.6', marginTop: '32px' },
}
```

### D-2e — Wire email templates into `src/lib/email.ts`

Replace the plain-text email functions with the React Email renderer:

```ts
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { EnquiryConfirmationEmail } from './emails/enquiry-confirmation'
import { AdminNotificationEmail }   from './emails/admin-notification'
import { InvoiceEmail }             from './emails/invoice-email'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'Vivabloom <hello@vivabloomdecor.com.au>'
const ADMIN  = process.env.ADMIN_EMAIL ?? 'info@vivabloomdecor.com.au'

export async function sendEnquiryConfirmation(
  to: string,
  name: string,
  eventType: string,
  eventDate?: string
) {
  const html = render(EnquiryConfirmationEmail({ name, eventType, eventDate }))
  return resend.emails.send({
    from: FROM, to,
    subject: `We've received your enquiry, ${name} — Vivabloom`,
    html,
  })
}

export async function sendAdminNotification(enquiry: any) {
  const html = render(AdminNotificationEmail({
    enquiryId:  enquiry.id,
    name:       enquiry.name,
    email:      enquiry.email,
    phone:      enquiry.phone,
    eventType:  enquiry.eventType,
    eventDate:  enquiry.eventDate?.toLocaleDateString('en-AU'),
    guestCount: enquiry.guestCount,
    budget:     enquiry.budget,
    message:    enquiry.message,
    receivedAt: new Date().toLocaleDateString('en-AU', { dateStyle: 'long' }),
  }))
  return resend.emails.send({
    from: FROM, to: ADMIN,
    subject: `New enquiry: ${enquiry.eventType} — ${enquiry.name}`,
    html,
  })
}

export async function sendInvoiceEmail(
  to: string,
  props: { invoiceNumber: string; clientName: string; dueDate: string;
           lineItems: any[]; total: number; invoiceId: string }
) {
  const html = render(InvoiceEmail(props))
  return resend.emails.send({
    from: FROM, to,
    subject: `Invoice #${props.invoiceNumber} from Vivabloom`,
    html,
  })
}
```

---

## D-3 — MOBILE AUDIT

Go through every public page at **375px width** (iPhone SE viewport). Fix every issue found.

### D-3a — Typography scale

Add to `globals.css` — fluid type for hero headline:
```css
.hero-headline-text {
  font-size: clamp(48px, 10vw, 112px);
  line-height: 0.92;
}
```
Replace the `text-[72px] md:text-[96px] lg:text-[112px]` Tailwind classes on the hero `<h1>` with this single class.

### D-3b — Nav mobile menu

Check these on 375px:
- [ ] Hamburger icon visible and tappable (min 44×44px tap target)
- [ ] Full-screen menu overlay covers entire screen, no horizontal scroll
- [ ] Each nav link: min height 56px, easy to tap
- [ ] Social icons row: adequate spacing between icons (min 32px)
- [ ] Close (✕) button: top-right, 44×44px tap target
- [ ] Menu closes when any link is tapped

If any fail, apply:
```tsx
// Nav links in mobile menu
className="block py-4 text-center font-display italic text-white text-[40px] leading-tight
           active:text-[#C9A96E] transition-colors"
```

### D-3c — Services grid

On mobile, the 3-column grid must become 1-column. Verify:
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```
Each card height on mobile: `h-[320px]` (not 480px). Update:
```tsx
style={{ height: 'clamp(320px, 50vw, 480px)' }}
```

### D-3d — Gallery masonry

On mobile (`< 768px`), force single column:
```tsx
// GalleryGrid.tsx
const columnCount = typeof window !== 'undefined'
  ? window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3
  : 3

// Or with Tailwind:
<div className="columns-1 md:columns-2 lg:columns-3 gap-3">
```

### D-3e — Brand statement

Stats 2×2 grid on mobile: already `grid-cols-2` — verify each stat box has adequate padding.
The main quote: check at 375px that `text-[42px]` doesn't overflow. Apply:
```css
font-size: clamp(28px, 7vw, 52px);
```

### D-3f — Quote form

Three-step form on mobile:
- Step indicator: if labels truncate, hide labels on mobile, show only numbers
- Form fields: full-width on mobile (already should be), verify `input` height ≥ 48px
- `Continue →` button: full-width on mobile
- Step transition: smooth — the `step` state change should not cause layout jump

### D-3g — Footer

On mobile (stacked):
- 4 columns → 2 columns on tablet → 1 column on small mobile
- Verify newsletter input + button don't overflow
- Social icons row: centered, adequate spacing

Fix:
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
```

### D-3h — Admin dashboard

Check admin on tablet (768px):
- Sidebar collapses correctly
- Dashboard stat cards: `grid-cols-2` on tablet → `grid-cols-4` on desktop
- Enquiry table: horizontally scrollable on tablet with `overflow-x-auto`
- Blog editor toolbar: wraps gracefully on narrow screens

### D-3i — Touch targets

Global rule — add to `globals.css`:
```css
/* Minimum touch targets for iOS/Android */
button, a, [role="button"] {
  min-height: 44px;
}
```
Exception: inline text links (prose links) are exempt.

---

## D-4 — PERFORMANCE OPTIMISATION

### D-4a — Image audit

Scan every `<Image>` component across the site. Apply these rules:

**Hero image:**
```tsx
<Image
  src={heroSrc}
  alt="Luxury event décor by Vivabloom"
  fill
  priority           // ← required for LCP image
  sizes="100vw"
  quality={90}
  className="object-cover"
/>
```

**Gallery grid images:**
```tsx
<Image
  src={item.imageUrl}
  alt={item.title}
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  quality={80}
  loading="lazy"
/>
```

**Service cards:**
```tsx
sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
quality={85}
```

**Above-fold images (hero, first gallery row):** `priority={true}`, others: `loading="lazy"` (Next.js Image is lazy by default — only explicitly set `priority` for above-fold).

### D-4b — Font preloading

In `src/app/layout.tsx`, `next/font/google` already handles preloading. Verify these options are set:
```ts
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style:  ['normal', 'italic'],
  display: 'swap',     // ← prevent FOIT
  preload: true,
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: true,
})
```

### D-4c — Bundle analysis

```bash
npm install --save-dev @next/bundle-analyzer
```

In `next.config.mjs`:
```js
import bundleAnalyzer from '@next/bundle-analyzer'
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
export default withBundleAnalyzer({ /* existing config */ })
```

Run: `ANALYZE=true npm run build`

Look for:
- GSAP bundle size (should be ~60KB gzipped — acceptable)
- Tiptap (admin only — verify it's NOT in public bundle via code splitting)
- `@react-pdf/renderer` (server-only — should not appear in client bundle)
- Any unexpectedly large packages

### D-4d — Code splitting for heavy admin deps

Tiptap and react-pdf are admin-only. Verify they're never imported in public routes.

In `next.config.mjs`, add:
```js
experimental: {
  optimizePackageImports: ['@tiptap/react', '@tiptap/starter-kit', 'recharts', 'lucide-react'],
},
```

### D-4e — Dynamic import for non-critical public components

```tsx
// In page.tsx, lazy-load below-fold sections
import dynamic from 'next/dynamic'

const TestimonialsSection = dynamic(() => import('@/components/public/TestimonialsSection'), {
  ssr: false, // client-only (uses useState for carousel)
})
```

Apply to: `TestimonialsSection`, `GalleryPreview` (lightbox), `BrandStatement` (if converted to client for GSAP).

### D-4f — Scroll-based GSAP loading

GSAP's ScrollTrigger registers against `window` — it's inherently client-only. The `@/lib/gsap.ts` guard (`typeof window !== 'undefined'`) handles SSR. Verify no GSAP import appears in any server component.

### D-4g — `next.config.mjs` final state

```js
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'], // ← serve AVIF where supported
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@tiptap/react'],
  },
}

export default withBundleAnalyzer(nextConfig)
```

---

## D-5 — SEO FINAL PASS

### D-5a — Root layout metadata

In `src/app/layout.tsx`, make the metadata complete:
```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://vivabloomdecor.com.au'),
  title: {
    default:  'Vivabloom | Luxury Event & Wedding Décor — Melbourne, Australia',
    template: '%s | Vivabloom',
  },
  description: 'Australia\'s premier luxury event and wedding décor studio. Floral design, balloon artistry, full styling & production. Based in Melbourne, serving Australia-wide.',
  keywords:    ['luxury event decor', 'wedding decor melbourne', 'event styling australia', 'floral design', 'balloon artistry', 'vivabloom'],
  authors:     [{ name: 'Vivabloom Decor', url: 'https://vivabloomdecor.com.au' }],
  openGraph: {
    type:        'website',
    locale:      'en_AU',
    url:         'https://vivabloomdecor.com.au',
    siteName:    'Vivabloom',
    title:       'Vivabloom | Luxury Event & Wedding Décor',
    description: 'Australia\'s premier luxury event décor studio. Melbourne-based, Australia-wide.',
    images: [{
      url:    '/og-image.jpg',
      width:  1200,
      height: 630,
      alt:    'Vivabloom Luxury Event Décor',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Vivabloom | Luxury Event & Wedding Décor',
    description: 'Australia\'s premier luxury event décor studio.',
    images:      ['/og-image.jpg'],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: 'https://vivabloomdecor.com.au',
  },
}
```

### D-5b — Per-page metadata

Verify every public page has a `generateMetadata` export or `metadata` export:

```ts
// Services page
export const metadata: Metadata = {
  title: 'Our Services — Luxury Event Décor',
  description: 'Floral design, balloon artistry, wedding styling, corporate events, backdrop & draping, and full event production. Melbourne & Australia-wide.',
  alternates: { canonical: 'https://vivabloomdecor.com.au/services' },
}

// Gallery page
export const metadata: Metadata = {
  title: 'Gallery — Event Décor Portfolio',
  description: 'Browse our portfolio of luxury weddings, corporate events, birthdays, and bespoke celebrations across Melbourne and Australia.',
  alternates: { canonical: 'https://vivabloomdecor.com.au/gallery' },
}

// About page
export const metadata: Metadata = {
  title: 'About Vivabloom — Meet the Team',
  description: 'Meet Vivian and the Vivabloom team. A decade of luxury event décor, 500+ events, and a passion for creating unforgettable celebrations.',
  alternates: { canonical: 'https://vivabloomdecor.com.au/about' },
}

// Contact page
export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Vivabloom. We\'d love to hear about your upcoming event.',
  alternates: { canonical: 'https://vivabloomdecor.com.au/contact' },
}

// Quote page
export const metadata: Metadata = {
  title: 'Request a Quote',
  description: 'Tell us about your event and we\'ll craft a personalised proposal for you.',
  alternates: { canonical: 'https://vivabloomdecor.com.au/quote' },
}
```

### D-5c — OG image

Create `/public/og-image.jpg` — 1200×630px.
Content: Dark background (`#0F0E0C`), Vivabloom wordmark in champagne, tagline, decorative floral element.
For now: use a high-quality event photo from Unsplash cropped to 1200×630, or generate via Vercel's `@vercel/og`:

```ts
// src/app/opengraph-image.tsx (Vercel OG image generation)
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: '#0F0E0C',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{ fontFamily: 'Georgia', fontSize: 80, color: '#C9A96E', fontStyle: 'italic', margin: 0 }}>
        Vivabloom
      </p>
      <p style={{ fontFamily: 'Arial', fontSize: 18, letterSpacing: '6px',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
        Luxury Event & Wedding Décor
      </p>
    </div>,
    { ...size }
  )
}
```

---

## D-6 — VERCEL DEPLOYMENT

### D-6a — Environment variables

Set all of these in Vercel Dashboard → Project → Settings → Environment Variables:

```
# Database
DATABASE_URL              postgresql://...

# Auth
NEXTAUTH_URL              https://vivabloomdecor.com.au
NEXTAUTH_SECRET           [generate: openssl rand -base64 32]

# Email
RESEND_API_KEY            re_...
ADMIN_EMAIL               info@vivabloomdecor.com.au

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME   vivabloom
CLOUDINARY_API_KEY                  ...
CLOUDINARY_API_SECRET               ...

# Optional (Phase 2)
STRIPE_SECRET_KEY         sk_...
STRIPE_PUBLISHABLE_KEY    pk_...
STRIPE_WEBHOOK_SECRET     whsec_...
```

### D-6b — `vercel.json` (final)

```json
{
  "buildCommand": "prisma generate && next build",
  "functions": {
    "src/app/api/**": { "maxDuration": 30 }
  },
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "www.vivabloomdecor.com.au" }],
      "destination": "https://vivabloomdecor.com.au/:path*",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options",           "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options",     "value": "nosniff" },
        { "key": "Referrer-Policy",            "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy",         "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### D-6c — Database (Vercel Postgres or Neon)

Option A — Vercel Postgres:
```bash
vercel env pull .env.local
# DATABASE_URL will be added automatically
```

Option B — Neon (recommended for Webuzo migration later):
1. Create project at neon.tech
2. Copy connection string → `DATABASE_URL`
3. `npx prisma migrate deploy` (not `dev`) in CI

After DB is connected:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### D-6d — Cloudinary setup

1. Create account at cloudinary.com
2. Create an unsigned upload preset named `vivabloom_gallery`
   - Settings: unsigned, allowed formats: jpg, png, webp, avif
   - Max file size: 10MB
3. Add your cloud name to env vars above

### D-6e — Resend domain setup

1. Add `vivabloomdecor.com.au` as a sending domain in Resend dashboard
2. Add the DNS records they specify (SPF, DKIM)
3. Verify domain
4. Emails now send from `hello@vivabloomdecor.com.au`

### D-6f — Deploy sequence

```bash
# 1. Push to GitHub main
git add -A
git commit -m "feat: Phase D polish, animations, email templates"
git push origin main

# 2. Vercel auto-deploys on push (if connected)
# OR manually:
vercel --prod

# 3. After deploy:
# Run seed against prod DB (once only):
DATABASE_URL="your-prod-url" npx prisma db seed

# 4. Verify:
# - https://vivabloomdecor.com.au loads
# - https://www.vivabloomdecor.com.au redirects to non-www
# - /admin redirects to /login when unauthenticated
# - Login works with seed credentials
# - Submit a test enquiry → check email arrives
```

---

## D-7 — CLEANUP: LEGACY ADMIN ROUTES

Remove or redirect these Phase A stub routes that are not in the sidebar:

```ts
// src/app/admin/shop/page.tsx — replace contents with:
import { redirect } from 'next/navigation'
export default function AdminShop() { redirect('/admin') }

// src/app/admin/events/page.tsx — same:
import { redirect } from 'next/navigation'
export default function AdminEvents() { redirect('/admin') }
```

Also remove:
- `/app/shop/` directory (Phase 2 — will be rebuilt properly when activated)
- `/app/events/` directory (Phase 2)

Keep the Prisma schema models for `Product`, `Event`, `Ticket`, `Order`, `OrderItem` — they're still needed for Phase 2 and removing them would require a migration.

---

## D-8 — FINAL PRE-LAUNCH CHECKLIST

Run everything:

```bash
npx tsc --noEmit      # Zero TS errors
npm run lint           # Zero lint errors
npm run build          # Clean production build
ANALYZE=true npm run build  # Check bundle sizes
```

### Functionality
- [ ] Homepage loads under 2.5s on 4G (check with Vercel Speed Insights)
- [ ] Hero video/image loads without CLS (Cumulative Layout Shift = 0)
- [ ] All nav links work — no 404s
- [ ] Quote form: submit → DB record created → both emails received
- [ ] Newsletter subscribe: upserts DB record
- [ ] Admin login → dashboard with live stats
- [ ] Enquiry CRM: status update + notes save
- [ ] Blog post: create in admin → appears on public blog
- [ ] Gallery: upload via Cloudinary → appears on public gallery
- [ ] Invoice: create → PDF generates → email with PDF sent
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt blocks `/admin`, `/api`

### Visual
- [ ] Hero parallax fires on desktop
- [ ] Service cards hover animation works
- [ ] Testimonials auto-advance
- [ ] Scroll animations fire correctly on each section
- [ ] No animation flicker or white-flash on page load
- [ ] All fonts loaded (no system font fallback visible)
- [ ] Champagne gold colour consistent across all elements
- [ ] Dark sections (#0F0E0C) have no white gaps between them

### SEO
- [ ] `<title>` correct on every page
- [ ] Meta description present on every page
- [ ] OG image set and correct dimensions (1200×630)
- [ ] JSON-LD LocalBusiness schema on homepage
- [ ] Canonical URLs correct (no www)
- [ ] Sitemap submitted to Google Search Console

### Mobile (test at 375px, 390px, 430px)
- [ ] Hero headline readable (no overflow)
- [ ] Mobile menu opens and closes cleanly
- [ ] Service cards: 1-column, appropriate height
- [ ] Quote form: all steps usable with soft keyboard open
- [ ] Admin dashboard: stat cards readable at 375px
- [ ] Footer: all content accessible, no horizontal scroll

### Security
- [ ] `/admin` routes require authentication
- [ ] API routes validate input with Zod
- [ ] No sensitive env vars exposed in client bundle
- [ ] `X-Frame-Options: SAMEORIGIN` header present
- [ ] Passwords stored as bcrypt hashes only

### Accessibility
- [ ] All images have meaningful `alt` text
- [ ] Colour contrast: white on `#0F0E0C` passes WCAG AA
- [ ] Champagne `#C9A96E` on white: check contrast (may need `#B8904E` for body text)
- [ ] All interactive elements focusable via keyboard
- [ ] Mobile menu closeable with Escape key

---

*Phase D complete → site is production-ready. Phase E (eCommerce: shop, ticket sales with QR codes, Stripe) activates when required.*
