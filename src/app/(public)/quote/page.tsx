import type { Metadata } from "next";
import QuotePageClient from "./QuotePageClient";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Tell us about your event and we'll craft a personalised proposal for you.",
  alternates: { canonical: "https://vivabloomdecor.com.au/quote" },
};

export default function QuotePage() {
  return <QuotePageClient />;
}
