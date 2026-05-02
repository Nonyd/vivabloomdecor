# Vivabloom — Phase C: Admin Dashboard
## Auth · Middleware · Sidebar · Enquiry CRM · Bookings · Content Management · Invoices · Media · Settings

> Phase A + B complete. Design tokens, Prisma schema, and full public site are live.
> This phase builds the entire protected admin system.
> Canonical domain: **vivabloomdecor.com.au** (no www) — use this string everywhere.
> Auth: **email + password only** (CredentialsProvider, bcrypt).
> Blog editor: **Tiptap**.

---

## DOMAIN FIX — apply before anything else

In **`src/app/layout.tsx`** update `metadataBase`:
```ts
metadataBase: new URL('https://vivabloomdecor.com.au'),
```

In **`src/app/sitemap.ts`** replace any `www.vivabloomdecor.com.au` with `vivabloomdecor.com.au`.

In **`src/app/(public)/page.tsx`** JSON-LD, set `"url": "https://vivabloomdecor.com.au"`.

---

## C-1 — DEPENDENCIES

```bash
npm install bcryptjs @types/bcryptjs
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
npm install @tiptap/extension-character-count @tiptap/extension-underline
npm install @tiptap/extension-text-align @tiptap/extension-highlight
npm install react-day-picker date-fns
npm install @react-pdf/renderer
npm install qrcode @types/qrcode
npm install react-dropzone
npm install recharts
npm install sonner
```

---

## C-2 — AUTH (`src/lib/auth.ts`)

```ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        if (!['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(user.role)) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id   = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).id  = token.id
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
```

