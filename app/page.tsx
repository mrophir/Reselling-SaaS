"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getTier, formatItemCap, type TierKey, type FeatureFlag } from "../lib/tiers";

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
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    function tick() {
      i++;
      setDisplayed(text.slice(0, i));
      if (i < text.length) timer = setTimeout(tick, speed);
      else setDone(true);
    }
    timer = setTimeout(tick, startDelay);
    return () => clearTimeout(timer);
  }, []); // text/startDelay/speed are literals — safe to exclude
  return { displayed, done };
}

/* ---------- nav ---------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <header className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-500 ${
      scrolled ? "border-line/70 bg-ink/90 backdrop-blur-md shadow-lg shadow-black/25"
               : "border-transparent bg-ink/30 backdrop-blur-sm"
    }`}>
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="relative grid place-items-center w-7 h-7 rounded-[6px] bg-amber overflow-hidden">
            <span className="absolute bottom-0 inset-x-0 bg-ink/25" style={{ height: "38%" }} />
            <span className="relative w-[3px] h-3.5 rounded-full bg-ink" />
          </span>
          <span className="font-display text-[17px] font-medium tracking-tight">Stockpile</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-paper-dim">
          <a href="#problem" className="hover:text-paper transition-colors">The problem</a>
          <a href="#features" className="hover:text-paper transition-colors">Features</a>
          <a href="#who" className="hover:text-paper transition-colors">Who it's for</a>
          <a href="#vs" className="hover:text-paper transition-colors">vs Spreadsheet</a>
          <a href="#case-study" className="hover:text-paper transition-colors">Case study</a>
          <a href="#cta" className="hover:text-paper transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#" className="hidden sm:block text-sm text-paper-dim hover:text-paper transition-colors px-3 py-2">
            Log in
          </a>
          <a href="/dashboard" className="hidden sm:block text-sm font-medium px-4 py-2 rounded-lg border border-line text-paper hover:border-paper-faint hover:-translate-y-0.5 transition-all duration-200">
            Dashboard
          </a>
          <a href="#cta" className="btn-shine text-sm font-medium px-4 py-2 rounded-lg bg-amber text-ink hover:bg-paper transition-colors">
            Sign up free
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------- hero ---------- */

