# Vivabloom — Phase B: Public Shell
## Navbar · Footer · Full Home Page · All Public Pages

> Phase A is complete. All deps installed, Prisma schema migrated, design tokens live in
> `globals.css`, UI primitives in `src/components/ui/`. Work through every section below in order.
> Do NOT deviate from the design language: ivory / onyx / champagne / Cormorant Garamond / DM Sans.

---

## B-1 — NAVBAR (`src/components/public/Navbar.tsx`)

Create a **client component** (`"use client"`).

### Behaviour
- Default state: `position: fixed`, `top: 0`, `width: 100%`, `z-index: 50`, fully transparent, all text white
- Scrolled state (after 80px): background transitions to `rgba(15,14,12,0.94)` + `backdrop-filter: blur(12px)`, smooth 400ms ease
- Use `useEffect` + `useState` to track scroll position

### Layout
```
[Logo]                    [Nav links]                 [CTA button]
```
Height: 80px desktop, 64px mobile. Padding: `0 5%`.

### Logo
```tsx
<Link href="/">
  <span style={{ fontFamily: 'var(--font-accent)' }}
    className="text-2xl tracking-wider text-white">
    Vivabloom
  </span>
</Link>
```

### Nav links (desktop, hidden below `lg`)
Links: `About · Services · Gallery · Portfolio · Blog · Contact`
```tsx
className="text-[11px] uppercase tracking-[0.2em] text-white/80 hover:text-[#C9A96E]
           transition-colors duration-300 font-body"
```

### CTA Button
```tsx
<Link href="/quote"
  className="border border-[#C9A96E] text-[#C9A96E] text-[11px] uppercase tracking-[0.2em]
             px-6 py-2.5 rounded-full hover:bg-[#C9A96E] hover:text-[#0F0E0C]
             transition-all duration-300 font-body">
  Request a Quote
</Link>
```

### Mobile menu
- Hamburger icon (3 lines → X, animated with CSS transition)
- Full-screen overlay: `fixed inset-0 bg-[#0F0E0C] z-40`
- Links stacked vertically, Cormorant Garamond, 48px, italic, white
- Each link animates in with staggered `animation-delay` (0ms, 80ms, 160ms…) — use `animate-fade-up`
- Bottom of overlay: social icons (Instagram, Facebook, Pinterest) in a row

### Implementation note
Import and use in root `layout.tsx`. Pass `className` so it can receive `"mix-blend-difference"` from hero if needed.

---

## B-2 — FOOTER (`src/components/public/Footer.tsx`)

Server component. Background `#0F0E0C`.

### Structure
Top border: `1px solid rgba(201,169,110,0.3)` (champagne, 30% opacity)

4-column grid on desktop, 2-column on tablet, stacked on mobile:

**Col 1 — Brand**
```
[Vivabloom wordmark — Italiana, 28px, champagne]
[Tagline — "Where Every Moment Becomes a Memory" — italic, 14px, ivory/60%]
[Social icons row — Instagram, Facebook, TikTok, Pinterest — 20px, ivory/50%, hover champagne]
[ABN: XX XXX XXX XXX — 12px, ivory/30%]
```

**Col 2 — Explore**
```
Heading: "Explore" — 10px, uppercase, tracking-[0.3em], champagne
Links: Home · About · Services · Gallery · Portfolio · Blog
```

**Col 3 — Services**
```
Heading: "Services"
Links: Floral Design · Balloon Artistry · Wedding Styling ·
       Corporate Events · Backdrop & Draping · Full Production
```

**Col 4 — Get in Touch**
```
Heading: "Get in Touch"
[Location icon] Melbourne, Victoria, Australia
[Phone icon] +61 3 XXXX XXXX
[Email icon] info@vivabloomdecor.com.au

Newsletter signup:
  Label: "Stay inspired"
  <input placeholder="Your email address" />
  <button>Subscribe →</button>
```

Newsletter `<form>` → `onSubmit` POSTs to `/api/newsletter`.

**Bottom bar** (below a divider):
```
© 2025 Vivabloom Decor. All rights reserved.    [Privacy Policy]  [Terms]
```
All footer text: `text-white/50 text-[13px]`, links hover to `text-[#C9A96E]`.

