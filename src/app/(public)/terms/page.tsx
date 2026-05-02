import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-ivory px-6 pb-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl italic text-onyx">Terms of use</h1>
        <p className="mt-8 font-body leading-relaxed text-charcoal">
          Terms governing use of this website and engagement with Vivabloom Decor services will be published here.
        </p>
      </div>
    </main>
  );
}
