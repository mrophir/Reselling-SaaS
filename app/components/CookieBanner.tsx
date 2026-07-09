"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "sellganise-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {}
  }, []);

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch {}
    setVisible(false);
  }

  function decline() {
    try { localStorage.setItem(STORAGE_KEY, "necessary"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[60] md:bottom-4 md:left-auto md:right-4 md:inset-x-auto"
    >
      <div className="bg-ink-card border border-line md:rounded-2xl shadow-2xl shadow-black/50 px-5 py-4 md:max-w-sm">
        <p className="text-xs font-mono uppercase tracking-[0.14em] text-amber mb-2">Cookies</p>
        <p className="text-sm text-paper-dim leading-relaxed mb-4">
          We use essential cookies to keep you signed in. We don&apos;t track you or sell your data.{" "}
          <Link href="/privacy" className="text-amber hover:underline underline-offset-2">
            Privacy policy
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            onClick={accept}
            className="flex-1 py-2 rounded-xl bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors"
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="flex-1 py-2 rounded-xl border border-line text-paper-dim text-sm font-medium hover:text-paper hover:border-paper-faint transition-colors"
          >
            Necessary only
          </button>
        </div>
      </div>
    </div>
  );
}