---

## B-3 — HOME PAGE (`src/app/(public)/page.tsx`)

Import and compose all sections. This is a **server component** — fetch data at the top where needed.

```tsx
import HeroSection from '@/components/public/HeroSection'
import BrandStatement from '@/components/public/BrandStatement'
import ServicesSection from '@/components/public/ServicesSection'
import GalleryPreview from '@/components/public/GalleryPreview'
import TestimonialsSection from '@/components/public/TestimonialsSection'
import AboutPreview from '@/components/public/AboutPreview'
import QuoteCTA from '@/components/public/QuoteCTA'

// Fetch featured gallery items server-side
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const galleryItems = await prisma.galleryItem.findMany({
    where: { featured: true },
    orderBy: { order: 'asc' },
    take: 8,
  })
  const testimonials = await prisma.testimonial.findMany({
    where: { approved: true, featured: true },
    take: 5,
  })

  return (
    <main>
      <HeroSection />
      <BrandStatement />
      <ServicesSection />
      <GalleryPreview items={galleryItems} />
      <TestimonialsSection testimonials={testimonials} />
      <AboutPreview />
      <QuoteCTA />
    </main>
  )
}
```

---

## B-4 — HERO SECTION (`src/components/public/HeroSection.tsx`)

**Client component.**

### Container
```css
height: 100vh;
min-height: 700px;
position: relative;
overflow: hidden;
display: flex;
align-items: center;
justify-content: center;
```

### Background
Use `next/image` with `fill` and `priority`:
```tsx
<Image
  src="/images/hero-bg.jpg"
  alt="Luxury event décor by Vivabloom"
  fill
  priority
  className="object-cover object-center scale-105"
  style={{ transform: 'scale(1.05)' }} // parallax base scale
/>
```
Add GSAP parallax in `useEffect`:
```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

useEffect(() => {
  gsap.to(heroImageRef.current, {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: heroRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })
}, [])
```

### Overlay
```css
position: absolute;
inset: 0;
background: linear-gradient(
  to bottom,
  rgba(15,14,12,0.25) 0%,
  rgba(15,14,12,0.55) 60%,
  rgba(15,14,12,0.75) 100%
);
```

### Content (centered)
```tsx
<div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

  {/* Eyebrow */}
  <p className="text-[11px] uppercase tracking-[0.35em] text-[#C9A96E] font-body mb-6
                opacity-0 animate-fade-up [animation-delay:200ms] [animation-fill-mode:forwards]">
    Australia&apos;s Premier Event Décor Studio
  </p>

  {/* Headline — two lines */}
  <h1 className="font-display italic text-white leading-[0.92]
                 text-[72px] md:text-[96px] lg:text-[112px]
                 opacity-0 animate-fade-up [animation-delay:400ms] [animation-fill-mode:forwards]">
    Crafting Moments<br />
    <span className="text-[#E8D5B0]">of Exquisite Beauty</span>
  </h1>

  {/* Subheadline */}
  <p className="font-body font-light text-white/75 text-lg max-w-[520px] mx-auto mt-8 leading-relaxed
                opacity-0 animate-fade-up [animation-delay:600ms] [animation-fill-mode:forwards]">
    From intimate gatherings to grand celebrations — we design
    unforgettable experiences that tell your story.
  </p>

  {/* CTAs */}
  <div className="flex items-center justify-center gap-5 mt-10
                  opacity-0 animate-fade-up [animation-delay:800ms] [animation-fill-mode:forwards]">
    <Link href="/gallery"
      className="bg-[#C9A96E] text-[#0F0E0C] text-[12px] uppercase tracking-[0.2em]
                 px-8 py-4 rounded-full font-body hover:bg-[#E8D5B0] transition-all duration-300">
      Explore Our Work
    </Link>
    <Link href="/quote"
      className="border border-white/60 text-white text-[12px] uppercase tracking-[0.2em]
                 px-8 py-4 rounded-full font-body hover:border-white hover:bg-white/10
                 transition-all duration-300">
      Request a Quote
    </Link>
  </div>
</div>
```

