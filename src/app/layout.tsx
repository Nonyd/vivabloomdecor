import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import {
  Cormorant_Garamond,
  DM_Sans,
  Italiana,
} from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-italiana",
  display: "swap",
});

const siteUrl = "https://vivabloomdecor.com.au";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vivabloom | Luxury Event & Wedding Décor — Melbourne, Australia",
    template: "%s | Vivabloom",
  },
  description:
    "Australia's premier luxury event and wedding décor studio. Floral design, balloon artistry, full styling & production. Based in Melbourne, serving Australia-wide.",
  keywords: [
    "luxury event decor",
    "wedding decor melbourne",
    "event styling australia",
    "floral design",
    "balloon artistry",
    "vivabloom",
  ],
  authors: [{ name: "Vivabloom Decor", url: siteUrl }],
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: siteUrl,
    siteName: "Vivabloom",
    title: "Vivabloom | Luxury Event & Wedding Décor",
    description:
      "Australia's premier luxury event décor studio. Melbourne-based, Australia-wide.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vivabloom Luxury Event Décor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vivabloom | Luxury Event & Wedding Décor",
    description: "Australia's premier luxury event décor studio.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${cormorant.variable} ${dmSans.variable} ${italiana.variable}`}
    >
      <body
        className={`min-h-screen bg-ivory font-body text-charcoal ${dmSans.className}`}
      >
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
