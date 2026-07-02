"use client";

import { useState, useEffect, useRef } from "react";

/* ---------- data ---------- */

const COND = {
  excellent: { label: "Excellent", dot: "#7fae4a", bg: "rgba(127,174,74,0.14)", fg: "#9cc76a" },
  good:      { label: "Good",      dot: "#f0a020", bg: "rgba(240,160,32,0.14)", fg: "#f0b657" },
  fair:      { label: "Fair",      dot: "#d8602f", bg: "rgba(216,96,47,0.14)",  fg: "#e28259" },
  flawed:    { label: "Flawed",    dot: "#d8602f", bg: "rgba(216,96,47,0.14)",  fg: "#e28259" },
} as const;

type CondKey = keyof typeof COND;
type Stage = "unlisted" | "listed" | "sold";

interface Item {
  id: number; code: string; name: string; cond: CondKey;
  paid: number; stage: Stage; age?: number;
  platform?: string; bin?: string;
}

const SEED_ITEMS: Item[] = [
  { id: 1, code: "IT-0231", name: "Carhartt beanie",       cond: "excellent", paid: 2,  stage: "unlisted", age: 4  },
  { id: 2, code: "IT-0229", name: "Levi 501 — vintage",    cond: "fair",      paid: 5,  stage: "unlisted", age: 94 },
  { id: 3, code: "IT-0228", name: "Nike fleece hoodie",    cond: "good",      paid: 4,  stage: "unlisted", age: 12 },
  { id: 4, code: "IT-0225", name: "The North Face puffer", cond: "good",      paid: 12, stage: "listed",   platform: "Vinted", bin: "A1" },
  { id: 5, code: "IT-0224", name: "Adidas track top",      cond: "excellent", paid: 3,  stage: "listed",   platform: "eBay",   bin: "A2" },
  { id: 6, code: "IT-0221", name: "Ralph Lauren shirt",    cond: "good",      paid: 4,  stage: "listed",   platform: "Depop",  bin: "B1" },
];

const MONTHS = [
  { m: "July 2026",  sold: 31, profit: 612, margin: 58 },
  { m: "June 2026",  sold: 44, profit: 891, margin: 61 },
  { m: "May 2026",   sold: 28, profit: 503, margin: 54 },
];

type NavKey = "overview" | "stock" | "storage" | "calculator" | "archives";

const NAV: { key: NavKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "overview", label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    key: "stock", label: "Stock",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>
      </svg>
    ),
  },
  {
    key: "storage", label: "Storage map",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/>
        <rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    key: "calculator", label: "Profit calculator",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="14" x2="8" y2="14"/>
        <line x1="16" y1="14" x2="16" y2="18"/><line x1="8" y1="18" x2="12" y2="18"/>
      </svg>
    ),
  },
  {
    key: "archives", label: "Monthly archives",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <rect x="3" y="4" width="18" height="4" rx="1"/>
        <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/>
        <line x1="10" y1="12" x2="14" y2="12"/>
      </svg>
    ),
  },
];

/* ---------- helpers ---------- */

const gbp = (n: number) => (n < 0 ? "−£" : "£") + Math.abs(n).toFixed(2);

/* ---------- icons ---------- */

function IconFilter() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}
function IconSort() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="3" y1="6" x2="15" y2="6"/><line x1="3" y1="12" x2="11" y2="12"/><line x1="3" y1="18" x2="7" y2="18"/>
    </svg>
  );
}
function IconArchive() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="4" rx="1"/>
      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  );
}
function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}
function IconBin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber">
      <rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/>
      <rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/>
    </svg>
  );
}

/* ---------- add stock modal ---------- */

const EMPTY_FORM = { name: "", paid: "", cond: "good" as CondKey, bin: "" };