### Scroll indicator (bottom center)
```tsx
<div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
                opacity-0 animate-fade-in [animation-delay:1200ms] [animation-fill-mode:forwards]">
  <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-body">Scroll</span>
  <div className="w-px h-12 bg-gradient-to-b from-[#C9A96E] to-transparent
                  animate-[scrollLine_1.5s_ease-in-out_infinite]" />
</div>
```
Add to `globals.css`:
```css
@keyframes scrollLine {
  0%, 100% { transform: scaleY(0); transform-origin: top; }
  50%       { transform: scaleY(1); transform-origin: top; }
}
```

---

## B-5 — BRAND STATEMENT (`src/components/public/BrandStatement.tsx`)

Server component. Background: `#F8F5EE` (ivory).

```tsx
<section className="py-28 px-[5%] bg-[#F8F5EE]">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-center">

    {/* Left: quote */}
    <div>
      {/* Decorative opening quote mark */}
      <span className="font-display text-[120px] leading-none text-[#C9A96E]/20 block -mb-8">"</span>
      <blockquote className="font-display italic text-[#0F0E0C] text-[42px] md:text-[52px]
                              leading-[1.1] max-w-2xl">
        Every event is a story.<br />We make it unforgettable.
      </blockquote>
      {/* Champagne divider line — animate width on scroll */}
      <div className="h-px w-24 bg-[#C9A96E] mt-10 mb-6 brand-divider" />
      <p className="font-body text-[#4A4843] text-base leading-relaxed max-w-lg">
        At Vivabloom, we believe every celebration should feel seamless, beautiful, and deeply personal.
        From florals to full productions, we bring your vision to life with flawless precision.
      </p>
    </div>

    {/* Right: stats 2×2 grid */}
    <div className="grid grid-cols-2 gap-px bg-[#C9A96E]/20 border border-[#C9A96E]/20 rounded-sm">
      {[
        { value: '10+',  label: 'Years of Excellence' },
        { value: '500+', label: 'Events Delivered' },
        { value: '3',    label: 'Cities Served' },
        { value: '5★',   label: 'Average Rating' },
      ].map((stat) => (
        <div key={stat.label} className="bg-[#F8F5EE] p-10 text-center">
          <p className="font-display italic text-[#0F0E0C] text-[52px] leading-none">{stat.value}</p>
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-[#C9A96E] mt-2">{stat.label}</p>
        </div>
      ))}
    </div>

  </div>
</section>
```

Add GSAP scroll animation for `.brand-divider` in a client wrapper or use `IntersectionObserver`:
```ts
// On intersection: animate from width 0 → 96px over 800ms
```

---

## B-6 — SERVICES SECTION (`src/components/public/ServicesSection.tsx`)

**Client component** (for hover interactions). Background: `#0F0E0C`.

```tsx
const services = [
  { title: 'Floral Design',       subtitle: 'Nature's beauty, curated',    image: '/images/services/floral.jpg' },
  { title: 'Balloon Artistry',    subtitle: 'Sculptural, joyful, bold',    image: '/images/services/balloons.jpg' },
  { title: 'Wedding Styling',     subtitle: 'Your day, perfectly told',    image: '/images/services/wedding.jpg' },
  { title: 'Corporate Events',    subtitle: 'Impressions that last',       image: '/images/services/corporate.jpg' },
  { title: 'Backdrop & Draping',  subtitle: 'Atmosphere in every fold',    image: '/images/services/draping.jpg' },
  { title: 'Full Production',     subtitle: 'End-to-end event mastery',    image: '/images/services/production.jpg' },
]
```

**Section header:**
```tsx
<div className="text-center pt-24 pb-16 px-[5%]">
  <p className="text-[10px] uppercase tracking-[0.35em] text-[#C9A96E] font-body mb-4">What We Do</p>
  <h2 className="font-display italic text-white text-[56px] leading-tight">Our Services</h2>
</div>
```

**Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {services.map((service) => (
    <ServiceCard key={service.title} {...service} />
  ))}