### `src/app/api/auth/[...nextauth]/route.ts`
```ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Extend types (`src/types/next-auth.d.ts`)
```ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id:   string
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:   string
    role: string
  }
}
```

---

## C-3 — MIDDLEWARE (`src/middleware.ts`)

```ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role as string | undefined

    // Admin routes require ADMIN or SUPER_ADMIN or STAFF
    if (pathname.startsWith('/admin')) {
      if (!role || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(role)) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Client portal requires any authenticated user
    if (pathname.startsWith('/client')) {
      if (!role) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/client/:path*'],
}
```

---

## C-4 — SEED SCRIPT (`prisma/seed.ts`)

Creates the first SUPER_ADMIN so the admin panel is accessible immediately.

```ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('Vivabloom2025!', 12)

  await prisma.user.upsert({
    where: { email: 'admin@vivabloomdecor.com.au' },
    update: {},
    create: {
      email:    'admin@vivabloomdecor.com.au',
      name:     'Vivabloom Admin',
      password,
      role:     'SUPER_ADMIN',
    },
  })

  console.log('✓ Seed complete — admin@vivabloomdecor.com.au / Vivabloom2025!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

Run: `npx prisma db seed`

---

## C-5 — LOGIN PAGE (`src/app/(auth)/login/page.tsx`)

**Client component.** Dark, elegant — matches the brand.

```tsx
'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0E0C] flex">
      {/* Left: decorative image panel — hidden on mobile */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"
          alt="Vivabloom event décor"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0F0E0C]/60" />
        <div className="absolute bottom-16 left-16 right-16">
          <p className="font-display italic text-white text-[48px] leading-tight">
            Where Every<br />Moment Becomes<br />
            <span className="text-[#C9A96E]">a Memory.</span>
          </p>
        </div>
      </div>

      {/* Right: login form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="font-accent text-[#C9A96E] text-3xl tracking-wider block mb-16">
            Vivabloom
          </Link>

          <p className="eyebrow mb-3">Admin Portal</p>
          <h1 className="font-display italic text-white text-[40px] mb-10">Welcome back</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-white/40 font-body mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5
                           text-white font-body text-sm placeholder:text-white/20
                           focus:outline-none focus:border-[#C9A96E]/60 transition-colors"
                placeholder="admin@vivabloomdecor.com.au"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-white/40 font-body mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5
                           text-white font-body text-sm placeholder:text-white/20
                           focus:outline-none focus:border-[#C9A96E]/60 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-body">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase
                         tracking-[0.2em] py-4 rounded-lg hover:bg-[#E8D5B0] transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-white/20 text-xs font-body text-center mt-12">
            © 2025 Vivabloom Decor
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## C-6 — ADMIN LAYOUT (`src/app/admin/layout.tsx`)

**Server component** — reads session server-side.

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { Toaster } from 'sonner'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen bg-[#F8F5EE] overflow-hidden">
      <AdminSidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
```

---

## C-7 — ADMIN SIDEBAR (`src/components/admin/AdminSidebar.tsx`)

**Client component** (for active state + mobile toggle).

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, MessageSquare, Calendar, Users,
  FileText, Image, Star, Settings, Edit3,
  ChevronDown, LogOut, GalleryHorizontal, BookOpen,
  ShoppingBag, Ticket,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin',           label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { href: '/admin/enquiries', label: 'Enquiries',   icon: MessageSquare,   badge: true },
  { href: '/admin/bookings',  label: 'Bookings',    icon: Calendar },
  { href: '/admin/clients',   label: 'Clients',     icon: Users },
  { href: '/admin/invoices',  label: 'Invoices',    icon: FileText },
  {
    label: 'Content', icon: Edit3,
    children: [
      { href: '/admin/content/gallery',       label: 'Gallery',       icon: GalleryHorizontal },
      { href: '/admin/content/blog',          label: 'Blog Posts',    icon: BookOpen },
      { href: '/admin/content/testimonials',  label: 'Testimonials',  icon: Star },
    ],
  },
  { href: '/admin/media',    label: 'Media Library', icon: Image },
  { href: '/admin/settings', label: 'Settings',      icon: Settings },
]

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export default function AdminSidebar({ user }: Props) {
  const pathname  = usePathname()
  const [contentOpen, setContentOpen] = useState(
    pathname.startsWith('/admin/content')
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F0E0C] w-64 flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/5">
        <Link href="/" className="font-accent text-[#C9A96E] text-2xl tracking-wider">
          Vivabloom
        </Link>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-body mt-1">
          Admin Portal
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setContentOpen(!contentOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                             text-white/50 hover:text-white hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <item.icon size={16} />
                    <span className="font-body text-[13px]">{item.label}</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${contentOpen ? 'rotate-180' : ''}`} />
                </button>
                {contentOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/5 pl-3">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-body
                                    transition-all ${
                                      isActive(child.href)
                                        ? 'text-[#C9A96E] bg-[#C9A96E]/10'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}>
                        <child.icon size={14} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link key={item.href} href={item.href!}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-body
                          transition-all relative ${
                            isActive(item.href!, item.exact)
                              ? 'text-[#C9A96E] bg-[#C9A96E]/10'
                              : 'text-white/50 hover:text-white hover:bg-white/5'
                          }`}>
              {isActive(item.href!, item.exact) && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5
                                 bg-[#C9A96E] rounded-full" />
              )}
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-[#C9A96E]/20 flex items-center justify-center
                          text-[#C9A96E] text-sm font-body">
            {user.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-body truncate">{user.name}</p>
            <p className="text-white/30 text-[11px] font-body truncate">{user.email}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-white/30 hover:text-[#C9A96E] transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex">
        <SidebarContent />
      </div>

      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(true)}
              className="lg:hidden fixed top-4 left-4 z-50 bg-[#0F0E0C] p-2 rounded-lg text-white">
        ☰
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
```

---

## C-8 — ADMIN TOPBAR (`src/components/admin/AdminTopbar.tsx`)

```tsx
'use client'
import { usePathname } from 'next/navigation'

const pageTitles: Record<string, string> = {
  '/admin':                      'Dashboard',
  '/admin/enquiries':            'Enquiries',
  '/admin/bookings':             'Bookings',
  '/admin/clients':              'Clients',
  '/admin/invoices':             'Invoices',
  '/admin/content/gallery':      'Gallery',
  '/admin/content/blog':         'Blog Posts',
  '/admin/content/testimonials': 'Testimonials',
  '/admin/media':                'Media Library',
  '/admin/settings':             'Settings',
}

interface Props {
  user: { name?: string | null }
}

export default function AdminTopbar({ user }: Props) {
  const pathname = usePathname()
  const title = Object.entries(pageTitles)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([key]) => pathname.startsWith(key))?.[1] ?? 'Admin'

  return (
    <header className="h-16 bg-white border-b border-[#EDE8DC] flex items-center justify-between
                       px-6 lg:px-8 flex-shrink-0">
      <div>
        <h1 className="font-display italic text-[#0F0E0C] text-[22px]">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[12px] text-[#4A4843] font-body hidden sm:block">
          Welcome back, {user.name?.split(' ')[0]}
        </span>
      </div>
    </header>
  )
}
```

---

## C-9 — DASHBOARD HOME (`src/app/admin/page.tsx`)

**Server component** — live data fetched at render time.

```tsx
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Calendar, DollarSign, Clock } from 'lucide-react'
import EnquiryStatusBadge from '@/components/admin/EnquiryStatusBadge'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  const [newEnquiries, confirmedBookings, revenue, pendingInvoices, recentEnquiries, upcomingBookings] =
    await Promise.all([
      prisma.enquiry.count({ where: { status: 'NEW', createdAt: { gte: startOfWeek() } } }),
      prisma.booking.count({ where: { status: 'CONFIRMED', eventDate: { gte: startOfMonth() } } }),
      prisma.invoice.aggregate({
        where: { status: 'PAID', paidAt: { gte: startOfMonth() } },
        _sum: { amount: true },
      }),
      prisma.invoice.count({ where: { status: { in: ['SENT', 'OVERDUE'] } } }),
      prisma.enquiry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.booking.findMany({
        where: { eventDate: { gte: new Date() }, status: { not: 'CANCELLED' } },
        orderBy: { eventDate: 'asc' },
        take: 5,
        include: { user: { select: { name: true } } },
      }),
    ])

  const stats = [
    { label: 'New Enquiries', sublabel: 'This week',      value: newEnquiries,                         icon: MessageSquare, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Confirmed',     sublabel: 'This month',     value: confirmedBookings,                    icon: Calendar,      color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Revenue',       sublabel: 'This month',     value: `$${(revenue._sum.amount ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-[#C9A96E]', bg: 'bg-[#C9A96E]/10' },
    { label: 'Pending',       sublabel: 'Invoices due',   value: pendingInvoices,                      icon: Clock,         color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-8">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-[#EDE8DC]">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="font-display italic text-[#0F0E0C] text-[32px] leading-none">{stat.value}</p>
            <p className="font-body text-[13px] text-[#4A4843] mt-1">{stat.label}</p>
            <p className="font-body text-[11px] text-[#4A4843]/50 mt-0.5">{stat.sublabel}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* Recent enquiries */}
        <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8DC]">
            <h2 className="font-display italic text-[#0F0E0C] text-[20px]">Recent Enquiries</h2>
            <Link href="/admin/enquiries"
              className="text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] font-body hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#EDE8DC]">
            {recentEnquiries.map((enquiry) => (
              <Link key={enquiry.id} href={`/admin/enquiries?id=${enquiry.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8F5EE] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#C9A96E]/10 flex items-center justify-center
                                text-[#C9A96E] text-sm font-body flex-shrink-0">
                  {enquiry.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[14px] text-[#0F0E0C] truncate">{enquiry.name}</p>
                  <p className="font-body text-[12px] text-[#4A4843]/60 truncate">{enquiry.eventType}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <EnquiryStatusBadge status={enquiry.status} />
                  <p className="font-body text-[11px] text-[#4A4843]/40">
                    {formatDistanceToNow(enquiry.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming bookings */}
        <div className="bg-white rounded-2xl border border-[#EDE8DC] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8DC]">
            <h2 className="font-display italic text-[#0F0E0C] text-[20px]">Upcoming</h2>
            <Link href="/admin/bookings"
              className="text-[11px] uppercase tracking-[0.15em] text-[#C9A96E] font-body hover:underline">
              Calendar →
            </Link>
          </div>
          <div className="divide-y divide-[#EDE8DC]">
            {upcomingBookings.length === 0 && (
              <p className="px-6 py-8 text-center text-[#4A4843]/40 text-sm font-body">
                No upcoming bookings
              </p>
            )}
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#F8F5EE] rounded-xl p-2 text-center min-w-[48px]">
                    <p className="font-body text-[10px] uppercase tracking-wider text-[#C9A96E]">
                      {booking.eventDate.toLocaleString('en-AU', { month: 'short' })}
                    </p>
                    <p className="font-display italic text-[#0F0E0C] text-[22px] leading-none">
                      {booking.eventDate.getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-[14px] text-[#0F0E0C]">{booking.title}</p>
                    <p className="font-body text-[12px] text-[#4A4843]/60">{booking.eventType}</p>
                    {booking.user && (
                      <p className="font-body text-[11px] text-[#4A4843]/40 mt-0.5">{booking.user.name}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/content/blog/new', label: '+ New Blog Post' },
          { href: '/admin/content/gallery',  label: '+ Upload Gallery' },
          { href: '/admin/invoices/new',      label: '+ Create Invoice' },
          { href: '/admin/bookings/new',      label: '+ New Booking' },
        ].map((action) => (
          <Link key={action.href} href={action.href}
            className="bg-white border border-[#EDE8DC] rounded-xl px-4 py-3.5 text-center
                       font-body text-[12px] uppercase tracking-[0.15em] text-[#4A4843]
                       hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all">
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function startOfWeek() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}
function startOfMonth() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}
```

Create `src/components/admin/EnquiryStatusBadge.tsx`:
```tsx
const statusConfig = {
  NEW:       { label: 'New',       classes: 'bg-blue-50 text-blue-700' },
  IN_REVIEW: { label: 'In Review', classes: 'bg-amber-50 text-amber-700' },
  QUOTED:    { label: 'Quoted',    classes: 'bg-purple-50 text-purple-700' },
  BOOKED:    { label: 'Booked',    classes: 'bg-green-50 text-green-700' },
  CLOSED:    { label: 'Closed',    classes: 'bg-gray-100 text-gray-500' },
  SPAM:      { label: 'Spam',      classes: 'bg-red-50 text-red-600' },
}

export default function EnquiryStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.CLOSED
  return (
    <span className={`${config.classes} text-[10px] uppercase tracking-[0.15em] px-2 py-0.5
                      rounded-full font-body`}>
      {config.label}
    </span>
  )
}
```

---

## C-10 — ENQUIRIES PAGE (`src/app/admin/enquiries/page.tsx`)

**Server component** for initial data. **Client component** `EnquiriesClient` handles interactivity.

```tsx
// page.tsx (server)
import { prisma } from '@/lib/prisma'
import EnquiriesClient from '@/components/admin/EnquiriesClient'

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: { id?: string; status?: string }
}) {
  const statusFilter = searchParams.status as any
  const enquiries = await prisma.enquiry.findMany({
    where: statusFilter ? { status: statusFilter } : {},
    orderBy: { createdAt: 'desc' },
  })
  return <EnquiriesClient enquiries={enquiries} selectedId={searchParams.id} />
}
```

Create `src/components/admin/EnquiriesClient.tsx` as a **client component**:

### Layout
Two-pane on desktop: left = table, right = detail panel (slide in from right).
On mobile: table full width, detail opens as an overlay.

### Left pane — filter tabs
```tsx
const statuses = ['ALL', 'NEW', 'IN_REVIEW', 'QUOTED', 'BOOKED', 'CLOSED']
// Tab row — clicking filters the enquiries array client-side
```

### Table columns
`Name | Event Type | Event Date | Budget | Status | Created | Actions`

Each row:
- Click anywhere → sets selected enquiry → detail panel opens
- `Actions` column: `View` button

### Right pane — detail panel
When an enquiry is selected, show a slide-in panel (transform `translate-x-full → translate-x-0`, transition 300ms):

```tsx
<div className={`fixed lg:relative right-0 top-0 bottom-0 w-full lg:w-[420px] bg-white
                 border-l border-[#EDE8DC] overflow-y-auto transition-transform duration-300
                 ${selected ? 'translate-x-0' : 'translate-x-full lg:translate-x-full'}`}>

  {/* Header */}
  <div className="sticky top-0 bg-white border-b border-[#EDE8DC] px-6 py-4 flex justify-between">
    <h3 className="font-display italic text-[#0F0E0C] text-xl">{selected?.name}</h3>
    <button onClick={() => setSelected(null)}>✕</button>
  </div>

  {/* Details grid */}
  <div className="px-6 py-6 space-y-4">
    <DetailRow label="Email"      value={selected?.email} />
    <DetailRow label="Phone"      value={selected?.phone ?? '—'} />
    <DetailRow label="Event Type" value={selected?.eventType} />
    <DetailRow label="Event Date" value={selected?.eventDate?.toLocaleDateString('en-AU') ?? '—'} />
    <DetailRow label="Guests"     value={selected?.guestCount?.toString() ?? '—'} />
    <DetailRow label="Budget"     value={selected?.budget ?? '—'} />
    <DetailRow label="Received"   value={selected?.createdAt.toLocaleDateString('en-AU')} />
  </div>

  {/* Message */}
  <div className="px-6 pb-6">
    <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-body mb-2">Message</p>
    <p className="font-body text-[14px] text-[#4A4843] leading-relaxed bg-[#F8F5EE] rounded-xl p-4">
      {selected?.message}
    </p>
  </div>

  {/* Status updater */}
  <div className="px-6 pb-6">
    <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-body mb-2">Status</p>
    <select value={selected?.status} onChange={handleStatusChange}
      className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2.5 font-body text-sm
                 text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E] bg-white">
      {['NEW','IN_REVIEW','QUOTED','BOOKED','CLOSED','SPAM'].map(s => (
        <option key={s} value={s}>{s.replace('_', ' ')}</option>
      ))}
    </select>
  </div>

  {/* Admin notes */}
  <div className="px-6 pb-6">
    <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-body mb-2">Admin Notes</p>
    <textarea
      value={notes}
      onChange={e => setNotes(e.target.value)}
      onBlur={saveNotes}
      rows={4}
      placeholder="Internal notes (not visible to client)…"
      className="w-full border border-[#EDE8DC] rounded-lg px-3 py-2.5 font-body text-sm
                 text-[#0F0E0C] focus:outline-none focus:border-[#C9A96E] resize-none"
    />
    <p className="text-[11px] text-[#4A4843]/40 font-body mt-1">Auto-saves on blur</p>
  </div>

  {/* Action buttons */}
  <div className="px-6 pb-8 space-y-3">
    <button onClick={convertToBooking}
      className="w-full bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase
                 tracking-[0.15em] py-3 rounded-lg hover:bg-[#E8D5B0] transition-colors">
      Convert to Booking
    </button>
    <a href={`mailto:${selected?.email}?subject=Re: Your Vivabloom Enquiry&body=Hi ${selected?.name},`}
       className="block text-center border border-[#EDE8DC] text-[#4A4843] font-body text-[12px]
                  uppercase tracking-[0.15em] py-3 rounded-lg hover:border-[#C9A96E] hover:text-[#C9A96E]
                  transition-all">
      Email Client
    </a>
  </div>
</div>
```

### API routes needed:
```ts
// PATCH /api/enquiries/[id] — update status and/or notes
// POST  /api/enquiries/[id]/convert — create Booking from Enquiry, update status to BOOKED
```

---

## C-11 — BOOKINGS PAGE (`src/app/admin/bookings/page.tsx`)

Server + client component pair.

### View toggle (Calendar / List)
```tsx
const [view, setView] = useState<'list' | 'calendar'>('list')
```

### List view
Table: `Event | Client | Date | Venue | Status | Actions`
- Inline status dropdown
- Row → link to booking detail page `/admin/bookings/[id]`

### Calendar view
Build a simple monthly grid — no external calendar library needed:

```tsx
function CalendarView({ bookings }: { bookings: Booking[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Generate days in month grid
  // For each day cell: show a dot or booking title if booked
  // Clicking a day with bookings opens a popover listing them

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth}>←</button>
        <h3 className="font-display italic text-[#0F0E0C] text-2xl">
          {currentMonth.toLocaleString('en-AU', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={nextMonth}>→</button>
      </div>
      {/* Day grid — 7 columns */}
      <div className="grid grid-cols-7 gap-px bg-[#EDE8DC] rounded-xl overflow-hidden">
        {/* Day headers */}
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="bg-[#F8F5EE] py-2 text-center text-[11px] uppercase
                                   tracking-[0.15em] text-[#4A4843] font-body">{d}</div>
        ))}
        {/* Day cells */}
        {days.map((day, i) => {
          const dayBookings = bookings.filter(b =>
            b.eventDate.toDateString() === day?.toDateString()
          )
          return (
            <div key={i} className={`bg-white min-h-[80px] p-2 ${!day ? 'bg-[#F8F5EE]' : ''}`}>
              {day && (
                <>
                  <span className={`text-[13px] font-body ${
                    day.toDateString() === new Date().toDateString()
                      ? 'text-[#C9A96E] font-medium'
                      : 'text-[#4A4843]'
                  }`}>
                    {day.getDate()}
                  </span>
                  {dayBookings.map(b => (
                    <div key={b.id}
                         className="mt-1 bg-[#C9A96E]/10 text-[#C9A96E] text-[11px] rounded px-1.5 py-0.5
                                    font-body truncate cursor-pointer hover:bg-[#C9A96E]/20">
                      {b.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## C-12 — CONTENT: GALLERY (`src/app/admin/content/gallery/page.tsx`)

**Client component** with Cloudinary upload.

### Layout
- Top toolbar: `Upload Images` button (triggers Cloudinary upload widget)
- Grid: 4 columns, each card shows image + title + category + action icons

### Cloudinary upload
```tsx
import { CldUploadWidget } from 'next-cloudinary'

<CldUploadWidget
  uploadPreset="vivabloom_gallery"
  onUpload={async (result) => {
    const info = result.info as any
    await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:       info.original_filename,
        category:    'General',
        imageUrl:    info.secure_url,
        cloudinaryId: info.public_id,
      }),
    })
    // Refresh gallery list
  }}
>
  {({ open }) => (
    <button onClick={() => open()} className="...">Upload Images</button>
  )}
</CldUploadWidget>
```

### Gallery grid card
```tsx
<div className="relative group rounded-xl overflow-hidden border border-[#EDE8DC]">
  <Image src={item.imageUrl} alt={item.title} width={400} height={300} className="object-cover w-full aspect-square" />
  {/* Hover overlay with actions */}
  <div className="absolute inset-0 bg-[#0F0E0C]/70 opacity-0 group-hover:opacity-100
                  transition-opacity flex flex-col justify-end p-4">
    <input defaultValue={item.title}
           onBlur={e => updateTitle(item.id, e.target.value)}
           className="bg-transparent text-white font-body text-sm border-b border-white/30
                      focus:outline-none w-full mb-2" />
    <select defaultValue={item.category}
            onChange={e => updateCategory(item.id, e.target.value)}
            className="bg-transparent text-white/60 font-body text-xs focus:outline-none mb-3">
      {['Wedding', 'Corporate', 'Birthday', 'Floral', 'Balloon', 'General'].map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-white/60 font-body text-xs cursor-pointer">
        <input type="checkbox" checked={item.featured}
               onChange={e => updateFeatured(item.id, e.target.checked)} />
        Featured
      </label>
      <button onClick={() => deleteItem(item.id)}
              className="text-red-400 hover:text-red-300 font-body text-xs">Delete</button>
    </div>
  </div>
</div>
```

API routes needed:
```ts
POST   /api/gallery         — create GalleryItem (already built in Phase B)
PATCH  /api/gallery/[id]    — update title/category/featured/order
DELETE /api/gallery/[id]    — delete from DB + Cloudinary
```

---

## C-13 — CONTENT: BLOG (`src/app/admin/content/blog/page.tsx` + `new/page.tsx` + `[id]/page.tsx`)

### Blog list (`page.tsx`)
Table: `Title | Status | Created | Actions`
- `+ New Post` button → `/admin/content/blog/new`
- Each row: Edit → `/admin/content/blog/[id]`, toggle Published inline

### Blog editor (`new/page.tsx` + `[id]/page.tsx`)

**Client component.** Full Tiptap integration.

#### Install + configure Tiptap editor:
```tsx
'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'

function BlogEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your article…' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  return (
    <div className="border border-[#EDE8DC] rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-[#EDE8DC] flex-wrap">
        {/* Bold, Italic, Underline, Strikethrough */}
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()}
                       active={editor?.isActive('bold')} label="B" bold />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()}
                       active={editor?.isActive('italic')} label="I" italic />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()}
                       active={editor?.isActive('underline')} label="U" underline />
        <div className="w-px h-5 bg-[#EDE8DC] mx-1" />
        {/* H2, H3 */}
        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                       active={editor?.isActive('heading', { level: 2 })} label="H2" />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                       active={editor?.isActive('heading', { level: 3 })} label="H3" />
        <div className="w-px h-5 bg-[#EDE8DC] mx-1" />
        {/* Lists */}
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()}
                       active={editor?.isActive('bulletList')} label="• List" />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                       active={editor?.isActive('orderedList')} label="1. List" />
        {/* Blockquote */}
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                       active={editor?.isActive('blockquote')} label="" />
        <div className="w-px h-5 bg-[#EDE8DC] mx-1" />
        {/* Align */}
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('left').run()}   label="L" />
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('center').run()} label="C" />
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('right').run()}  label="R" />
      </div>
      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-lg max-w-none px-6 py-5 min-h-[400px] font-body
                   focus:outline-none [&_.ProseMirror]:outline-none
                   [&_.ProseMirror_h2]:font-display [&_.ProseMirror_h2]:italic
                   [&_.ProseMirror_h3]:font-display [&_.ProseMirror_h3]:italic"
      />
    </div>
  )
}

function ToolbarButton({ onClick, active, label, bold, italic, underline }:
  { onClick: () => void; active?: boolean; label: string; bold?: boolean; italic?: boolean; underline?: boolean }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded text-[13px] font-body transition-colors
                  ${active ? 'bg-[#C9A96E]/20 text-[#C9A96E]' : 'text-[#4A4843] hover:bg-[#F8F5EE]'}
                  ${bold ? 'font-bold' : ''} ${italic ? 'italic' : ''} ${underline ? 'underline' : ''}`}>
      {label}
    </button>
  )
}
```

#### Full blog post form layout:
```
┌─────────────────────────────┬──────────────────┐
│  Title input (full width)   │                  │
│  Slug (auto-generated)      │  Sidebar:        │
│  Tiptap editor              │  - Publish toggle│
│                             │  - Cover image   │
│  Excerpt textarea           │  - Tags input    │
│                             │  - Meta title    │
│                             │  - Meta desc     │
│                             │  - Save / Publish│
└─────────────────────────────┴──────────────────┘
```

Slug auto-generation:
```ts
const slug = title.toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim()
```

On submit: POST/PATCH `/api/blog` with full form data. Redirect to blog list on save.

---

## C-14 — CONTENT: TESTIMONIALS (`src/app/admin/content/testimonials/page.tsx`)

Simple table + inline controls.

```tsx
// Fetch all testimonials (approved or not)
const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
```

Table: `Name | Role | Rating | Approved | Featured | Date | Actions`

Each row:
- Approved toggle: `PATCH /api/testimonials/[id]` with `{ approved: boolean }`
- Featured toggle: same
- Delete button: `DELETE /api/testimonials/[id]`
- View full quote: expand row or tooltip

Add a manual "Add Testimonial" button → modal form with: name, role, rating (1–5 stars selector), content (textarea), image URL optional.

---

## C-15 — INVOICES (`src/app/admin/invoices/page.tsx` + `new/page.tsx`)

### Invoice list
Table: `Invoice # | Client | Amount | Status | Due Date | Actions`

Status badge colours:
- DRAFT: gray, SENT: blue, PAID: green, OVERDUE: red, CANCELLED: gray

### New invoice form (`/admin/invoices/new/page.tsx`)

Client component:
```tsx
// State
const [lineItems, setLineItems] = useState([
  { description: '', quantity: 1, unitPrice: 0 }
])

// Dynamic total
const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
```

Form fields:
- Select client (from User list with CLIENT role, or free-text name/email if no account)
- Select linked booking (optional dropdown)
- Due date picker (`react-day-picker`)
- Line items table: Description | Qty | Unit Price | Total | [Delete row]
- `+ Add Line Item` button
- Notes textarea
- Total display (champagne, large)
- Actions: `Save as Draft` | `Save & Send`

On `Save & Send`:
1. POST `/api/invoices` → creates Invoice record
2. Generates PDF (server action using `@react-pdf/renderer`)
3. Emails PDF to client via Resend

### Invoice PDF (`src/lib/invoice-pdf.tsx`)

```tsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Branded A4 invoice PDF
export function InvoicePDF({ invoice, client, lineItems }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Vivabloom</Text>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
          </View>
        </View>
        {/* Client + dates */}
        {/* Line items table */}
        {/* Total */}
        {/* Footer */}
      </Page>
    </Document>
  )
}
```

---

## C-16 — MEDIA LIBRARY (`src/app/admin/media/page.tsx`)

Client component.

- Grid of all Cloudinary assets stored in `GalleryItem` table
- Upload new via `CldUploadWidget`
- Each asset: thumbnail, filename, copy URL button, delete button
- Filter: All | Images | Documents
- Search by filename

---

## C-17 — SETTINGS (`src/app/admin/settings/page.tsx`)

Tabbed interface — client component.

### Tab 1: General
Fields stored in `SiteSettings` table (key/value):
- Business Name, Tagline
- Phone, Email, Address
- Instagram URL, Facebook URL, TikTok URL, Pinterest URL
- ABN

Save: PATCH `/api/settings` — upserts all keys in one transaction.

### Tab 2: SEO
- Default Meta Title (template: `%s | Vivabloom`)
- Default Meta Description
- OG Image (upload via Cloudinary)

### Tab 3: Email
- Admin notification email address (where enquiry alerts go)
- `Test Email` button → POST `/api/settings/test-email` → sends a test via Resend

### Tab 4: Team
Table of all ADMIN/STAFF/SUPER_ADMIN users: Name | Email | Role | Joined | Actions

`Invite User` button → modal:
- Email input
- Role selector (ADMIN | STAFF)
- `Send Invite` → creates user record with random temp password, emails them credentials

Change password form (for logged-in user's own password):
- Current password | New password | Confirm
- PATCH `/api/users/me/password`

---

## C-18 — REMAINING API ROUTES

### `PATCH /api/enquiries/[id]`
```ts
// Update status and/or notes
const { status, notes } = await req.json()
await prisma.enquiry.update({ where: { id }, data: { status, notes } })
```

### `POST /api/enquiries/[id]/convert`
```ts
// Convert enquiry to booking
const enquiry = await prisma.enquiry.findUnique({ where: { id } })
const booking = await prisma.booking.create({
  data: {
    title:     `${enquiry.eventType} — ${enquiry.name}`,
    eventDate: enquiry.eventDate ?? new Date(),
    eventType: enquiry.eventType,
    status:    'PENDING',
  },
})
await prisma.enquiry.update({ where: { id }, data: { status: 'BOOKED' } })
return NextResponse.json({ bookingId: booking.id })
```

### `GET/POST/PATCH/DELETE /api/gallery/[id]`
Full CRUD. DELETE: also delete from Cloudinary using `cloudinary.uploader.destroy(item.cloudinaryId)`.

### `GET/POST /api/blog` + `PATCH/DELETE /api/blog/[id]`
Full CRUD for blog posts.

### `GET/POST /api/testimonials` + `PATCH/DELETE /api/testimonials/[id]`
Full CRUD.

### `GET/POST /api/invoices` + `PATCH /api/invoices/[id]`
Create, list, update status. PDF generation as server action.

### `GET/POST /api/bookings` + `PATCH /api/bookings/[id]`
Full CRUD for bookings.

### `GET/PATCH /api/settings`
```ts
// GET: return all SiteSettings as { key: value } object
// PATCH: upsert multiple settings in a transaction
const entries = Object.entries(body) // { businessName: 'Vivabloom', phone: '...' }
await prisma.$transaction(
  entries.map(([key, value]) =>
    prisma.siteSettings.upsert({
      where:  { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  )
)
```

### `PATCH /api/users/me/password`
```ts
const session = await getServerSession(authOptions)
const { currentPassword, newPassword } = await req.json()
const user = await prisma.user.findUnique({ where: { id: session.user.id } })
const valid = await bcrypt.compare(currentPassword, user.password!)
if (!valid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
const hashed = await bcrypt.hash(newPassword, 12)
await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
```

---

## C-19 — TOAST NOTIFICATIONS

Use `sonner` throughout admin (already in layout):

```tsx
import { toast } from 'sonner'

// Success
toast.success('Enquiry status updated')

// Error
toast.error('Failed to save. Please try again.')

// Promise-based (shows loading → success/error automatically)
toast.promise(savePost(), {
  loading: 'Saving post…',
  success: 'Post saved!',
  error:   'Failed to save post',
})
```

---

## C-20 — SHARED ADMIN UI COMPONENTS

Create these reusable components in `src/components/admin/ui/`:

### `AdminCard.tsx`
```tsx
export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#EDE8DC] ${className ?? ''}`}>
      {children}
    </div>
  )
}
```

### `AdminTable.tsx`
```tsx
// Generic table wrapper with consistent styling
// thead: bg-[#F8F5EE], font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843]
// tbody rows: hover:bg-[#F8F5EE], divide-y divide-[#EDE8DC]
// td: font-body text-[14px] text-[#0F0E0C] px-6 py-4
```

### `AdminModal.tsx`
```tsx
// Radix Dialog wrapper with consistent admin styling
// Dark backdrop, white modal, max-w-lg
```

### `StatCard.tsx`
```tsx
// Used on dashboard — icon + big number + label + sublabel
```

---

## C-21 — CLIENT PORTAL (`src/app/client/page.tsx`)

Simple protected view for booked clients.

```tsx
export default async function ClientPortal() {
  const session = await getServerSession(authOptions)
  const bookings = await prisma.booking.findMany({
    where: { userId: session!.user.id },
    include: { invoices: true },
    orderBy: { eventDate: 'desc' },
  })

  return (
    <div className="min-h-screen bg-[#F8F5EE] p-6">
      <h1 className="font-display italic text-[#0F0E0C] text-[48px] mb-8">My Events</h1>
      {bookings.map(booking => (
        <div key={booking.id} className="bg-white rounded-2xl p-6 mb-4 border border-[#EDE8DC]">
          <h2 className="font-display italic text-[#0F0E0C] text-2xl">{booking.title}</h2>
          <p className="font-body text-[#4A4843] mt-1">
            {booking.eventDate.toLocaleDateString('en-AU', { dateStyle: 'full' })}
          </p>
          {/* Invoice download links */}
          {booking.invoices.map(inv => (
            <a key={inv.id} href={`/api/invoices/${inv.id}/pdf`}
               className="champagne-outline-btn inline-block mt-4 text-sm">
              Download Invoice #{inv.number}
            </a>
          ))}
        </div>
      ))}
    </div>
  )
}
```

---

## C-22 — FINAL CHECKS

```bash
npx tsc --noEmit
npm run lint
npm run build
```

**Checklist:**
- [ ] `/login` — can sign in with seeded credentials
- [ ] Redirects to `/admin` dashboard after login
- [ ] `/admin/enquiries` — loads, detail panel opens on row click, status updates save
- [ ] Notes auto-save on blur (PATCH fires, toast confirms)
- [ ] `Convert to Booking` creates booking, status → BOOKED
- [ ] `/admin/bookings` — list + calendar both render, calendar shows booked dates
- [ ] `/admin/content/gallery` — images load, upload widget opens, delete works
- [ ] `/admin/content/blog/new` — Tiptap loads, slug auto-generates from title, saves
- [ ] `/admin/content/testimonials` — approve/featured toggles save
- [ ] `/admin/invoices/new` — line items add/remove, total calculates, save creates DB record
- [ ] `/admin/settings` — general tab saves, test email fires
- [ ] `/client` — logged-in client sees their bookings only
- [ ] Unauthenticated visit to `/admin` → redirects to `/login`
- [ ] Sidebar active state correct on all routes
- [ ] Mobile: sidebar hamburger opens/closes, all admin pages readable on 375px
- [ ] `sonner` toasts appear on all save operations
- [ ] `npm run build` completes with zero errors

---

*Phase D (GSAP polish, scroll animations across all public pages, mobile audit, full SEO pass, email template styling, performance optimisation) is next once Phase C passes build.*