function AddStockModal({ onClose, onAdd }: { onClose: () => void; onAdd: (item: Item) => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Item name is required."); return; }
    const paid = parseFloat(form.paid);
    if (isNaN(paid) || paid < 0) { setError("Enter a valid price paid."); return; }

    const id = Date.now();
    const code = `IT-${String(id).slice(-4)}`;
    onAdd({ id, code, name: form.name.trim(), cond: form.cond, paid, stage: "unlisted", age: 0, bin: form.bin.trim() || undefined });
    onClose();
  }

  const conditions: CondKey[] = ["excellent", "good", "fair", "flawed"];
  const fieldCls = "w-full bg-ink border border-line rounded-xl px-3.5 py-2.5 text-sm text-paper outline-none focus:border-amber/60 transition-colors placeholder:text-paper-faint";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* sheet */}
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-ink-card shadow-2xl shadow-black/60 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <div>
            <h2 className="font-display font-medium text-lg">Add stock</h2>
            <p className="text-paper-faint text-xs mt-0.5">New items land in Unlisted</p>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center w-8 h-8 rounded-lg text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* form */}
        <form onSubmit={submit} className="px-6 py-5 space-y-5">
          {/* item name */}
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Item name</label>
            <input
              ref={nameRef}
              className={fieldCls}
              placeholder="e.g. Carhartt beanie"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }}
            />
          </div>

          {/* price paid */}
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Price paid (£)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-faint text-sm">£</span>
              <input
                className={`${fieldCls} pl-7`}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.paid}
                onChange={(e) => { setForm((f) => ({ ...f, paid: e.target.value })); setError(""); }}
              />
            </div>
          </div>

          {/* condition */}
          <div>
            <label className="block text-sm text-paper-dim mb-2">Condition</label>
            <div className="grid grid-cols-4 gap-2">
              {conditions.map((c) => {
                const active = form.cond === c;
                const meta = COND[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, cond: c }))}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-medium"
                    style={{
                      borderColor: active ? meta.dot + "80" : "var(--color-line)",
                      background: active ? meta.bg : "transparent",
                      color: active ? meta.fg : "var(--color-paper-faint)",
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.dot }} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* storage code */}
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">
              Storage code <span className="text-paper-faint">(optional)</span>
            </label>
            <input
              className={fieldCls}
              placeholder="e.g. A1, Bin C4, Shelf 2"
              value={form.bin}
              onChange={(e) => setForm((f) => ({ ...f, bin: e.target.value }))}
            />
            <p className="text-xs text-paper-faint mt-1.5">Where it lives so you can find it fast</p>
          </div>

          {error && <p className="text-sm text-rust">{error}</p>}

          {/* actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-line text-sm text-paper-dim hover:text-paper hover:border-paper-faint transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors"
            >
              Add to stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- item row ---------- */

function ItemRow({ item }: { item: Item }) {
  const c = COND[item.cond];
  const aging = (item.age ?? 0) >= 60 && item.stage !== "sold";

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-t border-line-soft first:border-t-0 hover:bg-ink-soft/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} />
        <span className="text-sm font-medium truncate">{item.name}</span>
        <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-md" style={{ background: c.bg, color: c.fg }}>
          {c.label}
        </span>
        {aging && (
          <span className="shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-rust/15 text-rust font-mono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
            </svg>
            {item.age}d
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 shrink-0 text-xs text-paper-faint">
        {item.stage === "listed" ? (
          <>
            <span className="text-paper-dim">{item.platform}</span>
            <span>Bin {item.bin}</span>
          </>
        ) : (
          <span>paid £{item.paid}</span>
        )}
        <span className="hidden sm:block font-mono">{item.code}</span>
        {item.stage === "unlisted" && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-amber/12 text-amber border border-amber/25">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            Not listed
          </span>
        )}
        {item.stage === "listed" && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-moss/12 text-moss border border-moss/25">
            <span className="w-1.5 h-1.5 rounded-full bg-moss" />
            Listed
          </span>
        )}
        {item.stage === "sold" && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-paper-faint/10 text-paper-faint border border-line">
            <span className="w-1.5 h-1.5 rounded-full bg-paper-faint" />
            Sold
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- sections ---------- */

function Overview({ items, stage, setStage }: { items: Item[]; stage: Stage; setStage: (s: Stage) => void }) {
  const stages: Stage[] = ["unlisted", "listed", "sold"];
  const shown = items.filter((i) => i.stage === stage);
  const counts = {
    unlisted: items.filter((i) => i.stage === "unlisted").length,
    listed:   items.filter((i) => i.stage === "listed").length,
    sold:     31,
  };
  const deadMoney = items.filter((i) => i.stage === "unlisted").reduce((s, i) => s + i.paid, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Overview</h1>
        <p className="text-paper-dim text-sm mt-1">Wednesday, 1 July · here&apos;s where your stock stands</p>
      </div>

      <div className="rounded-2xl border border-amber/30 bg-amber/[0.07] p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-amber/15 text-amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/>
            </svg>
          </span>
          <div>
            <p className="font-mono text-2xl text-amber leading-none">{gbp(deadMoney)} not listed</p>
            <p className="text-sm text-paper-dim mt-1.5">
              {counts.unlisted} items bought but not earning — clear the pile to put them to work
            </p>
          </div>
        </div>
        <button
          onClick={() => setStage("unlisted")}
          className="px-4 py-2.5 rounded-xl bg-amber text-ink font-medium text-sm hover:bg-paper transition-colors whitespace-nowrap"
        >
          Clear the pile
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Unlisted",    value: counts.unlisted, cls: "text-amber" },
          { label: "Listed",      value: counts.listed,   cls: "" },
          { label: "Sold · Jul",  value: 31,              cls: "" },
          { label: "Profit · Jul",value: "£612",          cls: "text-moss" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-ink-card px-4 py-3.5">
            <p className="text-[13px] text-paper-faint">{s.label}</p>
            <p className={`font-mono text-2xl mt-1 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-ink-card overflow-hidden">
        <div className="flex items-center gap-1 p-2 border-b border-line overflow-x-auto">
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap shrink-0 capitalize transition-colors ${
                s === stage ? "bg-ink-soft text-paper font-medium" : "text-paper-dim hover:text-paper"
              }`}
            >
              {s} · {counts[s]}
            </button>
          ))}
          <div className="ml-auto flex gap-1 px-2 shrink-0">
            <button className="grid place-items-center w-8 h-8 rounded-md text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"><IconFilter /></button>
            <button className="grid place-items-center w-8 h-8 rounded-md text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"><IconSort /></button>
          </div>
        </div>
        <div>
          {shown.length > 0
            ? shown.map((it) => <ItemRow key={it.id} item={it} />)
            : <p className="px-4 py-8 text-center text-sm text-paper-faint">No items in this stage yet.</p>}
        </div>
      </div>
    </div>
  );
}

