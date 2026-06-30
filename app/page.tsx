"use client";

import { useState, useEffect, useRef } from "react";
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
  return (
    <section id="top" className="grain relative overflow-hidden pt-36 pb-24 px-6">
      <div className="orb absolute top-24 right-1/4 w-[500px] h-[500px] rounded-full bg-amber/[0.06] blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        <div>
          <div className="rise inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-amber mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" style={{ animation: "blink 1.6s infinite" }} />
            Stock management & profit tracking for resellers
          </div>
          <h1 className="rise font-display font-medium leading-[0.98] tracking-tight text-[clamp(2.6rem,6vw,4.6rem)]" style={{ animationDelay: "0.05s" }}>
            Manage your stock.{" "}
            <span className="relative whitespace-nowrap">
              <span className="text-amber">Own your profit.</span>
            </span>
          </h1>
          <p className="rise mt-7 text-lg text-paper-dim max-w-xl leading-relaxed" style={{ animationDelay: "0.12s" }}>
            Stockpile gives you a live view of everything you own, exactly where it's stored, and what you're actually making so every item is accounted for and every penny is tracked from source to sold.
          </p>
          <div className="rise mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "0.18s" }}>
            <a href="#cta" className="btn-shine px-6 py-3.5 rounded-xl bg-amber text-ink font-medium hover:bg-paper transition-colors">
              Start managing free
            </a>
            <a href="#vs" className="px-6 py-3.5 rounded-xl border border-line text-paper hover:border-paper-faint hover:-translate-y-0.5 transition-all duration-200">
              Why not a spreadsheet?
            </a>
          </div>
          <p className="rise mt-5 text-sm text-paper-faint" style={{ animationDelay: "0.22s" }}>
            £19.99/mo · no card to start · cancel anytime
          </p>
        </div>
        <HeroPanel />
      </div>
    </section>
  );
}

