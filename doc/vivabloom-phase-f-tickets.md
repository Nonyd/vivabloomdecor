# Vivabloom — Phase F: Event Ticket System
## Create Events · Sell Tickets · Stripe + Afterpay + PayPal · QR Code Check-in

> Phases A–E complete. This phase activates the full ticket system.
> Payment providers: Stripe (cards + Afterpay) + PayPal.
> All ticket system routes are under /events (public) and /admin/events (admin).

---

## F-1 — DEPENDENCIES

```bash
npm install @stripe/stripe-js stripe
npm install @paypal/react-paypal-js @paypal/paypal-js
npm install qrcode @types/qrcode
npm install nodemailer @types/nodemailer
npm install date-fns
npm install @radix-ui/react-select
```

---

## F-2 — ENVIRONMENT VARIABLES

Add to Vercel + `.env.local`:
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
```

Stripe Afterpay is enabled automatically in the Stripe Dashboard under
Payment Methods → Afterpay/Clearpay. No extra key needed.

---

## F-3 — DATABASE SCHEMA

The `Event`, `Ticket`, `Order`, and `OrderItem` models are already in `schema.prisma` from Phase A.
Add these fields to make them fully functional:

```prisma
// Update Event model — add missing fields:
model Event {
  id            String      @id @default(cuid())
  title         String
  slug          String      @unique
  description   String?     @db.Text
  date          DateTime
  endDate       DateTime?
  venue         String
  venueAddress  String?     // full street address
  city          String      @default("Melbourne")
  capacity      Int
  ticketsSold   Int         @default(0)
  ticketPrice   Float
  earlyBirdPrice Float?     // optional early bird price
  earlyBirdEnds  DateTime?  // when early bird expires
  isFree        Boolean     @default(false)
  coverImage    String?
  gallery       String[]    // multiple event images
  tags          String[]
  published     Boolean     @default(false)
  featured      Boolean     @default(false)
  status        EventStatus @default(UPCOMING)
  tickets       Ticket[]
  orderItems    OrderItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum EventStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

// Update Order model — add payment fields:
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique @default(cuid())
  total           Float
  status          OrderStatus @default(PENDING)
  paymentProvider String?     // "stripe" | "paypal"
  stripeSessionId String?
  stripePaymentId String?
  paypalOrderId   String?
  customerName    String
  customerEmail   String
  customerPhone   String?
  userId          String?
  user            User?       @relation(fields: [userId], references: [id])
  items           OrderItem[]
  tickets         Ticket[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// Update Ticket model — add check-in fields:
model Ticket {
  id          String    @id @default(cuid())
  ticketNumber String   @unique // human-readable e.g. "VB-2025-00142"
  qrCode      String    @unique // UUID used in QR code URL
  qrCodeImage String?           // base64 PNG of the QR code
  used        Boolean   @default(false)
  usedAt      DateTime?
  checkedInBy String?           // admin user who scanned
  eventId     String
  event       Event     @relation(fields: [eventId], references: [id])
  orderId     String
  order       Order     @relation(fields: [orderId], references: [id])
  attendeeName  String?
  attendeeEmail String?
  seatNumber    String?
  createdAt   DateTime  @default(now())
}
```

Run: `npx prisma db push`

---

## F-4 — PUBLIC EVENTS PAGES

### Events listing (`src/app/events/page.tsx`)

```tsx
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Users, Tag } from 'lucide-react'
import { format } from 'date-fns'

export const metadata = {
  title: 'Upcoming Events | Vivabloom',
  description: 'Browse and book tickets to upcoming Vivabloom events in Melbourne and Australia.',
}

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where:   { published: true, status: { not: 'CANCELLED' } },
    orderBy: { date: 'asc' },
  })

  const upcoming  = events.filter(e => e.status === 'UPCOMING')
  const completed = events.filter(e => e.status === 'COMPLETED')

  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      {/* Hero banner */}
      <div className="bg-[#0F0E0C] py-28 px-[5%] text-center">
        <p className="eyebrow-light mb-4">Events & Experiences</p>
        <h1 className="font-display italic text-white text-[64px] leading-tight">
          Upcoming Events
        </h1>
        <p className="font-body text-white/60 mt-4 max-w-lg mx-auto">
          Join us for intimate workshops, styled showcase events, and exclusive celebrations.
        </p>
      </div>

      {/* Events grid */}
      <div className="max-w-7xl mx-auto px-[5%] py-20">
        {upcoming.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display italic text-[#0F0E0C] text-3xl">No upcoming events yet</p>
            <p className="font-body text-[#4A4843]/60 mt-3">Check back soon or subscribe to our newsletter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function EventCard({ event }: { event: any }) {
  const spotsLeft  = event.capacity - event.ticketsSold
  const soldOut    = spotsLeft <= 0
  const almostGone = spotsLeft > 0 && spotsLeft <= 10

  return (
    <Link href={`/events/${event.slug}`}
      className="bg-white rounded-2xl overflow-hidden border border-[#EDE8DC]
                 hover:border-[#C9A96E] hover:shadow-lg transition-all duration-300 group">

      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {event.coverImage ? (
          <Image src={event.coverImage} alt={event.title} fill
                 className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-[#EDE8DC] flex items-center justify-center">
            <Calendar size={40} className="text-[#C9A96E]/40" />
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-[#0F0E0C]/80 backdrop-blur-sm
                        text-[#C9A96E] font-body text-[13px] px-3 py-1.5 rounded-full">
          {event.isFree ? 'Free' : `$${event.ticketPrice}`}
        </div>
        {/* Sold out overlay */}
        {soldOut && (
          <div className="absolute inset-0 bg-[#0F0E0C]/60 flex items-center justify-center">
            <span className="bg-white text-[#0F0E0C] font-body text-[12px] uppercase
                             tracking-[0.2em] px-4 py-2 rounded-full">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={13} className="text-[#C9A96E]" />
          <span className="font-body text-[12px] text-[#C9A96E] uppercase tracking-[0.15em]">
            {format(new Date(event.date), 'EEE, d MMM yyyy · h:mm a')}
          </span>
        </div>
        <h2 className="font-display italic text-[#0F0E0C] text-[24px] leading-tight mb-2
                        group-hover:text-[#C9A96E] transition-colors">
          {event.title}
        </h2>
        <div className="flex items-center gap-1.5 mb-4">
          <MapPin size={13} className="text-[#4A4843]/50" />
          <span className="font-body text-[13px] text-[#4A4843]/60">{event.venue}, {event.city}</span>
        </div>
        {event.description && (
          <p className="font-body text-[14px] text-[#4A4843] leading-relaxed line-clamp-2 mb-4">
            {event.description}
          </p>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-[#EDE8DC]">
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-[#4A4843]/50" />
            {almostGone && (
              <span className="font-body text-[12px] text-orange-500">Only {spotsLeft} left!</span>
            )}
            {!almostGone && !soldOut && (
              <span className="font-body text-[12px] text-[#4A4843]/50">{spotsLeft} spots available</span>
            )}
          </div>
          {!soldOut && (
            <span className="font-body text-[11px] uppercase tracking-[0.15em] text-[#C9A96E]">
              Book Now →
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
```

### Event detail page (`src/app/events/[slug]/page.tsx`)

```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, Clock, Tag } from 'lucide-react'
import Image from 'next/image'
import TicketPurchaseFlow from '@/components/events/TicketPurchaseFlow'

export async function generateStaticParams() {
  const events = await prisma.event.findMany({ where: { published: true }, select: { slug: true } })
  return events.map(e => ({ slug: e.slug }))
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await prisma.event.findUnique({ where: { slug: params.slug, published: true } })
  if (!event) notFound()

  const spotsLeft = event.capacity - event.ticketsSold
  const soldOut   = spotsLeft <= 0

  return (
    <main className="min-h-screen bg-[#F8F5EE]">

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[400px] overflow-hidden">
        {event.coverImage ? (
          <Image src={event.coverImage} alt={event.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-[#0F0E0C]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C] via-[#0F0E0C]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-[5%] pb-12">
          <p className="eyebrow-light mb-3">
            {format(new Date(event.date), 'EEEE, d MMMM yyyy')}
          </p>
          <h1 className="font-display italic text-white text-[56px] md:text-[72px] leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Content + Purchase sidebar */}
      <div className="max-w-7xl mx-auto px-[5%] py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

          {/* Left: event details */}
          <div>
            {/* Quick info bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Calendar, label: 'Date',     value: format(new Date(event.date), 'd MMM yyyy') },
                { icon: Clock,    label: 'Time',     value: format(new Date(event.date), 'h:mm a') },
                { icon: MapPin,   label: 'Venue',    value: event.venue },
                { icon: Users,    label: 'Capacity', value: `${event.capacity} guests` },
              ].map(info => (
                <div key={info.label} className="bg-white rounded-xl p-4 border border-[#EDE8DC]">
                  <info.icon size={16} className="text-[#C9A96E] mb-2" />
                  <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#4A4843]/50">{info.label}</p>
                  <p className="font-body text-[14px] text-[#0F0E0C] font-medium mt-0.5">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="prose prose-lg font-body text-[#4A4843]">
              <h2 className="font-display italic text-[#0F0E0C] text-[32px]">About This Event</h2>
              <p className="leading-relaxed">{event.description}</p>
            </div>

            {/* Venue address */}
            {event.venueAddress && (
              <div className="mt-10 bg-white rounded-2xl p-6 border border-[#EDE8DC]">
                <h3 className="font-display italic text-[#0F0E0C] text-[22px] mb-3">Venue</h3>
                <p className="font-body text-[#4A4843]">{event.venue}</p>
                <p className="font-body text-[#4A4843]/60 text-sm">{event.venueAddress}</p>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(event.venueAddress)}`}
                   target="_blank" rel="noopener noreferrer"
                   className="inline-block mt-3 text-[#C9A96E] font-body text-[12px] uppercase
                              tracking-[0.15em] hover:underline">
                  View on Maps →
                </a>
              </div>
            )}
          </div>

          {/* Right: ticket purchase widget */}
          <div className="lg:sticky lg:top-24 self-start">
            <TicketPurchaseFlow event={event} spotsLeft={spotsLeft} soldOut={soldOut} />
          </div>
        </div>
      </div>
    </main>
  )
}
```

---

## F-5 — TICKET PURCHASE FLOW (`src/components/events/TicketPurchaseFlow.tsx`)

**Client component.** Handles quantity selection, attendee details, and payment provider selection.

```tsx
'use client'
import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { loadStripe } from '@stripe/stripe-js'
import { CreditCard, Minus, Plus, User, Mail, Phone } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Step = 'select' | 'details' | 'payment' | 'success'

interface Props {
  event:     any
  spotsLeft: number
  soldOut:   boolean
}

export default function TicketPurchaseFlow({ event, spotsLeft, soldOut }: Props) {
  const [step, setStep]         = useState<Step>('select')
  const [quantity, setQuantity] = useState(1)
  const [details, setDetails]   = useState({ name: '', email: '', phone: '' })
  const [orderId, setOrderId]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const price    = event.earlyBirdPrice && new Date() < new Date(event.earlyBirdEnds)
    ? event.earlyBirdPrice
    : event.ticketPrice
  const subtotal = event.isFree ? 0 : price * quantity
  const maxQty   = Math.min(10, spotsLeft)

  // ── Step 1: Select quantity ──────────────────────────────────────────────
  if (step === 'select') return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] p-6 space-y-6">
      <div>
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] mb-1">
          {event.isFree ? 'Free Event' : 'Ticket Price'}
        </p>
        <p className="font-display italic text-[#0F0E0C] text-[40px] leading-none">
          {event.isFree ? 'Free' : `$${price}`}
          {event.earlyBirdPrice && new Date() < new Date(event.earlyBirdEnds) && (
            <span className="text-[16px] text-[#C9A96E] ml-2">Early Bird</span>
          )}
        </p>
        {spotsLeft <= 10 && spotsLeft > 0 && (
          <p className="font-body text-[12px] text-orange-500 mt-1">Only {spotsLeft} spots left!</p>
        )}
      </div>

      {/* Quantity selector */}
      {!soldOut && !event.isFree && (
        <div>
          <p className="font-body text-[12px] uppercase tracking-[0.15em] text-[#4A4843]/50 mb-3">
            Number of Tickets
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-full border border-[#EDE8DC] flex items-center justify-center
                         hover:border-[#C9A96E] transition-colors disabled:opacity-30">
              <Minus size={14} />
            </button>
            <span className="font-display italic text-[#0F0E0C] text-[28px] w-8 text-center">
              {quantity}
            </span>
            <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              className="w-10 h-10 rounded-full border border-[#EDE8DC] flex items-center justify-center
                         hover:border-[#C9A96E] transition-colors disabled:opacity-30">
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Subtotal */}
      {!event.isFree && (
        <div className="border-t border-[#EDE8DC] pt-4">
          <div className="flex justify-between items-center">
            <span className="font-body text-[13px] text-[#4A4843]/60">Subtotal</span>
            <span className="font-display italic text-[#0F0E0C] text-[22px]">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <p className="font-body text-[11px] text-[#4A4843]/40 mt-1">
            Afterpay available at checkout
          </p>
        </div>
      )}

      {soldOut ? (
        <div className="bg-[#F8F5EE] rounded-xl p-4 text-center">
          <p className="font-body text-[#4A4843] text-sm">This event is sold out.</p>
        </div>
      ) : (
        <button onClick={() => setStep('details')}
          className="w-full bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase
                     tracking-[0.2em] py-4 rounded-xl hover:bg-[#E8D5B0] transition-colors">
          {event.isFree ? 'Register for Free' : 'Continue to Details'}
        </button>
      )}
    </div>
  )

  // ── Step 2: Attendee details ─────────────────────────────────────────────
  if (step === 'details') return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display italic text-[#0F0E0C] text-[22px]">Your Details</h3>
        <button onClick={() => setStep('select')}
          className="font-body text-[12px] text-[#4A4843]/50 hover:text-[#C9A96E]">← Back</button>
      </div>

      {[
        { key: 'name',  label: 'Full Name',     icon: User,  type: 'text',  required: true },
        { key: 'email', label: 'Email Address', icon: Mail,  type: 'email', required: true },
        { key: 'phone', label: 'Phone (optional)', icon: Phone, type: 'tel', required: false },
      ].map(field => (
        <div key={field.key}>
          <label className="flex items-center gap-1.5 font-body text-[11px] uppercase
                            tracking-[0.15em] text-[#4A4843]/60 mb-1.5">
            <field.icon size={12} />
            {field.label}
          </label>
          <input
            type={field.type}
            required={field.required}
            value={(details as any)[field.key]}
            onChange={e => setDetails(d => ({ ...d, [field.key]: e.target.value }))}
            className="w-full border border-[#EDE8DC] rounded-lg px-4 py-3 font-body text-[14px]
                       text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E] transition-colors"
          />
        </div>
      ))}

      <button
        onClick={() => {
          if (!details.name || !details.email) return
          setStep('payment')
        }}
        className="w-full bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase
                   tracking-[0.2em] py-4 rounded-xl hover:bg-[#E8D5B0] transition-colors">
        Continue to Payment
      </button>
    </div>
  )

  // ── Step 3: Payment ──────────────────────────────────────────────────────
  if (step === 'payment') return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display italic text-[#0F0E0C] text-[22px]">Payment</h3>
        <button onClick={() => setStep('details')}
          className="font-body text-[12px] text-[#4A4843]/50 hover:text-[#C9A96E]">← Back</button>
      </div>

      {/* Order summary */}
      <div className="bg-[#F8F5EE] rounded-xl p-4">
        <div className="flex justify-between font-body text-[14px] text-[#4A4843]">
          <span>{quantity}× {event.title}</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <p className="font-body text-[11px] text-[#4A4843]/50 mt-1">{details.name} · {details.email}</p>
      </div>

      {/* ── Stripe: Card + Afterpay ── */}
      <div className="space-y-3">
        <p className="font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/50">
          Pay by Card or Afterpay
        </p>
        <button
          onClick={async () => {
            setLoading(true)
            const res = await fetch('/api/tickets/checkout/stripe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventId:  event.id,
                quantity,
                name:     details.name,
                email:    details.email,
                phone:    details.phone,
              }),
            })
            const { url } = await res.json()
            if (url) window.location.href = url
            setLoading(false)
          }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border-2 border-[#0F0E0C]
                     text-[#0F0E0C] font-body text-[13px] uppercase tracking-[0.15em] py-3.5
                     rounded-xl hover:bg-[#0F0E0C] hover:text-white transition-all disabled:opacity-50">
          <CreditCard size={16} />
          {loading ? 'Redirecting…' : 'Pay with Card / Afterpay'}
        </button>
      </div>

      {/* ── PayPal ── */}
      {!event.isFree && (
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843]/50 mb-3">
            Or pay with PayPal
          </p>
          <PayPalScriptProvider options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
            currency: 'AUD',
          }}>
            <PayPalButtons
              style={{ layout: 'vertical', color: 'gold', shape: 'rect', height: 48 }}
              createOrder={async () => {
                const res = await fetch('/api/tickets/checkout/paypal/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ eventId: event.id, quantity, name: details.name, email: details.email }),
                })
                const { orderId } = await res.json()
                return orderId
              }}
              onApprove={async (data) => {
                const res = await fetch('/api/tickets/checkout/paypal/capture', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paypalOrderId: data.orderID, eventId: event.id,
                                        quantity, name: details.name, email: details.email }),
                })
                const { success, orderId } = await res.json()
                if (success) {
                  setOrderId(orderId)
                  setStep('success')
                }
              }}
            />
          </PayPalScriptProvider>
        </div>
      )}

      {/* Free event registration */}
      {event.isFree && (
        <button
          onClick={async () => {
            setLoading(true)
            const res = await fetch('/api/tickets/checkout/free', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eventId: event.id, quantity, name: details.name, email: details.email }),
            })
            const { success, orderId: oid } = await res.json()
            if (success) { setOrderId(oid); setStep('success') }
            setLoading(false)
          }}
          disabled={loading}
          className="w-full bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase
                     tracking-[0.2em] py-4 rounded-xl hover:bg-[#E8D5B0] transition-colors">
          {loading ? 'Registering…' : 'Complete Registration'}
        </button>
      )}
    </div>
  )

  // ── Step 4: Success ──────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DC] p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center
                      justify-center mx-auto text-green-600 text-2xl">✓</div>
      <h3 className="font-display italic text-[#0F0E0C] text-[28px]">You're registered!</h3>
      <p className="font-body text-[#4A4843]/70 text-sm leading-relaxed">
        Your ticket{quantity > 1 ? 's have' : ' has'} been sent to <strong>{details.email}</strong>.
        Check your inbox — each ticket has a QR code for entry.
      </p>
      <div className="h-px bg-[#EDE8DC]" />
      <p className="font-body text-[11px] text-[#4A4843]/40 uppercase tracking-[0.15em]">
        Order #{orderId?.slice(-8).toUpperCase()}
      </p>
    </div>
  )
}
```

---

## F-6 — STRIPE CHECKOUT API (`src/app/api/tickets/checkout/stripe/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

export async function POST(req: NextRequest) {
  const { eventId, quantity, name, email, phone } = await req.json()

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event || !event.published) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const spotsLeft = event.capacity - event.ticketsSold
  if (quantity > spotsLeft) {
    return NextResponse.json({ error: 'Not enough tickets available' }, { status: 400 })
  }

  const price = event.earlyBirdPrice && event.earlyBirdEnds && new Date() < event.earlyBirdEnds
    ? event.earlyBirdPrice
    : event.ticketPrice

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'afterpay_clearpay'],
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price_data: {
        currency:     'aud',
        unit_amount:  Math.round(price * 100),
        product_data: {
          name:        `${event.title} — Ticket`,
          description: `${quantity} ticket${quantity > 1 ? 's' : ''} · ${new Date(event.date).toLocaleDateString('en-AU')}`,
          images:      event.coverImage ? [event.coverImage] : [],
        },
      },
      quantity,
    }],
    metadata: { eventId, quantity: String(quantity), name, email, phone: phone ?? '' },
    success_url: `${process.env.NEXTAUTH_URL}/events/${event.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.NEXTAUTH_URL}/events/${event.slug}`,
    billing_address_collection: 'auto',
    phone_number_collection:    { enabled: true },
  })

  return NextResponse.json({ url: session.url })
}
```

### Stripe Webhook (`src/app/api/tickets/webhook/stripe/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { generateTickets } from '@/lib/tickets'
import { sendTicketEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

export const runtime = 'nodejs' // required for raw body

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object as Stripe.CheckoutSession
    const metadata = session.metadata!

    await fulfillOrder({
      eventId:        metadata.eventId,
      quantity:       parseInt(metadata.quantity),
      customerName:   metadata.name,
      customerEmail:  metadata.email,
      customerPhone:  metadata.phone,
      paymentProvider: 'stripe',
      stripeSessionId: session.id,
      stripePaymentId: session.payment_intent as string,
      total:          (session.amount_total ?? 0) / 100,
    })
  }

  return NextResponse.json({ received: true })
}
```

---

## F-7 — PAYPAL API ROUTES

### Create PayPal order (`src/app/api/tickets/checkout/paypal/create/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getPayPalToken() {
  const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

export async function POST(req: NextRequest) {
  const { eventId, quantity, name, email } = await req.json()
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const price    = event.ticketPrice
  const total    = (price * quantity).toFixed(2)
  const token    = await getPayPalToken()

  const res = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'AUD', value: total },
        description: `${quantity}× ticket(s) to ${event.title}`,
        custom_id: JSON.stringify({ eventId, quantity, name, email }),
      }],
    }),
  })
  const order = await res.json()
  return NextResponse.json({ orderId: order.id })
}
```

### Capture PayPal order (`src/app/api/tickets/checkout/paypal/capture/route.ts`)

```ts
export async function POST(req: NextRequest) {
  const { paypalOrderId, eventId, quantity, name, email } = await req.json()
  const token = await getPayPalToken()

  const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  const capture = await res.json()

  if (capture.status === 'COMPLETED') {
    const paidAmount = parseFloat(capture.purchase_units[0].payments.captures[0].amount.value)
    const order = await fulfillOrder({
      eventId, quantity, customerName: name, customerEmail: email,
      paymentProvider: 'paypal', paypalOrderId,
      total: paidAmount,
    })
    return NextResponse.json({ success: true, orderId: order.id })
  }

  return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
}
```

---

## F-8 — TICKET GENERATION (`src/lib/tickets.ts`)

```ts
import { prisma } from './prisma'
import QRCode from 'qrcode'
import { v4 as uuid } from 'uuid'
import { sendTicketEmail } from './email'

export async function fulfillOrder(params: {
  eventId:         string
  quantity:        number
  customerName:    string
  customerEmail:   string
  customerPhone?:  string
  paymentProvider: string
  stripeSessionId?:string
  stripePaymentId?:string
  paypalOrderId?:  string
  total:           number
}) {
  const event = await prisma.event.findUnique({ where: { id: params.eventId } })
  if (!event) throw new Error('Event not found')

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber:     `VB-${Date.now()}`,
      total:           params.total,
      status:          'PAID',
      paymentProvider: params.paymentProvider,
      stripeSessionId: params.stripeSessionId,
      stripePaymentId: params.stripePaymentId,
      paypalOrderId:   params.paypalOrderId,
      customerName:    params.customerName,
      customerEmail:   params.customerEmail,
      customerPhone:   params.customerPhone,
      items: {
        create: {
          quantity: params.quantity,
          price:    params.total / params.quantity,
          eventId:  params.eventId,
        },
      },
    },
  })

  // Generate tickets
  const tickets: any[] = []
  for (let i = 0; i < params.quantity; i++) {
    const qrCode      = uuid()
    const ticketNumber = `VB-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}-${String(i + 1).padStart(2, '0')}`

    // Generate QR code image (base64 PNG)
    // QR code encodes the check-in URL so scanner goes straight to verification
    const checkInUrl  = `${process.env.NEXTAUTH_URL}/admin/events/checkin/${qrCode}`
    const qrCodeImage = await QRCode.toDataURL(checkInUrl, {
      width:           400,
      margin:          2,
      color:           { dark: '#0F0E0C', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    })

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        qrCode,
        qrCodeImage,
        eventId:       params.eventId,
        orderId:       order.id,
        attendeeName:  params.customerName,
        attendeeEmail: params.customerEmail,
      },
    })
    tickets.push(ticket)
  }

  // Update ticket count on event
  await prisma.event.update({
    where: { id: params.eventId },
    data:  { ticketsSold: { increment: params.quantity } },
  })

  // Send ticket email (fire and forget)
  sendTicketEmail({
    to:        params.customerEmail,
    name:      params.customerName,
    event,
    tickets,
    order,
  }).catch(console.error)

  return order
}
```

---

## F-9 — TICKET EMAIL (`src/lib/emails/ticket-email.tsx`)

```tsx
import { Html, Head, Preview, Body, Container, Section, Text, Hr, Img } from '@react-email/components'
import { BaseLayout } from './base-layout'

interface Props {
  name:    string
  event:   any
  tickets: any[]
  order:   any
}

export function TicketEmail({ name, event, tickets, order }: Props) {
  return (
    <BaseLayout preview={`Your ticket${tickets.length > 1 ? 's' : ''} for ${event.title} — Vivabloom`}>

      <Text style={s.eyebrow}>Your Ticket{tickets.length > 1 ? 's' : ''}</Text>
      <Text style={s.heading}>You're in, {name}!</Text>
      <Text style={s.body}>
        Here {tickets.length > 1 ? 'are your tickets' : 'is your ticket'} for{' '}
        <strong>{event.title}</strong>. Present the QR code at the door for entry.
      </Text>

      {/* Event details */}
      <Section style={s.eventBox}>
        <Text style={s.eventTitle}>{event.title}</Text>
        <Text style={s.eventDetail}>📅 {new Date(event.date).toLocaleDateString('en-AU', { dateStyle: 'full' })}</Text>
        <Text style={s.eventDetail}>🕐 {new Date(event.date).toLocaleTimeString('en-AU', { timeStyle: 'short' })}</Text>
        <Text style={s.eventDetail}>📍 {event.venue}{event.venueAddress ? `, ${event.venueAddress}` : ''}</Text>
      </Section>

      {/* Individual tickets with QR codes */}
      {tickets.map((ticket, i) => (
        <Section key={ticket.id} style={s.ticketBox}>
          <Text style={s.ticketLabel}>Ticket {i + 1} of {tickets.length}</Text>
          <Text style={s.ticketNumber}>{ticket.ticketNumber}</Text>
          {ticket.qrCodeImage && (
            <Img src={ticket.qrCodeImage} alt="QR Code" width="180" height="180"
                 style={{ margin: '16px auto', display: 'block' }} />
          )}
          <Text style={s.ticketHint}>Show this QR code at the entrance</Text>
        </Section>
      ))}

      <Text style={s.orderRef}>Order reference: {order.orderNumber}</Text>

    </BaseLayout>
  )
}

const s = {
  eyebrow:     { fontFamily: 'Arial', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' as const, color: '#C9A96E', margin: '0 0 16px' },
  heading:     { fontFamily: 'Georgia', fontSize: '36px', fontStyle: 'italic', color: '#0F0E0C', margin: '0 0 16px' },
  body:        { fontFamily: 'Arial', fontSize: '15px', lineHeight: '1.7', color: '#4A4843', margin: '0 0 24px' },
  eventBox:    { backgroundColor: '#F8F5EE', borderLeft: '3px solid #C9A96E', padding: '20px 24px', marginBottom: '24px' },
  eventTitle:  { fontFamily: 'Georgia', fontSize: '22px', fontStyle: 'italic', color: '#0F0E0C', margin: '0 0 12px' },
  eventDetail: { fontFamily: 'Arial', fontSize: '14px', color: '#4A4843', margin: '4px 0' },
  ticketBox:   { backgroundColor: '#0F0E0C', borderRadius: '12px', padding: '24px', marginBottom: '16px', textAlign: 'center' as const },
  ticketLabel: { fontFamily: 'Arial', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' },
  ticketNumber:{ fontFamily: 'Georgia', fontSize: '20px', fontStyle: 'italic', color: '#C9A96E', margin: '0 0 16px' },
  ticketHint:  { fontFamily: 'Arial', fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '12px 0 0' },
  orderRef:    { fontFamily: 'Arial', fontSize: '11px', color: '#9B9589', textAlign: 'center' as const, marginTop: '24px' },
}
```

---

## F-10 — QR CODE CHECK-IN (Admin)

### Check-in page (`src/app/admin/events/checkin/[qrCode]/page.tsx`)

This page is opened when a staff member scans a QR code with their phone:

```tsx
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import CheckInAction from '@/components/admin/CheckInAction'

export default async function CheckInPage({ params }: { params: { qrCode: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const ticket = await prisma.ticket.findUnique({
    where:   { qrCode: params.qrCode },
    include: { event: true, order: true },
  })

  if (!ticket) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-lg">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="font-display italic text-red-600 text-2xl">Invalid Ticket</h1>
          <p className="font-body text-[#4A4843] mt-2 text-sm">This QR code is not valid.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      ticket.used ? 'bg-orange-50' : 'bg-green-50'
    }`}>
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-lg">
        {ticket.used ? (
          <>
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="font-display italic text-orange-600 text-2xl mb-2">Already Used</h1>
            <p className="font-body text-[#4A4843] text-sm">
              This ticket was checked in at{' '}
              {ticket.usedAt ? format(ticket.usedAt, 'h:mm a, d MMM yyyy') : 'an earlier time'}.
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="font-display italic text-green-600 text-[28px] mb-2">Valid Ticket</h1>
          </>
        )}

        {/* Ticket details */}
        <div className="bg-[#F8F5EE] rounded-xl p-4 mt-4 text-left space-y-2">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#C9A96E]">Event</p>
            <p className="font-body text-[14px] text-[#0F0E0C]">{ticket.event.title}</p>
          </div>
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#C9A96E]">Attendee</p>
            <p className="font-body text-[14px] text-[#0F0E0C]">{ticket.attendeeName}</p>
            <p className="font-body text-[12px] text-[#4A4843]/60">{ticket.attendeeEmail}</p>
          </div>
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#C9A96E]">Ticket #</p>
            <p className="font-body text-[13px] text-[#0F0E0C]">{ticket.ticketNumber}</p>
          </div>
        </div>

        {/* Check-in button — only shows if not yet used */}
        {!ticket.used && (
          <CheckInAction ticketId={ticket.id} checkedInBy={session.user.email ?? 'staff'} />
        )}
      </div>
    </div>
  )
}
```

### `CheckInAction` client component (`src/components/admin/CheckInAction.tsx`)

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckInAction({ ticketId, checkedInBy }: { ticketId: string; checkedInBy: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function checkIn() {
    setLoading(true)
    await fetch('/api/tickets/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, checkedInBy }),
    })
    router.refresh()
  }

  return (
    <button onClick={checkIn} disabled={loading}
      className="w-full mt-6 bg-green-600 text-white font-body text-[13px] uppercase
                 tracking-[0.15em] py-4 rounded-xl hover:bg-green-700 transition-colors
                 disabled:opacity-50 text-lg">
      {loading ? 'Checking in…' : '✓ Check In Attendee'}
    </button>
  )
}
```

### Check-in API (`src/app/api/tickets/checkin/route.ts`)

```ts
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ticketId, checkedInBy } = await req.json()

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data:  { used: true, usedAt: new Date(), checkedInBy },
  })

  return NextResponse.json({ success: true })
}
```

---

## F-11 — ADMIN EVENTS MANAGEMENT

### Events list (`src/app/admin/events/page.tsx`)

Add `Events` to the admin sidebar under the existing nav.

Table: `Title | Date | Venue | Tickets Sold | Status | Published | Actions`

```tsx
const events = await prisma.event.findMany({
  orderBy: { date: 'desc' },
  include: { _count: { select: { tickets: true } } },
})
```

Each row:
- Tickets progress bar: `ticketsSold / capacity`
- Toggle published inline
- `Manage` → `/admin/events/[id]`
- `+ New Event` button

### New/Edit event form (`src/app/admin/events/new/page.tsx` + `[id]/page.tsx`)

Fields:
```
Title               [text input]
Slug                [auto-generated, editable]
Date & Time         [date + time picker]
End Date/Time       [optional]
Venue Name          [text]
Venue Address       [text]
City                [text, default "Melbourne"]
Capacity            [number]
Ticket Price        [number, AUD]
Early Bird Price    [optional number]
Early Bird Ends     [optional date]
Is Free Event       [toggle — hides price fields]
Cover Image         [Cloudinary upload]
Description         [Tiptap editor]
Tags                [comma-separated]
Published           [toggle]
Featured            [toggle]
```

On save: POST/PATCH `/api/events`

### Event detail/manage page (`src/app/admin/events/[id]/page.tsx`)

Shows:
- Event summary + edit link
- **Tickets tab:** table of all tickets with attendee name, email, ticket number, check-in status
- **Check-in tab:** QR scanner instructions + manual search by ticket number
- **Revenue tab:** total collected, payment provider breakdown

---

## F-12 — FREE TICKET API (`src/app/api/tickets/checkout/free/route.ts`)

```ts
export async function POST(req: NextRequest) {
  const { eventId, quantity, name, email } = await req.json()
  const event = await prisma.event.findUnique({ where: { id: eventId } })

  if (!event?.isFree) return NextResponse.json({ error: 'Not a free event' }, { status: 400 })

  const order = await fulfillOrder({
    eventId, quantity,
    customerName:    name,
    customerEmail:   email,
    paymentProvider: 'free',
    total:           0,
  })

  return NextResponse.json({ success: true, orderId: order.id })
}
```

---

## F-13 — STRIPE WEBHOOK REGISTRATION

In Vercel, add environment variable:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

In Stripe Dashboard → Developers → Webhooks → Add endpoint:
```
URL:    https://vivabloomdecor.com.au/api/tickets/webhook/stripe
Events: checkout.session.completed
```

Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

---

## F-14 — SUCCESS PAGE (`src/app/events/[slug]/success/page.tsx`)

```tsx
export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { session_id?: string }
}) {
  const event = await prisma.event.findUnique({ where: { slug: params.slug } })

  return (
    <main className="min-h-screen bg-[#0F0E0C] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-full border border-[#C9A96E]/30 flex items-center
                        justify-center mx-auto mb-8 text-[#C9A96E] text-3xl">✓</div>
        <p className="eyebrow-light mb-4">Booking Confirmed</p>
        <h1 className="font-display italic text-white text-[56px] leading-tight mb-4">
          See you there!
        </h1>
        <p className="font-body text-white/60 leading-relaxed mb-10">
          Your tickets for <strong className="text-white">{event?.title}</strong> are on their way.
          Check your inbox — each ticket includes a QR code for entry.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/events" className="champagne-outline-btn">Browse More Events</Link>
          <Link href="/" className="font-body text-[11px] uppercase tracking-[0.2em] text-white/40
                                    hover:text-white py-3 transition-colors">Back to Home</Link>
        </div>
      </div>
    </main>
  )
}
```

---

## F-15 — CHECKLIST

- [ ] `npx prisma db push` — Event/Ticket/Order schema updated
- [ ] Events listing page `/events` — renders correctly with empty state
- [ ] Create a test event in admin → published → appears on `/events`
- [ ] Event detail page shows correctly
- [ ] Stripe checkout: click "Pay with Card" → redirects to Stripe hosted page
- [ ] Afterpay: appears as payment option on Stripe checkout (enable in Stripe Dashboard)
- [ ] PayPal buttons render in payment step
- [ ] After successful Stripe payment → webhook fires → tickets created in DB → email received
- [ ] After successful PayPal payment → tickets created → email received
- [ ] Free event: register → tickets created → email received
- [ ] Ticket email: QR code image renders correctly in Gmail + Apple Mail
- [ ] QR code URL opens check-in page at `/admin/events/checkin/[qrCode]`
- [ ] Check-in page: valid ticket shows green ✅
- [ ] Check-in page: already-used ticket shows orange ⚠️
- [ ] Check-in page: invalid QR shows red ❌
- [ ] "Check In Attendee" button marks ticket as used + timestamp
- [ ] Admin events list shows ticket sold count + capacity bar
- [ ] `npm run build` passes clean
