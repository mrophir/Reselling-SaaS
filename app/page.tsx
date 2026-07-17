"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getTier, formatItemCap, type TierKey, type FeatureFlag } from "../lib/tiers";
import { ThemeToggle } from "./components/ThemeToggle";

/* ---------- small helpers ---------- */

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); ob.disconnect(); } },
      { threshold }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [threshold]);
  return { ref, seen };
}

function Counter({ to, prefix = "", duration = 1400 }: { to: number; prefix?: string; duration?: number }) {
  const { ref, seen } = useInView<HTMLSpanElement>(0.5);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}</span>;
}

function useTypewriter(text: string, startDelay = 0, speed = 52) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let cancelled = false;
    function go(fn: () => void, delay: number) {
      setTimeout(() => { if (!cancelled) fn(); }, delay);
    }
    function tick(i: number) {
      setDisplayed(text.slice(0, i));
      if (i < text.length) go(() => tick(i + 1), speed);
      else setDone(true);
    }
    go(() => tick(1), startDelay);
    return () => { cancelled = true; };
  }, []); // text/startDelay/speed are literals — safe to exclude
  return { displayed, done };
}

function useCyclingTypewriter(
  phrases: string[],
  startDelay = 0,
  typeSpeed = 55,
  deleteSpeed = 30,
  pauseAfterType = 1800,
  pauseAfterDelete = 400
) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function go(fn: () => void, delay: number) {
      setTimeout(() => { if (!cancelled) fn(); }, delay);
    }

    function type(pi: number, ci: number) {
      const phrase = phrases[pi];
      const next = ci + 1;
      setDisplayed(phrase.slice(0, next));
      if (next < phrase.length) {
        go(() => type(pi, next), typeSpeed);
      } else {
        go(() => erase(pi, next), pauseAfterType);
      }
    }

    function erase(pi: number, ci: number) {
      const next = ci - 1;
      setDisplayed(phrases[pi].slice(0, next));
      if (next > 0) {
        go(() => erase(pi, next), deleteSpeed);
      } else {
        go(() => type((pi + 1) % phrases.length, 0), pauseAfterDelete);
      }
    }

    go(() => { setStarted(true); type(0, 0); }, startDelay);

    return () => { cancelled = true; };
  }, []); // phrases/speeds are literals — safe to exclude

  return { displayed, started };
}

/* ---------- nav ---------- */