</div>
```

**`ServiceCard` component (inline):**
```tsx
function ServiceCard({ title, subtitle, image }: ServiceItem) {
  return (
    <Link href="/services" className="relative overflow-hidden block" style={{ height: '480px' }}>
      {/* Background image */}
      <Image src={image} alt={title} fill className="object-cover transition-transform duration-700
                                                       group-hover:scale-110" />
      {/* Gradient overlay — always present, darkens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C] via-[#0F0E0C]/40 to-transparent
                      transition-opacity duration-500 group-hover:opacity-90" />
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-3
                      group-hover:translate-y-0 transition-transform duration-500">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#C9A96E] font-body mb-2
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
          {subtitle}
        </p>
        <h3 className="font-display italic text-white text-[32px] leading-tight">{title}</h3>
        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 delay-150">
          <span className="text-[#C9A96E] text-[11px] uppercase tracking-[0.2em] font-body">Explore</span>
          <ArrowRight size={14} className="text-[#C9A96E]" />
        </div>
      </div>
    </Link>
  )
}
```
Wrap each card's outer `<Link>` with `group` className for group-hover to work.

---

## B-7 — GALLERY PREVIEW (`src/components/public/GalleryPreview.tsx`)

**Client component** (for lightbox). Receives `items: GalleryItem[]` from server.

### Section header
```tsx
<div className="text-center py-24 px-[5%] bg-[#F8F5EE]">
  <p className="eyebrow">Our Work</p>
  <h2 className="font-display italic text-[#0F0E0C] text-[56px]">A Glimpse of the Magic</h2>
</div>
```

### Masonry grid
Use CSS columns — **no JS masonry library needed**:
```tsx
<div className="px-[3%] pb-24 bg-[#F8F5EE]"
     style={{ columns: '3', columnGap: '12px' }}>
  {items.map((item, i) => (
    <div key={item.id}
         className="break-inside-avoid mb-3 overflow-hidden cursor-pointer group relative"
         onClick={() => setLightboxIndex(i)}>
      <Image
        src={item.imageUrl}
        alt={item.title}
        width={600}
        height={0}
        style={{ height: 'auto', width: '100%' }}
        className="transition-transform duration-700 group-hover:scale-105"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-[#0F0E0C]/0 group-hover:bg-[#0F0E0C]/50
                      transition-all duration-500 flex items-end p-5">
        <span className="text-white font-display italic text-xl opacity-0
                         group-hover:opacity-100 transition-opacity duration-300 translate-y-2
                         group-hover:translate-y-0">
          {item.title}
        </span>
      </div>
    </div>
  ))}
</div>
```

Responsive: `[style={{ columns: '3' }}]` → use Tailwind's responsive prefix via a conditional or inline media query helper.
- `lg:columns-3 md:columns-2 columns-1` — use Tailwind's column utilities.

### Lightbox
Use `@radix-ui/react-dialog`:
```tsx
<Dialog open={lightboxIndex !== null} onOpenChange={() => setLightboxIndex(null)}>
  <DialogContent className="max-w-5xl bg-[#0F0E0C] border-0 p-0">
    {/* Current image */}
    <Image src={items[lightboxIndex!]?.imageUrl} ... fill className="object-contain" />
    {/* Prev / Next arrows */}
    {/* Close button top right */}
  </DialogContent>
</Dialog>
```

### "View Full Gallery" CTA
```tsx
<div className="text-center pb-24">
  <Link href="/gallery" className="champagne-outline-btn">View Full Gallery</Link>
</div>
```
Add `.champagne-outline-btn` to `globals.css`:
```css
.champagne-outline-btn {
  border: 1px solid #C9A96E;
  color: #C9A96E;
  font-family: var(--font-body);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  padding: 14px 36px;
  border-radius: 9999px;
  display: inline-block;
  transition: all 0.3s ease;
}
.champagne-outline-btn:hover {
  background: #C9A96E;
  color: #0F0E0C;
}
```

---

## B-8 — TESTIMONIALS SECTION (`src/components/public/TestimonialsSection.tsx`)

**Client component.** Background: `#0F0E0C`. Receives `testimonials: Testimonial[]`.

### Auto-advance carousel
```tsx
const [active, setActive] = useState(0)

useEffect(() => {
  const timer = setInterval(() => {
    setActive((prev) => (prev + 1) % testimonials.length)
  }, 6000)
  return () => clearInterval(timer)
}, [testimonials.length])
```

### Layout
```tsx
<section className="py-28 px-[5%] bg-[#0F0E0C] relative overflow-hidden">
  {/* Decorative large quote mark */}
  <span className="absolute top-16 left-[5%] font-display text-[200px] text-[#C9A96E]/5
                   leading-none select-none pointer-events-none">"</span>

  <div className="max-w-4xl mx-auto text-center relative z-10">
    <p className="eyebrow-light mb-16">What Our Clients Say</p>

    {/* Testimonial content — fade transition */}
    <div className="relative min-h-[260px]">
      {testimonials.map((t, i) => (
        <div key={t.id}
             className={`absolute inset-0 flex flex-col items-center justify-center
                         transition-all duration-700 ${
                           i === active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                         }`}>
          {/* Stars */}
          <div className="flex gap-1 mb-8">
            {Array.from({ length: t.rating }).map((_, si) => (
              <Star key={si} size={16} fill="#C9A96E" className="text-[#C9A96E]" />
            ))}
          </div>
          {/* Quote */}
          <blockquote className="font-display italic text-white text-[28px] md:text-[36px]
                                  leading-[1.25] max-w-3xl">
            "{t.content}"
          </blockquote>
          {/* Attribution */}
          <div className="mt-8 flex flex-col items-center gap-1">
            {t.imageUrl && (
              <Image src={t.imageUrl} alt={t.name}
                     width={48} height={48} className="rounded-full object-cover mb-2" />
            )}
            <p className="font-body text-[#C9A96E] text-[13px] uppercase tracking-[0.2em]">{t.name}</p>
            {t.role && <p className="font-body text-white/40 text-[12px]">{t.role}</p>}
          </div>
        </div>
      ))}
    </div>

    {/* Progress dots */}
    <div className="flex justify-center gap-3 mt-16">
      {testimonials.map((_, i) => (
        <button key={i} onClick={() => setActive(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === active
                    ? 'w-8 h-1.5 bg-[#C9A96E]'
                    : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`} />
      ))}
    </div>
  </div>