function Stock({ items }: { items: Item[] }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Stock</h1>
        <p className="text-paper-dim text-sm mt-1">Every item across all three stages</p>
      </div>
      <div className="rounded-2xl border border-line bg-ink-card overflow-hidden">
        {items.length > 0
          ? <div>{items.map((it) => <ItemRow key={it.id} item={it} />)}</div>
          : <p className="px-4 py-8 text-center text-sm text-paper-faint">No stock yet — hit Add stock to get started.</p>}
      </div>
    </div>
  );
}

function StorageMap({ items }: { items: Item[] }) {
  const binsWithItems = Array.from(new Set(items.filter((i) => i.bin).map((i) => i.bin!)));
  const allBins = Array.from(new Set([...["A1", "A2", "B1", "B2", "C1", "C4"], ...binsWithItems])).sort();
  const byBin: Record<string, Item[]> = {};
  items.forEach((i) => { if (i.bin) (byBin[i.bin] = byBin[i.bin] ?? []).push(i); });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Storage map</h1>
        <p className="text-paper-dim text-sm mt-1">What&apos;s inside each bin — tap an item to find it fast</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBins.map((b) => {
          const binItems = byBin[b] ?? [];
          return (
            <div key={b} className="rounded-2xl border border-line bg-ink-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 font-medium"><IconBin />Bin {b}</span>
                <span className="text-xs text-paper-faint font-mono">{binItems.length} items</span>
              </div>
              {binItems.length > 0 ? binItems.map((it) => (
                <div key={it.id} className="flex items-center gap-2 text-sm text-paper-dim mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: COND[it.cond].dot }} />
                  <span className="truncate">{it.name}</span>
                </div>
              )) : (
                <p className="text-xs text-paper-faint">Empty</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Plat = "vinted" | "ebay" | "depop" | "facebook";
type EbayType = "private" | "business";
type Payer = "buyer" | "free";

function ProfitCalculator() {
  const [cst, setCst] = useState(5);
  const [prc, setPrc] = useState(30);
  const [postCost, setPostCost] = useState(3.2);
  const [plat, setPlat] = useState<Plat>("ebay");
  const [ebayType, setEbayType] = useState<EbayType>("private");
  const [payer, setPayer] = useState<Payer>("buyer");

  const isVinted = plat === "vinted", isFb = plat === "facebook";
  const isEbay = plat === "ebay", isDepop = plat === "depop";
  const choosable = isEbay || isDepop;
  const sellerPays = (isVinted || isFb) ? false : payer === "free";

  let fee = 0, feeLabel = "Seller fee (£0)";
  if (isDepop) {
    const base = prc + (payer === "buyer" ? postCost : 0);
    fee = base > 0 ? base * 0.029 + 0.30 : 0;
    feeLabel = "Depop processing (2.9% + 30p, incl. postage)";
  } else if (isEbay) {
    if (ebayType === "private") { fee = 0; feeLabel = "eBay private (£0, standard cats)"; }
    else { const po = prc > 10 ? 0.40 : 0; fee = prc * 0.128 + 0.30 + po; feeLabel = "eBay business (12.8% + 30p + 40p)"; }
  }

  const postDed = sellerPays ? postCost : 0;
  const net = prc - fee - postDed - cst;
  const margin = prc > 0 ? Math.round(net / prc * 100) : 0;
  const roi = cst > 0 ? net / cst : 0;

  let note = "";
  if (isVinted) note = "On Vinted the buyer always pays postage — it never comes out of your payout.";
  else if (isFb) note = "Facebook is usually local pickup or seller-arranged — no platform postage.";
  else if (payer === "buyer") note = "Buyer pays postage, so it doesn't reduce your take-home." + (isDepop ? " (Depop still charges processing on it.)" : "");
  else note = "Free postage means you absorb the cost — it comes straight out of your margin.";

  const fieldCls = "w-full bg-ink border border-line rounded-lg px-3 py-2.5 text-sm text-paper outline-none focus:border-amber/50 transition-colors";
  const segBtn = (active: boolean) =>
    `flex-1 text-sm py-2 px-3 rounded-lg border transition-colors ${active ? "border-amber/50 bg-amber/10 text-amber" : "border-line text-paper-dim hover:text-paper"}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Profit calculator</h1>
        <p className="text-paper-dim text-sm mt-1">Work out your real take-home before you list — 2026 UK fees</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-line bg-ink-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-paper-dim mb-1.5">You paid</label>
              <input className={fieldCls} type="number" value={cst} onChange={(e) => setCst(+e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-paper-dim mb-1.5">List price</label>
              <input className={fieldCls} type="number" value={prc} onChange={(e) => setPrc(+e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Platform</label>
            <select className={fieldCls} value={plat} onChange={(e) => setPlat(e.target.value as Plat)}>
              <option value="vinted">Vinted</option>
              <option value="ebay">eBay</option>
              <option value="depop">Depop</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
          {isEbay && (
            <div>
              <label className="block text-sm text-paper-dim mb-1.5">eBay account type</label>
              <div className="flex gap-2">
                <button className={segBtn(ebayType === "private")} onClick={() => setEbayType("private")}>Private seller</button>
                <button className={segBtn(ebayType === "business")} onClick={() => setEbayType("business")}>Business seller</button>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Who pays postage?</label>
            {choosable && (
              <div className="flex gap-2 mb-3">
                <button className={segBtn(payer === "buyer")} onClick={() => setPayer("buyer")}>Buyer pays</button>
                <button className={segBtn(payer === "free")} onClick={() => setPayer("free")}>Free postage (you pay)</button>
              </div>
            )}
            {choosable && payer === "free" && (
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm text-paper-dim whitespace-nowrap">Postage cost</label>
                <input className={fieldCls} type="number" value={postCost} onChange={(e) => setPostCost(+e.target.value)} />
              </div>
            )}
            <p className="text-xs text-paper-faint">{note}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-ink-card p-5 flex flex-col">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-paper-dim">
              <span>Sale price</span><span className="font-mono text-paper">{gbp(prc)}</span>
            </div>
            <div className="flex items-center justify-between text-paper-dim">
              <span>{feeLabel}</span><span className="font-mono text-rust">{gbp(-fee)}</span>
            </div>
            {postDed > 0 && (
              <div className="flex items-center justify-between text-paper-dim">
                <span>Postage</span><span className="font-mono text-rust">{gbp(-postDed)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-paper-dim">
              <span>Cost of item</span><span className="font-mono text-rust">{gbp(-cst)}</span>
            </div>
          </div>
          <div className="mt-auto pt-5">
            <div className="rounded-xl bg-ink-soft px-4 py-4 flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">Net profit</span>
                <span className="text-xs text-paper-dim ml-2">{margin}% margin</span>
              </div>
              <span className="font-mono text-2xl" style={{ color: net >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>
                {gbp(net)}
              </span>
            </div>
            <p className="text-xs text-paper-faint text-center mt-3">
              {cst > 0 ? `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}× return on what you paid` : "—"}
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs text-paper-faint mt-5">
        Fees reflect 2026 UK rates. Vinted &amp; Facebook charge sellers £0; Depop keeps payment processing; eBay depends on private vs business. Rates change — keep these current.
      </p>
    </div>
  );
}

function Archives() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Monthly archives</h1>
        <p className="text-paper-dim text-sm mt-1">Your sales grouped by month — tax-ready totals</p>
      </div>
      <div className="space-y-3">
        {MONTHS.map((mo) => (
          <div key={mo.m} className="rounded-2xl border border-line bg-ink-card p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-ink-soft border border-line-soft text-amber">
                <IconArchive />
              </span>
              <div>
                <p className="font-medium">{mo.m}</p>
                <p className="text-sm text-paper-dim mt-0.5">{mo.sold} items sold · {mo.margin}% margin</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-mono text-xl text-moss">£{mo.profit}</p>
                <p className="text-xs text-paper-faint">net profit</p>
              </div>
              <button className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-line-soft text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">
                <IconDownload /> Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function DashboardPage() {
  const [navKey, setNavKey] = useState<NavKey>("overview");
  const [stage, setStage] = useState<Stage>("unlisted");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [items, setItems] = useState<Item[]>(SEED_ITEMS);

  function addItem(item: Item) {
    setItems((prev) => [item, ...prev]);
  }

  return (
    <div className="flex min-h-screen bg-ink">
      {modalOpen && (
        <AddStockModal onClose={() => setModalOpen(false)} onAdd={addItem} />
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-[230px] shrink-0 border-r border-line bg-ink-soft/40 flex flex-col z-40 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-line">
          <span className="relative grid place-items-center w-7 h-7 rounded-[6px] bg-amber overflow-hidden shrink-0">
            <span className="absolute bottom-0 inset-x-0 bg-ink/25" style={{ height: "38%" }} />
            <span className="relative w-[3px] h-3.5 rounded-full bg-ink" />
          </span>
          <span className="font-display text-[16px] font-medium">Stockpile</span>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => { setNavKey(n.key); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left w-full transition-colors ${
                n.key === navKey
                  ? "bg-amber/12 text-amber"
                  : "text-paper-dim hover:text-paper hover:bg-ink-card"
              }`}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-line">
          <div className="rounded-lg bg-ink-card border border-line-soft p-3 mb-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-paper-faint">{items.length} / 500 items</span>
              <span className="text-amber">Reseller</span>
            </div>
            <div className="h-1.5 rounded-full bg-line overflow-hidden">
              <div className="h-full bg-amber rounded-full transition-all duration-500" style={{ width: `${Math.min(items.length / 500 * 100, 100)}%` }} />
            </div>
            <button className="mt-3 w-full text-center text-xs py-1.5 rounded-md border border-line-soft text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">
              Upgrade to Operator
            </button>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-paper-faint hover:text-paper hover:bg-ink-card transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Collapse
          </button>
        </div>
      </aside>

      {/* main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-line flex items-center gap-4 px-6 sticky top-0 bg-ink/85 backdrop-blur-md z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden grid place-items-center w-9 h-9 rounded-lg text-paper-dim hover:text-paper hover:bg-ink-card transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0 max-w-[420px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-paper-faint shrink-0">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Find an item or bin…"
              className="bg-transparent border-none outline-none text-sm text-paper placeholder:text-paper-faint w-full"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg bg-amber text-ink hover:bg-paper transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className="hidden sm:block">Add stock</span>
          </button>

          <button className="grid place-items-center w-9 h-9 rounded-lg text-paper-dim hover:text-paper hover:bg-ink-card transition-colors shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          <div className="grid place-items-center w-9 h-9 rounded-full bg-ink-card border border-line text-xs font-medium text-paper-dim shrink-0">
            JD
          </div>
        </header>

        <main className="flex-1 p-6 max-w-[1152px] w-full mx-auto">
          {navKey === "overview"   && <Overview items={items} stage={stage} setStage={setStage} />}
          {navKey === "stock"      && <Stock items={items} />}
          {navKey === "storage"    && <StorageMap items={items} />}
          {navKey === "calculator" && <ProfitCalculator />}
          {navKey === "archives"   && <Archives />}
        </main>
      </div>
    </div>
  );
}