const NAV_LINKS = [
  { href: "#problem",    label: "The problem"   },
  { href: "#features",  label: "Features"       },
  { href: "#who",       label: "Who it's for"   },
  { href: "#vs",        label: "vs Spreadsheet" },
  { href: "#case-study",label: "Case study"     },
  { href: "#cta",       label: "Pricing"        },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-500 ${
        scrolled || menuOpen
          ? "border-line/70 bg-ink/95 backdrop-blur-md shadow-lg shadow-black/25"
          : "border-transparent bg-ink/30 backdrop-blur-sm"
      }`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <a href="#top" className="flex items-center gap-2.5 shrink-0">
            <span className="font-display text-[17px] font-medium tracking-tight">Sellganise</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm text-paper-dim">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-paper transition-colors">{l.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href="/login" className="hidden md:block text-sm font-medium px-3 py-2 rounded-lg text-paper-dim hover:text-paper transition-colors shrink-0">
              Log in
            </a>
            <a href="/signup" className="btn-shine text-sm font-medium px-3 py-2 rounded-lg bg-amber text-ink hover:bg-paper transition-colors shrink-0">
              Sign up free
            </a>
            <ThemeToggle />
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden grid place-items-center w-10 h-10 rounded-lg text-paper-dim hover:text-paper hover:bg-ink-card transition-colors"
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute top-16 inset-x-0 bg-ink border-b border-line" onClick={(e) => e.stopPropagation()}>
            <nav className="flex flex-col px-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href} href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center py-4 text-[15px] text-paper-dim hover:text-paper border-b border-line-soft last:border-b-0 transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="px-4 py-4 flex flex-col gap-2">
              <a href="/signup" onClick={() => setMenuOpen(false)} className="block w-full text-center py-3.5 rounded-xl bg-amber text-ink font-medium text-sm hover:bg-paper transition-colors">
                Sign up free
              </a>
              <a href="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2.5 rounded-xl border border-line text-paper font-medium text-sm hover:border-paper-faint transition-colors">
                Log in
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- hero ---------- */

const STORAGE_BINS = [
  { id: "A1", items: 4, value: 112, unlisted: 1, names: ["North Face Puffer", "Carhartt Beanie", "Ralph Lauren Shirt", "Champion Hoodie"] },
  { id: "A2", items: 3, value: 67,  unlisted: 0, names: ["Levi 501 Jeans", "Carhartt Work Shirt", "Dickies Trousers"] },
  { id: "A3", items: 5, value: 189, unlisted: 2, names: ["Nike Air Max 90", "Adidas Tracksuit", "Puma Hoodie", "New Balance 550s", "Reebok Classic"] },
  { id: "B1", items: 2, value: 83,  unlisted: 0, names: ["Burberry Scarf", "Tommy Hilfiger Jacket"] },
  { id: "B2", items: 0, value: 0,   unlisted: 0, names: [] },
  { id: "B3", items: 6, value: 244, unlisted: 1, names: ["Stone Island Jumper", "CP Company Goggle", "Barbour Wax Jacket", "Wrangler Denim", "Lee Cooper Jeans", "Carhartt WIP"] },
  { id: "C1", items: 1, value: 22,  unlisted: 1, names: ["Adidas Gazelle"] },
  { id: "C2", items: 3, value: 97,  unlisted: 0, names: ["Levi Trucker Jacket", "Wrangler Shirt", "Lee Carpenter Pant"] },
  { id: "C3", items: 2, value: 58,  unlisted: 0, names: ["Timberland Boots", "Dr Martens 1460"] },
] as const;

function Hero() {
  const L2_PHRASES = [
    "Stock Management Just Got Easier",
    "Making Resellers More Profitable",
    "Manage Your Stock, Make More Profit",
    "The Reseller Software Built for the UK",
  ];

  const { displayed: t2 } = useCyclingTypewriter(
    L2_PHRASES, 480, 80, 42, 3000, 600
  );

  return (
    <section id="top" className="grain bg-ink relative overflow-hidden pt-28 pb-0 md:pt-36 md:pb-0 px-6">
      {/* radial spotlight glow — mimics the Tarss cone effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-[1000px] h-[700px]"
          style={{ background: "radial-gradient(ellipse 55% 60% at 50% 10%, rgba(240,160,32,0.14) 0%, rgba(240,160,32,0.05) 45%, transparent 75%)" }} />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] h-[600px]"
          style={{ background: "radial-gradient(ellipse 50% 50% at 50% 0%, rgba(240,160,32,0.06) 0%, transparent 70%)" }} />
      </div>

      {/* ── 3-col grid: [sold card] [text] [bin card] ── */}
      <div className="relative mx-auto max-w-7xl pb-14 md:pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_200px] gap-6 items-center">

          {/* left — sold card */}
          <div className="hidden xl:flex justify-end rise" style={{ animationDelay: "0.5s" }}>
            <div style={{ background: "#161410", border: "1px solid #2a2722", borderRadius: 14, padding: "12px 14px", width: 200, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(127,174,74,0.15)", border: "1px solid rgba(127,174,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7fae4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#f5f1e8" }}>Just sold</div>
                  <div style={{ fontSize: 10, color: "#6f6a5e" }}>Vinted · 2 mins ago</div>
                </div>
                <div style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: "#7fae4a", boxShadow: "0 0 6px #7fae4a" }} />
              </div>
              <div style={{ borderTop: "1px solid #2a2722", paddingTop: 8 }}>
                <div style={{ fontSize: 11, color: "#b8b1a3", marginBottom: 4 }}>Nike Air Max 90</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#6f6a5e" }}>Paid £45 · Sold £89</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "#7fae4a" }}>+£44</span>
                </div>
              </div>
            </div>
          </div>

          {/* centre — text */}
          <div className="text-center">
            {/* eyebrow pill */}
            <div className="rise inline-flex items-center gap-2 rounded-full border border-line bg-ink-card/80 px-4 py-2 mb-8 md:mb-10 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" style={{ animation: "blink 1.6s infinite" }} />
              <span className="text-paper-dim">Reseller stock management software — built for UK sellers</span>
            </div>

            {/* typewriter headline */}
            <h1 className="font-display font-medium leading-[1.05] md:leading-[0.97] tracking-tight text-[clamp(2.2rem,5.5vw,4.2rem)] min-h-[2.3em] md:min-h-[2em]">
              <span className="text-amber">
                {t2}
                <span className="cursor-blink inline-block w-[3px] h-[0.82em] bg-amber rounded-sm align-middle ml-1 translate-y-[-0.05em]" />
              </span>
            </h1>

            {/* subtext */}
            <p className="rise mt-6 md:mt-7 text-base md:text-lg text-paper-dim max-w-xl mx-auto leading-relaxed" style={{ animationDelay: "0.12s" }}>
              Sellganise is reseller inventory management software that gives you a live view of everything you own, exactly where it&apos;s stored, and what you&apos;re actually making across Vinted, eBay, Depop and Facebook.
            </p>

            {/* CTA */}
            <div className="rise mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3" style={{ animationDelay: "0.17s" }}>
              <a href="/signup" className="btn-shine w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber text-ink font-semibold text-base hover:bg-paper transition-colors">
                Start for free
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <a href="#vs" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-line text-paper hover:border-paper-faint hover:-translate-y-0.5 transition-all duration-200 text-base">
                Why not a spreadsheet?
              </a>
            </div>

            {/* trust */}
            <p className="rise mt-4 text-xs text-paper-faint" style={{ animationDelay: "0.21s" }}>
              Free plan available &nbsp;·&nbsp; Cancel anytime
            </p>
          </div>

          {/* right — bin card */}
          <div className="hidden xl:flex justify-start rise" style={{ animationDelay: "0.6s" }}>
            <div style={{ background: "#161410", border: "1px solid #2a2722", borderRadius: 14, padding: "12px 14px", width: 180, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 28, borderRadius: 7, background: "rgba(240,160,32,0.12)", border: "1px solid rgba(240,160,32,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#f0a020" }}>B3</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#f5f1e8" }}>Storage</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div style={{ background: "#0e0d0b", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f5f1e8", fontFamily: "monospace" }}>6</div>
                  <div style={{ fontSize: 9, color: "#6f6a5e", marginTop: 1 }}>items</div>
                </div>
                <div style={{ background: "#0e0d0b", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#7fae4a", fontFamily: "monospace" }}>£244</div>
                  <div style={{ fontSize: 9, color: "#6f6a5e", marginTop: 1 }}>value</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── storage map dashboard preview ── */}
      <div className="rise relative max-w-5xl mx-auto" style={{ animationDelay: "0.35s" }}>
        <div style={{ perspective: "1600px" }}>
          <div
            className="rounded-t-2xl border border-b-0 border-line/40 overflow-hidden shadow-[0_-16px_80px_rgba(0,0,0,0.75)]"
            style={{ transform: "rotateX(6deg) scale(0.975)", transformOrigin: "center bottom" }}
          >
            {/* Mobile */}
            <div className="md:hidden py-6 flex justify-center" style={{ background: "var(--color-ink)" }}>
              <PhoneMockup />
            </div>

            {/* Desktop — storage map */}
            <div className="hidden md:flex" style={{ background: "#0a0908", height: 460, fontFamily: "Inter, system-ui, sans-serif" }}>
              {/* sidebar */}
              <div style={{ width: 180, background: "#0e0d0b", borderRight: "1px solid #1e1c18", display: "flex", flexDirection: "column", flexShrink: 0, padding: "14px 0" }}>
                <div style={{ padding: "0 14px 18px" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f1e8", letterSpacing: "-0.02em" }}>Sellganise</span>
                </div>
                {[
                  { l: "Overview",        active: false },
                  { l: "Stock",           active: false },
                  { l: "Storage map",     active: true  },
                  { l: "Calculator",      active: false },
                  { l: "Monthly archives",active: false },
                ].map((n) => (
                  <div key={n.l} style={{ padding: "7px 10px", margin: "1px 6px", borderRadius: 7, background: n.active ? "#1a1815" : "transparent", display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: n.active ? "#f0a020" : "#2a2722", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: n.active ? "#f5f1e8" : "#6f6a5e", fontWeight: n.active ? 500 : 400 }}>{n.l}</span>
                  </div>
                ))}
              </div>

              {/* main */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* topbar */}
                <div style={{ height: 46, borderBottom: "1px solid #1e1c18", display: "flex", alignItems: "center", padding: "0 18px", gap: 10, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f5f1e8", letterSpacing: "-0.01em" }}>Storage map</div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <div style={{ padding: "4px 10px", background: "#f0a020", borderRadius: 6, fontSize: 10, fontWeight: 600, color: "#0a0908" }}>+ New storage</div>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#161410", border: "1px solid #2a2722", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, color: "#b8b1a3", fontWeight: 500 }}>JT</span>
                    </div>
                  </div>
                </div>

                {/* summary bar */}
                <div style={{ padding: "10px 18px", borderBottom: "1px solid #1e1c18", display: "flex", gap: 12, flexShrink: 0 }}>
                  {[
                    { l: "Total locations", v: "9" },
                    { l: "Total items", v: "26" },
                    { l: "Total value", v: "£872" },
                    { l: "Unlisted value", v: "£243", warn: true },
                  ].map((s) => (
                    <div key={s.l} style={{ background: "#161410", border: `1px solid ${s.warn ? "rgba(240,160,32,0.3)" : "#2a2722"}`, borderRadius: 8, padding: "6px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
                      <div style={{ fontSize: 9, color: "#6f6a5e" }}>{s.l}</div>
                      <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 600, color: s.warn ? "#f0a020" : "#f5f1e8" }}>{s.v}</div>
                    </div>
                  ))}
                </div>

                {/* bin grid */}
                <div style={{ flex: 1, padding: "14px 18px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, overflowY: "auto" }}>
                  {STORAGE_BINS.map((bin) => {
                    const empty = bin.items === 0;
                    const hasUnlisted = bin.unlisted > 0;
                    return (
                      <div key={bin.id} style={{
                        background: empty ? "#0e0d0b" : "#161410",
                        border: `1px solid ${hasUnlisted ? "rgba(240,160,32,0.35)" : empty ? "#1a1815" : "#2a2722"}`,
                        borderRadius: 10,
                        padding: "10px 12px",
                        opacity: empty ? 0.45 : 1,
                        position: "relative",
                        overflow: "hidden",
                      }}>
                        {hasUnlisted && (
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #f0a020, transparent)" }} />
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <div style={{ width: 36, height: 26, borderRadius: 6, background: hasUnlisted ? "rgba(240,160,32,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${hasUnlisted ? "rgba(240,160,32,0.3)" : "#2a2722"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: hasUnlisted ? "#f0a020" : "#b8b1a3" }}>{bin.id}</span>
                          </div>
                          {hasUnlisted && (
                            <span style={{ fontSize: 9, background: "rgba(240,160,32,0.12)", color: "#f0a020", border: "1px solid rgba(240,160,32,0.25)", borderRadius: 4, padding: "2px 5px", fontWeight: 500 }}>
                              {bin.unlisted} unlisted
                            </span>
                          )}
                        </div>
                        {empty ? (
                          <div style={{ fontSize: 10, color: "#3a3730", textAlign: "center", padding: "4px 0" }}>empty</div>
                        ) : (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontSize: 10, color: "#6f6a5e" }}>{bin.items} item{bin.items !== 1 ? "s" : ""}</span>
                              <span style={{ fontSize: 10, fontFamily: "monospace", color: "#7fae4a", fontWeight: 600 }}>£{bin.value}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              {bin.names.slice(0, 2).map((name) => (
                                <div key={name} style={{ fontSize: 9, color: "#4a4640", background: "#0e0d0b", borderRadius: 4, padding: "2px 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                              ))}
                              {bin.names.length > 2 && (
                                <div style={{ fontSize: 9, color: "#3a3730", padding: "0 6px" }}>+{bin.names.length - 2} more</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function CondDot({ t }: { t: string }) {
  const map: Record<string, string> = {
    excellent: "bg-moss", good: "bg-amber", fair: "bg-rust", flawed: "bg-rust",
  };
  return <span className={`shrink-0 w-2 h-2 rounded-full ${map[t] ?? "bg-paper-faint"}`} title={t} />;
}

/* ---------- dashboard mockup ---------- */

const MOCK_ITEMS = [
  { name: "North Face Puffer",     cond: "excellent", stage: "listed",   platform: "Vinted", age: 3,  paid: 22, bin: "A1" },
  { name: "Levi 501 Jeans",        cond: "good",      stage: "listed",   platform: "eBay",   age: 12, paid: 8,  bin: "B3" },
  { name: "Carhartt Beanie",       cond: "good",      stage: "listed",   platform: "Depop",  age: 3,  paid: 5,  bin: "A2" },
  { name: "Nike Air Max 90",       cond: "fair",      stage: "listed",   platform: "eBay",   age: 28, paid: 45, bin: "C1" },
  { name: "Ralph Lauren Shirt",    cond: "excellent", stage: "listed",   platform: "Vinted", age: 8,  paid: 12, bin: "A3" },
  { name: "Tommy Hilfiger Jacket", cond: "good",      stage: "listed",   platform: "Depop",  age: 19, paid: 28, bin: "B1" },
  { name: "Burberry Scarf",        cond: "excellent", stage: "listed",   platform: "eBay",   age: 5,  paid: 55, bin: "D2" },
  { name: "Champion Hoodie",       cond: "good",      stage: "listed",   platform: "Vinted", age: 2,  paid: 9,  bin: "A4" },
  { name: "Stone Island Jumper",   cond: "fair",      stage: "unlisted", platform: "",       age: 45, paid: 35, bin: ""   },
  { name: "Adidas Tracksuit",      cond: "good",      stage: "unlisted", platform: "",       age: 32, paid: 18, bin: ""   },
] as const;

const COND_DOT: Record<string, string> = {
  excellent: "#7fae4a", good: "#f0a020", fair: "#d8602f",
};

function AgeBadge({ age }: { age: number }) {
  const [cls, col] = age <= 15
    ? ["rgba(127,174,74,0.15)", "#7fae4a"]
    : age <= 30
    ? ["rgba(240,160,32,0.15)", "#f0a020"]
    : ["rgba(216,96,47,0.15)", "#d8602f"];
  return (
    <span style={{ background: cls, color: col, border: `1px solid ${col}40`, borderRadius: 4, padding: "1px 5px", fontSize: 10, fontFamily: "monospace", whiteSpace: "nowrap" }}>
      {age}d
    </span>
  );
}

function MockItemRow({ item }: { item: typeof MOCK_ITEMS[number] }) {
  const dot = COND_DOT[item.cond] ?? "#6f6a5e";
  const stageColor = item.stage === "listed" ? "#7fae4a" : "#f0a020";
  const stageBg    = item.stage === "listed" ? "rgba(127,174,74,0.1)" : "rgba(240,160,32,0.1)";
  const stageBdr   = item.stage === "listed" ? "rgba(127,174,74,0.25)" : "rgba(240,160,32,0.25)";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderTop: "1px solid #211e1a", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#f5f1e8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{item.name}</span>
        <AgeBadge age={item.age} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {item.bin && <span style={{ fontSize: 11, color: "#6f6a5e", fontFamily: "monospace" }}>{item.bin}</span>}
        {item.platform && <span style={{ fontSize: 11, color: "#b8b1a3", fontFamily: "monospace" }}>{item.platform}</span>}
        <span style={{ background: stageBg, color: stageColor, border: `1px solid ${stageBdr}`, borderRadius: 5, padding: "2px 7px", fontSize: 10, fontWeight: 500, whiteSpace: "nowrap" }}>
          {item.stage === "listed" ? "Listed" : "Not listed"}
        </span>
        <span style={{ fontSize: 11, color: "#b8b1a3", fontFamily: "monospace" }}>£{item.paid}</span>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="flex justify-center">
      {/* phone shell */}
      <div style={{ width: 288, background: "#181614", borderRadius: 46, padding: 10, boxShadow: "0 32px 72px rgba(0,0,0,0.85), 0 0 0 1px #2a2722, inset 0 0 0 1px #3a3530", position: "relative" }}>
        {/* screen */}
        <div style={{ background: "#0e0d0b", borderRadius: 38, overflow: "hidden", display: "flex", flexDirection: "column", height: 576, fontFamily: "Inter, system-ui, sans-serif" }}>
          {/* dynamic island */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 6, flexShrink: 0 }}>
            <div style={{ width: 92, height: 28, background: "#0a0908", borderRadius: 18 }} />
          </div>
          {/* app header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 16px 10px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: "#f5f1e8", letterSpacing: "-0.02em" }}>Sellganise</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ position: "relative", width: 34, height: 34, borderRadius: 10, background: "#1a1815", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#b8b1a3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#f0a020", border: "1.5px solid #0e0d0b" }} />
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f0a020", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0e0d0b" strokeWidth="2.5" strokeLinecap="round" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
            </div>
          </div>
          {/* content */}
          <div style={{ flex: 1, padding: "0 12px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 9 }}>
            {/* alert banner */}
            <div style={{ background: "rgba(240,160,32,0.08)", border: "1px solid rgba(240,160,32,0.28)", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 14, color: "#f0a020", fontFamily: "monospace", fontWeight: 700 }}>£243 not listed</div>
                <div style={{ fontSize: 11, color: "#b8b1a3", marginTop: 2 }}>2 items sitting idle</div>
              </div>
              <div style={{ background: "#f0a020", color: "#0e0d0b", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700 }}>Clear</div>
            </div>
            {/* 2×2 stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, flexShrink: 0 }}>
              {[
                { l: "Listed",   v: "8",      c: "#f5f1e8" },
                { l: "Unlisted", v: "2",      c: "#f0a020" },
                { l: "Sold",     v: "3",      c: "#f5f1e8" },
                { l: "Profit",   v: "£127.50", c: "#7fae4a" },
              ].map((s) => (
                <div key={s.l} style={{ background: "#161410", border: "1px solid #2a2722", borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "#6f6a5e", marginBottom: 3 }}>{s.l}</div>
                  <div style={{ fontSize: 15, color: s.c, fontFamily: "monospace", fontWeight: 600 }}>{s.v}</div>
                </div>
              ))}
            </div>
            {/* stage tabs */}
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              {([["unlisted · 2", false], ["listed · 8", true], ["sold · 3", false]] as const).map(([label, active]) => (
                <div key={label} style={{ padding: "5px 9px", borderRadius: 7, fontSize: 11, fontWeight: active ? 500 : 400, color: active ? "#f5f1e8" : "#6f6a5e", background: active ? "#211e1a" : "transparent", border: `1px solid ${active ? "#2a2722" : "transparent"}`, whiteSpace: "nowrap" }}>
                  {label}
                </div>
              ))}
            </div>
            {/* item list */}
            <div style={{ background: "#161410", border: "1px solid #2a2722", borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
              {MOCK_ITEMS.slice(0, 5).map((it, i) => {
                const dot = COND_DOT[it.cond] ?? "#6f6a5e";
                return (
                  <div key={it.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderTop: i === 0 ? "none" : "1px solid #211e1a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#f5f1e8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{it.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ background: it.stage === "listed" ? "rgba(127,174,74,0.1)" : "rgba(240,160,32,0.1)", color: it.stage === "listed" ? "#7fae4a" : "#f0a020", border: `1px solid ${it.stage === "listed" ? "rgba(127,174,74,0.25)" : "rgba(240,160,32,0.25)"}`, borderRadius: 5, padding: "2px 6px", fontSize: 9, fontWeight: 500 }}>
                        {it.stage === "listed" ? "Listed" : "Unlisted"}
                      </span>
                      <span style={{ fontSize: 10, color: "#6f6a5e", fontFamily: "monospace" }}>£{it.paid}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* bottom nav */}
          <div style={{ height: 62, borderTop: "1px solid #211e1a", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 10px", flexShrink: 0, marginTop: 8 }}>
            {[
              { label: "Overview", active: true,  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
              { label: "Stock",    active: false, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/></svg> },
              { label: "Storage",  active: false, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/><rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/></svg> },
              { label: "Calc",     active: false, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="14" x2="8" y2="18"/><line x1="16" y1="14" x2="16" y2="18"/></svg> },
              { label: "Archives", active: false, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
            ].map((n) => (
              <div key={n.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: n.active ? "#f0a020" : "#6f6a5e" }}>
                {n.icon}
                <span style={{ fontSize: 9, fontWeight: n.active ? 600 : 400 }}>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* side buttons */}
        <div style={{ position: "absolute", left: -3, top: 92, width: 3, height: 26, background: "#2a2722", borderRadius: "3px 0 0 3px" }} />
        <div style={{ position: "absolute", left: -3, top: 126, width: 3, height: 26, background: "#2a2722", borderRadius: "3px 0 0 3px" }} />
        <div style={{ position: "absolute", right: -3, top: 110, width: 3, height: 42, background: "#2a2722", borderRadius: "0 3px 3px 0" }} />
      </div>
    </div>
  );
}

function DashboardMockup() {
  const INNER_W = 1120;
  const INNER_H = 610;
  const SCREEN_W = 900;
  const scale = SCREEN_W / INNER_W;
  const screenH = Math.round(INNER_H * scale);

  const navItems = [
    { label: "Overview",         active: false },
    { label: "Stock",            active: false },
    { label: "Storage map",      active: false },
    { label: "Calculator",       active: false },
    { label: "Monthly archives", active: true  },
  ];

  const MONTH_BARS = [
    { label: "Apr", profit: 84,  pct: 39 },
    { label: "May", profit: 112, pct: 53 },
    { label: "Jun", profit: 156, pct: 73 },
    { label: "Jul", profit: 213, pct: 100 },
  ];

  const JULY_SALES = [
    { name: "Stone Island Jumper",  platform: "Vinted", paid: 35,  sold: 95,  profit: 60,  margin: 63 },
    { name: "CP Company Goggle",    platform: "Depop",  paid: 48,  sold: 120, profit: 72,  margin: 60 },
    { name: "North Face Puffer",    platform: "eBay",   paid: 22,  sold: 55,  profit: 33,  margin: 60 },
    { name: "Nike Air Max 90",      platform: "eBay",   paid: 45,  sold: 89,  profit: 44,  margin: 49 },
    { name: "Levi 501 Jeans",       platform: "Vinted", paid: 8,   sold: 32,  profit: 24,  margin: 75 },
    { name: "Carhartt Beanie",      platform: "Depop",  paid: 5,   sold: 18,  profit: 13,  margin: 72 },
    { name: "Barbour Wax Jacket",   platform: "eBay",   paid: 55,  sold: 110, profit: 55,  margin: 50 },
    { name: "Ralph Lauren Shirt",   platform: "Vinted", paid: 12,  sold: 24,  profit: 12,  margin: 50 },
  ];

  return (
    <section className="px-6 py-12 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="fade">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-amber mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              See it in action
            </div>
            <h2 className="font-display font-medium text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight tracking-tight">
              Every sale logged. Every penny tracked.<br className="hidden sm:block" /> Ready for tax in one click.
            </h2>
          </div>
        </Reveal>

        {/* Mobile: archives card */}
        <div className="md:hidden">
          <Reveal>
            <div className="rounded-2xl border border-line bg-ink-card overflow-hidden">
              {/* month header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <div>
                  <p className="text-xs font-mono text-amber uppercase tracking-wider mb-1">July 2026</p>
                  <p className="text-2xl font-display font-medium text-moss">+£213.00</p>
                  <p className="text-xs text-paper-faint mt-0.5">net profit · 8 items sold</p>
                </div>
                <div className="text-right space-y-1.5">
                  <div><span className="text-xs text-paper-faint">Revenue</span><span className="text-sm font-mono text-paper ml-2">£438</span></div>
                  <div><span className="text-xs text-paper-faint">Cost</span><span className="text-sm font-mono text-rust ml-2">−£225</span></div>
                  <div><span className="text-xs text-paper-faint">Margin</span><span className="text-sm font-mono text-moss ml-2">49%</span></div>
                </div>
              </div>
              {/* bar chart */}
              <div className="px-5 py-4 border-b border-line">
                <p className="text-[10px] font-mono uppercase tracking-wider text-paper-faint mb-3">Monthly profit</p>
                <div className="flex items-end gap-2 h-14">
                  {MONTH_BARS.map((m) => (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-moss">£{m.profit}</span>
                      <div className="w-full rounded-t-sm" style={{ height: `${m.pct}%`, background: m.label === "Jul" ? "#7fae4a" : "#2a2722" }} />
                      <span className="text-[9px] text-paper-faint">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* sold items */}
              <div className="divide-y divide-line">
                {JULY_SALES.slice(0, 4).map((r) => (
                  <div key={r.name} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-paper truncate">{r.name}</p>
                      <p className="text-xs text-paper-faint">{r.platform} · paid £{r.paid}</p>
                    </div>
                    <span className="font-mono text-moss shrink-0 ml-4">+£{r.profit}</span>
                  </div>
                ))}
                <div className="px-5 py-3 text-center">
                  <span className="text-xs text-paper-faint">+ 4 more sales this month</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Desktop: laptop frame */}
        <Reveal>
          <div className="hidden md:block mx-auto" style={{ maxWidth: 980 }}>
            <div className="rounded-2xl shadow-2xl shadow-black/70" style={{ background: "#0a0908", border: "10px solid #1a1815", padding: "10px 10px 6px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#211e1a" }} />
              </div>
              <div style={{ overflow: "hidden", borderRadius: 8, height: screenH, background: "#0e0d0b", position: "relative" }}>
                <div style={{ width: INNER_W, height: INNER_H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0, display: "flex", fontFamily: "Inter, system-ui, sans-serif" }}>

                  {/* sidebar */}
                  <div style={{ width: 192, background: "#0e0d0b", borderRight: "1px solid #2a2722", display: "flex", flexDirection: "column", flexShrink: 0, padding: "16px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 20px" }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#f5f1e8", letterSpacing: "-0.02em" }}>Sellganise</span>
                    </div>
                    {navItems.map((n) => (
                      <div key={n.label} style={{ padding: "8px 12px", margin: "1px 8px", borderRadius: 8, background: n.active ? "#1a1815" : "transparent", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: n.active ? "#f0a020" : "#2a2722" }} />
                        <span style={{ fontSize: 12, color: n.active ? "#f5f1e8" : "#6f6a5e", fontWeight: n.active ? 500 : 400 }}>{n.label}</span>
                      </div>
                    ))}
                    <div style={{ flex: 1 }} />
                    <div style={{ margin: "0 8px", padding: "10px 12px", borderRadius: 8, border: "1px solid #2a2722", background: "#161410" }}>
                      <div style={{ fontSize: 10, color: "#6f6a5e", fontFamily: "monospace", marginBottom: 4 }}>RESELLER PLAN</div>
                      <div style={{ height: 4, borderRadius: 2, background: "#2a2722", overflow: "hidden" }}>
                        <div style={{ width: "38%", height: "100%", background: "#f0a020", borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#b8b1a3", marginTop: 4 }}>190 / 500 items</div>
                    </div>
                  </div>

                  {/* main */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0e0d0b", overflow: "hidden" }}>
                    {/* topbar */}
                    <div style={{ height: 52, borderBottom: "1px solid #2a2722", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f5f1e8", letterSpacing: "-0.01em" }}>Monthly archives</div>
                      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ padding: "4px 10px", background: "#f0a020", borderRadius: 6, fontSize: 10, fontWeight: 600, color: "#0a0908" }}>Export CSV</div>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#161410", border: "1px solid #2a2722", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 10, color: "#b8b1a3", fontWeight: 500 }}>JT</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1, padding: "14px 20px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>

                      {/* month tabs */}
                      <div style={{ display: "flex", gap: 4 }}>
                        {["Apr 2026", "May 2026", "Jun 2026", "Jul 2026"].map((m) => {
                          const active = m === "Jul 2026";
                          return (
                            <div key={m} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: active ? 500 : 400, color: active ? "#f5f1e8" : "#6f6a5e", background: active ? "#1a1815" : "transparent", border: `1px solid ${active ? "#2a2722" : "transparent"}`, whiteSpace: "nowrap" }}>
                              {m}
                            </div>
                          );
                        })}
                      </div>

                      {/* summary + bar chart row */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 10 }}>
                        {/* stat cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                          {[
                            { l: "Revenue",    v: "£438",  c: "#f5f1e8" },
                            { l: "Stock cost", v: "£225",  c: "#d8602f" },
                            { l: "Net profit", v: "£213",  c: "#7fae4a" },
                            { l: "Avg margin", v: "59%",   c: "#7fae4a" },
                          ].map((s) => (
                            <div key={s.l} style={{ background: "#161410", border: `1px solid ${s.l === "Net profit" ? "rgba(127,174,74,0.3)" : "#2a2722"}`, borderRadius: 10, padding: "8px 10px" }}>
                              <div style={{ fontSize: 9, color: "#6f6a5e", marginBottom: 4 }}>{s.l}</div>
                              <div style={{ fontSize: 16, color: s.c, fontFamily: "monospace", fontWeight: 600 }}>{s.v}</div>
                            </div>
                          ))}
                        </div>
                        {/* mini bar chart */}
                        <div style={{ background: "#161410", border: "1px solid #2a2722", borderRadius: 10, padding: "8px 12px" }}>
                          <div style={{ fontSize: 9, color: "#6f6a5e", marginBottom: 8 }}>PROFIT TREND</div>
                          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 44 }}>
                            {MONTH_BARS.map((m) => (
                              <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", width: "100%" }}>
                                  <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: m.label === "Jul" ? "#7fae4a" : "#2a2722", height: `${m.pct}%` }} />
                                </div>
                                <span style={{ fontSize: 8, color: m.label === "Jul" ? "#7fae4a" : "#4a4640", fontFamily: "monospace" }}>{m.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* sold items table */}
                      <div style={{ background: "#161410", border: "1px solid #2a2722", borderRadius: 12, overflow: "hidden", flex: 1 }}>
                        {/* table header */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 60px 60px 60px 60px", gap: 0, padding: "7px 14px", borderBottom: "1px solid #211e1a" }}>
                          {["Item", "Platform", "Paid", "Sold", "Profit", "Margin"].map((h) => (
                            <div key={h} style={{ fontSize: 9, color: "#4a4640", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
                          ))}
                        </div>
                        {/* rows */}
                        {JULY_SALES.map((r, i) => (
                          <div key={r.name} style={{ display: "grid", gridTemplateColumns: "1fr 80px 60px 60px 60px 60px", padding: "7px 14px", borderTop: i === 0 ? "none" : "1px solid #1a1815", alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "#f5f1e8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{r.name}</span>
                            <span style={{ fontSize: 10, color: "#b8b1a3", fontFamily: "monospace" }}>{r.platform}</span>
                            <span style={{ fontSize: 10, color: "#6f6a5e", fontFamily: "monospace" }}>£{r.paid}</span>
                            <span style={{ fontSize: 10, color: "#b8b1a3", fontFamily: "monospace" }}>£{r.sold}</span>
                            <span style={{ fontSize: 11, color: "#7fae4a", fontFamily: "monospace", fontWeight: 500 }}>+£{r.profit}</span>
                            <span style={{ fontSize: 10, color: "#7fae4a", fontFamily: "monospace" }}>{r.margin}%</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* stand */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: 120, height: 20, background: "#1a1815" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: 220, height: 10, background: "#1a1815", borderRadius: "0 0 12px 12px" }} />
            </div>
          </div>
        </Reveal>
        </div>
    </section>
  );
}

/* ---------- platform logos ---------- */

const PLATFORM_LOGOS: Record<string, { path: string; color: string }> = {
  "Vinted": {
    color: "#09B1BA",
    path: "M19.316 0c-.258 0-.571.217-1.415.953-.3.108-.627.027-1.008.613-2.15 3.09-3.825 14.648-5.255 17.984-.286-1.444-.885-10.837-1.116-13.41-.028-.477.027-1.076.027-1.43 0-2.368-.516-3.567-2.886-3.567-1.198 0-2.382.436-3.008 1.226-.299.408-.409.708-.409 1.443 0 4.915 1.171 12.973 2.478 18.228C7.132 23.688 8.603 24 9.99 24c.654 0 1.307-.081 2.233-.544 3.212-1.567 4.07-5.84 4.9-9.993.15-.749.899-4.37 1.253-6.275.476-2.6 1.02-5.54 1.347-6.617C19.833.245 19.63 0 19.317 0z",
  },
  "eBay": {
    color: "#E53238",
    path: "M6.056 12.132v-4.92h1.2v3.026c.59-.703 1.402-.906 2.202-.906 1.34 0 2.828.904 2.828 2.855 0 .233-.015.457-.06.668.24-.953 1.274-1.305 2.896-1.344.51-.018 1.095-.018 1.56-.018v-.135c0-.885-.556-1.244-1.53-1.244-.72 0-1.245.3-1.305.81h-1.275c.136-1.29 1.5-1.62 2.686-1.62 1.064 0 1.995.27 2.415 1.02l-.436-.84h1.41l2.055 4.125 2.055-4.126H24l-3.72 7.305h-1.346l1.07-2.04-2.33-4.38c.13.255.2.555.2.93v2.46c0 .346.01.69.04 1.005H16.8a6.543 6.543 0 01-.046-.765c-.603.734-1.32.96-2.32.96-1.48 0-2.272-.78-2.272-1.695 0-.15.015-.284.037-.405-.3 1.246-1.36 2.086-2.767 2.086-.87 0-1.694-.315-2.2-.93 0 .24-.015.494-.04.734h-1.18c.02-.39.04-.855.04-1.245v-1.05h-4.83c.065 1.095.818 1.74 1.853 1.74.718 0 1.355-.3 1.568-.93h1.24c-.24 1.29-1.61 1.725-2.79 1.725C.95 15.009 0 13.822 0 12.232c0-1.754.982-2.91 3.116-2.91 1.688 0 2.93.886 2.94 2.806v.005zm9.137.183c-1.095.034-1.77.233-1.77.95 0 .465.36.97 1.305.97 1.26 0 1.935-.69 1.935-1.814v-.13c-.45 0-.99.006-1.484.022h.012zm-6.06 1.875c1.11 0 1.876-.806 1.876-2.02s-.768-2.02-1.893-2.02c-1.11 0-1.89.806-1.89 2.02s.765 2.02 1.875 2.02h.03zm-4.35-2.514c-.044-1.125-.854-1.546-1.725-1.546-.944 0-1.694.474-1.815 1.546z",
  },
  "Depop": {
    color: "#FF2300",
    path: "M15.6 2.4h2.4v10.2a6 6 0 1 1-2.4-4.762V2.4zM10.2 16.8a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4z",
  },
  "Facebook Marketplace": {
    color: "#1877F2",
    path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  "Gumtree": {
    color: "#72EF36",
    path: "M18.846 6.582a.698.698 0 0 1-.333-.599C18.181 2.66 15.39 0 12 0 8.609 0 5.75 2.593 5.485 5.983a.796.796 0 0 1-.332.599C3.49 7.778 2.36 9.707 2.36 11.9c0 2.991 2.061 5.584 4.853 6.316.465.133.998.2 1.13.066.333-.2.798-1.862.599-2.194-.134-.2-.533-.399-1.064-.532-1.662-.465-2.86-1.928-2.86-3.723 0-.997.4-1.861.998-2.592a2.927 2.927 0 0 1 .998-.798c.73-.4 1.13-1.13 1.13-1.928 0-.4.066-.798.2-1.196.531-1.53 1.927-2.66 3.656-2.66 1.728 0 3.125 1.13 3.656 2.66.132.399.2.798.2 1.196 0 .798.397 1.529 1.13 1.928.398.2.664.465.997.798a3.918 3.918 0 0 1 .997 2.592 3.859 3.859 0 0 1-3.855 3.856c-2.46 0-4.388 1.995-4.388 4.455v2.526c0 .465.066.997.2 1.13.266.267 1.995.267 2.26 0 .133-.133.2-.665.2-1.13v-2.593c0-.93.797-1.728 1.728-1.728 3.59 0 6.515-2.925 6.515-6.515-.002-2.128-1.133-4.056-2.794-5.252z",
  },
};

function PlatformLogo({ name, size = 24 }: { name: string; size?: number }) {
  const logo = PLATFORM_LOGOS[name];
  if (!logo) return <span className="text-paper-dim text-sm">{name}</span>;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ fill: logo.color, flexShrink: 0 }}>
      <path d={logo.path} />
    </svg>
  );
}

/* ---------- logo strip ---------- */

function Strip() {
  const platforms = ["Vinted", "eBay", "Depop", "Facebook Marketplace", "Gumtree"];
  const items = [...platforms, ...platforms];
  return (
    <section className="border-y border-line bg-ink-soft/40 overflow-hidden">
      <div className="ticker-track py-5">
        {items.map((p, i) => (
          <div key={i} className="flex items-center gap-3 px-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber/35 shrink-0" />
            <PlatformLogo name={p} size={22} />
            <span className="font-display text-base text-paper-dim whitespace-nowrap">{p}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- problem ---------- */

function Problem() {
  const items = [
    { k: "01", h: "The unlisted pile grows", b: "You source 60 items on a good weekend. Forty get listed. Twenty sit in storage for three months, paid for, earning nothing. Without proper reseller stock management, you forget they exist." },
    { k: "02", h: "It sells and you can't find it", b: "A notification hits at 9pm. Now you're tearing through 40 boxes hunting one jumper, because your spreadsheet just says 'grey hoodie'. Reseller inventory software fixes this." },
    { k: "03", h: "You never really know your profit", b: "Fees, postage, sourcing cost, platform cuts across Vinted, eBay and Depop. By the time you net it out in your head, the number's wrong. So you stop checking." },
  ];
  return (
    <section id="problem" className="px-6 py-16 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="slideRight">
          <div className="text-center mb-14">
            <SectionEyebrow center>The reseller's tax</SectionEyebrow>
            <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight">
              Volume doesn't kill resellers.{" "}
              <span className="text-paper-dim">Losing track does.</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-px bg-line rounded-2xl overflow-hidden border border-line">
          {items.map((it, i) => (
            <Reveal key={it.k} delay={i * 0.13}>
              <div className="bg-ink-card p-8 h-full">
                <p className="font-mono text-amber text-sm mb-6">{it.k}</p>
                <h3 className="font-display text-xl font-medium mb-3">{it.h}</h3>
                <p className="text-paper-dim leading-relaxed text-[15px]">{it.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal variant="pop">
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/signup" className="btn-shine inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-amber text-ink font-semibold text-sm hover:bg-paper transition-colors">
              Start for free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- features ---------- */

function PipelineTab() {
  const cols = [
    { label: "Unlisted", color: "#f0a020", items: ["Stone Island Jumper", "Adidas Tracksuit", "Patagonia Fleece"] },
    { label: "Listed",   color: "#7fae4a", items: ["North Face Puffer", "Levi 501 Jeans", "Carhartt Beanie", "Nike Air Max 90"] },
    { label: "Sold",     color: "#b8b1a3", items: ["Champion Hoodie", "Gucci Belt"] },
  ];
  return (
    <div className="grid grid-cols-3 gap-4 p-6 h-full">
      {cols.map((col) => (
        <div key={col.label}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium" style={{ color: col.color }}>{col.label}</span>
            <span className="text-[10px] font-mono text-paper-faint bg-ink px-1.5 py-0.5 rounded border border-line-soft">{col.items.length}</span>
          </div>
          <div className="space-y-2">
            {col.items.map((item) => (
              <div key={item} className="px-3 py-2 rounded-lg border border-line-soft bg-ink text-xs text-paper-dim truncate">{item}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StorageTab() {
  const bins = [
    { id: "A1", items: ["North Face Puffer", "Carhartt Beanie"] },
    { id: "A2", items: ["Ralph Lauren Shirt"] },
    { id: "B1", items: ["Nike Air Max 90", "Tommy Hilfiger Jacket"] },
    { id: "B3", items: ["Levi 501 Jeans"] },
    { id: "C1", items: ["Burberry Scarf", "Champion Hoodie"] },
    { id: "D2", items: [] },
  ];
  return (
    <div className="grid grid-cols-3 gap-3 p-6">
      {bins.map((bin) => (
        <div key={bin.id} className={`rounded-xl border p-3 ${bin.items.length ? "border-amber/25 bg-amber/[0.04]" : "border-line-soft bg-ink"}`}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-mono font-medium text-amber">{bin.id}</span>
            {bin.items.length > 0 && <span className="text-[9px] bg-amber/15 text-amber px-1 rounded font-mono">{bin.items.length}</span>}
          </div>
          <div className="space-y-1">
            {bin.items.map((it) => <div key={it} className="text-[10px] text-paper-faint truncate">{it}</div>)}
            {bin.items.length === 0 && <div className="text-[10px] text-paper-faint/40 italic">Empty</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfitTab() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        {["Vinted", "eBay", "Depop", "Facebook Marketplace"].map((p, i) => (
          <div key={p} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${i === 1 ? "border-amber/40 bg-amber/10 text-amber" : "border-line-soft text-paper-faint"}`}>
            <PlatformLogo name={p} size={13} />
            <span>{p === "Facebook Marketplace" ? "Facebook" : p}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[
          { l: "Listed price",      v: "£45.00",  c: "text-paper" },
          { l: "Platform fee (eBay)", v: "−£5.63", c: "text-rust" },
          { l: "Postage label",     v: "−£3.40",  c: "text-rust" },
          { l: "Cost of item",      v: "−£8.00",  c: "text-rust" },
        ].map((r) => (
          <div key={r.l} className="flex items-center justify-between text-sm">
            <span className="text-paper-faint">{r.l}</span>
            <span className={`font-mono ${r.c}`}>{r.v}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-line-soft pt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-paper">Net profit</span>
        <span className="font-mono text-xl font-medium text-moss">+£27.97</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-paper-faint">ROI</span>
        <span className="font-mono text-moss">+349%</span>
      </div>
    </div>
  );
}

