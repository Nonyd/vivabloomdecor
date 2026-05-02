# Vivabloom Decor — Luxury Redesign: Full Cursor AI Prompt
**Project:** vivabloomdecor.com.au complete rebuild  
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma ORM · PostgreSQL · NextAuth.js  
**Deploy:** Vercel (Phase 1) → Webuzo VPS (Phase 2)  
**Scope:** Public website + Admin dashboard + eCommerce scaffolding (Phase 2)

---

## PART 1 — PROJECT SETUP & ARCHITECTURE

### 1.1 Initialise the project

```bash
npx create-next-app@latest vivabloom --typescript --tailwind --app --src-dir --import-alias "@/*"
cd vivabloom
npm install prisma @prisma/client next-auth @auth/prisma-adapter
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs
npm install framer-motion gsap @gsap/react
npm install react-hook-form @hookform/resolvers zod
npm install resend nodemailer @types/nodemailer
npm install cloudinary next-cloudinary
npm install sharp @vercel/analytics
npm install lucide-react clsx tailwind-merge
npx prisma init
```

### 1.2 Folder structure

```
src/
  app/
    (public)/               ← public routes
      page.tsx              ← home
      services/page.tsx
      gallery/page.tsx
      portfolio/page.tsx
      blog/
        page.tsx
        [slug]/page.tsx
      about/page.tsx
      contact/page.tsx
      quote/page.tsx
    (auth)/
      login/page.tsx
    admin/                  ← protected admin routes
      layout.tsx
      page.tsx              ← dashboard home
      content/page.tsx
      enquiries/page.tsx
      bookings/page.tsx
      clients/page.tsx
      invoices/page.tsx
      reviews/page.tsx
      media/page.tsx
      settings/page.tsx
    client/                 ← client portal
      layout.tsx
      page.tsx
    api/
      auth/[...nextauth]/route.ts
      enquiries/route.ts
      bookings/route.ts
      gallery/route.ts
      blog/route.ts
      newsletter/route.ts
      quote/route.ts
      upload/route.ts
  components/
    public/                 ← public-facing components
    admin/                  ← admin UI components
    shared/                 ← shared across both
    ui/                     ← base design system
  lib/
    auth.ts
    prisma.ts
    cloudinary.ts
    email.ts
    utils.ts
  types/
    index.ts
```

---

## PART 2 — DATABASE SCHEMA (Prisma)