</section>
```

Add to `globals.css`:
```css
.eyebrow-light {
  font-family: var(--font-body);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  color: #C9A96E;
  display: block;
}
```

---

## B-9 — ABOUT PREVIEW (`src/components/public/AboutPreview.tsx`)

Server component. Background: `#F8F5EE`.

```tsx
<section className="py-28 px-[5%] bg-[#F8F5EE]">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

    {/* Left: image with offset champagne border frame */}
    <div className="relative">
      <div className="relative z-10 overflow-hidden" style={{ aspectRatio: '4/5' }}>
        <Image src="/images/vivian.jpg" alt="Vivian, Founder of Vivabloom"
               fill className="object-cover object-top" />
      </div>
      {/* Offset decorative frame */}
      <div className="absolute top-6 left-6 right-[-24px] bottom-[-24px]
                      border border-[#C9A96E]/50 z-0 rounded-sm" />
    </div>

    {/* Right: content */}
    <div>
      <p className="eyebrow mb-6">The Mind Behind the Magic</p>
      <h2 className="font-display italic text-[#0F0E0C] text-[52px] leading-tight mb-2">
        Hi there, I&apos;m <em className="text-[#C9A96E]">Vivian</em>
      </h2>
      <div className="h-px w-16 bg-[#C9A96E] my-8" />
      <p className="font-body text-[#4A4843] text-base leading-[1.8] mb-6">
        Vivabloom was born from my obsession with detail and my love of creating truly precious moments.
        For me, it&apos;s never just about flowers or balloons or draping — it&apos;s about flowers,
        feelings, and the stories we tell.
      </p>
      {/* Pull quote */}
      <blockquote className="border-l-2 border-[#C9A96E] pl-6 my-8">
        <p className="font-display italic text-[#0F0E0C] text-[24px] leading-tight">
          "I make every event personal. I believe in the magic
          of perfectly executed, deeply felt celebrations."
        </p>
      </blockquote>
      <p className="font-body text-[#4A4843] text-base leading-[1.8] mb-10">
        Every collaboration begins with listening — truly understanding your vision — then building
        something that makes your day feel extraordinary and entirely your own.
      </p>
      {/* Micro-stats */}
      <div className="flex gap-10 mb-10">
        {[
          { icon: '✦', label: '5-Star Experiences' },
          { icon: '✦', label: '10+ Years Practice' },
          { icon: '✦', label: '500+ Events Planned' },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[#C9A96E] font-body text-[10px] uppercase tracking-[0.25em]">
              {item.icon} {item.label}
            </p>
          </div>
        ))}
      </div>
      <Link href="/about" className="champagne-outline-btn">Meet the Full Team</Link>
    </div>
  </div>
</section>
```