function AgingTab() {
  const items = [
    { name: "Champion Hoodie",       age: 2,  tier: "moss"  },
    { name: "Burberry Scarf",        age: 8,  tier: "moss"  },
    { name: "Carhartt Beanie",       age: 12, tier: "moss"  },
    { name: "Nike Air Max 90",       age: 22, tier: "amber" },
    { name: "Tommy Hilfiger Jacket", age: 28, tier: "amber" },
    { name: "Stone Island Jumper",   age: 45, tier: "rust"  },
    { name: "Adidas Tracksuit",      age: 52, tier: "rust"  },
  ];
  const cls: Record<string, string> = {
    moss:  "bg-moss/15 text-moss border-moss/20",
    amber: "bg-amber/15 text-amber border-amber/20",
    rust:  "bg-rust/15 text-rust border-rust/20",
  };
  return (
    <div className="p-6 space-y-2">
      {items.map((it) => (
        <div key={it.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-line-soft bg-ink">
          <span className="text-sm text-paper-dim">{it.name}</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cls[it.tier]}`}>{it.age}d</span>
        </div>
      ))}
    </div>
  );
}

function ArchivesTab() {
  const items = [
    { name: "North Face Puffer",  paid: 22, sold: 55, profit: 33 },
    { name: "Levi 501 Jeans",    paid: 8,  sold: 32, profit: 24 },
    { name: "Nike Air Max 90",   paid: 45, sold: 90, profit: 45 },
    { name: "Burberry Scarf",    paid: 55, sold: 120, profit: 65 },
  ];
  const total = items.reduce((s, r) => s + r.profit, 0);
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-amber font-mono mb-0.5">JULY 2026</div>
          <div className="text-sm text-paper-faint">{items.length} items sold · 71% margin</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xl text-moss">+£{total}</div>
          <div className="text-xs text-paper-faint">net profit</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-ink rounded-lg border border-line-soft p-3">
          <div className="text-xs text-paper-faint mb-1">Revenue</div>
          <div className="font-mono text-paper">£{items.reduce((s, r) => s + r.sold, 0)}</div>
        </div>
        <div className="bg-ink rounded-lg border border-line-soft p-3">
          <div className="text-xs text-paper-faint mb-1">Cost</div>
          <div className="font-mono text-rust">£{items.reduce((s, r) => s + r.paid, 0)}</div>
        </div>
        <div className="bg-ink rounded-lg border border-line-soft p-3">
          <div className="text-xs text-paper-faint mb-1">Profit</div>
          <div className="font-mono text-moss">£{total}</div>
        </div>
      </div>
      <div className="space-y-2">
        {items.map((r) => (
          <div key={r.name} className="flex items-center justify-between text-xs">
            <span className="text-paper-faint truncate max-w-[180px]">{r.name}</span>
            <span className="font-mono text-moss shrink-0">+£{r.profit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURE_TABS = [
  {
    key: "pipeline",
    label: "3-stage pipeline",
    icon: "◉",
    heading: "Every item has one clear state.",
    body: "Unlisted → Listed → Sold. The unlisted pile shouts your dead money. Watch it shrink as you list. Hit zero and you're working at full efficiency.",
    preview: <PipelineTab />,
  },
  {
    key: "storage",
    label: "Storage map",
    icon: "⊞",
    heading: "Know exactly where everything is.",
    body: "Assign each item to a physical storage location. When something sells at midnight, open Sellganise, search the item, and see its exact location in seconds. No digging.",
    preview: <StorageTab />,
  },
  {
    key: "profit",
    label: "Profit calculator",
    icon: "£",
    heading: "Know your number before you list.",
    body: "2026 UK fees built in for Vinted, eBay, Depop, and Facebook. Toggle who pays postage, see net profit and ROI update live. No more guessing your margin. Fee rates are indicative — always verify on each platform.",
    preview: <ProfitTab />,
  },
  {
    key: "aging",
    label: "Aging flags",
    icon: "◷",
    heading: "Dead stock gets loud, not forgotten.",
    body: "Every item shows how long it's been sitting. Green → Amber → Red. When something turns amber or red it appears in your notification feed with a nudge to relist or drop it.",
    preview: <AgingTab />,
  },
  {
    key: "archives",
    label: "Monthly archives",
    icon: "▤",
    heading: "Tax-ready P&L, every month.",
    body: "Sales group into clean monthly views with revenue, cost, and margin. Export a single month or every month in one CSV. One file, handed straight to your accountant.",
    preview: <ArchivesTab />,
  },
] as const;

function Features() {
  const [active, setActive] = useState(0);
  const tab = FEATURE_TABS[active];

  return (
    <section id="features" className="px-6 py-16 md:py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="flip">
          <div className="text-center mb-14">
            <SectionEyebrow center>What it does</SectionEyebrow>
            <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight mb-5">
              One job: nothing slips through the cracks.
            </h2>
            <p className="text-paper-dim max-w-xl mx-auto text-lg">
              Reseller software built around the one thing a spreadsheet can&apos;t do: actively watching the gap between bought and sold, across every platform you sell on.
            </p>
          </div>
        </Reveal>

        {/* tab bar */}
        <Reveal variant="slideLeft">
        <div className="flex gap-2 overflow-x-auto pb-2 justify-center mb-6 scrollbar-none">
          {FEATURE_TABS.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setActive(i)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap border transition-all duration-200 shrink-0 ${
                i === active
                  ? "bg-amber/10 border-amber/40 text-amber"
                  : "border-line bg-ink-card text-paper-faint hover:text-paper hover:border-paper-faint/50"
              }`}
            >
              <span className="text-base leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        </Reveal>

        {/* tab panel */}
        <Reveal key={tab.key}>
          <div className="rounded-2xl border border-line bg-ink-card overflow-hidden shadow-xl shadow-black/25">
            <div className="grid md:grid-cols-[1fr_1.4fr]">
              {/* description */}
              <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-line flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-amber mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber" /> {tab.label}
                </div>
                <h3 className="font-display text-2xl font-medium mb-4 leading-snug">{tab.heading}</h3>
                <p className="text-paper-dim leading-relaxed text-[15px]">{tab.body}</p>
                <a href="/signup" className="mt-8 self-start inline-flex items-center gap-2 text-sm font-medium text-amber hover:text-paper transition-colors">
                  Get started free
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
              {/* preview */}
              <div className="bg-ink border-line min-h-[300px]">
                {tab.preview}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- export section ---------- */

const STOCK_COLS  = ["Item Code", "Name", "Condition", "Size", "Paid (£)", "Status", "Platform", "Storage", "Notes"];
const SOLD_COLS   = ["Item", "Platform", "Paid (£)", "Sold For (£)", "Profit (£)", "Margin (%)", "Month"];
const STOCK_ROWS  = [
  ["SG-001", "North Face Puffer",  "Excellent", "L",  "22.00", "Listed",   "Vinted",  "A1", ""],
  ["SG-002", "Levi 501 Jeans",     "Good",      "32", "8.00",  "Listed",   "eBay",    "B3", "Slight fade"],
  ["SG-003", "Nike Air Max 90",    "Fair",      "9",  "45.00", "Unlisted", "",        "C1", ""],
  ["SG-004", "Burberry Scarf",     "Excellent", "—",  "55.00", "Listed",   "eBay",    "D2", ""],
];
const SOLD_ROWS   = [
  ["Nike Air Max 90",  "eBay",   "45.00", "89.00",  "44.00",  "49%", "Jun 2026"],
  ["Levi 501 Jeans",  "Vinted", "8.00",  "24.00",  "16.00",  "67%", "Jun 2026"],
  ["Carhartt Beanie", "Depop",  "5.00",  "18.00",  "13.00",  "72%", "Jul 2026"],
];

function SpreadsheetPreview({ cols, rows, accentCol }: { cols: string[]; rows: string[][]; accentCol: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line shadow-lg shadow-black/30">
      <table className="w-full text-xs border-collapse" style={{ fontFamily: "monospace" }}>
        <thead>
          <tr className="bg-ink-soft/60 border-b border-line">
            {cols.map((c, i) => (
              <th key={c} className={`px-3 py-2.5 text-left font-semibold whitespace-nowrap ${i === accentCol ? "text-amber" : "text-paper-dim"}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-line/50 hover:bg-ink-soft/30 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-3 py-2 whitespace-nowrap ${ci === accentCol ? "text-amber font-medium" : "text-paper-faint"} ${cell === "Unlisted" ? "text-amber" : ""} ${cell === "Listed" ? "text-moss" : ""}`}>
                  {cell || <span className="text-paper-faint/30">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExportSection() {
  return (
    <section className="px-6 py-16 md:py-24 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="fade">
          <div className="text-center mb-12">
            <SectionEyebrow center>Export</SectionEyebrow>
            <h2 className="font-display font-medium text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] tracking-tight mb-4">
              Your data, always yours.
            </h2>
            <p className="text-paper-dim max-w-lg mx-auto text-lg">
              One click exports everything to CSV. Open in Excel, Google Sheets, or Numbers. No lock-in, ever.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Stock export card */}
          <Reveal variant="slideRight">
            <div className="rounded-2xl border border-line bg-ink-card overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-line flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium mb-1">Stock list export</h3>
                  <p className="text-paper-dim text-sm leading-relaxed">Every item you own — condition, storage location, platform, and what you paid — in one clean file.</p>
                </div>
              </div>
              <div className="p-5 flex-1">
                <SpreadsheetPreview cols={STOCK_COLS} rows={STOCK_ROWS} accentCol={4} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Item code", "Name & condition", "Size", "Paid", "Stage", "Platform", "Storage", "Notes"].map((t) => (
                    <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-ink-soft border border-line text-paper-faint">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Monthly sold export card */}
          <Reveal variant="slideLeft" delay={0.1}>
            <div className="rounded-2xl border border-line bg-ink-card overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-line flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-moss/10 border border-moss/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-moss">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    <polyline points="8 14 10 16 16 12"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium mb-1">Monthly sold export</h3>
                  <p className="text-paper-dim text-sm leading-relaxed">Every sale for a month — item, platform, profit, and margin — plus a summary row of totals at the bottom.</p>
                </div>
              </div>
              <div className="p-5 flex-1">
                <SpreadsheetPreview cols={SOLD_COLS} rows={SOLD_ROWS} accentCol={4} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Item name", "Platform", "Paid", "Sold for", "Profit", "Margin %", "Extra costs", "Totals row"].map((t) => (
                    <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-ink-soft border border-line text-paper-faint">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* bottom trust line + CTA */}
        <Reveal variant="pop">
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <a href="/signup" className="btn-shine inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-amber text-ink font-semibold text-sm hover:bg-paper transition-colors">
              Start exporting for free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <p className="text-sm text-paper-faint">
              Works with&nbsp;
              <span className="text-paper-dim">Excel · Google Sheets · Numbers · LibreOffice</span>
              &nbsp;·&nbsp;
              <span className="text-paper-dim">No upgrade required</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- analytics extension ---------- */

function AnalyticsSection() {
  const bullets = [
    ["Est. resale value", "Average price of matching live listings, filtered by size and condition."],
    ["List at & Offer at", "75th percentile for an ambitious ask, 25th for a quick-sale price."],
    ["Bargain / Fair / Overpriced", "Instant flag when a listing is ≤85% or ≥115% of the market rate."],
    ["Sell speed estimate", "Demand signal derived from favourites-per-day on comparable listings."],
    ["100% private", "Every calculation runs locally in your browser. Nothing sent to any server."],
  ];

  return (
    <section id="analytics" className="px-6 py-16 md:py-28 border-t border-line overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-14 md:gap-20 items-center">

          {/* ── left: description ── */}
          <Reveal variant="slideRight">
          <div>
            <SectionEyebrow>Sellganise Analytics</SectionEyebrow>
            <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-tight mb-5">
              Know if it&apos;s a bargain<br className="hidden sm:block" /> before you buy it.
            </h2>
            <p className="text-paper-dim text-lg leading-relaxed mb-8">
              A free Chrome extension that lives inside Vinted UK. On every listing it scans comparable sold and live items, strips outlier prices, and injects a live market card so you know in seconds whether something is worth buying to resell.
            </p>

            <ul className="space-y-4 mb-10">
              {bullets.map(([title, desc]) => (
                <li key={title} className="flex gap-3 text-[14px]">
                  <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-moss/15 border border-moss/25 grid place-items-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-moss">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span className="text-paper-dim">
                    <span className="text-paper font-medium">{title}</span> — {desc}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/dashboard"
                className="btn-shine inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber text-ink font-semibold text-sm hover:bg-paper transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Get the extension free
              </a>
              <span className="text-xs text-paper-faint">Chrome only · Vinted UK · no account required</span>
            </div>
          </div>
          </Reveal>

          {/* ── right: screenshot ── */}
          <Reveal variant="slideLeft" delay={0.1}>
            <div className="relative flex justify-center">
              {/* ambient glow behind card */}
              <div className="absolute inset-0 bg-amber/[0.07] blur-3xl pointer-events-none rounded-full scale-75" />

              {/* card screenshot */}
              <div className="relative w-full max-w-[340px] rounded-2xl overflow-hidden border border-line/60 shadow-2xl shadow-black/70 ring-1 ring-white/5">
                <img
                  src="/analytics-card.png"
                  alt="Sellganise Analytics extension card — estimated resale value, pricing suggestions and sell speed on a Vinted listing"
                  className="w-full block"
                />
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

/* ---------- who it's for ---------- */

function Who() {
  const rows = [
    { h: "The weekend sourcer", b: "You hit car boots and charity shops hard, come home with 40-60 items, and the logging never quite happens. Sellganise makes adding stock a tap, not a chore.", tag: "200-500 items" },
    { h: "The full-time flipper", b: "This is your income. You're across four platforms with stock in 30+ storage locations, and a single lost item is real money. Retrieval and profit tracking pay for themselves.", tag: "500-2,000 items" },
    { h: "The scaling operator", b: "You've outgrown the spreadsheet, maybe added help, and need the numbers clean for tax. The monthly archives and aging flags keep the whole operation honest.", tag: "2,000+ items" },
  ];
  return (
    <section id="who" className="px-6 py-16 md:py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="fade">
          <SectionEyebrow>Who it's built for</SectionEyebrow>
          <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight max-w-3xl mb-5">
            For resellers who've outgrown "I'll remember."
          </h2>
          <p className="text-paper-dim max-w-2xl text-lg mb-16">
            Whether you sell on Vinted, eBay, Depop or Facebook Marketplace, Sellganise is the stock management software that keeps your reselling business organised and profitable.
          </p>
        </Reveal>
        <div className="space-y-4">
          {rows.map((r, i) => (
            <Reveal key={r.h} delay={i * 0.1}>
              <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-center rounded-2xl border border-line bg-ink-card p-7 md:p-8 hover:border-paper-faint/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/25 transition-all duration-300">
                <span className="font-mono text-amber text-sm">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-xl font-medium mb-2">{r.h}</h3>
                  <p className="text-paper-dim leading-relaxed text-[15px] max-w-2xl">{r.b}</p>
                </div>
                <span className="justify-self-start md:justify-self-end shrink-0 font-mono text-xs px-3 py-1.5 rounded-lg border border-line text-paper-dim">
                  {r.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- vs spreadsheet ---------- */

function Versus() {
  const rows = [
    { f: "Adding a weekend haul", sheet: "Pinch-zoom into a phone grid, type every field", app: "Tap to add: name, cost, condition, done in seconds" },
    { f: "Finding an item when it sells", sheet: "Ctrl+F a name you half-remember", app: "Tap the item and see its storage location instantly" },
    { f: "Knowing what's not listed", sheet: "Nothing tells you. The pile just grows", app: "A live alert shouts your dead money" },
    { f: "Working out net profit", sheet: "A formula you built and forgot to update", app: "Calculated on sale, fees current per platform" },
    { f: "Tax time", sheet: "A late-night scramble to reconcile tabs", app: "Monthly totals, ready to export" },
    { f: "Falling a week behind", sheet: "The whole sheet becomes untrustworthy", app: "Designed to stay useful when you're behind" },
  ];
  return (
    <section id="vs" className="px-6 py-16 md:py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="slideRight">
          <SectionEyebrow>Sellganise vs the spreadsheet</SectionEyebrow>
          <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight max-w-3xl mb-5">
            A spreadsheet is free. So is forgetting £486 in a box.
          </h2>
          <p className="text-paper-dim max-w-2xl text-lg mb-14">
            A spreadsheet stores what you type and does nothing else. Sellganise is dedicated reseller software built for the messy, physical reality of a stockroom. It actively watches the gaps no spreadsheet or generic stock management tool can.
          </p>
        </Reveal>
        <Reveal variant="pop">
          {/* Mobile: stacked cards showing Sellganise advantage */}
          <div className="md:hidden space-y-3">
            {rows.map((r) => (
              <div key={r.f} className="rounded-xl border border-line bg-ink-card p-4">
                <p className="text-sm font-medium text-paper mb-2">{r.f}</p>
                <div className="flex items-start gap-2">
                  <span className="text-moss shrink-0 mt-0.5 text-sm">✓</span>
                  <p className="text-sm text-paper-dim leading-snug">{r.app}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: full 3-col comparison table */}
          <div className="hidden md:block rounded-2xl border border-line overflow-hidden">
            <div className="grid grid-cols-[1.1fr_1fr_1.1fr] bg-ink-soft border-b border-line text-sm font-medium">
              <div className="p-5 text-paper-faint">The moment</div>
              <div className="p-5 text-paper-faint border-x border-line">Spreadsheet</div>
              <div className="p-5 text-amber flex items-center gap-2">Sellganise</div>
            </div>
            {rows.map((r, i) => (
              <div key={r.f} className={`grid grid-cols-[1.1fr_1fr_1.1fr] text-[14px] ${i % 2 ? "bg-ink-card" : "bg-ink"}`}>
                <div className="p-5 font-medium">{r.f}</div>
                <div className="p-5 text-paper-faint border-x border-line flex items-start gap-2">
                  <span className="text-rust mt-0.5 shrink-0">✕</span>{r.sheet}
                </div>
                <div className="p-5 text-paper-dim flex items-start gap-2">
                  <span className="text-moss mt-0.5 shrink-0">✓</span>{r.app}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal variant="fade">
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <a href="/signup" className="btn-shine w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber text-ink font-semibold text-base hover:bg-paper transition-colors">
              Ditch the spreadsheet. Start free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <span className="text-sm text-paper-faint">Cancel anytime</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- case study ---------- */

function CaseStudy() {
  const before = [
    { label: "Time logging each haul", v: "~45 min on a laptop" },
    { label: "Items lost / forgotten", v: "17 over 6 months" },
    { label: "Net profit visibility", v: "Rough guess at best" },
    { label: "Tax prep time", v: "2 full days every Jan" },
    { label: "Time finding a sold item", v: "8-12 min on average" },
  ];
  const after = [
    { label: "Time logging each haul", v: "~8 min on his phone" },
    { label: "Items lost / forgotten", v: "0 in 4 months" },
    { label: "Net profit visibility", v: "Live, to the penny" },
    { label: "Tax prep time", v: "< 1 hour" },
    { label: "Time finding a sold item", v: "< 30 seconds" },
  ];
  return (
    <section id="case-study" className="px-6 py-16 md:py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="flip">
          <SectionEyebrow>Case study</SectionEyebrow>
          <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight max-w-3xl mb-5">
            From a 900-row Google Sheet{" "}
            <span className="text-paper-dim">to knowing exactly where every item is.</span>
          </h2>
          <p className="text-paper-dim text-lg max-w-2xl mb-16">
            Marcus runs a full-time vintage clothing operation across eBay and Vinted. Here's what happened when he dropped the spreadsheet.
          </p>
        </Reveal>
        <Reveal>
        <div className="grid md:grid-cols-2 gap-px bg-line rounded-2xl overflow-hidden border border-line mb-8">
          <div className="bg-ink-card p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-paper-faint mb-6">Before: spreadsheet</p>
            <div className="space-y-5">
              {before.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-paper-faint">{r.label}</span>
                  <span className="font-mono text-rust shrink-0">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-ink-card p-8 border-t md:border-t-0 md:border-l border-line">
            <p className="font-mono text-xs uppercase tracking-widest text-amber mb-6">After: Sellganise</p>
            <div className="space-y-5">
              {after.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-paper-faint">{r.label}</span>
                  <span className="font-mono text-moss shrink-0">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </Reveal>
        <Reveal variant="slideLeft">
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-10 rounded-2xl border border-line bg-ink-card p-8 md:p-10 items-start">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber/20 border border-amber/30 grid place-items-center font-display text-2xl font-medium text-amber mb-5">
                M
              </div>
              <p className="font-display text-lg font-medium">Marcus T.</p>
              <p className="text-paper-faint text-sm mt-1">Full-time reseller · Vintage clothing</p>
              <div className="mt-6 flex flex-col gap-2.5">
                {[
                  { k: "Reselling since", v: "2022" },
                  { k: "Stock size", v: "800-1,100 items" },
                  { k: "Platforms", v: "eBay, Vinted" },
                  { k: "On Sellganise since", v: "March 2025" },
                ].map((s) => (
                  <div key={s.k} className="flex gap-3 text-sm">
                    <span className="text-paper-faint w-28 shrink-0">{s.k}</span>
                    <span className="font-mono text-paper-dim">{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5 text-[15px] text-paper-dim leading-relaxed border-t md:border-t-0 md:border-l border-line md:pl-10 pt-6 md:pt-0">
              <p>
                "I had been reselling vintage for three years when I hit 600 items. That's when the spreadsheet started lying to me. I'd have stock listed on eBay I couldn't find. I'd log something, miss a row, come back to an 18-column sheet and just give up for the week."
              </p>
              <p>
                "I tried fixing it with more columns. A found column. A separate tab for sold. By January I had four tabs and none of them agreed on how many items I had. Tax time was embarrassing. I'd genuinely lost £340 of stock and had no clue what my actual margin was."
              </p>
              <blockquote className="border-l-2 border-amber pl-5 text-paper font-medium">
                "First thing Sellganise showed me: I had £612 of unlisted stock sitting in three storage locations I'd half-forgotten. I listed all of it that week. That alone paid for a year of the subscription."
              </blockquote>
              <p>
                "The storage map changed everything. I got a Vinted notification at 11pm. Opened Sellganise, searched the item: Storage C3, top layer. Done in 20 seconds. On the spreadsheet that would have been a full-box dig at midnight."
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- reviews ---------- */

const REVIEWS = [
  {
    name: "Sarah M.",
    platform: "Vinted & eBay",
    items: "~650 items",
    stars: 5,
    text: "I used to spend Sunday evenings dreading the stock audit. Now I open Sellganise, see exactly what's unlisted, and I'm done in 20 minutes. The profit tracking alone has paid for itself ten times over.",
  },
  {
    name: "Jake R.",
    platform: "Depop & eBay",
    items: "~300 items",
    stars: 5,
    text: "The storage map is genuinely life-changing. When something sells at midnight I'm not ripping boxes apart anymore. I tap the item and it tells me exactly where it is. Can't believe I didn't have this sooner.",
  },
  {
    name: "Priya K.",
    platform: "Vinted",
    items: "~200 items",
    stars: 5,
    text: "I was nervous about jumping from a spreadsheet. Took about 10 minutes to get going. My unlisted pile went from no idea to a number I could actually attack and I cleared it in a week.",
  },
  {
    name: "Tom H.",
    platform: "eBay & FB Marketplace",
    items: "1,200+ items",
    stars: 5,
    text: "Running over a thousand items across two platforms, this is the only tool that's kept up with me. The aging flags stopped me sitting on dead stock I'd completely forgotten about. Cleared £800 of it in a month.",
  },
  {
    name: "Lauren B.",
    platform: "Depop & Vinted",
    items: "~400 items",
    stars: 5,
    text: "Tax time used to be a nightmare. Last January I exported my Sellganise monthly archives and handed them straight to my accountant. Two-hour job, not two days. Worth £19.99 a month easily.",
  },
];

type Review = (typeof REVIEWS)[number];

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="text-amber text-sm">★</span>
      ))}
    </div>
  );
}

function ReviewCard({ r, compact = false }: { r: Review; compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-ink-card p-7 h-full flex flex-col">
      <StarRow n={r.stars} />
      <blockquote className={`mt-4 leading-relaxed flex-1 ${compact ? "text-[13px] line-clamp-4 text-paper-dim" : "text-[16px] text-paper"}`}>
        "{r.text}"
      </blockquote>
      <div className="mt-6 flex items-center gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-amber/15 border border-amber/25 grid place-items-center font-medium text-amber text-sm">
          {r.name[0]}
        </div>
        <div>
          <p className={`font-medium ${compact ? "text-xs" : "text-sm"}`}>{r.name}</p>
          <p className="text-xs text-paper-faint">{r.platform} · {r.items}</p>
        </div>
      </div>
    </div>
  );
}

function Reviews() {
  const [idx, setIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = (next: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setIdx(((next % REVIEWS.length) + REVIEWS.length) % REVIEWS.length);
      setTransitioning(false);
    }, 220);
  };

  useEffect(() => {
    const t = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % REVIEWS.length);
        setTransitioning(false);
      }, 220);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const prevIdx = (idx - 1 + REVIEWS.length) % REVIEWS.length;
  const nextIdx = (idx + 1) % REVIEWS.length;

  return (
    <section id="reviews" className="px-6 py-16 md:py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="spin">
          <SectionEyebrow center>What resellers say</SectionEyebrow>
          <h2 className="font-display font-medium text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.08] tracking-tight text-center mb-16">
            Trusted by resellers who mean business.
          </h2>
        </Reveal>
        <Reveal variant="fade">
        <div className="flex items-stretch gap-5">
          <div
            className="hidden md:flex flex-1 opacity-40 hover:opacity-60 transition-opacity cursor-pointer scale-[0.97] origin-right"
            onClick={() => goTo(prevIdx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && goTo(prevIdx)}
          >
            <ReviewCard r={REVIEWS[prevIdx]} compact />
          </div>
          <div
            className="flex-1 md:flex-[1.35]"
            style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.22s ease" }}
          >
            <ReviewCard r={REVIEWS[idx]} />
          </div>
          <div
            className="hidden md:flex flex-1 opacity-40 hover:opacity-60 transition-opacity cursor-pointer scale-[0.97] origin-left"
            onClick={() => goTo(nextIdx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && goTo(nextIdx)}
          >
            <ReviewCard r={REVIEWS[nextIdx]} compact />
          </div>
        </div>
        <div className="flex items-center justify-center gap-5 mt-10">
          <button
            onClick={() => goTo(prevIdx)}
            aria-label="Previous review"
            className="grid place-items-center w-10 h-10 rounded-full border border-line bg-ink-card text-paper-dim hover:text-paper hover:border-paper-faint transition-colors text-lg"
          >
            ←
          </button>
          <div className="flex gap-2">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to review ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-amber" : "w-2 bg-line hover:bg-paper-faint"}`}
              />
            ))}
          </div>
          <button
            onClick={() => goTo(nextIdx)}
            aria-label="Next review"
            className="grid place-items-center w-10 h-10 rounded-full border border-line bg-ink-card text-paper-dim hover:text-paper hover:border-paper-faint transition-colors text-lg"
          >
            →
          </button>
        </div>
        </Reveal>

        {/* post-review CTA */}
        <Reveal variant="pop">
        <div className="mt-14 rounded-2xl border border-amber/20 bg-amber/[0.05] px-8 py-10 text-center">
          <p className="text-paper-dim text-sm mb-3">Join resellers already using Sellganise</p>
          <h3 className="font-display text-2xl md:text-3xl font-medium mb-6">Ready to see your real numbers?</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/signup" className="btn-shine w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber text-ink font-semibold text-base hover:bg-paper transition-colors">
              Start for free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <a href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-line text-paper hover:border-paper-faint transition-colors text-base">
              Log in
            </a>
          </div>
          <p className="mt-4 text-xs text-paper-faint">Free plan available · Cancel anytime</p>
        </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- pricing / cta ---------- */

const FEATURE_LABELS: Record<FeatureFlag, string> = {
  pipeline: "3-stage pipeline (Unlisted / Listed / Sold)",
  leak_alert: "Not listed yet leak alert",
  bin_lookup: "Storage map & instant retrieval",
  basic_profit: "Profit calculator (2026 UK fees: Vinted, eBay, Depop, Facebook)",
  monthly_archives: "Monthly archives",
  aging_flags: "Aging flags on dead stock",
  tax_export: "Tax-ready CSV export",
  multi_platform: "Multi-platform tracking",
  bulk_actions: "Bulk actions",
  advanced_reporting: "Advanced reporting",
  csv_import: "CSV import",
  analytics_extension: "Sellganise Analytics Chrome extension: live market price data on every Vinted listing",
};

const FREE_FEATURES: FeatureFlag[] = ["pipeline", "leak_alert", "bin_lookup", "basic_profit"];
const PRO_EXTRA_FEATURES: FeatureFlag[] = ["monthly_archives", "aging_flags", "tax_export", "multi_platform", "bulk_actions", "advanced_reporting", "csv_import", "analytics_extension"];

function CTA() {
  const free = getTier("starter");
  const pro = getTier("pro");

  return (
    <section id="cta" className="px-6 py-16 md:py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="flip">
          <div className="text-center mb-16">
            <SectionEyebrow center>Pricing</SectionEyebrow>
            <h2 className="font-display font-medium text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-tight mb-5">
              Simple pricing. No surprises.
            </h2>
            <p className="text-paper-dim text-lg max-w-xl mx-auto">
              Start free, log your first haul, see how it works. Upgrade when it's earning its keep.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">

          {/* Free card */}
          <Reveal delay={0}>
            <div className="flex flex-col rounded-2xl border border-line bg-ink-card p-9 h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 transition-all duration-300">
              <div className="mb-6">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-paper-faint mb-4">{free.name}</p>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="font-display text-5xl font-medium">Free</span>
                </div>
                <p className="text-paper-faint text-sm mt-2">{free.tagline}</p>
              </div>
              <div className="inline-flex self-start items-center px-3 py-1.5 rounded-lg text-xs font-mono bg-ink-soft border border-line text-paper-dim mb-8">
                {formatItemCap("starter")} items included
              </div>
              <ul className="space-y-3.5 flex-1 mb-10">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[14px] text-paper-dim">
                    <span className="mt-0.5 grid place-items-center w-4 h-4 rounded-full bg-moss/20 text-moss text-[10px] shrink-0 font-bold">✓</span>
                    {FEATURE_LABELS[f]}
                  </li>
                ))}
              </ul>
              <a href="/signup" className="block text-center px-5 py-3.5 rounded-xl border border-line text-paper font-medium text-sm hover:border-paper-faint hover:bg-ink-soft transition-colors">
                Start free
              </a>
            </div>
          </Reveal>

          {/* Pro card */}
          <Reveal delay={0.1}>
            <div className="relative flex flex-col rounded-2xl border border-amber/50 bg-gradient-to-b from-amber/[0.07] to-transparent p-9 h-full card-glow hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 transition-all duration-300">
              <div className="absolute -top-3.5 left-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber text-ink text-xs font-semibold">
                  → Popular
                </span>
              </div>
              <div className="mb-6">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-paper-faint mb-4">{pro.name}</p>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="font-display text-5xl font-medium text-amber">£19.99</span>
                  <span className="text-paper-faint text-sm">/ month</span>
                </div>
                <p className="text-paper-faint text-sm mt-2">{pro.tagline}</p>
              </div>
              <div className="inline-flex self-start items-center px-3 py-1.5 rounded-lg text-xs font-mono bg-amber/15 text-amber border border-amber/25 mb-8">
                Unlimited items
              </div>
              <div className="flex-1 mb-10">
                <p className="text-xs text-paper-faint font-mono mb-4 uppercase tracking-wider">Everything in Free, plus:</p>
                <ul className="space-y-3.5">
                  {PRO_EXTRA_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14px] text-paper-dim">
                      <span className="mt-0.5 grid place-items-center w-4 h-4 rounded-full bg-amber/20 text-amber text-[10px] shrink-0 font-bold">✓</span>
                      {FEATURE_LABELS[f]}
                    </li>
                  ))}
                </ul>
              </div>
              <a href="/signup" className="btn-shine block text-center px-5 py-3.5 rounded-xl bg-amber text-ink font-medium text-sm hover:bg-paper transition-colors">
                Get started
              </a>
              <p className="text-center text-xs text-paper-faint mt-3">Cancel anytime · No hidden fees</p>
            </div>
          </Reveal>

        </div>
        <Reveal variant="fade">
          <p className="text-center text-sm text-paper-faint mt-10">
            All prices in GBP · Secure billing via Stripe · Cancel anytime
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer className="border-t border-line px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-paper-faint">
          <div className="flex items-center gap-2.5">
            <span className="relative grid place-items-center w-6 h-6 rounded-[5px] bg-amber overflow-hidden">
              <span className="relative w-[2.5px] h-3 rounded-full bg-ink" />
            </span>
            <span className="font-display text-paper">Sellganise</span>
          </div>
          <p>Reseller stock management software. © {new Date().getFullYear()}</p>
          <div className="flex gap-6 flex-wrap justify-center">
            <a href="#features" className="hover:text-paper transition-colors">Features</a>
            <a href="#vs" className="hover:text-paper transition-colors">vs Spreadsheet</a>
            <Link href="/blog" className="hover:text-paper transition-colors">Blog</Link>
            <Link href="/pricing" className="hover:text-paper transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-paper transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-paper transition-colors">Terms of Service</Link>
          </div>
        </div>
        <p className="text-xs text-paper-faint/60 text-center max-w-3xl mx-auto leading-relaxed">
          Sellganise is reseller software and inventory management built for UK sellers on Vinted, eBay, Depop and Facebook Marketplace. Track your reselling stock, monitor profit, and manage storage locations all in one place.
        </p>
        <p className="text-xs text-paper-faint/40 text-center">
          All trademarks, logos and brand names are the property of their respective owners. Sellganise is not affiliated with or endorsed by Vinted, eBay, Depop, Facebook or Gumtree.
        </p>
      </div>
    </footer>
  );
}

/* ---------- shared bits ---------- */

function SectionEyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-3 mb-6 ${center ? "justify-center" : ""}`}>
      <span className="w-6 h-px bg-amber" />
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-amber">{children}</span>
    </div>
  );
}

type RevealVariant = "fadeUp" | "fade" | "pop" | "slideLeft" | "slideRight" | "spin" | "flip";

function Reveal({ children, className = "", delay = 0, variant = "fadeUp" }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.15);
  const sp = `cubic-bezier(0.16,1,0.3,1)`;
  const bounce = `cubic-bezier(0.34,1.56,0.64,1)`;
  const t75 = `0.75s ${sp} ${delay}s`;
  const t70 = `0.7s ${sp} ${delay}s`;
  const t55 = `0.55s ${bounce} ${delay}s`;

  const variants: Record<RevealVariant, { hidden: React.CSSProperties; visible: React.CSSProperties; transition: string }> = {
    fadeUp: {
      hidden:  { opacity: 0, transform: "translateY(22px) scale(0.98)" },
      visible: { opacity: 1, transform: "translateY(0) scale(1)" },
      transition: `opacity ${t75}, transform ${t75}`,
    },
    fade: {
      hidden:  { opacity: 0 },
      visible: { opacity: 1 },
      transition: `opacity 0.9s ease ${delay}s`,
    },
    pop: {
      hidden:  { opacity: 0, transform: "scale(0.86)" },
      visible: { opacity: 1, transform: "scale(1)" },
      transition: `opacity ${t55}, transform ${t55}`,
    },
    slideLeft: {
      hidden:  { opacity: 0, transform: "translateX(54px)" },
      visible: { opacity: 1, transform: "translateX(0)" },
      transition: `opacity ${t70}, transform ${t70}`,
    },
    slideRight: {
      hidden:  { opacity: 0, transform: "translateX(-54px)" },
      visible: { opacity: 1, transform: "translateX(0)" },
      transition: `opacity ${t70}, transform ${t70}`,
    },
    spin: {
      hidden:  { opacity: 0, transform: "rotate(-7deg) scale(0.92)" },
      visible: { opacity: 1, transform: "rotate(0deg) scale(1)" },
      transition: `opacity ${t75}, transform ${t75}`,
    },
    flip: {
      hidden:  { opacity: 0, transform: "perspective(700px) rotateX(14deg) scale(0.97)" },
      visible: { opacity: 1, transform: "perspective(700px) rotateX(0deg) scale(1)" },
      transition: `opacity ${t75}, transform ${t75}`,
    },
  };

  const s = variants[variant];
  return (
    <div
      ref={ref}
      className={className}
      style={{ ...(seen ? s.visible : s.hidden), transition: s.transition }}
    >
      {children}
    </div>
  );
}

/* ---------- page ---------- */

export default function Page() {
  return (
    <main className="relative overflow-x-hidden">
      <Nav />
      <Hero />

      <Problem />
      <DashboardMockup />
      <Features />
      <ExportSection />
      <AnalyticsSection />
      <Who />
      <Versus />
      <CaseStudy />
      <Reviews />
      <CTA />
      <Footer />

    </main>
  );
}