Create `prisma/schema.prisma` with the full schema below:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(CLIENT)
  password      String?
  accounts      Account[]
  sessions      Session[]
  enquiries     Enquiry[]
  bookings      Booking[]
  invoices      Invoice[]
  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  SUPER_ADMIN
  ADMIN
  STAFF
  CLIENT
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Enquiry {
  id          String        @id @default(cuid())
  name        String
  email       String
  phone       String?
  eventType   String
  eventDate   DateTime?
  guestCount  Int?
  budget      String?
  message     String        @db.Text
  status      EnquiryStatus @default(NEW)
  notes       String?       @db.Text
  userId      String?
  user        User?         @relation(fields: [userId], references: [id])
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum EnquiryStatus {
  NEW
  IN_REVIEW
  QUOTED
  BOOKED
  CLOSED
  SPAM
}

model Booking {
  id          String        @id @default(cuid())
  title       String
  eventDate   DateTime
  eventType   String
  venue       String?
  status      BookingStatus @default(PENDING)
  notes       String?       @db.Text
  userId      String?
  user        User?         @relation(fields: [userId], references: [id])
  invoices    Invoice[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum BookingStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model Invoice {
  id          String        @id @default(cuid())
  number      String        @unique
  amount      Float
  status      InvoiceStatus @default(DRAFT)
  dueDate     DateTime?
  paidAt      DateTime?
  lineItems   Json
  userId      String?
  user        User?         @relation(fields: [userId], references: [id])
  bookingId   String?
  booking     Booking?      @relation(fields: [bookingId], references: [id])
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

model GalleryItem {
  id          String   @id @default(cuid())
  title       String
  category    String
  imageUrl    String
  cloudinaryId String?
  featured    Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model BlogPost {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String?  @db.Text
  content     String   @db.Text
  coverImage  String?
  published   Boolean  @default(false)
  featured    Boolean  @default(false)
  tags        String[]
  metaTitle   String?
  metaDesc    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Testimonial {
  id          String   @id @default(cuid())
  name        String
  role        String?
  content     String   @db.Text
  rating      Int      @default(5)
  imageUrl    String?
  videoUrl    String?
  approved    Boolean  @default(false)
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model NewsletterSubscriber {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model SiteSettings {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String   @db.Text
  updatedAt   DateTime @updatedAt
}

// ── Phase 2: eCommerce ──────────────────────────────────────────────────────

model Product {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  description String?     @db.Text
  price       Float
  images      String[]
  category    String
  inStock     Boolean     @default(true)
  featured    Boolean     @default(false)
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Event {
  id          String      @id @default(cuid())
  title       String
  slug        String      @unique
  description String?     @db.Text
  date        DateTime
  venue       String
  capacity    Int
  ticketPrice Float
  coverImage  String?
  published   Boolean     @default(false)
  tickets     Ticket[]
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Ticket {
  id          String   @id @default(cuid())
  qrCode      String   @unique
  used        Boolean  @default(false)
  usedAt      DateTime?
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id])
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  createdAt   DateTime @default(now())
}

model Order {
  id          String      @id @default(cuid())
  total       Float
  status      OrderStatus @default(PENDING)
  stripeId    String?
  userId      String?
  user        User?       @relation(fields: [userId], references: [id])
  items       OrderItem[]
  tickets     Ticket[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum OrderStatus {
  PENDING
  PAID
  FULFILLED
  CANCELLED
  REFUNDED
}

model OrderItem {
  id        String   @id @default(cuid())
  quantity  Int
  price     Float
  productId String?
  product   Product? @relation(fields: [productId], references: [id])
  eventId   String?
  event     Event?   @relation(fields: [eventId], references: [id])
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
}
```

---

## PART 3 — DESIGN SYSTEM & GLOBAL STYLES

### 3.1 Design language

**Aesthetic:** Editorial luxury. Think *Vogue Arabia meets Australian Editorial* — warm ivory, deep onyx, champagne gold accents. Every section commands attention. Zero clutter.

**Color palette — CSS variables in `globals.css`:**
```css
:root {
  --ivory:       #F8F5EE;
  --ivory-dark:  #EDE8DC;
  --onyx:        #0F0E0C;
  --onyx-mid:    #1C1B18;
  --onyx-soft:   #2C2B26;
  --champagne:   #C9A96E;
  --champagne-lt:#E8D5B0;
  --sage:        #7A8C76;
  --blush:       #E8C5B8;
  --charcoal:    #4A4843;
  --white:       #FFFFFF;

  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-accent:  'Italiana', Georgia, serif;

  --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Typography rules:**
- All display headings: `font-family: var(--font-display)` — italic where appropriate
- Section labels / eyebrow text: uppercase, letter-spacing 0.3em, 10–11px, champagne color
- Body: `font-family: var(--font-body)`, 16px, charcoal
- Never use bold body text except for CTAs

**Google Fonts import** in `app/layout.tsx`:
```
Cormorant Garamond: 300, 400, 500, 600italic
DM Sans: 300, 400, 500
Italiana: 400
```

### 3.2 Tailwind config additions

Extend `tailwind.config.ts` with the full color palette above and add custom animation:
```js
extend: {
  colors: { ivory: '#F8F5EE', onyx: '#0F0E0C', champagne: '#C9A96E', sage: '#7A8C76', blush: '#E8C5B8', charcoal: '#4A4843' },
  fontFamily: { display: ['Cormorant Garamond', 'Georgia', 'serif'], body: ['DM Sans', 'system-ui', 'sans-serif'], accent: ['Italiana', 'Georgia', 'serif'] },
  animation: {
    'fade-up': 'fadeUp 0.8s ease forwards',
    'fade-in': 'fadeIn 0.6s ease forwards',
    'scale-in': 'scaleIn 0.5s ease forwards',
  },
  keyframes: {
    fadeUp: { from: { opacity: '0', transform: 'translateY(32px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
    fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
    scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
  }
}
```

---

## PART 4 — PUBLIC WEBSITE: COMPONENT-BY-COMPONENT

### 4.1 Root layout (`app/layout.tsx`)

Build with:
- Google Fonts loaded via `next/font/google`
- `<Navbar />` component
- `<Footer />` component
- `@vercel/analytics` wrapped
- `metadata` export with full Open Graph defaults for Vivabloom

### 4.2 Navbar (`components/public/Navbar.tsx`)

**Exact behaviour:**
- Default: fully transparent, white text, sits over hero
- On scroll past 80px: transitions to `background: rgba(15,14,12,0.92)` with backdrop blur
- Logo: Vivabloom wordmark in Cormorant Garamond, champagne color
- Nav links: `About · Services · Gallery · Portfolio · Blog · Contact` — DM Sans 13px, uppercase, letter-spacing 0.15em
- CTA button: `Request a Quote` — outlined champagne, pill shape, hover fills champagne bg
- Mobile: hamburger → full-screen overlay menu with staggered link animation

### 4.3 Hero section (`components/public/HeroSection.tsx`)

**Exact spec:**
- Full-viewport height (`100vh`)
- Background: full-bleed autoplay looping video (MP4) OR high-res image with subtle parallax scroll effect using GSAP ScrollTrigger
- Dark overlay: `linear-gradient(to bottom, rgba(15,14,12,0.35) 0%, rgba(15,14,12,0.6) 100%)`
- Center-aligned content stack:
  - Eyebrow: `AUSTRALIA'S PREMIER EVENT DÉCOR STUDIO` — champagne, uppercase, letter-spacing 0.3em, 11px, DM Sans
  - Headline: `Crafting Moments` (line break) `of Exquisite Beauty` — Cormorant Garamond, 96px desktop / 56px mobile, italic, white, line-height 0.95
  - Subheadline: 18px, ivory, DM Sans 300, max-width 520px, centered
  - Two CTAs side by side: `Explore Our Work` (champagne filled) + `Request a Quote` (ghost white)
- Bottom: scroll indicator — thin vertical line animating downward, 48px tall, champagne color

### 4.4 Brand statement section

Full-width section, ivory background:
- Left: large italic quote in Cormorant Garamond — `"Every event is a story. We make it unforgettable."` — 52px, onyx
- Right: small stat grid in 2×2 — `10+ Years · 500+ Events · 3 Cities · 5-Star Rated`
- Subtle horizontal divider line, champagne color, animated width on scroll entry

### 4.5 Services section (`components/public/ServicesSection.tsx`)

**Layout:** Full-width, dark background (`#0F0E0C`)

Services grid — 3 columns, 2 rows (6 services):
1. Floral Design
2. Balloon Artistry
3. Wedding Styling
4. Corporate Events
5. Backdrop & Draping
6. Full Event Production

Each card:
- 500px tall on desktop
- Background: full-bleed image with dark gradient overlay
- On hover: image scales to 1.08, overlay darkens, service name shifts up, description fades in
- Bottom: service name in Cormorant Garamond italic + `Explore →` link in champagne

### 4.6 Gallery section (`components/public/GallerySection.tsx`)

- Fetch `GalleryItem[]` from `/api/gallery` (server component)
- Masonry grid layout using CSS columns (3 on desktop, 2 on tablet, 1 on mobile)
- Category filter tabs above grid: `All · Weddings · Corporate · Birthdays · Florals`
- Each image: hover reveals title overlay with smooth fade
- Lightbox on click using `@radix-ui/react-dialog` — full screen, keyboard navigable, swipeable

### 4.7 Testimonials section (`components/public/TestimonialsSection.tsx`)

- Fetch approved testimonials from Prisma
- Large format cards: one testimonial visible at a time, fullscreen-width
- Background: ivory
- Quote in Cormorant Garamond italic, 42px
- Client name + event type below in DM Sans
- Stars rendered as SVG
- Auto-advance every 6s with smooth fade transition
- Progress dots below

### 4.8 About/Meet Vivian section

- Split layout: left 55% = editorial text, right 45% = Vivian's image with offset frame (champagne border)
- Pull-quote highlight: one standout sentence in large Cormorant italic
- Stats row: `Years in Industry · Events Completed · Cities Served`
- CTA: `Meet the Full Team →`

### 4.9 Quote Request form (`app/(public)/quote/page.tsx`)

Multi-step form (3 steps):
1. **Event basics:** Type (select), Date (date picker), Guest count, Venue
2. **Contact details:** Full name, Email, Phone, Budget range
3. **Vision:** Message textarea, How did you hear about us?, Submit

Form validation with Zod + react-hook-form. On submit:
- POST to `/api/enquiries`
- Creates `Enquiry` in DB
- Sends confirmation email via Resend to client + notification email to admin
- Shows beautiful success state with animation

### 4.10 Blog listing + post pages

`app/(public)/blog/page.tsx`:
- Fetch published BlogPosts from DB
- Editorial card layout: full-width cover image, category pill, title, excerpt, date
- Featured post: hero format at top (full bleed)

`app/(public)/blog/[slug]/page.tsx`:
- `generateStaticParams` for ISR
- Article layout: narrow column (680px), large cover image, Cormorant headings, DM Sans body
- Reading time estimate
- Share buttons (copy link, socials)
- Related posts at bottom

### 4.11 Footer (`components/public/Footer.tsx`)

- Dark background (`#0F0E0C`)
- 4 columns: Brand + tagline | Explore links | Services links | Get in Touch
- Newsletter signup inline: email input + `Subscribe` button, POST to `/api/newsletter`
- Social icons: Instagram, Facebook, TikTok, Pinterest
- Bottom: copyright line + ABN + privacy policy link
- Thin champagne top border

---

## PART 5 — ADMIN DASHBOARD

### 5.1 Auth setup (`lib/auth.ts`)

Configure NextAuth with:
- `PrismaAdapter`
- `CredentialsProvider` (email + password with bcrypt)
- `GoogleProvider` (optional for team login)
- Session strategy: `jwt`
- Callbacks: include `role` in JWT and session

Protect all `/admin/*` routes via middleware (`middleware.ts`) — redirect to `/login` if no session or role not in `[ADMIN, SUPER_ADMIN, STAFF]`

### 5.2 Admin layout (`app/admin/layout.tsx`)

Build a professional sidebar layout:
- Left sidebar: 240px, dark onyx background
- Vivabloom logo at top
- Nav items with icons (lucide-react):
  - Dashboard (LayoutDashboard)
  - Enquiries (MessageSquare) + badge for unread count
  - Bookings (Calendar)
  - Clients (Users)
  - Invoices (FileText)
  - Content (Edit3) — expands to Gallery, Blog, Testimonials, Pages
  - Media (Image)
  - Reviews (Star)
  - Settings (Settings)
- Bottom: logged-in user avatar + name + logout
- Active state: champagne left border + subtle bg highlight
- Responsive: sidebar collapses to icon-only on tablet, full hamburger on mobile

### 5.3 Dashboard home (`app/admin/page.tsx`)

Stat cards row (server component, fetch live data):
- New Enquiries (this week)
- Confirmed Bookings (this month)
- Revenue (this month from paid invoices)
- Pending Invoices

Below:
- **Recent enquiries table** — last 10, with status badge, quick-action buttons (View, Mark as Reviewed)
- **Upcoming bookings** — next 5 events in a mini calendar strip
- **Quick actions** — `+ New Blog Post`, `+ Upload Gallery`, `+ Create Invoice`

### 5.4 Enquiries management (`app/admin/enquiries/page.tsx`)

- Filterable, sortable table: Name | Email | Event Type | Event Date | Budget | Status | Created At
- Status filter tabs: All · New · In Review · Quoted · Booked · Closed
- Row click → slide-in detail panel (Radix Sheet):
  - Full enquiry details
  - Admin notes textarea (auto-save)
  - Status dropdown updater
  - `Convert to Booking` button
  - Email client button (opens pre-filled draft)
- Search by name/email
- Pagination (20 per page)

### 5.5 Bookings / Calendar (`app/admin/bookings/page.tsx`)

- Toggle between Calendar view and List view
- Calendar: react full-calendar alternative built with a simple grid — show booked dates as coloured dots
- List view: table with Booking Title | Client | Date | Venue | Status | Actions
- Status management inline
- Link to invoice from booking row

### 5.6 Content management (`app/admin/content/page.tsx`)

Tabbed interface:

**Gallery tab:**
- Grid of current gallery images, drag-to-reorder
- Upload new: Cloudinary via `next-cloudinary` CldUploadWidget
- Edit title, category, featured toggle per item
- Delete with confirmation

**Blog tab:**
- List of all posts with Published/Draft badge
- `New Post` → rich text editor page (use `@uiw/react-md-editor` or Tiptap)
- Post edit form: title, slug (auto-generated), excerpt, content, cover image upload, tags, meta fields, publish toggle

**Testimonials tab:**
- List with approved/pending status
- Toggle approved + featured
- Delete

### 5.7 Invoice management (`app/admin/invoices/page.tsx`)

- Table: Invoice # | Client | Amount | Status | Due Date | Actions
- `New Invoice` → form: select client/booking, add line items dynamically, set due date
- `Generate PDF` button → server action that creates a branded PDF (use `@react-pdf/renderer` or puppeteer)
- Status update: Draft → Sent → Paid
- Email invoice to client button

### 5.8 Media Library (`app/admin/media/page.tsx`)

- Grid view of all Cloudinary assets
- Upload new files (images, PDFs)
- Copy URL to clipboard
- Delete from Cloudinary + DB

### 5.9 Settings (`app/admin/settings/page.tsx`)

Tabbed:
- **General:** Site name, tagline, contact email, phone, address, social links — stored in `SiteSettings`
- **SEO:** Default meta title, meta description, OG image
- **Email:** SMTP / Resend config test
- **Team:** Invite admin users, manage roles

---

## PART 6 — CLIENT PORTAL (`app/client/`)

Simple protected area for booked clients:
- View their upcoming event details
- Download their invoice PDFs
- View mood board / gallery curated for their event (future)
- Message admin (simple enquiry form)

---

## PART 7 — API ROUTES

### POST `/api/enquiries`
```ts
// Validate with Zod, create Enquiry in Prisma, send two emails via Resend:
// 1. Confirmation to client
// 2. Notification to admin (info@vivabloomdecor.com.au)
```

### GET/POST `/api/gallery`
```ts
// GET: return published GalleryItems, optionally filtered by category
// POST (admin only): create new GalleryItem after Cloudinary upload
```

### POST `/api/newsletter`
```ts
// Upsert NewsletterSubscriber, return success
```

### GET/POST `/api/blog`
```ts
// GET: published posts (with optional slug param)
// POST (admin only): create/update BlogPost
```

### POST `/api/quote`
```ts
// Same as enquiries but triggers quote-specific email template
```

---

## PART 8 — EMAIL TEMPLATES

Create branded HTML email templates in `lib/emails/`:

**`enquiry-confirmation.tsx`** — sent to client:
- Vivabloom logo
- "Thank you, [Name]! We've received your enquiry."
- Summary of their details
- "We'll be in touch within 24 hours"
- Champagne CTA button: View Our Portfolio

**`enquiry-notification.tsx`** — sent to admin:
- New enquiry alert
- All fields displayed
- Direct admin link to view in dashboard

**`invoice.tsx`** — sent to client:
- Branded invoice summary
- Line items table
- Payment due date
- Payment instructions

---

## PART 9 — PHASE 2 ECOMMERCE SCAFFOLDING

> Build the DB schema now (already in Part 2). Build the routes/UI as stubs but do NOT activate them in the public nav until Phase 2 is triggered.

### Product shop structure (stubbed routes):
- `app/shop/page.tsx` — product grid
- `app/shop/[slug]/page.tsx` — product detail
- `app/shop/cart/page.tsx` — cart
- `app/shop/checkout/page.tsx` — Stripe integration

### Ticket sales (stubbed):
- `app/events/page.tsx` — upcoming events list
- `app/events/[slug]/page.tsx` — event detail + `Buy Tickets` flow
- After successful Stripe payment: generate unique QR code per ticket (use `qrcode` npm package), store in DB, email PDF ticket to buyer

### Admin shop management:
- `app/admin/shop/page.tsx` — product management
- `app/admin/events/page.tsx` — event management + QR check-in scanner UI

---

## PART 10 — PERFORMANCE & SEO

### Image optimisation
- All images via `next/image` with proper `sizes` attribute
- Gallery images: width 800, quality 85
- Hero: width 1920, priority true

### Metadata
Each public page exports `generateMetadata()`:
```ts
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Vivabloom | Luxury Event & Wedding Décor — Melbourne, Victoria',
    description: '...',
    openGraph: { images: ['/og-image.jpg'] },
  }
}
```

### Structured data
Add `JSON-LD` schema to home page:
- `LocalBusiness` with address, geo, openingHours
- `Service` entries per service

### sitemap.xml
Generate via `app/sitemap.ts` — include all public pages + published blog posts

### robots.txt
Block `/admin` and `/api` routes

---

## PART 11 — DEPLOYMENT CONFIG

### `.env.local` variables needed:
```
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### `vercel.json`
```json
{
  "buildCommand": "prisma generate && next build",
  "functions": {
    "app/api/**": { "maxDuration": 30 }
  }
}
```

### Webuzo migration checklist (Phase 2):
- Export Vercel Postgres → dump to `.sql`
- Install Node.js 20 + PM2 on Webuzo
- Set up Nginx reverse proxy to Next.js port 3000
- Configure SSL via Let's Encrypt
- Set all env vars in PM2 ecosystem config
- Set up GitHub webhook for auto-deploy on push to `main`

---

## IMPLEMENTATION ORDER FOR CURSOR

Work through these phases in order:

**Phase A — Foundation (do first):**
1. Project init + folder structure
2. Prisma schema + DB connection
3. Global styles, fonts, Tailwind config
4. Shared UI components (Button, Input, Badge, Card)

**Phase B — Public site:**
5. Navbar + Footer
6. Home page (all sections)
7. Services page
8. Gallery page
9. Quote form + API
10. Blog listing + post
11. About + Contact pages

**Phase C — Admin dashboard:**
12. NextAuth setup + middleware
13. Admin layout + sidebar
14. Dashboard home with live stats
15. Enquiries management
16. Bookings + calendar
17. Content management (gallery, blog, testimonials)
18. Invoice generation
19. Media library
20. Settings

**Phase D — Polish:**
21. Animations (GSAP ScrollTrigger on hero + sections)
22. Mobile responsiveness audit
23. SEO metadata + sitemap + JSON-LD
24. Email templates
25. Performance audit + image optimisation

**Phase E — eCommerce (future):**
26. Activate shop + ticket routes
27. Stripe integration
28. QR ticket generation + PDF emails
29. Admin shop management

---

*This is a $10,000-tier build. Every component must be production-quality, visually elite, and architecturally sound. No shortcuts on UI polish — Vivabloom competes at the top of the Australian luxury events market.*