Add `.eyebrow` to `globals.css`:
```css
.eyebrow {
  font-family: var(--font-body);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  color: #C9A96E;
  display: block;
}
```

---

## B-10 — QUOTE CTA SECTION (`src/components/public/QuoteCTA.tsx`)

Server component. Full-width, dark background with a background image.

```tsx
<section className="relative py-36 overflow-hidden">
  {/* Background image */}
  <Image src="/images/cta-bg.jpg" alt="" fill className="object-cover object-center" />
  {/* Overlay */}
  <div className="absolute inset-0 bg-[#0F0E0C]/80" />

  <div className="relative z-10 text-center px-[5%] max-w-3xl mx-auto">
    <p className="eyebrow-light mb-6">Let&apos;s Create Together</p>
    <h2 className="font-display italic text-white text-[56px] md:text-[72px] leading-tight mb-6">
      Your Dream Event<br />
      <span className="text-[#C9A96E]">Starts Here</span>
    </h2>
    <p className="font-body font-light text-white/70 text-lg leading-relaxed mb-12 max-w-xl mx-auto">
      Every extraordinary event begins with a single conversation.
      Tell us your vision and we&apos;ll make it a reality.
    </p>
    <Link href="/quote"
      className="inline-block bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase
                 tracking-[0.2em] px-12 py-5 rounded-full hover:bg-[#E8D5B0]
                 transition-all duration-300">
      Request a Quote
    </Link>
  </div>
</section>
```

---

## B-11 — SCROLL ANIMATION WRAPPER

Create `src/components/public/ScrollReveal.tsx` — a **client component** that wraps any content and triggers a fade-up on scroll entry using `IntersectionObserver`:

```tsx
'use client'
import { useEffect, useRef, ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number // ms
  className?: string
}

export default function ScrollReveal({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
          }, delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    el.style.opacity = '0'
    el.style.transform = 'translateY(28px)'
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease'
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return <div ref={ref} className={className}>{children}</div>
}
```

Wrap major section headings and stat blocks with `<ScrollReveal>` throughout the home page.

---

## B-12 — SERVICES PAGE (`src/app/(public)/services/page.tsx`)

Full page with metadata. Re-use `ServicesSection`. Add:
- Hero sub-banner (not full viewport — 50vh, with `Services` headline)
- Each service as a full section: large image left, details right (alternating)
- Each section: service title, 3-bullet description list, pricing guide line (`Starting from $XXX`), CTA to quote form

```tsx
export const metadata: Metadata = {
  title: 'Our Services | Vivabloom — Luxury Event Décor Melbourne',
  description: '...',
}
```

---

## B-13 — GALLERY PAGE (`src/app/(public)/gallery/page.tsx`)

Server component — fetch ALL gallery items from DB.

```tsx
export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { order: 'asc' },
  })
  return <GalleryGrid items={items} />
}
```

`GalleryGrid` is a **client component** handling:
- Category filter tabs (derived from unique `item.category` values)
- Filtered masonry grid (same CSS columns approach as B-7)
- Lightbox

---

## B-14 — BLOG PAGES

**`src/app/(public)/blog/page.tsx`** (server):
```tsx
const posts = await prisma.blogPost.findMany({
  where: { published: true },
  orderBy: { createdAt: 'desc' },
})
```
Layout:
- First post: hero card (full-width, 55vh image, title overlay)
- Remaining: 3-column grid of cards (cover image, category, title, excerpt, date, read time)

