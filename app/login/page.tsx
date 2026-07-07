"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signUp } from "./actions";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "signin"
  );
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "confirmation_failed"
      ? "Confirmation link is invalid or has expired. Please try signing up again."
      : null
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const action = mode === "signin" ? signIn : signUp;
      const result = await action(formData);
      if (result?.error) setError(result.error);
      if (result && "success" in result && result.success) setSuccess(result.success);
    });
  }

  return (
    <div className="grain relative min-h-screen flex flex-col items-center justify-center px-4 bg-ink">
      {/* ambient glow */}
      <div className="orb pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber/[0.05] blur-3xl" />

      {/* logo */}
      <Link href="/" className="relative mb-10 font-display text-xl font-medium tracking-tight text-paper hover:text-amber transition-colors">
        Sellganise
      </Link>

      {/* card */}
      <div className="rise relative w-full max-w-sm rounded-2xl border border-line bg-ink-card p-8 shadow-2xl shadow-black/40">

        {/* heading */}
        <h1 className="font-display text-2xl font-medium tracking-tight mb-1">
          {mode === "signin" ? "Welcome back" : "Get started free"}
        </h1>
        <p className="text-sm text-paper-dim mb-7">
          {mode === "signin"
            ? "Sign in to your Sellganise account."
            : "No card needed. 50 items free forever."}
        </p>

        {/* form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder={mode === "signup" ? "Min. 8 characters" : "••••••••"}
              minLength={mode === "signup" ? 8 : undefined}
              className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:border-amber/60 focus:ring-1 focus:ring-amber/30 transition-colors"
            />
          </div>

          {/* error / success */}
          {error && (
            <p className="rounded-lg border border-rust/30 bg-rust/10 px-4 py-2.5 text-sm text-rust">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-moss/30 bg-moss/10 px-4 py-2.5 text-sm text-moss">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn-shine mt-1 w-full rounded-xl bg-amber py-3 text-sm font-medium text-ink hover:bg-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending
              ? mode === "signin" ? "Signing in…" : "Creating account…"
              : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* divider */}
        <div className="my-6 flex items-center gap-3">
          <span className="flex-1 h-px bg-line" />
          <span className="text-xs text-paper-faint">or</span>
          <span className="flex-1 h-px bg-line" />
        </div>

        {/* mode toggle */}
        <p className="text-center text-sm text-paper-dim">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
                className="text-amber hover:text-paper transition-colors font-medium"
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
                className="text-amber hover:text-paper transition-colors font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      {/* footer */}
      <p className="relative mt-8 text-xs text-paper-faint text-center max-w-xs leading-relaxed">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-paper-dim transition-colors">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-paper-dim transition-colors">Privacy Policy</Link>.
      </p>
    </div>
  );
}
