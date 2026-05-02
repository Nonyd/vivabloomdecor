"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const session = await getSession();
    const role = session?.user?.role ?? "";
    if (["ADMIN", "SUPER_ADMIN", "STAFF"].includes(role)) {
      router.push("/admin");
    } else {
      router.push("/client");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0F0E0C] flex">
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"
          alt="Vivabloom event décor"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-[#0F0E0C]/60" />
        <div className="absolute bottom-16 left-16 right-16">
          <p className="font-display italic text-white text-[48px] leading-tight">
            Where Every
            <br />
            Moment Becomes
            <br />
            <span className="text-[#C9A96E]">a Memory.</span>
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="font-accent text-[#C9A96E] text-3xl tracking-wider block mb-16"
          >
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
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/60 transition-colors"
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
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 text-white font-body text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/60 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm font-body">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A96E] text-[#0F0E0C] font-body text-[12px] uppercase tracking-[0.2em] py-4 rounded-lg hover:bg-[#E8D5B0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-white/20 text-xs font-body text-center mt-12">
            © 2026 Vivabloom Decor
          </p>
        </div>
      </div>
    </div>
  );
}
