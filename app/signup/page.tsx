"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUp } from "./actions";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) setError(result.error);
      if (result?.success) setSuccess(result.success);
    });
  }

  if (success) {
    return (
      <div className="grain relative min-h-screen flex flex-col items-center justify-center px-4 bg-ink">
        <div className="orb pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber/[0.05] blur-3xl" />
        <div className="rise relative w-full max-w-sm rounded-2xl border border-moss/40 bg-ink-card p-10 shadow-2xl shadow-black/40 text-center">
          <div className="w-14 h-14 rounded-full bg-moss/20 border border-moss/30 grid place-items-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#7fae4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-medium mb-2">Check your email</h2>
          <p className="text-paper-dim text-sm leading-relaxed">
            We sent a confirmation link to your inbox. Click it to activate your account and get started.
          </p>
          <p className="text-paper-faint text-xs mt-2">
            Can&apos;t see it? Check your spam or junk folder.
          </p>
          <Link href="/login" className="mt-8 block text-sm text-amber hover:text-paper transition-colors">
            Back to sign in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grain relative min-h-screen flex flex-col items-center justify-center px-4 bg-ink">
      <div className="orb pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber/[0.05] blur-3xl" />

      <Link href="/" className="relative mb-10 font-display text-xl font-medium tracking-tight text-paper hover:text-amber transition-colors">
        Sellganise
      </Link>

      <div className="rise relative w-full max-w-sm rounded-2xl border border-line bg-ink-card p-8 shadow-2xl shadow-black/40">
        <h1 className="font-display text-2xl font-medium tracking-tight mb-1">Create your account</h1>
        <p className="text-sm text-paper-dim mb-7">Free forever. 50 items included.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="full_name" className="text-xs font-medium text-paper-dim uppercase tracking-wider">
              Your name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jack Smith"
              className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:border-amber/60 focus:ring-1 focus:ring-amber/30 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-paper-dim uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:border-amber/60 focus:ring-1 focus:ring-amber/30 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-paper-dim uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              minLength={8}
              className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:border-amber/60 focus:ring-1 focus:ring-amber/30 transition-colors"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rust/30 bg-rust/10 px-4 py-2.5 text-sm text-rust">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn-shine mt-1 w-full rounded-xl bg-amber py-3 text-sm font-medium text-ink hover:bg-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating account…" : "Create free account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="flex-1 h-px bg-line" />
          <span className="text-xs text-paper-faint">or</span>
          <span className="flex-1 h-px bg-line" />
        </div>

        <p className="text-center text-sm text-paper-dim">
          Already have an account?{" "}
          <Link href="/login" className="text-amber hover:text-paper transition-colors font-medium">
            Log in
          </Link>
        </p>
      </div>

      <p className="relative mt-8 text-xs text-paper-faint text-center max-w-xs leading-relaxed">
        By signing up you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-paper-dim transition-colors">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-paper-dim transition-colors">Privacy Policy</Link>.
      </p>
    </div>
  );
}
