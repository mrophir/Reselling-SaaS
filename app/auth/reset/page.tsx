"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    startTransition(async () => {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) { setError(error.message); return; }
      router.push("/dashboard");
    });
  }

  return (
    <div className="grain relative min-h-screen flex flex-col items-center justify-center px-4 bg-ink">
      <div className="orb pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber/[0.05] blur-3xl" />
      <Link href="/" className="relative mb-10 font-display text-xl font-medium tracking-tight text-paper hover:text-amber transition-colors">
        Sellganise
      </Link>
      <div className="rise relative w-full max-w-sm rounded-2xl border border-line bg-ink-card p-8 shadow-2xl shadow-black/40">
        <h1 className="font-display text-2xl font-medium tracking-tight mb-1">Set new password</h1>
        <p className="text-sm text-paper-dim mb-7">Choose a strong password for your account.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-paper-dim uppercase tracking-wider">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:border-amber/60 focus:ring-1 focus:ring-amber/30 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-paper-dim uppercase tracking-wider">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:border-amber/60 focus:ring-1 focus:ring-amber/30 transition-colors"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-rust/30 bg-rust/10 px-4 py-2.5 text-sm text-rust">{error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="btn-shine mt-1 w-full rounded-xl bg-amber py-3 text-sm font-medium text-ink hover:bg-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving…" : "Set new password"}
          </button>
        </form>
      </div>
    </div>
  );
}