function HeroPanel() {
  return (
    <div className="rise float relative" style={{ animationDelay: "0.15s" }}>
      <div className="relative rounded-2xl border border-line bg-ink-card p-5 shadow-2xl shadow-black/40 overflow-hidden">
        <div className="scan-line" />
        <div className="rounded-xl bg-amber/10 border border-amber/30 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center w-9 h-9 rounded-lg bg-amber/20 text-amber text-lg">⚠</div>
            <div>
              <p className="font-mono text-amber text-lg leading-none">£<Counter to={486} /></p>
              <p className="text-xs text-paper-faint mt-1">of stock not listed</p>
            </div>
          </div>
          <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber text-ink">Clear pile</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          {[
            { l: "Unlisted", v: "23", c: "text-amber" },
            { l: "Listed", v: "184", c: "text-paper" },
            { l: "Profit / Jul", v: "£612", c: "text-moss" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg bg-ink-soft border border-line-soft px-3 py-3">
              <p className="text-[11px] text-paper-faint">{s.l}</p>
              <p className={`font-mono text-xl mt-1 ${s.c}`}>{s.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {[
            { n: "North Face puffer", b: "Bin A1", p: "Vinted", t: "good", age: "" },
            { n: "Levi 501 - vintage", b: "Bin C4", p: "-", t: "fair", age: "94d" },
            { n: "Carhartt beanie", b: "Bin A2", p: "Depop", t: "excellent", age: "" },
          ].map((it) => (
            <div key={it.n} className="flex items-center justify-between gap-3 rounded-lg bg-ink-soft border border-line-soft px-3.5 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm truncate">{it.n}</span>
                <CondDot t={it.t} />
                {it.age && (
                  <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-rust/15 text-rust">{it.age}</span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 text-[11px] text-paper-faint font-mono">
                <span>{it.b}</span>
                <span className="text-paper-dim">{it.p}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -right-3 -bottom-3 hidden sm:block rounded-xl bg-paper text-ink px-4 py-2.5 shadow-xl shadow-black/40 float-tag">
        <p className="font-mono text-xs leading-none">sold · £45 net</p>
      </div>
    </div>
  );
}

function CondDot({ t }: { t: string }) {
  const map: Record<string, string> = {
    excellent: "bg-moss", good: "bg-amber", fair: "bg-rust", flawed: "bg-rust",
  };
  return <span className={`shrink-0 w-2 h-2 rounded-full ${map[t] ?? "bg-paper-faint"}`} title={t} />;
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
        <SectionEyebrow>The reseller's tax</SectionEyebrow>
        <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight max-w-3xl">
          Volume doesn't kill resellers.{" "}
          <span className="text-paper-dim">Losing track does.</span>
        </h2>
        <div className="mt-16 grid md:grid-cols-3 gap-px bg-line rounded-2xl overflow-hidden border border-line">
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

function Features() {
  return (
    <section id="features" className="px-6 py-28 border-t border-line">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow>What it does</SectionEyebrow>
        <h2 className="font-display font-medium text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight max-w-3xl">
          One job: nothing slips through the cracks.
        </h2>
        <p className="mt-5 text-paper-dim max-w-2xl text-lg">
          Five tools, built around the one thing a spreadsheet can't do: actively watch the gap between bought and sold.
        </p>
        <div className="mt-16 grid md:grid-cols-6 gap-5">
          <BigFeature />
          <Feature className="md:col-span-2" icon="◉" title="3-stage pipeline" body="Unlisted → Listed → Sold. Every item has one clear state. The unlisted pile is loud on purpose." />
          <Feature className="md:col-span-2" icon="⊞" title="Storage map" body="Assign each item to a physical bin. When it sells, tap it and see exactly which box it's in." />
          <Feature className="md:col-span-2" icon="∑" title="Triggered profit engine" body="Mark sold and a modal forces the real numbers: price, postage, fees. Exact net profit, instantly." />
          <Feature className="md:col-span-3" icon="◷" title="Aging flags" body="Anything unlisted or unsold past 60 or 90 days gets flagged, so dead stock gets relisted or dropped, not forgotten." />
          <Feature className="md:col-span-3" icon="▤" title="Monthly archives, tax-ready" body="Sales group into clean monthly views with totals and margin. Export when HMRC asks, your books are already done." />
        </div>
      </div>
    </section>
  );
}

function BigFeature() {
  return (
    <Reveal className="md:col-span-6">
      <div className="relative overflow-hidden rounded-2xl border border-amber/30 bg-gradient-to-br from-amber/[0.08] to-transparent p-8 md:p-10">
        <div className="grid md:grid-cols-[1fr_0.8fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-amber mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber" /> The core
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-medium mb-4 leading-tight">
              The "not listed yet" alert
            </h3>
            <p className="text-paper-dim leading-relaxed text-[15px] max-w-md">
              The app opens shouting your dead money: the total value of stock you've paid for but haven't put up for sale anywhere. Watch it shrink as you list. Hit zero and it turns green.
            </p>
          </div>
          <LeakMeter />
        </div>
      </div>
    </Reveal>
  );
}

function LeakMeter() {
  const { ref, seen } = useInView<HTMLDivElement>(0.4);
  const bars = [
    { v: "£486", h: 88, color: "bg-amber", text: "text-amber" },
    { v: "£210", h: 52, color: "bg-amber/60", text: "text-amber" },
    { v: "£0", h: 22, color: "bg-moss", text: "text-moss" },
  ];
  return (
    <div ref={ref} className="flex items-end justify-center gap-3 h-44">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-2 w-16">
          <div className="relative w-full rounded-t-lg bg-ink-soft border border-line-soft overflow-hidden flex items-end" style={{ height: 140 }}>
            <div
              className={`w-full ${b.color} transition-[height] duration-1000 ease-out`}
              style={{ height: seen ? `${b.h}%` : "100%", transitionDelay: `${i * 180}ms` }}
            />
          </div>
          <span className={`font-mono text-sm ${b.text}`}>{b.v}</span>
        </div>
      ))}
    </div>
  );
}

function Feature({ icon, title, body, className = "" }: { icon: string; title: string; body: string; className?: string }) {
  return (
    <Reveal className={className}>
      <div className="rounded-2xl border border-line bg-ink-card p-7 h-full hover:border-paper-faint/50 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 group">
        <div className="grid place-items-center w-11 h-11 rounded-xl bg-ink-soft border border-line-soft text-amber text-lg mb-5 group-hover:bg-amber group-hover:text-ink group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>
        <h3 className="font-display text-lg font-medium mb-2.5">{title}</h3>
        <p className="text-paper-dim leading-relaxed text-[14px]">{body}</p>
      </div>
    </Reveal>
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
  basic_profit: "Net profit calculator",
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

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto items-stretch">

          {/* Free card */}
          <Reveal delay={0}>
            <div className="flex flex-col rounded-2xl border border-line bg-ink-card p-8 h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 transition-all duration-300">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-paper-faint mb-3">{free.name}</p>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="font-display text-4xl font-medium">Free</span>
              </div>
              <p className="text-paper-faint text-sm mb-6">{free.tagline}</p>
              <div className="inline-flex self-start items-center px-3 py-1.5 rounded-lg text-xs font-mono bg-ink-soft border border-line text-paper-dim mb-6">
                {formatItemCap("starter")} items
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-paper-dim">
                    <span className="mt-0.5 grid place-items-center w-4 h-4 rounded-full bg-moss/20 text-moss text-[10px] shrink-0">✓</span>
                    {FEATURE_LABELS[f]}
                  </li>
                ))}
              </ul>
              <a href="#" className="block text-center px-5 py-3 rounded-xl border border-line text-paper font-medium text-sm hover:border-paper-faint transition-colors">
                Start free
              </a>
              <p className="text-center text-xs text-paper-faint mt-3">No card required</p>
            </div>
          </Reveal>

          {/* Pro card */}
          <Reveal delay={0.1}>
            <div className="relative flex flex-col rounded-2xl border border-amber/50 bg-gradient-to-b from-amber/[0.08] to-transparent p-8 h-full card-glow hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 transition-all duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber text-ink text-xs font-medium font-mono uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink/40" />
                  Full access
                </span>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-paper-faint mb-3">{pro.name}</p>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="font-display text-4xl font-medium">£19.99</span>
                <span className="text-paper-faint text-sm">/ month</span>
              </div>
              <p className="text-paper-faint text-sm mb-6">{pro.tagline}</p>
              <div className="inline-flex self-start items-center px-3 py-1.5 rounded-lg text-xs font-mono bg-amber/15 text-amber border border-amber/25 mb-6">
                Unlimited items
              </div>
              <div className="flex-1 mb-8">
                <p className="text-xs text-paper-faint font-mono mb-3">Everything in Free, plus:</p>
                <ul className="space-y-2.5">
                  {PRO_EXTRA_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-paper-dim">
                      <span className="mt-0.5 grid place-items-center w-4 h-4 rounded-full bg-amber/20 text-amber text-[10px] shrink-0">✓</span>
                      {FEATURE_LABELS[f]}
                    </li>
                  ))}
                </ul>
              </div>
              <a href="#" className="btn-shine block text-center px-5 py-3 rounded-xl bg-amber text-ink font-medium text-sm hover:bg-paper transition-colors">
                Get started
              </a>
              <p className="text-center text-xs text-paper-faint mt-3">Cancel anytime</p>
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
        <div className="flex gap-6">
          <a href="#features" className="hover:text-paper transition-colors">Features</a>
          <a href="#vs" className="hover:text-paper transition-colors">vs Spreadsheet</a>
          <a href="#case-study" className="hover:text-paper transition-colors">Case study</a>
          <a href="#reviews" className="hover:text-paper transition-colors">Reviews</a>
          <a href="#cta" className="hover:text-paper transition-colors">Pricing</a>
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