**`src/app/(public)/blog/[slug]/page.tsx`** (server):
```tsx
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({ where: { published: true }, select: { slug: true } })
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } })
  return { title: post?.metaTitle || post?.title, description: post?.metaDesc || post?.excerpt || '' }
}
```
Article layout:
- Max-width 720px centered
- Cover image: full-bleed above content area, `aspect-video`
- Heading hierarchy: `font-display italic` for `h1/h2`, `font-body` for body
- `dangerouslySetInnerHTML` for the `content` field (or integrate a markdown renderer)
- Share buttons (copy link, Twitter/X, Facebook)
- Estimated reading time: `Math.ceil(content.split(' ').length / 200)` minutes

---

## B-15 — ABOUT PAGE (`src/app/(public)/about/page.tsx`)

Server component. Sections:
1. Hero banner (50vh) — headline `"The Story Behind Vivabloom"`
2. Vivian bio (expanded from `AboutPreview`) — full story, larger image
3. Team grid — 3 columns, each with photo + name + role + short bio
4. Values section — 4 values in a 2×2 grid with champagne icon + title + description
5. Press / Awards — logos row (greyscale, hover colour)
6. CTA → quote form

---

## B-16 — CONTACT PAGE (`src/app/(public)/contact/page.tsx`)

Split layout:
- **Left (40%):** Contact details with icons, Google Maps embed (`<iframe>` from Google Maps embed API), social links
- **Right (60%):** Contact form — name, email, phone, subject (select: General · Wedding · Corporate · Press), message

Form posts to `/api/enquiries` same as quote form. Show success state after submit.

```tsx
export const metadata: Metadata = {
  title: 'Contact Vivabloom | Luxury Event Décor Melbourne',
}
```

---

## B-17 — QUOTE PAGE (`src/app/(public)/quote/page.tsx`)

Client component. 3-step form with visual step indicator.

### Step indicator
```tsx
<div className="flex items-center justify-center gap-0 mb-16">
  {['Event Details', 'Your Contact', 'Your Vision'].map((label, i) => (
    <div key={i} className="flex items-center">
      <div className={`flex flex-col items-center ${i < step ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-body
                         ${i + 1 === step ? 'border-[#C9A96E] bg-[#C9A96E] text-[#0F0E0C]'
                           : i + 1 < step ? 'border-[#C9A96E] bg-[#C9A96E]/20 text-[#C9A96E]'
                           : 'border-white/20 text-white/40'}`}>
          {i + 1 < step ? '✓' : i + 1}
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] mt-2 text-white/60 font-body">{label}</span>
      </div>
      {i < 2 && <div className={`w-24 h-px mx-4 ${i + 1 < step ? 'bg-[#C9A96E]' : 'bg-white/10'}`} />}
    </div>
  ))}
</div>
```

Page background: `#0F0E0C` with subtle hero image underneath at `opacity-10`.

### Zod schema (create `src/lib/validations/quote.ts`):
```ts
import { z } from 'zod'

export const quoteSchema = z.object({
  eventType:  z.string().min(1, 'Please select an event type'),
  eventDate:  z.string().optional(),
  guestCount: z.coerce.number().optional(),
  venue:      z.string().optional(),
  name:       z.string().min(2, 'Please enter your name'),
  email:      z.email('Please enter a valid email'),
  phone:      z.string().optional(),
  budget:     z.string().optional(),
  message:    z.string().min(10, 'Please tell us a bit more'),
  referral:   z.string().optional(),
})
export type QuoteFormData = z.infer<typeof quoteSchema>
```

### On submit: POST `/api/enquiries`
Show a success screen:
```tsx
<div className="text-center py-20">
  <div className="w-16 h-16 rounded-full border border-[#C9A96E] flex items-center justify-center
                  mx-auto mb-8 text-[#C9A96E] text-2xl">✓</div>
  <h2 className="font-display italic text-white text-[48px]">Thank You, {name}!</h2>
  <p className="font-body text-white/60 mt-4 max-w-md mx-auto">
    We&apos;ve received your enquiry and will be in touch within 24 hours.
  </p>
  <Link href="/" className="champagne-outline-btn mt-10 inline-block">Back to Home</Link>
</div>
```

---

## B-18 — API ROUTES (replace 501 stubs)

### `src/app/api/enquiries/route.ts`
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendEnquiryConfirmation, sendAdminNotification } from '@/lib/email'

