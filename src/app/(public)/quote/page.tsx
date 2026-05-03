import type { Metadata } from "next";
import QuotePageClient from "./QuotePageClient";
import { getPageContent, get } from "@/lib/content";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Tell us about your event and we'll craft a personalised proposal for you.",
  alternates: { canonical: "https://vivabloomdecor.com.au/quote" },
};

export default async function QuotePage() {
  const content = await getPageContent("quote");
  return (
    <QuotePageClient
      heroHeadline={get(content, "hero", "headline", "Request a Quote")}
      heroSubheadline={get(
        content,
        "hero",
        "subheadline",
        "Tell us about your event and we'll craft a personalised proposal just for you."
      )}
    />
  );
}