function Hero() {
  const L1 = "Manage your stock.";
  const L2 = "Own your profit.";
  const L1_DELAY = 480;
  const L1_SPEED = 52;
  const L2_DELAY = L1_DELAY + L1.length * L1_SPEED + 340;
  const L2_SPEED = 58;

  const { displayed: t1, done: d1 } = useTypewriter(L1, L1_DELAY, L1_SPEED);
  const { displayed: t2, done: d2 } = useTypewriter(L2, L2_DELAY, L2_SPEED);

  // cursor sits on line 1 until line 2 starts typing
  const cursorLine1 = !d1 || (d1 && t2.length === 0);
  const cursorLine2 = d1 && t2.length > 0 && !d2;

  return (
    <section id="top" className="grain relative overflow-hidden pt-40 pb-28 px-6">
      <div className="orb absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-amber/[0.055] blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* social proof pill */}
        <div className="rise inline-flex items-center gap-3 rounded-full border border-line bg-ink-card/80 px-4 py-2 mb-10 text-xs">
          <span className="flex items-center gap-1.5 text-paper-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-moss shrink-0" style={{ animation: "blink 1.6s infinite" }} />
            Trusted by resellers across the UK
          </span>
          <span className="w-px h-3 bg-line shrink-0" />
          <span className="text-amber font-mono font-medium">10,000+ items tracked</span>
        </div>

        {/* heading — typewriter */}
        <h1 className="font-display font-medium leading-[0.94] tracking-tight text-[clamp(3rem,7.5vw,5.8rem)] min-h-[1.9em]">
          <span>
            {t1}
            {cursorLine1 && (
              <span className="cursor-blink inline-block w-[3px] h-[0.82em] bg-paper rounded-sm align-middle ml-1 translate-y-[-0.05em]" />
            )}
          </span>
          {t2.length > 0 && (
            <>
              <br />
              <span className="text-amber">
                {t2}
                {cursorLine2 && (
                  <span className="cursor-blink inline-block w-[3px] h-[0.82em] bg-amber rounded-sm align-middle ml-1 translate-y-[-0.05em]" />
                )}
              </span>
            </>
          )}
        </h1>

        {/* subtext */}
        <p className="rise mt-8 text-lg text-paper-dim max-w-xl mx-auto leading-relaxed" style={{ animationDelay: "0.12s" }}>
          A live view of everything you own, exactly where it's stored, and what you're actually making — from source to sold.
        </p>

        {/* CTAs */}
        <div className="rise mt-10 flex items-center justify-center gap-4 flex-wrap" style={{ animationDelay: "0.17s" }}>
          <a href="#cta" className="btn-shine inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-amber text-ink font-medium text-[15px] hover:bg-paper transition-colors">
            Start managing free
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a href="#vs" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-line text-paper hover:border-paper-faint hover:-translate-y-0.5 transition-all duration-200 text-[15px]">
            Why not a spreadsheet?
          </a>
        </div>

        {/* built for */}
        <p className="rise mt-6 text-sm" style={{ animationDelay: "0.22s" }}>
          <span className="text-paper-faint">Built for</span>
          <span className="text-paper-dim"> · Weekend sourcers · Full-time flippers · Scaling operators</span>
        </p>

        {/* stats row */}
        <div className="rise mt-16 inline-grid grid-cols-3 gap-px bg-line rounded-2xl overflow-hidden border border-line shadow-xl shadow-black/30" style={{ animationDelay: "0.26s" }}>
          {[
            { v: "£0",    l: "to get started" },
            { v: "5 min", l: "to first insight" },
            { v: "100%",  l: "profit visibility" },
          ].map((s) => (
            <div key={s.l} className="bg-ink-card px-8 py-5 text-center">
              <div className="font-mono text-2xl font-medium text-amber">{s.v}</div>
              <div className="text-xs text-paper-faint mt-1.5">{s.l}</div>
            </div>
          ))}
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

function DashboardMockup() {
  // inner canvas is 1120×610; we scale it into a 900px-wide screen area
  const INNER_W = 1120;
  const INNER_H = 610;
  const SCREEN_W = 900;
  const scale = SCREEN_W / INNER_W;
  const screenH = Math.round(INNER_H * scale);

  const navItems = [
    { label: "Overview",         active: true  },
    { label: "Stock",            active: false },
    { label: "Storage map",      active: false },
    { label: "Calculator",       active: false },
    { label: "Monthly archives", active: false },
  ];

  return (
    <section className="px-6 py-16 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-amber mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            See it in action
          </div>
          <h2 className="font-display font-medium text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight tracking-tight">
            Your entire reselling operation,<br className="hidden sm:block" /> in one screen.
          </h2>
        </div>

        {/* laptop frame */}
        <Reveal>
          <div className="mx-auto" style={{ maxWidth: 980 }}>
            {/* lid / screen */}
            <div
              className="rounded-2xl shadow-2xl shadow-black/70"
              style={{ background: "#0a0908", border: "10px solid #1a1815", padding: "10px 10px 6px" }}
            >
              {/* camera dot */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#211e1a" }} />
              </div>

              {/* screen viewport */}
              <div style={{ overflow: "hidden", borderRadius: 8, height: screenH, background: "#0e0d0b", position: "relative" }}>
                {/* inner dashboard at INNER_W × INNER_H */}
                <div style={{ width: INNER_W, height: INNER_H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0, display: "flex", fontFamily: "Inter, system-ui, sans-serif" }}>

                  {/* ── sidebar ── */}
                  <div style={{ width: 192, background: "#0e0d0b", borderRight: "1px solid #2a2722", display: "flex", flexDirection: "column", flexShrink: 0, padding: "16px 0" }}>
                    {/* logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 20px" }}>
                      <span style={{ width: 24, height: 24, borderRadius: 5, background: "#f0a020", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ width: 3, height: 12, borderRadius: 2, background: "#0e0d0b" }} />
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#f5f1e8", letterSpacing: "-0.02em" }}>Stockpile</span>
                    </div>
                    {/* nav */}
                    {navItems.map((n) => (
                      <div key={n.label} style={{ padding: "8px 12px", margin: "1px 8px", borderRadius: 8, background: n.active ? "#1a1815" : "transparent", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: n.active ? "#f0a020" : "#2a2722" }} />
                        <span style={{ fontSize: 12, color: n.active ? "#f5f1e8" : "#6f6a5e", fontWeight: n.active ? 500 : 400 }}>{n.label}</span>
                      </div>
                    ))}
                    {/* spacer + plan badge */}
                    <div style={{ flex: 1 }} />
                    <div style={{ margin: "0 8px", padding: "10px 12px", borderRadius: 8, border: "1px solid #2a2722", background: "#161410" }}>
                      <div style={{ fontSize: 10, color: "#6f6a5e", fontFamily: "monospace", marginBottom: 4 }}>RESELLER PLAN</div>
                      <div style={{ height: 4, borderRadius: 2, background: "#2a2722", overflow: "hidden" }}>
                        <div style={{ width: "38%", height: "100%", background: "#f0a020", borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#b8b1a3", marginTop: 4 }}>190 / 500 items</div>
                    </div>
                  </div>

                  {/* ── main area ── */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0e0d0b", overflow: "hidden" }}>

                    {/* header */}
                    <div style={{ height: 52, borderBottom: "1px solid #2a2722", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
                      <div style={{ flex: 1, background: "#1a1815", border: "1px solid #211e1a", borderRadius: 8, height: 28, display: "flex", alignItems: "center", padding: "0 10px", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "#6f6a5e" }}>🔍</span>
                        <span style={{ fontSize: 11, color: "#6f6a5e" }}>Search stock…</span>
                      </div>
                      {/* bell */}
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: "#1a1815", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <span style={{ fontSize: 13 }}>🔔</span>
                        <span style={{ position: "absolute", top: 5, right: 5, width: 6, height: 6, borderRadius: "50%", background: "#f0a020", border: "1.5px solid #0e0d0b" }} />
                      </div>
                      {/* avatar */}
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#161410", border: "1px solid #2a2722", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 11, color: "#b8b1a3", fontWeight: 500 }}>JT</span>
                      </div>
                    </div>

                    {/* content */}
                    <div style={{ flex: 1, padding: "16px 20px", overflow: "hidden" }}>

                      <div style={{ fontSize: 18, fontWeight: 600, color: "#f5f1e8", marginBottom: 12, letterSpacing: "-0.02em" }}>Overview</div>

                      {/* dead money banner */}
                      <div style={{ background: "rgba(240,160,32,0.07)", border: "1px solid rgba(240,160,32,0.3)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(240,160,32,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 14 }}>⚠️</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 16, color: "#f0a020", fontFamily: "monospace", fontWeight: 600, lineHeight: 1 }}>£243.00 not listed</div>
                            <div style={{ fontSize: 11, color: "#b8b1a3", marginTop: 3 }}>2 items bought but not earning — clear the pile</div>
                          </div>
                        </div>
                        <div style={{ background: "#f0a020", color: "#0e0d0b", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>Clear the pile</div>
                      </div>

                      {/* stat cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
                        {[
                          { l: "Unlisted",     v: "2",       c: "#f0a020" },
                          { l: "Listed",       v: "8",       c: "#f5f1e8" },
                          { l: "Sold · Jul",   v: "3",       c: "#f5f1e8" },
                          { l: "Profit · Jul", v: "£127.50", c: "#7fae4a" },
                        ].map((s) => (
                          <div key={s.l} style={{ background: "#161410", border: "1px solid #2a2722", borderRadius: 10, padding: "8px 10px" }}>
                            <div style={{ fontSize: 10, color: "#6f6a5e", marginBottom: 3 }}>{s.l}</div>
                            <div style={{ fontSize: 16, color: s.c, fontFamily: "monospace", fontWeight: 600 }}>{s.v}</div>
                          </div>
                        ))}
                      </div>

                      {/* stage tabs + item list */}
                      <div style={{ background: "#161410", border: "1px solid #2a2722", borderRadius: 12, overflow: "hidden" }}>
                        {/* tabs */}
                        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "6px 8px", borderBottom: "1px solid #211e1a" }}>
                          {[["unlisted · 2", false], ["listed · 8", true], ["sold · 3", false]].map(([label, active]) => (
                            <div key={String(label)} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: active ? 500 : 400, color: active ? "#f5f1e8" : "#6f6a5e", background: active ? "#1a1815" : "transparent", whiteSpace: "nowrap" }}>
                              {String(label)}
                            </div>
                          ))}
                        </div>
                        {/* rows */}
                        {MOCK_ITEMS.map((it) => <MockItemRow key={it.name} item={it} />)}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* stand neck */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: 120, height: 20, background: "#1a1815" }} />
            </div>
            {/* stand base */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: 220, height: 10, background: "#1a1815", borderRadius: "0 0 12px 12px" }} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- logo strip ---------- */

function Strip() {
  const platforms = ["Vinted", "eBay", "Depop", "Facebook Marketplace", "Shpock", "Gumtree"];
  const items = [...platforms, ...platforms];
  return (
    <section className="border-y border-line bg-ink-soft/40 overflow-hidden">
      <div className="ticker-track py-5">
        {items.map((p, i) => (
          <div key={i} className="flex items-center gap-4 px-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber/35 shrink-0" />
            <span className="font-display text-lg text-paper-dim whitespace-nowrap">{p}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- problem ---------- */

function Problem() {
  const items = [
    { k: "01", h: "The unlisted pile grows", b: "You source 60 items on a good weekend. Forty get listed. Twenty sit in a bin for three months, paid for, earning nothing. You forget they exist." },
    { k: "02", h: "It sells and you can't find it", b: "A notification hits at 9pm. Now you're tearing through 40 boxes hunting one jumper, because your spreadsheet just says 'grey hoodie' and nothing else." },
    { k: "03", h: "You never really know your profit", b: "Fees, postage, sourcing cost, platform cuts. By the time you net it out in your head, the number's wrong. So you stop checking." },
  ];
  return (
    <section id="problem" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-14">
        <SectionEyebrow center>The reseller's tax</SectionEyebrow>
        <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight">
          Volume doesn't kill resellers.{" "}
          <span className="text-paper-dim">Losing track does.</span>
        </h2>
        </div>
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
            <span className="text-[10px] font-mono font-medium text-amber">Bin {bin.id}</span>
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
        {["Vinted", "eBay", "Depop", "Facebook"].map((p, i) => (
          <div key={p} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${i === 1 ? "border-amber/40 bg-amber/10 text-amber" : "border-line-soft text-paper-faint"}`}>{p}</div>
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
    body: "Assign each item to a physical bin. When something sells at midnight, open Stockpile, search the item, and see its exact location in seconds — no digging.",
    preview: <StorageTab />,
  },
  {
    key: "profit",
    label: "Profit calculator",
    icon: "£",
    heading: "Know your number before you list.",
    body: "2026 UK fees built in for Vinted, eBay, Depop, and Facebook. Toggle who pays postage, see net profit and ROI update live — no more guessing your margin.",
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
    body: "Sales group into clean monthly views with revenue, cost, and margin. Export a single month or every month in one CSV — one file, handed straight to your accountant.",
    preview: <ArchivesTab />,
  },
] as const;

function Features() {
  const [active, setActive] = useState(0);
  const tab = FEATURE_TABS[active];

  return (
    <section id="features" className="px-6 py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <SectionEyebrow center>What it does</SectionEyebrow>
          <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight mb-5">
            One job: nothing slips through the cracks.
          </h2>
          <p className="text-paper-dim max-w-xl mx-auto text-lg">
            Five tools built around the one thing a spreadsheet can't do — actively watch the gap between bought and sold.
          </p>
        </div>

        {/* tab bar */}
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
                <a href="#cta" className="mt-8 self-start inline-flex items-center gap-2 text-sm font-medium text-amber hover:text-paper transition-colors">
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

/* ---------- who it's for ---------- */

function Who() {
  const rows = [
    { h: "The weekend sourcer", b: "You hit car boots and charity shops hard, come home with 40-60 items, and the logging never quite happens. Stockpile makes adding stock a tap, not a chore.", tag: "200-500 items" },
    { h: "The full-time flipper", b: "This is your income. You're across four platforms with stock in 30+ bins, and a single lost item is real money. Retrieval and profit tracking pay for themselves.", tag: "500-2,000 items" },
    { h: "The scaling operator", b: "You've outgrown the spreadsheet, maybe added help, and need the numbers clean for tax. The monthly archives and aging flags keep the whole operation honest.", tag: "2,000+ items" },
  ];
  return (
    <section id="who" className="px-6 py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow>Who it's built for</SectionEyebrow>
        <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight max-w-3xl mb-16">
          For resellers who've outgrown "I'll remember."
        </h2>
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
    { f: "Finding an item when it sells", sheet: "Ctrl+F a name you half-remember", app: "Tap the item and see its bin instantly" },
    { f: "Knowing what's not listed", sheet: "Nothing tells you. The pile just grows", app: "A live alert shouts your dead money" },
    { f: "Working out net profit", sheet: "A formula you built and forgot to update", app: "Calculated on sale, fees current per platform" },
    { f: "Tax time", sheet: "A late-night scramble to reconcile tabs", app: "Monthly totals, ready to export" },
    { f: "Falling a week behind", sheet: "The whole sheet becomes untrustworthy", app: "Designed to stay useful when you're behind" },
  ];
  return (
    <section id="vs" className="px-6 py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow>Stockpile vs the spreadsheet</SectionEyebrow>
        <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight max-w-3xl mb-5">
          A spreadsheet is free. So is forgetting £486 in a box.
        </h2>
        <p className="text-paper-dim max-w-2xl text-lg mb-14">
          A grid stores what you type and does nothing else. Stockpile is built for the messy, physical reality of a stockroom and it actively watches the gaps a spreadsheet can't.
        </p>
        <Reveal>
          <div className="rounded-2xl border border-line overflow-hidden">
            <div className="grid grid-cols-[1.1fr_1fr_1.1fr] bg-ink-soft border-b border-line text-sm font-medium">
              <div className="p-4 md:p-5 text-paper-faint">The moment</div>
              <div className="p-4 md:p-5 text-paper-faint border-x border-line">Spreadsheet</div>
              <div className="p-4 md:p-5 text-amber flex items-center gap-2">Stockpile</div>
            </div>
            {rows.map((r, i) => (
              <div key={r.f} className={`grid grid-cols-[1.1fr_1fr_1.1fr] text-[14px] ${i % 2 ? "bg-ink-card" : "bg-ink"}`}>
                <div className="p-4 md:p-5 font-medium">{r.f}</div>
                <div className="p-4 md:p-5 text-paper-faint border-x border-line flex items-start gap-2">
                  <span className="text-rust mt-0.5 shrink-0">✕</span>{r.sheet}
                </div>
                <div className="p-4 md:p-5 text-paper-dim flex items-start gap-2">
                  <span className="text-moss mt-0.5 shrink-0">✓</span>{r.app}
                </div>
              </div>
            ))}
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
    <section id="case-study" className="px-6 py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow>Case study</SectionEyebrow>
        <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight max-w-3xl mb-5">
          From a 900-row Google Sheet{" "}
          <span className="text-paper-dim">to knowing exactly where every item is.</span>
        </h2>
        <p className="text-paper-dim text-lg max-w-2xl mb-16">
          Marcus runs a full-time vintage clothing operation across eBay and Vinted. Here's what happened when he dropped the spreadsheet.
        </p>
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
            <p className="font-mono text-xs uppercase tracking-widest text-amber mb-6">After: Stockpile</p>
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
        <Reveal>
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
                  { k: "On Stockpile since", v: "March 2025" },
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
                "First thing Stockpile showed me: I had £612 of unlisted stock sitting in three bins I'd half-forgotten. I listed all of it that week. That alone paid for a year of the subscription."
              </blockquote>
              <p>
                "The bin map changed everything. I got a Vinted notification at 11pm. Opened Stockpile, searched the item: Bin C3, top layer. Done in 20 seconds. On the spreadsheet that would have been a full-box dig at midnight."
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
    text: "I used to spend Sunday evenings dreading the stock audit. Now I open Stockpile, see exactly what's unlisted, and I'm done in 20 minutes. The profit tracking alone has paid for itself ten times over.",
  },
  {
    name: "Jake R.",
    platform: "Depop & eBay",
    items: "~300 items",
    stars: 5,
    text: "The bin map is genuinely life-changing. When something sells at midnight I'm not ripping boxes apart anymore. I tap the item and it tells me exactly where it is. Can't believe I didn't have this sooner.",
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
    text: "Tax time used to be a nightmare. Last January I exported my Stockpile monthly archives and handed them straight to my accountant. Two-hour job, not two days. Worth £15 a month easily.",
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
    <section id="reviews" className="px-6 py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow center>What resellers say</SectionEyebrow>
        <h2 className="font-display font-medium text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.08] tracking-tight text-center mb-16">
          Trusted by resellers who mean business.
        </h2>
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
      </div>
    </section>
  );
}

/* ---------- pricing / cta ---------- */

const FEATURE_LABELS: Record<FeatureFlag, string> = {
  pipeline: "3-stage pipeline (Unlisted / Listed / Sold)",
  leak_alert: "Not listed yet leak alert",
  bin_lookup: "Storage map & instant retrieval",
  basic_profit: "Profit calculator (2026 UK fees — Vinted, eBay, Depop, Facebook)",
  monthly_archives: "Monthly archives",
  aging_flags: "Aging flags on dead stock",
  tax_export: "Tax-ready CSV export",
  multi_platform: "Multi-platform tracking",
  bulk_actions: "Bulk actions",
  advanced_reporting: "Advanced reporting",
  csv_import: "CSV import",
};

const FREE_FEATURES: FeatureFlag[] = ["pipeline", "leak_alert", "bin_lookup", "basic_profit"];
const PRO_EXTRA_FEATURES: FeatureFlag[] = ["monthly_archives", "aging_flags", "tax_export", "multi_platform", "bulk_actions", "advanced_reporting", "csv_import"];

function CTA() {
  const free = getTier("starter");
  const pro = getTier("pro");

  return (
    <section id="cta" className="px-6 py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <SectionEyebrow center>Pricing</SectionEyebrow>
          <h2 className="font-display font-medium text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-tight mb-5">
            Simple pricing. No surprises.
          </h2>
          <p className="text-paper-dim text-lg max-w-xl mx-auto">
            Start free, log your first haul, see how it works. Upgrade when it's earning its keep.
          </p>
        </div>

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
              <a href="#" className="block text-center px-5 py-3.5 rounded-xl border border-line text-paper font-medium text-sm hover:border-paper-faint hover:bg-ink-soft transition-colors">
                Start free — no card needed
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
              <a href="#" className="btn-shine block text-center px-5 py-3.5 rounded-xl bg-amber text-ink font-medium text-sm hover:bg-paper transition-colors">
                Get started
              </a>
              <p className="text-center text-xs text-paper-faint mt-3">Cancel anytime · No hidden fees</p>
            </div>
          </Reveal>

        </div>
        <p className="text-center text-sm text-paper-faint mt-10">
          All prices in GBP · Secure billing via Stripe · Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer className="border-t border-line px-6 py-12">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-paper-faint">
        <div className="flex items-center gap-2.5">
          <span className="relative grid place-items-center w-6 h-6 rounded-[5px] bg-amber overflow-hidden">
            <span className="relative w-[2.5px] h-3 rounded-full bg-ink" />
          </span>
          <span className="font-display text-paper">Stockpile</span>
        </div>
        <p>Inventory CRM for resellers. © {new Date().getFullYear()}</p>
        <div className="flex gap-6 flex-wrap justify-center">
          <a href="#features" className="hover:text-paper transition-colors">Features</a>
          <a href="#vs" className="hover:text-paper transition-colors">vs Spreadsheet</a>
          <a href="#case-study" className="hover:text-paper transition-colors">Case study</a>
          <a href="#reviews" className="hover:text-paper transition-colors">Reviews</a>
          <a href="#cta" className="hover:text-paper transition-colors">Pricing</a>
          <Link href="/privacy" className="hover:text-paper transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-paper transition-colors">Terms of Service</Link>
        </div>
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

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, seen } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? "translateY(0) scale(1)" : "translateY(22px) scale(0.98)",
        transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- page ---------- */

export default function Page() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Strip />
      <Problem />
      <DashboardMockup />
      <Features />
      <Who />
      <Versus />
      <CaseStudy />
      <Reviews />
      <CTA />
      <Footer />
    </main>
  );
}
