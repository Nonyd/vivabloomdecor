import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ivory px-6 pb-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl italic text-onyx">Privacy Policy</h1>
        <p className="mt-8 font-body leading-relaxed text-charcoal">
          This policy will be updated to reflect Australian Privacy Principles and how Vivabloom Decor collects,
          uses, and stores personal information submitted through this website.
        </p>
      </div>
    </main>
  );
}