const schema = z.object({
  name:       z.string().min(1),
  email:      z.string().email(),
  phone:      z.string().optional(),
  eventType:  z.string().min(1),
  eventDate:  z.string().optional(),
  guestCount: z.coerce.number().optional(),
  budget:     z.string().optional(),
  message:    z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const enquiry = await prisma.enquiry.create({
      data: {
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      },
    })

    // Send emails (don't await — fire and forget)
    sendEnquiryConfirmation(data.email, data.name).catch(console.error)
    sendAdminNotification(enquiry).catch(console.error)

    return NextResponse.json({ success: true, id: enquiry.id })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### `src/app/api/newsletter/route.ts`
```ts
export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { active: true },
    create: { email, name },
  })
  return NextResponse.json({ success: true })
}
```

### `src/app/api/gallery/route.ts`
```ts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const items = await prisma.galleryItem.findMany({
    where: category ? { category } : {},
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(items)
}
```

---

## B-19 — PLACEHOLDER IMAGES

Until real client photography is provided, use high-quality Unsplash images for all `Image` components. Add to `next.config.js`:

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'res.cloudinary.com' },
  ],
},
```

Use these Unsplash URLs as placeholder `src` values:
- Hero: `https://images.unsplash.com/photo-1519741497674-611481863552?w=1920`
- Services/floral: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800`
- Services/wedding: `https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800`
- Services/balloons: `https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800`
- Services/corporate: `https://images.unsplash.com/photo-1511578314322-379afb476865?w=800`
- Services/draping: `https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800`
- Services/production: `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800`
- CTA background: `https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920`

---

## B-20 — SITEMAP & ROBOTS

### `src/app/sitemap.ts`
```ts
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  })

  const staticRoutes = ['', '/services', '/gallery', '/portfolio', '/blog', '/about', '/contact', '/quote']
    .map((route) => ({
      url: `https://vivabloomdecor.com.au${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    }))

  const blogRoutes = posts.map((post) => ({
    url: `https://vivabloomdecor.com.au/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...blogRoutes]
}
```

### `src/app/robots.ts`
```ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/client'] },
    ],
    sitemap: 'https://vivabloomdecor.com.au/sitemap.xml',
  }
}
```

---

## B-21 — JSON-LD STRUCTURED DATA

Add to home page (`app/(public)/page.tsx`):
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Vivabloom Decor',
      description: 'Luxury event and wedding décor studio in Melbourne, Australia',
      url: 'https://vivabloomdecor.com.au',
      telephone: '+61-3-XXXX-XXXX',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Melbourne',
        addressRegion: 'VIC',
        addressCountry: 'AU',
      },
      geo: { '@type': 'GeoCoordinates', latitude: -37.8136, longitude: 144.9631 },
      priceRange: '$$$',
      servedCuisine: undefined,
      hasMap: 'https://maps.google.com/?q=Melbourne+VIC',
    }),
  }}
/>
```

---

## FINAL CHECKS BEFORE COMMITTING PHASE B

Run these before declaring Phase B done:

```bash
# Type check
npx tsc --noEmit

# Build check
npm run build

# Verify all pages render (dev mode)
npm run dev
# Visit: / /services /gallery /blog /about /contact /quote
```

**Checklist:**
- [ ] Navbar transparent on hero, dark on scroll — works on all pages
- [ ] Hero parallax effect fires on desktop
- [ ] Services cards hover animation works
- [ ] Gallery masonry renders correctly on 3 screen sizes
- [ ] Lightbox opens, closes with ESC, navigates prev/next
- [ ] Testimonials auto-advance every 6s, dots work as manual nav
- [ ] Quote form submits, creates DB record, shows success state
- [ ] Newsletter footer subscribe works
- [ ] All pages have correct `metadata` exports
- [ ] `next/image` used everywhere (no `<img>` tags)
- [ ] No TypeScript errors
- [ ] Mobile: hamburger menu opens, all nav links work, hero text readable
- [ ] `npm run build` completes with zero errors

---

*Phase C (Admin Dashboard with live auth, sidebar, enquiry CRM, booking calendar, content management) is the next chunk once Phase B passes build.*
