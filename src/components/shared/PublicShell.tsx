import type { ReactNode } from "react";

type PublicShellProps = {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  /** Dark hero-style band at top (adds top padding for fixed navbar) */
  variant?: "ivory" | "dark-hero";
};

export function PublicShell({ title, eyebrow, children, variant = "ivory" }: PublicShellProps) {
  if (variant === "dark-hero") {
    return (
      <main className="min-h-[50vh] bg-ivory pt-20">
        <div className="flex min-h-[40vh] flex-col justify-center bg-onyx px-[5%] py-16 text-center">
          {eyebrow ? <p className="eyebrow-light mb-4">{eyebrow}</p> : null}
          <h1 className="font-display text-5xl italic text-white md:text-6xl">{title}</h1>
        </div>
        <div className="mx-auto max-w-3xl px-6 py-16">{children}</div>
      </main>
    );
  }

  return (
    <main className="min-h-[50vh] bg-ivory px-6 pb-24 pt-28">
      <div className="mx-auto max-w-3xl">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h1 className="font-display text-4xl font-medium italic text-onyx md:text-5xl">{title}</h1>
        {children}
      </div>
    </main>
  );
}
