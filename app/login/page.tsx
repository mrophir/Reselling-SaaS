"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, forgotPassword } from "./actions";
import { signUp } from "../signup/actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(
    searchParams.get("mode") === "signup" ? "signup" : searchParams.get("error") === "reset_failed" ? "forgot" : "signin"
  );
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "reset_failed"
      ? "Reset link is invalid or has expired. Please request a new one below."
      : searchParams.get("error") === "confirmation_failed"
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
      const action = mode === "signin" ? signIn : mode === "signup" ? signUp : forgotPassword;
      const result = await action(formData);
      if (result?.error) setError(result.error);
      if (result && "success" in result && result.success) setSuccess(result.success);
    });
  }

  return (
    <div className="rise relative w-full max-w-sm rounded-2xl border border-line bg-ink-card p-8 shadow-2xl shadow-black/40">
      <h1 className="font-display text-2xl font-medium tracking-tight mb-1">
        {mode === "signin" ? "Welcome back" : mode === "signup" ? "Get started free" : "Reset password"}
      </h1>
      <p className="text-sm text-paper-dim mb-7">
        {mode === "signin"
          ? "Log in to your Sellganise account."
          : mode === "signup"
          ? "50 items free forever."
          : "Enter your email and we'll send you a reset link."}
      </p>

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

        {mode !== "forgot" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-medium text-paper-dim uppercase tracking-wider">
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(null); setSuccess(null); }}
                  className="text-xs text-paper-faint hover:text-amber transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
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
        )}

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
            ? mode === "signin" ? "Signing in…" : mode === "signup" ? "Creating account…" : "Sending…"
            : mode === "signin" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="flex-1 h-px bg-line" />
        <span className="text-xs text-paper-faint">or</span>
        <span className="flex-1 h-px bg-line" />
      </div>

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
            <button
              onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
              className="text-amber hover:text-paper transition-colors font-medium"
            >
              Back to log in
            </button>
          </>
        )}
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grain relative min-h-screen flex flex-col items-center justify-center px-4 bg-ink">
      <div className="orb pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber/[0.05] blur-3xl" />
      <Link href="/" className="relative mb-10 font-display text-xl font-medium tracking-tight text-paper hover:text-amber transition-colors">
        Sellganise
      </Link>
      <Suspense fallback={<div className="w-full max-w-sm h-96 rounded-2xl border border-line bg-ink-card animate-pulse" />}>
        <LoginForm />
      </Suspense>
      <p className="relative mt-8 text-xs text-paper-faint text-center max-w-xs leading-relaxed">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-paper-dim transition-colors">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-paper-dim transition-colors">Privacy Policy</Link>.
      </p>
    </div>
  );
}
