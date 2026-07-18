"use client";

import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import { hasFeature, canAddItem, TIERS, type TierKey } from "../../lib/tiers";
import { createClient } from "@/lib/supabase/client";
import { deleteAccount } from "./actions";

/* ---------- types & data ---------- */

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
  paid: number; stage: Stage; age?: number; createdAt?: number;
  platform?: string[]; bin?: string; notes?: string; size?: string;
}

const SIZE_GROUPS = [
  {
    label: "Children's Shoe Sizes",
    sizes: ["1","1.5","2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15"],
  },
  {
    label: "Children's Clothing",
    sizes: ["0-3 Months","3-6 Months","6-9 Months","9-12 Months","12-18 Months","18-24 Months","2-3 Years","3-4 Years","4-5 Years","5-6 Years","6-7 Years","7-8 Years","8-9 Years","9-10 Years","10-11 Years","11-12 Years","12-13 Years","13-14 Years"],
  },
  {
    label: "Ladies' Clothing (UK)",
    sizes: ["4","6","8","10","12","14","16","18","20","22","24","26"],
  },
  {
    label: "Adult Clothing",
    sizes: ["XS","S","M","L","XL","2XL","3XL","4XL"],
  },
  {
    label: "Adult Shoe Sizes (UK)",
    sizes: ["3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13"],
  },
];

interface SaleRecord {
  id: number;
  itemId?: number;
  itemName: string;
  paid: number;
  soldFor: number;
  profit: number;
  month: string;
  platform?: string;
  adCost?: number;
  packagingCost?: number;
  equipmentCost?: number;
  otherCost?: number;
}

// --- Supabase row shapes ---
interface DbItemRow {
  id: number; user_id: string; code: string; name: string;
  cond: string; paid: number; stage: string;
  bin: string | null; platform: string[] | null;
  notes: string | null; size: string | null; created_at: string;
}
interface DbSaleRow {
  id: number; user_id: string; item_id: number | null;
  item_name: string; paid: number; sold_for: number; profit: number;
  month: string; platform: string | null;
  ad_cost: number | null; packaging_cost: number | null;
  equipment_cost: number | null; other_cost: number | null;
  created_at: string;
}
function rowToItem(r: DbItemRow): Item {
  const createdAt = r.created_at ? new Date(r.created_at).getTime() : Date.now();
  return {
    id: r.id, code: r.code, name: r.name,
    cond: (r.cond as CondKey) ?? "good",
    paid: Number(r.paid), stage: (r.stage as Stage) ?? "unlisted",
    bin: r.bin ?? undefined, platform: r.platform ?? undefined,
    notes: r.notes ?? undefined, size: r.size ?? undefined,
    createdAt, age: Math.floor((Date.now() - createdAt) / 86400000),
  };
}
function rowToSale(r: DbSaleRow): SaleRecord {
  return {
    id: r.id, itemId: r.item_id ?? undefined,
    itemName: r.item_name, paid: Number(r.paid),
    soldFor: Number(r.sold_for), profit: Number(r.profit),
    month: r.month, platform: r.platform ?? undefined,
    adCost: r.ad_cost ?? undefined, packagingCost: r.packaging_cost ?? undefined,
    equipmentCost: r.equipment_cost ?? undefined, otherCost: r.other_cost ?? undefined,
  };
}

const CURRENT_MONTH = new Date().toLocaleString("en-GB", { month: "long", year: "numeric" });
const SALE_PLATFORMS = ["Vinted", "eBay", "Depop", "Facebook Marketplace", "Other"] as const;
const LISTING_PLATFORMS = ["Vinted", "eBay", "Depop", "Facebook", "Other"] as const;


type NavKey = "overview" | "stock" | "storage" | "calculator" | "archives" | "analytics" | "settings";

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
  {
    key: "analytics", label: "Analytics extension",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    key: "settings", label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

/* ---------- helpers ---------- */

const gbp = (n: number) => (n < 0 ? "−£" : "£") + Math.abs(n).toFixed(2);

function exportMonthCSV(month: string, records: SaleRecord[], revenue: number, cost: number, profit: number, margin: number) {
  const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
  const rows: string[][] = [
    [`Sellganise Export — ${month}`],
    [],
    ["Item Name", "Cost Paid (£)", "Sold For (£)", "Advertising (£)", "Packaging (£)", "Equipment (£)", "Other (£)", "Net Profit (£)"],
    ...records.map((r) => [
      r.itemName, r.paid.toFixed(2), r.soldFor.toFixed(2),
      (r.adCost ?? 0).toFixed(2), (r.packagingCost ?? 0).toFixed(2),
      (r.equipmentCost ?? 0).toFixed(2), (r.otherCost ?? 0).toFixed(2),
      r.profit.toFixed(2),
    ]),
    [],
    ["", "Revenue",       "", revenue.toFixed(2)],
    ["", "Stock cost",    "", cost.toFixed(2)],
    ["", "Extra costs",   "", records.reduce((s, r) => s + (r.adCost ?? 0) + (r.packagingCost ?? 0) + (r.equipmentCost ?? 0) + (r.otherCost ?? 0), 0).toFixed(2)],
    ["", "Net profit",    "", profit.toFixed(2)],
    ["", "Margin",        "", `${margin}%`],
  ];
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sellganise-${month.toLowerCase().replace(/\s+/g, "-")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function useEscClose(onClose: () => void) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
}


/* ---------- icons ---------- */

function IconFilter() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
}
function IconSort() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="3" y1="6" x2="15" y2="6"/><line x1="3" y1="12" x2="11" y2="12"/><line x1="3" y1="18" x2="7" y2="18"/></svg>;
}
function IconArchive() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>;
}
function IconDownload() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function IconBin() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber"><rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/><rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/></svg>;
}
function IconClose() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

/* ---------- modal shell ---------- */

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-line bg-ink-card shadow-2xl shadow-black/60 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/* ---------- toasts ---------- */

interface Toast { id: number; message: string; type: "success" | "info" | "warning"; }

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; });
  useEffect(() => {
    const t = setTimeout(() => onDismissRef.current(toast.id), 3200);
    return () => clearTimeout(t);
  }, [toast.id]);

  const style = {
    success: { border: "border-moss/30",  bg: "bg-moss/10",  dot: "var(--color-moss)"  },
    info:    { border: "border-amber/30", bg: "bg-amber/10", dot: "var(--color-amber)" },
    warning: { border: "border-rust/30",  bg: "bg-rust/10",  dot: "var(--color-rust)"  },
  }[toast.type];

  return (
    <div className={`toast-slide pointer-events-auto flex items-center gap-3 rounded-xl border ${style.border} ${style.bg} bg-ink-card px-4 py-3 shadow-lg shadow-black/50 min-w-[260px] max-w-[360px]`}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: style.dot }} />
      <span className="text-sm text-paper flex-1 leading-snug">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="text-paper-faint hover:text-paper transition-colors ml-1 shrink-0"><IconClose /></button>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  );
}

/* ---------- csv import helpers ---------- */

function parseCsvTsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { headers: [], rows: [] };
  const tabCount = (lines[0].match(/\t/g) ?? []).length;
  const commaCount = (lines[0].match(/,/g) ?? []).length;
  const isTab = tabCount >= commaCount;
  function parseRow(line: string): string[] {
    if (isTab) return line.split("\t").map((c) => c.trim().replace(/^"|"$/g, ""));
    const cols: string[] = []; let cur = ""; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  }
  return { headers: parseRow(lines[0]), rows: lines.slice(1).map(parseRow).filter((r) => r.some((c) => c)) };
}

const CSV_FIELDS = [
  { key: "name",     label: "Item name"        },
  { key: "paid",     label: "Price paid (£)"   },
  { key: "size",     label: "Size"             },
  { key: "cond",     label: "Condition"        },
  { key: "bin",      label: "Storage location" },
  { key: "platform", label: "Platform"         },
  { key: "notes",    label: "Notes"            },
  { key: "ignore",   label: "Ignore column"   },
];

function autoMapCols(headers: string[]): Record<string, string> {
  const patterns: [string, string[]][] = [
    ["name",     ["name", "item", "title", "product", "desc"]],
    ["paid",     ["price", "paid", "cost", "bought", "£", "gbp", "spend", "purchase"]],
    ["size",     ["size", "sz"]],
    ["cond",     ["condition", "cond", "quality", "grade", "state"]],
    ["bin",      ["bin", "location", "storage", "box", "shelf", "loc"]],
    ["platform", ["platform", "site", "marketplace", "channel"]],
    ["notes",    ["note", "comment", "remark", "extra", "detail", "info"]],
  ];
  const result: Record<string, string> = {};
  const used = new Set<string>();
  for (const h of headers) {
    const lc = h.toLowerCase();
    let mapped = "ignore";
    for (const [field, kws] of patterns) {
      if (!used.has(field) && kws.some((k) => lc.includes(k))) { mapped = field; used.add(field); break; }
    }
    result[h] = mapped;
  }
  if (!used.has("name")) { const first = headers.find((h) => result[h] === "ignore"); if (first) result[first] = "name"; }
  return result;
}

function parseCsvCond(v: string): CondKey {
  const lc = v.toLowerCase();
  if (["excellent", "vgc", "very good", "great", "mint", "new", "bnwt", "bnwot"].some((k) => lc.includes(k))) return "excellent";
  if (["fair", "worn", "average", "used", "ok"].some((k) => lc.includes(k))) return "fair";
  if (["flawed", "damaged", "poor", "broken"].some((k) => lc.includes(k))) return "flawed";
  return "good";
}

/* ---------- add stock modal ---------- */

const EMPTY_FORM = { name: "", paid: "", cond: "good" as CondKey, bin: "", itemCode: "", notes: "", size: "" };

function getRecentMonths(count: number): string[] {
  const months = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString("en-GB", { month: "long", year: "numeric" }));
  }
  return months;
}

function parseSoldList(raw: string): { name: string; paid: number; soldFor: number }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const m = line.match(/^(.+?)\s*[-–]\s*£?([\d]+(?:[.,]\d+)?)\s*[-–]\s*£?([\d]+(?:[.,]\d+)?)[.\s]*$/);
      if (!m) return [];
      const name = m[1].trim();
      const paid = parseFloat(m[2].replace(",", "."));
      const soldFor = parseFloat(m[3].replace(",", "."));
      if (!name || isNaN(paid) || isNaN(soldFor)) return [];
      return [{ name, paid, soldFor }];
    });
}

function parsePasteList(raw: string): { name: string; paid: number }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      // Match: "Item name - £12.34" or "Item name - 12.34" (trailing punctuation stripped)
      const m = line.match(/^(.+?)\s*[-–]\s*£?([\d]+(?:[.,]\d+)?)[.\s]*$/);
      if (!m) return [];
      const name = m[1].trim();
      const paid = parseFloat(m[2].replace(",", "."));
      if (!name || isNaN(paid)) return [];
      return [{ name, paid }];
    });
}

function AddStockModal({ onClose, onAdd, onAddMany, onAddAndSold, storageLocations }: {
  onClose: () => void;
  onAdd: (item: Item) => void;
  onAddMany: (items: Item[]) => void;
  onAddAndSold: (item: Item, sale: SaleRecord) => void;
  storageLocations: string[];
}) {
  const [tab, setTab] = useState<"single" | "paste" | "csv">("single");
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [markSold, setMarkSold] = useState(false);
  const [soldPrice, setSoldPrice] = useState("");
  const [soldPlatform, setSoldPlatform] = useState("");
  const [soldMonth, setSoldMonth] = useState(getRecentMonths(1)[0]);
  const [pasteText, setPasteText] = useState("");
  const [pasteBin, setPasteBin] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [colMap, setColMap] = useState<Record<string, string>>({});
  const [csvBin, setCsvBin] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLTextAreaElement>(null);
  useEscClose(onClose);

  useEffect(() => {
    if (tab === "single") nameRef.current?.focus();
    else pasteRef.current?.focus();
  }, [tab]);

  useEffect(() => {
    if (!csvText.trim()) { setCsvHeaders([]); setCsvRows([]); setColMap({}); return; }
    const { headers, rows } = parseCsvTsv(csvText);
    setCsvHeaders(headers);
    setCsvRows(rows);
    setColMap(autoMapCols(headers));
  }, [csvText]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Item name is required."); return; }
    const paid = parseFloat(form.paid);
    if (isNaN(paid) || paid < 0) { setError("Enter a valid price paid."); return; }
    const now = Date.now();
    const code = form.itemCode.trim() || `IT-${String(now).slice(-4)}`;
    if (markSold) {
      const soldFor = parseFloat(soldPrice);
      if (isNaN(soldFor) || soldFor < 0) { setError("Enter a valid sold price."); return; }
      const item: Item = { id: now, code, name: form.name.trim(), cond: form.cond, paid, stage: "sold", age: 0, createdAt: now, bin: form.bin || undefined, notes: form.notes.trim() || undefined, size: form.size || undefined, platform: soldPlatform ? [soldPlatform] : undefined };
      const sale: SaleRecord = { id: now, itemId: now, itemName: form.name.trim(), paid, soldFor, profit: soldFor - paid, month: soldMonth, platform: soldPlatform || undefined };
      onAddAndSold(item, sale);
    } else {
      onAdd({ id: now, code, name: form.name.trim(), cond: form.cond, paid, stage: "unlisted", age: 0, createdAt: now, bin: form.bin || undefined, notes: form.notes.trim() || undefined, size: form.size || undefined });
    }
    onClose();
  }

  function submitPaste() {
    const parsed = parsePasteList(pasteText);
    if (parsed.length === 0) { setError("No items found. Use the format: Item name - £12.34"); return; }
    const now = Date.now();
    const newItems: Item[] = parsed.map((p, i) => ({
      id: now + i,
      code: `IT-${String(now + i).slice(-4)}`,
      name: p.name,
      cond: "good" as CondKey,
      paid: p.paid,
      stage: "unlisted" as Stage,
      age: 0,
      createdAt: now + i,
      bin: pasteBin || undefined,
    }));
    onAddMany(newItems);
    onClose();
  }

  function submitCsv() {
    if (!csvHeaders.some((h) => colMap[h] === "name")) { setError("Map a column to 'Item name' first."); return; }
    if (!csvHeaders.some((h) => colMap[h] === "paid")) { setError("Map a column to 'Price paid' first."); return; }
    const now = Date.now();
    const items: Item[] = csvRows.map((row, i) => {
      const get = (field: string) => { const idx = csvHeaders.findIndex((h) => colMap[h] === field); return idx >= 0 ? (row[idx] ?? "").trim() : ""; };
      const name = get("name"); if (!name) return null;
      const paid = parseFloat(get("paid").replace(/[£$€,\s]/g, "")); if (isNaN(paid) || paid < 0) return null;
      const size = get("size") || undefined;
      const condRaw = get("cond"); const cond: CondKey = condRaw ? parseCsvCond(condRaw) : "good";
      const bin = get("bin") || csvBin || undefined;
      const platform = get("platform") || undefined;
      const notes = get("notes") || undefined;
      return { id: now + i, code: `IT-${String(now + i).slice(-4)}`, name, cond, paid, stage: "unlisted" as Stage, age: 0, createdAt: now + i, bin, platform: platform ? [platform] : undefined, notes, size } as Item;
    }).filter((x): x is Item => x !== null);
    if (!items.length) { setError("No valid rows found — check that Name and Price columns have data."); return; }
    onAddMany(items);
    onClose();
  }

  const parsed = parsePasteList(pasteText);
  const conditions: CondKey[] = ["excellent", "good", "fair", "flawed"];
  const field = "w-full bg-ink border border-line rounded-xl px-3.5 py-2.5 text-sm text-paper outline-none focus:border-amber/60 transition-colors placeholder:text-paper-faint";

  const csvValidItems: Item[] = csvHeaders.length > 0 ? csvRows.map((row, i) => {
    const get = (f: string) => { const idx = csvHeaders.findIndex((h) => colMap[h] === f); return idx >= 0 ? (row[idx] ?? "").trim() : ""; };
    const name = get("name"); if (!name) return null;
    const paid = parseFloat(get("paid").replace(/[£$€,\s]/g, "")); if (isNaN(paid) || paid < 0) return null;
    const size = get("size") || undefined;
    const condRaw = get("cond"); const cond: CondKey = condRaw ? parseCsvCond(condRaw) : "good";
    const bin = get("bin") || csvBin || undefined;
    const platform = get("platform") || undefined;
    const notes = get("notes") || undefined;
    const now = Date.now();
    return { id: now + i, code: `IT-${String(now + i).slice(-4)}`, name, cond, paid, stage: "unlisted" as Stage, age: 0, createdAt: now + i, bin, platform: platform ? [platform] : undefined, notes, size } as Item;
  }).filter((x): x is Item => x !== null) : [];
  const csvPreview = csvValidItems.slice(0, 6);

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-line">
        <div>
          <h2 className="font-display font-medium text-lg">Add stock</h2>
          <p className="text-paper-faint text-xs mt-0.5">New items land in Unlisted</p>
        </div>
        <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"><IconClose /></button>
      </div>

      {/* tab toggle */}
      <div className="flex gap-1 px-6 pt-4">
        {(["single", "paste", "csv"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(""); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-amber/15 text-amber border border-amber/30" : "text-paper-faint hover:text-paper"}`}
          >
            {t === "single" ? "Single item" : t === "paste" ? "Paste a list" : "Spreadsheet"}
          </button>
        ))}
      </div>

      {tab === "csv" ? (
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm text-paper-dim mb-1">Paste from spreadsheet</label>
            <p className="text-xs text-paper-faint mb-2">Copy cells from Excel or Google Sheets — first row must be column headers</p>
            <textarea
              className={`${field} resize-none font-mono text-xs leading-relaxed`}
              rows={5}
              placeholder={"Name\tPrice\tSize\tCondition\nNike Air Max 90\t45\t10\tGood\nLevi 501 Jeans\t8\t32\tFair"}
              value={csvText}
              onChange={(e) => { setCsvText(e.target.value); setError(""); }}
            />
          </div>

          {csvHeaders.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-paper-faint mb-2">Map columns</p>
              <div className="rounded-xl border border-line overflow-hidden divide-y divide-line">
                {csvHeaders.map((h) => (
                  <div key={h} className="flex items-center justify-between px-3.5 py-2 gap-3">
                    <span className="text-sm text-paper font-mono truncate shrink-0 max-w-[45%]">{h || "(blank)"}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-paper-faint shrink-0"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    <select
                      className="ml-auto bg-ink border border-line rounded-lg px-2.5 py-1.5 text-xs text-paper outline-none focus:border-amber/60 transition-colors"
                      value={colMap[h] ?? "ignore"}
                      onChange={(e) => setColMap((m) => ({ ...m, [h]: e.target.value }))}
                    >
                      {CSV_FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {csvPreview.length > 0 && (
            <div className="rounded-xl border border-line bg-ink-soft overflow-hidden">
              <div className="px-3.5 py-2 border-b border-line flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-paper-faint">Preview</span>
                <span className="text-xs text-moss font-medium">{csvValidItems.length} item{csvValidItems.length !== 1 ? "s" : ""} ready</span>
              </div>
              <ul className="divide-y divide-line max-h-52 overflow-y-auto">
                {csvPreview.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 px-3.5 py-2">
                    <span className="text-paper text-sm flex-1 min-w-0 truncate">{item.name}</span>
                    <span className="text-amber font-mono text-xs shrink-0">£{item.paid.toFixed(2)}</span>
                    {item.size && <span className="text-paper-faint text-xs shrink-0 font-mono">{item.size}</span>}
                    {item.cond && item.cond !== "good" && <span className="text-paper-faint text-xs shrink-0 capitalize">{item.cond}</span>}
                    {item.platform?.[0] && <span className="text-paper-faint text-xs shrink-0">{item.platform[0]}</span>}
                    {item.bin && <span className="text-xs font-mono text-paper-faint shrink-0">{item.bin}</span>}
                  </li>
                ))}
                {csvValidItems.length > 6 && (
                  <li className="px-3.5 py-2 text-xs text-paper-faint">+{csvValidItems.length - 6} more rows</li>
                )}
              </ul>
            </div>
          )}

          {csvHeaders.length > 0 && storageLocations.length > 0 && !csvHeaders.some((h) => colMap[h] === "bin") && (
            <div>
              <label className="block text-sm text-paper-dim mb-1.5">Default storage location <span className="text-paper-faint">(optional)</span></label>
              <select className={field} value={csvBin} onChange={(e) => setCsvBin(e.target.value)}>
                <option value="">None</option>
                {storageLocations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-rust">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-line text-sm text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">Cancel</button>
            <button
              type="button"
              onClick={submitCsv}
              disabled={csvValidItems.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {csvValidItems.length > 0 ? `Import ${csvValidItems.length} item${csvValidItems.length !== 1 ? "s" : ""}` : "Import"}
            </button>
          </div>
        </div>
      ) : tab === "single" ? (
        <form onSubmit={submit} className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Item name</label>
            <input ref={nameRef} className={field} placeholder="e.g. Carhartt beanie" value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }} />
          </div>
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Price paid (£)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-faint text-sm">£</span>
              <input className={`${field} pl-7`} type="number" min="0" step="0.01" placeholder="0.00" value={form.paid}
                onChange={(e) => { setForm((f) => ({ ...f, paid: e.target.value })); setError(""); }} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-paper-dim mb-2">Condition</label>
            <div className="grid grid-cols-4 gap-2">
              {conditions.map((c) => {
                const active = form.cond === c;
                const meta = COND[c];
                return (
                  <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, cond: c }))}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-medium"
                    style={{ borderColor: active ? meta.dot + "80" : "var(--color-line)", background: active ? meta.bg : "transparent", color: active ? meta.fg : "var(--color-paper-faint)" }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.dot }} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Size <span className="text-paper-faint">(optional)</span></label>
            <select className={field} value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}>
              <option value="">No size</option>
              {SIZE_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">
              Storage location <span className="text-paper-faint">(optional)</span>
            </label>
            {storageLocations.length > 0 ? (
              <select className={field} value={form.bin} onChange={(e) => setForm((f) => ({ ...f, bin: e.target.value }))}>
                <option value="">No location assigned</option>
                {storageLocations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl border border-line-soft bg-ink-soft px-3.5 py-2.5 text-sm text-paper-faint">
                No storage locations yet — create one in the Storage map first
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">
              Item code <span className="text-paper-faint">(optional)</span>
            </label>
            <input
              className={field}
              placeholder="e.g. SKU-001, TAG-42 — auto-generated if left blank"
              value={form.itemCode}
              onChange={(e) => setForm((f) => ({ ...f, itemCode: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">
              Notes <span className="text-paper-faint">(optional)</span>
            </label>
            <textarea
              className={`${field} resize-none`}
              rows={3}
              placeholder="e.g. small mark on left sleeve, missing button, bought as bundle…"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* mark as sold toggle */}
          <div className="rounded-xl border border-line bg-ink-soft px-4 py-3 space-y-3">
            <button
              type="button"
              className="flex items-center gap-3 w-full text-left"
              onClick={() => { setMarkSold((v) => !v); setError(""); }}
            >
              <div className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${markSold ? "bg-amber" : "bg-line"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-paper transition-transform ${markSold ? "translate-x-4" : ""}`} />
              </div>
              <span className="text-sm text-paper">Already sold this item</span>
            </button>
            {markSold && (
              <div className="space-y-3 pt-1 border-t border-line">
                <div className="pt-2">
                  <label className="block text-sm text-paper-dim mb-1.5">Sold price (£)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-faint text-sm">£</span>
                    <input
                      className={`${field} pl-7`}
                      type="number" min="0" step="0.01" placeholder="0.00"
                      value={soldPrice}
                      onChange={(e) => { setSoldPrice(e.target.value); setError(""); }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-paper-dim mb-1.5">Platform <span className="text-paper-faint">(optional)</span></label>
                  <select className={field} value={soldPlatform} onChange={(e) => setSoldPlatform(e.target.value)}>
                    <option value="">Not specified</option>
                    {SALE_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-paper-dim mb-1.5">Month sold</label>
                  <select className={field} value={soldMonth} onChange={(e) => setSoldMonth(e.target.value)}>
                    {getRecentMonths(12).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-rust">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-line text-sm text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors">
              {markSold ? "Add & record sale" : "Add to stock"}
            </button>
          </div>
        </form>
      ) : (
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Paste your list</label>
            <p className="text-xs text-paper-faint mb-2">One item per line, in the format: <span className="font-mono text-amber">Item name - £12.34</span></p>
            <textarea
              ref={pasteRef}
              className={`${field} resize-none font-mono text-xs leading-relaxed`}
              rows={8}
              placeholder={"Air rift Navy/ white toe - £13.49\nAdidas campus size 5 - £9.29\nMerrell trainers - £12.44"}
              value={pasteText}
              onChange={(e) => { setPasteText(e.target.value); setError(""); }}
            />
          </div>

          <div>
            <label className="block text-sm text-paper-dim mb-1.5">
              Storage location <span className="text-paper-faint">(optional — applies to all items)</span>
            </label>
            {storageLocations.length > 0 ? (
              <select className={field} value={pasteBin} onChange={(e) => setPasteBin(e.target.value)}>
                <option value="">No location assigned</option>
                {storageLocations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl border border-line-soft bg-ink-soft px-3.5 py-2.5 text-sm text-paper-faint">
                No storage locations yet — create one in the Storage map first
              </div>
            )}
          </div>

          {/* live preview */}
          {parsed.length > 0 && (
            <div className="rounded-xl border border-line bg-ink-soft overflow-hidden">
              <div className="px-3.5 py-2 border-b border-line flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-paper-faint">Preview</span>
                <span className="text-xs text-moss font-medium">{parsed.length} item{parsed.length === 1 ? "" : "s"} detected</span>
              </div>
              <ul className="divide-y divide-line max-h-48 overflow-y-auto">
                {parsed.map((p, i) => (
                  <li key={i} className="flex items-center justify-between px-3.5 py-2 text-sm">
                    <span className="text-paper truncate pr-4">{p.name}</span>
                    <span className="text-amber font-mono shrink-0">£{p.paid.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-sm text-rust">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-line text-sm text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">Cancel</button>
            <button
              type="button"
              onClick={submitPaste}
              disabled={parsed.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {parsed.length > 0 ? `Add ${parsed.length} item${parsed.length === 1 ? "" : "s"}` : "Add to stock"}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

/* ---------- add storage modal ---------- */

function AddStorageModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEscClose(onClose);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Storage name is required."); return; }
    onAdd(name.trim());
    onClose();
  }

  const field = "w-full bg-ink border border-line rounded-xl px-3.5 py-2.5 text-sm text-paper outline-none focus:border-amber/60 transition-colors placeholder:text-paper-faint";

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-line">
        <div>
          <h2 className="font-display font-medium text-lg">Add storage location</h2>
          <p className="text-paper-faint text-xs mt-0.5">Give it a name you&apos;ll recognise</p>
        </div>
        <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"><IconClose /></button>
      </div>
      <form onSubmit={submit} className="px-6 py-5 space-y-5">
        <div>
          <label className="block text-sm text-paper-dim mb-1.5">Location name</label>
          <input ref={inputRef} className={field} placeholder="e.g. Bin A1, Shelf 2, Blue box"
            value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
          <p className="text-xs text-paper-faint mt-1.5">Items assigned here will appear in this location on the storage map</p>
        </div>
        {error && <p className="text-sm text-rust">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-line text-sm text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors">Create location</button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---------- edit stock modal ---------- */

function EditStockModal({ item, onClose, onSave, storageLocations }: {
  item: Item; onClose: () => void;
  onSave: (updated: Item) => void;
  storageLocations: string[];
}) {
  const [form, setForm] = useState({
    name: item.name, paid: String(item.paid), cond: item.cond,
    bin: item.bin ?? "", itemCode: item.code, notes: item.notes ?? "", size: item.size ?? "",
  });
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  useEscClose(onClose);
  useEffect(() => { nameRef.current?.focus(); }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Item name is required."); return; }
    const paid = parseFloat(form.paid);
    if (isNaN(paid) || paid < 0) { setError("Enter a valid price paid."); return; }
    onSave({ ...item, name: form.name.trim(), paid, cond: form.cond, bin: form.bin || undefined, code: form.itemCode.trim() || item.code, notes: form.notes.trim() || undefined, size: form.size || undefined });
    onClose();
  }

  const conditions: CondKey[] = ["excellent", "good", "fair", "flawed"];
  const field = "w-full bg-ink border border-line rounded-xl px-3.5 py-2.5 text-sm text-paper outline-none focus:border-amber/60 transition-colors placeholder:text-paper-faint";

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-line">
        <div>
          <h2 className="font-display font-medium text-lg">Edit stock</h2>
          <p className="text-paper-faint text-xs mt-0.5 truncate max-w-[260px]">{item.name}</p>
        </div>
        <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"><IconClose /></button>
      </div>
      <form onSubmit={submit} className="px-6 py-5 space-y-5">
        <div>
          <label className="block text-sm text-paper-dim mb-1.5">Item name</label>
          <input ref={nameRef} className={field} value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }} />
        </div>
        <div>
          <label className="block text-sm text-paper-dim mb-1.5">Price paid (£)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-faint text-sm">£</span>
            <input className={`${field} pl-7`} type="number" min="0" step="0.01" value={form.paid} onChange={(e) => { setForm((f) => ({ ...f, paid: e.target.value })); setError(""); }} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-paper-dim mb-2">Condition</label>
          <div className="grid grid-cols-4 gap-2">
            {conditions.map((c) => {
              const active = form.cond === c;
              const meta = COND[c];
              return (
                <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, cond: c }))}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-medium"
                  style={{ borderColor: active ? meta.dot + "80" : "var(--color-line)", background: active ? meta.bg : "transparent", color: active ? meta.fg : "var(--color-paper-faint)" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.dot }} />{meta.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm text-paper-dim mb-1.5">Size <span className="text-paper-faint">(optional)</span></label>
          <select className={field} value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}>
            <option value="">No size</option>
            {SIZE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-paper-dim mb-1.5">Storage location <span className="text-paper-faint">(optional)</span></label>
          {storageLocations.length > 0 ? (
            <select className={field} value={form.bin} onChange={(e) => setForm((f) => ({ ...f, bin: e.target.value }))}>
              <option value="">No location assigned</option>
              {storageLocations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          ) : (
            <div className="rounded-xl border border-line-soft bg-ink-soft px-3.5 py-2.5 text-sm text-paper-faint">No storage locations yet</div>
          )}
        </div>
        <div>
          <label className="block text-sm text-paper-dim mb-1.5">Item code</label>
          <input className={field} value={form.itemCode} onChange={(e) => setForm((f) => ({ ...f, itemCode: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm text-paper-dim mb-1.5">Notes <span className="text-paper-faint">(optional)</span></label>
          <textarea className={`${field} resize-none`} rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        {error && <p className="text-sm text-rust">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-line text-sm text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors">Save changes</button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---------- sell modal ---------- */

type ExtraCosts = { adCost: number; packagingCost: number; equipmentCost: number; otherCost: number };

function SellModal({ item, onClose, onConfirm }: {
  item: Item;
  onClose: () => void;
  onConfirm: (soldFor: number, platform: string, costs: ExtraCosts) => void;
}) {
  const [soldFor, setSoldFor]             = useState("");
  const [platform, setPlatform]           = useState("");
  const [error, setError]                 = useState("");
  const [costsOpen, setCostsOpen]         = useState(false);
  const [adCost, setAdCost]               = useState("");
  const [packagingCost, setPackagingCost] = useState("");
  const [equipmentCost, setEquipmentCost] = useState("");
  const [otherCost, setOtherCost]         = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEscClose(onClose);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const price      = parseFloat(soldFor);
  const extraCosts: ExtraCosts = {
    adCost:        parseFloat(adCost)        || 0,
    packagingCost: parseFloat(packagingCost) || 0,
    equipmentCost: parseFloat(equipmentCost) || 0,
    otherCost:     parseFloat(otherCost)     || 0,
  };
  const totalExtra = extraCosts.adCost + extraCosts.packagingCost + extraCosts.equipmentCost + extraCosts.otherCost;
  const profit     = !isNaN(price) && price >= 0 ? price - item.paid - totalExtra : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isNaN(price) || price < 0) { setError("Enter a valid sold price."); return; }
    onConfirm(price, platform, extraCosts);
    onClose();
  }

  const costField = "w-full bg-ink border border-line rounded-xl pl-7 pr-3 py-2 text-sm text-paper outline-none focus:border-amber/60 transition-colors placeholder:text-paper-faint";

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-line">
        <div>
          <h2 className="font-display font-medium text-lg">Record a sale</h2>
          <p className="text-paper-faint text-xs mt-0.5 truncate max-w-[260px]">{item.name}</p>
        </div>
        <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"><IconClose /></button>
      </div>

      <form onSubmit={submit} className="px-6 py-5 space-y-5">
        {/* cost recap */}
        <div className="flex items-center justify-between rounded-xl bg-ink-soft border border-line-soft px-4 py-3 text-sm">
          <span className="text-paper-faint">You paid</span>
          <span className="font-mono text-paper">{gbp(item.paid)}</span>
        </div>

        {/* sold price */}
        <div>
          <label className="block text-sm text-paper-dim mb-1.5">Sold for (£)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-faint text-sm">£</span>
            <input
              ref={inputRef}
              className="w-full bg-ink border border-line rounded-xl pl-7 pr-3.5 py-2.5 text-sm text-paper outline-none focus:border-amber/60 transition-colors placeholder:text-paper-faint"
              type="number" min="0" step="0.01" placeholder="0.00"
              value={soldFor}
              onChange={(e) => { setSoldFor(e.target.value); setError(""); }}
            />
          </div>
        </div>

        {/* platform */}
        <div>
          <label className="block text-sm text-paper-dim mb-1.5">Sold on</label>
          <div className="grid grid-cols-3 gap-2">
            {SALE_PLATFORMS.map((p) => (
              <button
                key={p} type="button"
                onClick={() => setPlatform(platform === p ? "" : p)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${platform === p ? "bg-amber/15 border-amber/40 text-amber" : "bg-ink border-line-soft text-paper-faint hover:border-paper-faint hover:text-paper"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* extra costs — collapsible */}
        <div>
          <button
            type="button"
            onClick={() => setCostsOpen((o) => !o)}
            className="flex items-center gap-1.5 text-xs font-medium text-paper-faint hover:text-paper transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              {!costsOpen && <line x1="12" y1="5" x2="12" y2="19"/>}
            </svg>
            {costsOpen ? "Hide extra costs" : "Add extra costs"}
            {totalExtra > 0 && !costsOpen && <span className="ml-1 font-mono text-rust">−{gbp(totalExtra)}</span>}
          </button>
          {costsOpen && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {([
                ["Advertising", adCost, setAdCost],
                ["Packaging", packagingCost, setPackagingCost],
                ["Equipment", equipmentCost, setEquipmentCost],
                ["Other", otherCost, setOtherCost],
              ] as [string, string, (v: string) => void][]).map(([label, value, set]) => (
                <div key={label}>
                  <label className="block text-xs text-paper-faint mb-1">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-paper-faint text-xs">£</span>
                    <input type="number" min="0" step="0.01" placeholder="0.00" value={value} onChange={(e) => set(e.target.value)} className={costField} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* live profit preview */}
        {profit !== null && (
          <div className="rounded-xl border px-4 py-3 transition-colors"
            style={{
              borderColor: profit >= 0 ? "rgba(127,174,74,0.3)" : "rgba(216,96,47,0.3)",
              background:  profit >= 0 ? "rgba(127,174,74,0.06)" : "rgba(216,96,47,0.06)",
            }}>
            {totalExtra > 0 ? (
              <div className="space-y-1 text-xs text-paper-dim">
                <div className="flex justify-between"><span>Sold for</span><span className="font-mono">{gbp(price)}</span></div>
                <div className="flex justify-between"><span>Stock cost</span><span className="font-mono text-rust">−{gbp(item.paid)}</span></div>
                <div className="flex justify-between"><span>Extra costs</span><span className="font-mono text-rust">−{gbp(totalExtra)}</span></div>
                <div className="border-t border-line-soft pt-1.5 flex items-center justify-between">
                  <span className="text-sm text-paper-dim">Net profit</span>
                  <span className="font-mono text-xl font-medium" style={{ color: profit >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>{gbp(profit)}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-paper-dim">Net profit</span>
                <span className="font-mono text-xl font-medium" style={{ color: profit >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>{gbp(profit)}</span>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-rust">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-line text-sm text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-moss text-ink text-sm font-medium hover:brightness-110 transition-all">Save sale</button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---------- bulk sold modal ---------- */

const SOLD_CSV_FIELDS = [
  { key: "name",     label: "Item name"      },
  { key: "paid",     label: "Price paid (£)"  },
  { key: "soldFor",  label: "Sold price (£)"  },
  { key: "platform", label: "Platform"        },
  { key: "ignore",   label: "Ignore column"  },
];

function autoMapSoldCols(headers: string[]): Record<string, string> {
  const patterns: [string, string[]][] = [
    ["name",     ["name", "item", "title", "product", "desc"]],
    ["paid",     ["paid", "cost", "bought", "purchase", "price paid", "buy"]],
    ["soldFor",  ["sold", "sale", "selling", "sold for", "sold price", "sale price", "revenue", "received", "price"]],
    ["platform", ["platform", "site", "marketplace", "channel", "where"]],
  ];
  const result: Record<string, string> = {};
  const used = new Set<string>();
  for (const h of headers) {
    const lc = h.toLowerCase();
    let mapped = "ignore";
    for (const [field, kws] of patterns) {
      if (!used.has(field) && kws.some((k) => lc.includes(k))) { mapped = field; used.add(field); break; }
    }
    result[h] = mapped;
  }
  if (!used.has("name")) { const first = headers.find((h) => result[h] === "ignore"); if (first) result[first] = "name"; }
  return result;
}

function BulkSoldModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (records: SaleRecord[]) => void;
}) {
  const [tab, setTab]               = useState<"paste" | "csv">("csv");
  const [pasteText, setPasteText]   = useState("");
  const [csvText, setCsvText]       = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows]       = useState<string[][]>([]);
  const [colMap, setColMap]         = useState<Record<string, string>>({});
  const [platform, setPlatform]     = useState("");
  const [month, setMonth]           = useState(CURRENT_MONTH);
  const [error, setError]           = useState("");
  const pasteRef                    = useRef<HTMLTextAreaElement>(null);
  useEscClose(onClose);

  useEffect(() => { if (tab === "paste") pasteRef.current?.focus(); }, [tab]);

  useEffect(() => {
    if (!csvText.trim()) { setCsvHeaders([]); setCsvRows([]); setColMap({}); return; }
    const { headers, rows } = parseCsvTsv(csvText);
    setCsvHeaders(headers);
    setCsvRows(rows);
    setColMap(autoMapSoldCols(headers));
  }, [csvText]);

  const recentMonths = getRecentMonths(24);

  // Paste-mode parsed items
  const parsed       = parseSoldList(pasteText);
  const totalProfit  = parsed.reduce((s, p) => s + (p.soldFor - p.paid), 0);

  // CSV-mode parsed items
  type SoldRow = { name: string; paid: number; soldFor: number; platform?: string };
  const csvItems: SoldRow[] = csvHeaders.length > 0 ? csvRows.map((row): SoldRow | null => {
    const get = (f: string) => { const idx = csvHeaders.findIndex((h) => colMap[h] === f); return idx >= 0 ? (row[idx] ?? "").trim() : ""; };
    const name = get("name"); if (!name) return null;
    const paid = parseFloat(get("paid").replace(/[£$€,\s]/g, "")); if (isNaN(paid) || paid < 0) return null;
    const soldFor = parseFloat(get("soldFor").replace(/[£$€,\s]/g, "")); if (isNaN(soldFor) || soldFor < 0) return null;
    const plat = get("platform") || undefined;
    return { name, paid, soldFor, platform: plat };
  }).filter((x): x is SoldRow => x !== null) : [];
  const csvPreview    = csvItems.slice(0, 6);
  const csvTotal      = csvItems.reduce((s, p) => s + (p.soldFor - p.paid), 0);

  function submitPaste() {
    if (parsed.length === 0) { setError("No items found. Use: Item name - £paid - £soldFor"); return; }
    const now = Date.now();
    onAdd(parsed.map((p, i) => ({ id: now + i, itemName: p.name, paid: p.paid, soldFor: p.soldFor, profit: p.soldFor - p.paid, month, platform: platform || undefined })));
    onClose();
  }

  function submitCsv() {
    if (!csvHeaders.some((h) => colMap[h] === "name"))    { setError("Map a column to 'Item name' first."); return; }
    if (!csvHeaders.some((h) => colMap[h] === "paid"))    { setError("Map a column to 'Price paid' first."); return; }
    if (!csvHeaders.some((h) => colMap[h] === "soldFor")) { setError("Map a column to 'Sold price' first."); return; }
    if (csvItems.length === 0) { setError("No valid rows found — check Name, Price paid, and Sold price columns have data."); return; }
    const now = Date.now();
    onAdd(csvItems.map((p, i) => ({ id: now + i, itemName: p.name, paid: p.paid, soldFor: p.soldFor, profit: p.soldFor - p.paid, month, platform: p.platform ?? platform ?? undefined })));
    onClose();
  }

  const field = "w-full bg-ink border border-line rounded-xl px-3.5 py-2.5 text-sm text-paper outline-none focus:border-amber/60 transition-colors placeholder:text-paper-faint";

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-line">
        <div>
          <h2 className="font-display font-medium text-lg">Import sold list</h2>
          <p className="text-paper-faint text-xs mt-0.5">Log a batch of sales in one go</p>
        </div>
        <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"><IconClose /></button>
      </div>

      {/* tab toggle */}
      <div className="flex gap-1 px-6 pt-4">
        {(["csv", "paste"] as const).map((t) => (
          <button key={t} type="button" onClick={() => { setTab(t); setError(""); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-amber/15 text-amber border border-amber/30" : "text-paper-faint hover:text-paper"}`}>
            {t === "csv" ? "Spreadsheet" : "Paste a list"}
          </button>
        ))}
      </div>

      <div className="px-6 py-5 space-y-4">

        {tab === "csv" ? (<>
          <div>
            <label className="block text-sm text-paper-dim mb-1">Paste from spreadsheet</label>
            <p className="text-xs text-paper-faint mb-2">Copy cells from Excel or Google Sheets — first row must be column headers</p>
            <textarea
              className={`${field} resize-none font-mono text-xs leading-relaxed`}
              rows={5}
              placeholder={"Item\tPrice Paid\tSold For\tPlatform\nCarhartt Beanie\t2\t18\tVinted\nNike Air Max 90\t45\t89\teBay"}
              value={csvText}
              onChange={(e) => { setCsvText(e.target.value); setError(""); }}
            />
          </div>

          {csvHeaders.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-paper-faint mb-2">Map columns</p>
              <div className="rounded-xl border border-line overflow-hidden divide-y divide-line">
                {csvHeaders.map((h) => (
                  <div key={h} className="flex items-center justify-between px-3.5 py-2 gap-3">
                    <span className="text-sm text-paper font-mono truncate shrink-0 max-w-[45%]">{h || "(blank)"}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-paper-faint shrink-0"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    <select
                      className="ml-auto bg-ink border border-line rounded-lg px-2.5 py-1.5 text-xs text-paper outline-none focus:border-amber/60 transition-colors"
                      value={colMap[h] ?? "ignore"}
                      onChange={(e) => setColMap((m) => ({ ...m, [h]: e.target.value }))}
                    >
                      {SOLD_CSV_FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {csvPreview.length > 0 && (
            <div className="rounded-xl border border-line bg-ink-soft overflow-hidden">
              <div className="px-3.5 py-2 border-b border-line flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-paper-faint">Preview</span>
                <span className="text-xs font-medium" style={{ color: csvTotal >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>
                  {csvItems.length} sale{csvItems.length !== 1 ? "s" : ""} · {csvTotal >= 0 ? "+" : ""}{gbp(csvTotal)} profit
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-paper-faint border-b border-line">
                <span>Item</span><span>Paid</span><span>Sold</span><span>Profit</span>
              </div>
              <ul className="divide-y divide-line max-h-52 overflow-y-auto">
                {csvPreview.map((p, i) => {
                  const profit = p.soldFor - p.paid;
                  return (
                    <li key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3.5 py-2 items-center">
                      <span className="text-paper text-sm truncate">{p.name}</span>
                      <span className="text-paper-faint font-mono text-xs">{gbp(p.paid)}</span>
                      <span className="text-amber font-mono text-xs">{gbp(p.soldFor)}</span>
                      <span className="font-mono text-xs font-medium" style={{ color: profit >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>
                        {profit >= 0 ? "+" : ""}{gbp(profit)}
                      </span>
                    </li>
                  );
                })}
                {csvItems.length > 6 && <li className="px-3.5 py-2 text-xs text-paper-faint">+{csvItems.length - 6} more rows</li>}
              </ul>
            </div>
          )}
        </>) : (<>
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Paste your sold list</label>
            <p className="text-xs text-paper-faint mb-2">One item per line: <span className="font-mono text-amber">Item name - £paid - £soldFor</span></p>
            <textarea
              ref={pasteRef}
              className={`${field} resize-none font-mono text-xs leading-relaxed`}
              rows={8}
              placeholder={"Carhartt beanie - £2 - £18\nNike Air Force 1 - £12 - £45.99\nLevi jeans - £5 - £28"}
              value={pasteText}
              onChange={(e) => { setPasteText(e.target.value); setError(""); }}
            />
          </div>
          {parsed.length > 0 && (
            <div className="rounded-xl border border-line bg-ink-soft overflow-hidden">
              <div className="px-3.5 py-2 border-b border-line flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-paper-faint">Preview</span>
                <span className="text-xs font-medium" style={{ color: totalProfit >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>
                  {parsed.length} sale{parsed.length === 1 ? "" : "s"} · {totalProfit >= 0 ? "+" : ""}{gbp(totalProfit)} profit
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-paper-faint border-b border-line">
                <span>Item</span><span>Paid</span><span>Sold</span><span>Profit</span>
              </div>
              <ul className="divide-y divide-line max-h-48 overflow-y-auto">
                {parsed.map((p, i) => {
                  const profit = p.soldFor - p.paid;
                  return (
                    <li key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3.5 py-2 text-sm items-center">
                      <span className="text-paper truncate pr-2">{p.name}</span>
                      <span className="text-paper-faint font-mono text-xs">{gbp(p.paid)}</span>
                      <span className="text-amber font-mono text-xs">{gbp(p.soldFor)}</span>
                      <span className="font-mono text-xs font-medium" style={{ color: profit >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>
                        {profit >= 0 ? "+" : ""}{gbp(profit)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>)}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Month</label>
            <select className={field} value={month} onChange={(e) => setMonth(e.target.value)}>
              {recentMonths.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Platform <span className="text-paper-faint">(optional default)</span></label>
            <select className={field} value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="">Not specified</option>
              {SALE_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-line text-sm text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">Cancel</button>
          <button
            type="button"
            onClick={tab === "csv" ? submitCsv : submitPaste}
            disabled={tab === "csv" ? csvItems.length === 0 : parsed.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-moss text-ink text-sm font-medium hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tab === "csv"
              ? (csvItems.length > 0 ? `Import ${csvItems.length} sale${csvItems.length !== 1 ? "s" : ""}` : "Import sales")
              : (parsed.length > 0 ? `Add ${parsed.length} sale${parsed.length === 1 ? "" : "s"}` : "Add sales")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------- item row ---------- */

function ItemRow({ item, onSell, onToggleListed, onEdit, onRemove, onUnsell, storageLocations, onAssignBin, selectMode, isSelected, onToggleSelect }: {
  item: Item; onSell: (item: Item) => void; onToggleListed: (item: Item, platforms?: string[]) => void;
  onEdit?: (item: Item) => void; onRemove?: (id: number) => void; onUnsell?: (id: number) => void;
  storageLocations?: string[]; onAssignBin?: (id: number, bin: string) => void;
  selectMode?: boolean; isSelected?: boolean; onToggleSelect?: (id: number) => void;
}) {
  const c = COND[item.cond];
  const ageDays = item.createdAt
    ? Math.floor((Date.now() - item.createdAt) / 86_400_000)
    : (item.age ?? 0);
  const showAge = item.stage !== "sold";
  const ageTier = ageDays <= 15
    ? { cls: "bg-moss/15 text-moss border-moss/20", label: "Fresh" }
    : ageDays <= 30
    ? { cls: "bg-amber/15 text-amber border-amber/20", label: "Ageing" }
    : { cls: "bg-rust/15 text-rust border-rust/20", label: "Old" };
  const [noteOpen, setNoteOpen]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [binPickerOpen, setBinPickerOpen] = useState(false);
  const [listPickerOpen, setListPickerOpen]       = useState(false);
  const [pendingPlatforms, setPendingPlatforms]   = useState<string[]>([]);
  const binPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!binPickerOpen) return;
    function handleOutside(e: MouseEvent) {
      if (binPickerRef.current && !binPickerRef.current.contains(e.target as Node)) setBinPickerOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [binPickerOpen]);

  function confirmList() {
    onToggleListed(item, pendingPlatforms.length > 0 ? pendingPlatforms : undefined);
    setListPickerOpen(false);
    setPendingPlatforms([]);
  }
  function togglePending(p: string) {
    setPendingPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  const platformTags = item.platform?.map((p) => (
    <span key={p} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-moss/12 text-moss border border-moss/20">{p}</span>
  ));

  const statusBadge = (
    <>
      {item.stage === "unlisted" && (
        listPickerOpen ? (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-moss/12 text-moss border border-moss/25">
            Pick platforms
            <button onClick={(e) => { e.stopPropagation(); setListPickerOpen(false); setPendingPlatforms([]); }} className="ml-0.5 opacity-60 hover:opacity-100">✕</button>
          </span>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); setListPickerOpen(true); }} className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-amber/12 text-amber border border-amber/25 hover:bg-moss/12 hover:text-moss hover:border-moss/25 transition-all duration-200 group">
            <span className="w-1.5 h-1.5 rounded-full bg-amber group-hover:bg-moss transition-colors duration-200" />
            <span className="group-hover:hidden">Not listed</span>
            <span className="hidden group-hover:inline">Mark listed</span>
          </button>
        )
      )}
      {item.stage === "listed" && (
        <button onClick={(e) => { e.stopPropagation(); onToggleListed(item); }} className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-moss/12 text-moss border border-moss/25 hover:bg-amber/12 hover:text-amber hover:border-amber/25 transition-all duration-200 group">
          <span className="w-1.5 h-1.5 rounded-full bg-moss group-hover:bg-amber transition-colors duration-200" />
          <span className="group-hover:hidden">Listed</span>
          <span className="hidden group-hover:inline">Unlist</span>
        </button>
      )}
      {item.stage === "sold" && (
        <button onClick={() => onUnsell?.(item.id)} className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-paper-faint/10 text-paper-faint border border-line hover:bg-rust/10 hover:text-rust hover:border-rust/30 transition-all duration-200 group">
          <span className="w-1.5 h-1.5 rounded-full bg-paper-faint group-hover:bg-rust transition-colors duration-200" />
          <span className="group-hover:hidden">Sold</span>
          <span className="hidden group-hover:inline">Mark unsold</span>
        </button>
      )}
    </>
  );

  const editBtn = onEdit && (
    <button onClick={() => onEdit(item)} title="Edit item" className="grid place-items-center w-7 h-7 rounded-md text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  );

  const checkBox = selectMode && (
    <span
      className="shrink-0 grid place-items-center w-5 h-5 rounded border-2 transition-colors"
      style={{ background: isSelected ? "var(--color-amber)" : "transparent", borderColor: isSelected ? "var(--color-amber)" : "var(--color-line)" }}
    >
      {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" style={{ color: "var(--color-ink)" }}><polyline points="20 6 9 17 4 12"/></svg>}
    </span>
  );

  return (
    <div
      className={`border-t border-line-soft first:border-t-0 transition-colors ${selectMode ? "cursor-pointer" : ""} ${isSelected ? "bg-amber/[0.05]" : ""}`}
      onClick={selectMode ? () => onToggleSelect?.(item.id) : undefined}
    >

      {/* ── Mobile layout (two-line card) ── */}
      <div className="sm:hidden px-4 py-3 hover:bg-ink-soft/40 transition-colors">
        {/* Line 1: name + status badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {checkBox}
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} />
            <span className="text-sm font-medium truncate">{item.name}</span>
          </div>
          {!selectMode && <div className="shrink-0">{statusBadge}</div>}
        </div>
        {/* Line 2: meta + actions */}
        <div className={`flex items-center justify-between gap-2 ${selectMode ? "pl-4" : "pl-4"}`}>
          <div className="flex items-center gap-2 text-xs text-paper-faint flex-wrap">
            <span>£{item.paid}</span>
            {item.size && <span className="px-1.5 py-0.5 rounded border border-line font-mono">{item.size}</span>}
            {item.bin && <span className="px-1.5 py-0.5 rounded border border-amber/25 bg-amber/10 text-amber/80 font-mono">{item.bin}</span>}
            <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded-md" style={{ background: c.bg, color: c.fg }}>{c.label}</span>
            {item.stage === "listed" && platformTags}
          </div>
          {!selectMode && (
            <div className="flex items-center gap-1.5 shrink-0">
              {item.stage !== "sold" && (
                <button onClick={(e) => { e.stopPropagation(); onSell(item); }} className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md border border-line-soft text-paper-faint hover:border-moss/40 hover:text-moss hover:bg-moss/8 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                  Sold
                </button>
              )}
              {editBtn}
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop layout (single row) ── */}
      <div className="hidden sm:flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-ink-soft/40 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          {checkBox}
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} />
          <span className="text-sm font-medium truncate">{item.name}</span>
          <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-md" style={{ background: c.bg, color: c.fg }}>{c.label}</span>
          {item.size && <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-md bg-ink-soft border border-line text-paper-faint font-mono">{item.size}</span>}
          {showAge && (
            <span className={`shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-mono ${ageTier.cls}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
              {ageDays}d
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs text-paper-faint">
          {item.stage === "listed" ? (
            <><div className="flex items-center gap-1 flex-wrap">{platformTags ?? <span className="text-paper-faint">Not specified</span>}</div>{item.bin && <span>Bin {item.bin}</span>}</>
          ) : item.stage !== "sold" && item.bin ? (
            <><span>paid £{item.paid}</span><span className="px-1.5 py-0.5 rounded border border-amber/25 bg-amber/10 text-amber/80 font-mono">{item.bin}</span></>
          ) : (
            <span>paid £{item.paid}</span>
          )}
          {selectMode ? null : (<>
          <span className="font-mono">{item.code}</span>
          {item.stage !== "sold" && !item.bin && onAssignBin && storageLocations && storageLocations.length > 0 && (
            <div className="relative" ref={binPickerRef}>
              <button onClick={() => setBinPickerOpen((o) => !o)} className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border border-dashed border-line text-paper-faint hover:border-amber/40 hover:text-amber hover:bg-amber/8 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/><rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/></svg>
                Add to box
              </button>
              {binPickerOpen && (
                <div className="absolute right-0 top-[calc(100%+4px)] z-20 bg-ink-card border border-line rounded-xl shadow-xl shadow-black/50 min-w-[140px] overflow-hidden">
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-paper-faint">Pick a location</p>
                  {storageLocations.map((loc) => (
                    <button key={loc} onClick={() => { onAssignBin(item.id, loc); setBinPickerOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-paper-dim hover:bg-ink-soft hover:text-paper transition-colors flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-amber shrink-0"><rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/><rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/></svg>
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {statusBadge}
          {item.stage !== "sold" && (
            <button onClick={(e) => { e.stopPropagation(); onSell(item); }} className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border border-line-soft text-paper-faint hover:border-moss/40 hover:text-moss hover:bg-moss/8 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
              Mark sold
            </button>
          )}
          {item.notes && (
            <button onClick={(e) => { e.stopPropagation(); setNoteOpen((o) => !o); }} className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all ${noteOpen ? "border-amber/40 bg-amber/10 text-amber" : "border-line-soft text-paper-faint hover:border-amber/30 hover:text-amber"}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              {noteOpen ? "Hide note" : "See note"}
            </button>
          )}
          {editBtn}
          {onRemove && (
            confirmDelete ? (
              <button onClick={(e) => { e.stopPropagation(); onRemove(item.id); }} className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-rust/15 text-rust border border-rust/30 hover:bg-rust/25 transition-all" onBlur={() => setConfirmDelete(false)}>Confirm?</button>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} title="Delete item" className="grid place-items-center w-7 h-7 rounded-md text-paper-faint hover:text-rust hover:bg-rust/10 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            )
          )}
          </>)}
        </div>
      </div>

    {noteOpen && item.notes && (
      <div className="px-4 pb-3">
        <p className="text-xs text-paper-dim bg-ink-soft border border-line-soft rounded-lg px-3 py-2 leading-relaxed">{item.notes}</p>
      </div>
    )}
    {listPickerOpen && (
      <div className="px-4 pb-4 border-t border-line-soft">
        <p className="text-[10px] font-mono uppercase tracking-wider text-paper-faint pt-3 pb-2">Where are you listing?</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {LISTING_PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={(e) => { e.stopPropagation(); togglePending(p); }}
              className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                pendingPlatforms.includes(p)
                  ? "bg-moss/15 border-moss/40 text-moss"
                  : "bg-ink border-line-soft text-paper-faint hover:border-moss/30 hover:text-moss"
              }`}
            >
              {pendingPlatforms.includes(p) && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
              )}
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); confirmList(); }}
            className="flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded-lg bg-moss text-ink border border-moss/60 hover:bg-moss/80 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
            Save{pendingPlatforms.length > 0 ? ` — ${pendingPlatforms.join(", ")}` : ""}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setListPickerOpen(false); setPendingPlatforms([]); }}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg border border-line-soft text-paper-faint hover:text-paper transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
  );
}

/* ---------- sections ---------- */

function Overview({
  items, stage, setStage, onSell, onToggleListed, onUnsell, onEdit, liveProfit, liveSold, query, storageLocations, onAssignBin,
}: {
  items: Item[]; stage: Stage; setStage: (s: Stage) => void;
  onSell: (item: Item) => void; onToggleListed: (item: Item, platforms?: string[]) => void; onUnsell: (id: number) => void;
  onEdit: (item: Item) => void;
  liveProfit: number; liveSold: number; query: string;
  storageLocations: string[]; onAssignBin: (id: number, bin: string) => void;
}) {
  const q = query.toLowerCase().trim();
  const matchQ = (i: Item) => !q || i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q) || (i.bin?.toLowerCase().includes(q) ?? false);

  const stages: Stage[] = ["unlisted", "listed", "sold"];
  const shown = items.filter((i) => i.stage === stage && matchQ(i));
  const counts = {
    unlisted: items.filter((i) => i.stage === "unlisted").length,
    listed:   items.filter((i) => i.stage === "listed").length,
    sold:     liveSold,
  };
  const deadMoney = items.filter((i) => i.stage === "unlisted").reduce((s, i) => s + i.paid, 0);
  const totalProfit = liveProfit;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Overview</h1>
        <p className="text-paper-dim text-sm mt-1">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · here&apos;s where your stock stands</p>
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
            <p className="text-sm text-paper-dim mt-1.5">{counts.unlisted} items bought but not earning — clear the pile to put them to work</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {([
          { label: "Unlisted", value: counts.unlisted, cls: "text-amber", stageKey: "unlisted" as Stage },
          { label: "Listed",   value: counts.listed,   cls: "",           stageKey: "listed"   as Stage },
          { label: "Sold · Jul", value: counts.sold,   cls: "",           stageKey: "sold"     as Stage },
        ] as const).map((s) => {
          const active = stage === s.stageKey;
          return (
            <button
              key={s.label}
              onClick={() => setStage(s.stageKey)}
              className={`rounded-xl border px-4 py-3.5 text-left transition-all ${active ? "border-amber/40 bg-amber/[0.06]" : "border-line bg-ink-card hover:border-line hover:bg-ink-soft/60"}`}
            >
              <p className="text-[13px] text-paper-faint">{s.label}</p>
              <p className={`font-mono text-2xl mt-1 ${s.cls}`}>{s.value}</p>
              {active && <p className="text-[10px] text-amber/70 mt-1 font-mono">showing below ↓</p>}
            </button>
          );
        })}
        <div className="rounded-xl border border-line bg-ink-card px-4 py-3.5">
          <p className="text-[13px] text-paper-faint">Profit · Jul</p>
          <p className="font-mono text-2xl mt-1 text-moss">{gbp(totalProfit)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-ink-card">
        <div className="flex items-center gap-1 p-2 border-b border-line overflow-x-auto">
          {stages.map((s) => (
            <button key={s} onClick={() => setStage(s)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap shrink-0 capitalize transition-colors ${s === stage ? "bg-ink-soft text-paper font-medium" : "text-paper-dim hover:text-paper"}`}>
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
            ? shown.map((it) => <ItemRow key={it.id} item={it} onSell={onSell} onToggleListed={onToggleListed} onEdit={onEdit} onUnsell={onUnsell} storageLocations={storageLocations} onAssignBin={onAssignBin} />)
            : q
              ? <p className="px-4 py-8 text-center text-sm text-paper-faint">No results for &ldquo;{query}&rdquo; in this stage.</p>
              : <p className="px-4 py-8 text-center text-sm text-paper-faint">No items in this stage yet.</p>}
        </div>
      </div>
    </div>
  );
}

function Stock({ items, onSell, onToggleListed, onEdit, onRemove, onUnsell, query, storageLocations, onAssignBin, currentTier, onBulkList, onBulkUnlist, onBulkRemove, onBulkAssignBin }: {
  items: Item[]; onSell: (item: Item) => void; onToggleListed: (item: Item, platforms?: string[]) => void;
  onEdit: (item: Item) => void; onRemove: (id: number) => void; onUnsell: (id: number) => void; query: string;
  storageLocations: string[]; onAssignBin: (id: number, bin: string) => void;
  currentTier: TierKey;
  onBulkList: (ids: number[]) => void; onBulkUnlist: (ids: number[]) => void;
  onBulkRemove: (ids: number[]) => void; onBulkAssignBin: (ids: number[], bin: string) => void;
}) {
  const [selectMode, setSelectMode]               = useState(false);
  const [selectedIds, setSelectedIds]             = useState<Set<number>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [actionBinOpen, setActionBinOpen]         = useState(false);
  const [headerBinOpen, setHeaderBinOpen]         = useState(false);
  const actionBinRef                              = useRef<HTMLDivElement>(null);
  const headerBinRef                              = useRef<HTMLDivElement>(null);
  const canBulk = hasFeature(currentTier, "bulk_actions");

  useEffect(() => {
    if (!actionBinOpen) return;
    function handle(e: MouseEvent) {
      if (actionBinRef.current && !actionBinRef.current.contains(e.target as Node)) setActionBinOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [actionBinOpen]);

  useEffect(() => {
    if (!headerBinOpen) return;
    function handle(e: MouseEvent) {
      if (headerBinRef.current && !headerBinRef.current.contains(e.target as Node)) setHeaderBinOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [headerBinOpen]);

  function exitSelect() { setSelectMode(false); setSelectedIds(new Set()); setConfirmBulkDelete(false); setActionBinOpen(false); }
  function toggleId(id: number) { setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleAll() {
    if (selectedIds.size === shown.length) { setSelectedIds(new Set()); }
    else { setSelectedIds(new Set(shown.map((i) => i.id))); }
  }

  const q = query.toLowerCase().trim();
  const shown = q
    ? items.filter((i) => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q) || (i.bin?.toLowerCase().includes(q) ?? false))
    : items;

  function exportStock() {
    const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    const rows: string[][] = [
      ["Sellganise — Stock Export"],
      [],
      ["Item Code", "Name", "Condition", "Size", "Paid (£)", "Status", "Platform", "Storage Bin", "Notes"],
      ...items.map((i) => [
        i.code, i.name, COND[i.cond].label, i.size ?? "", i.paid.toFixed(2),
        i.stage, i.platform?.join(", ") ?? "", i.bin ?? "", i.notes ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sellganise-stock.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const allSelected = shown.length > 0 && selectedIds.size === shown.length;
  const unlistedShown = shown.filter((i) => i.stage === "unlisted");

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-medium">Stock</h1>
          <p className="text-paper-dim text-sm mt-1">
            {selectMode
              ? `${selectedIds.size} of ${shown.length} selected`
              : q ? `${shown.length} result${shown.length !== 1 ? "s" : ""} for "${query}"` : "Every item across all three stages"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {selectMode ? (
            <>
              <button onClick={toggleAll} className="text-xs font-medium px-3 py-2 rounded-lg border border-line text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">
                {allSelected ? "Deselect all" : "Select all"}
              </button>
              <button onClick={exitSelect} className="text-xs font-medium px-3 py-2 rounded-lg border border-line text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">
                Cancel
              </button>
            </>
          ) : (
            <>
              {unlistedShown.length > 0 && (
                <button
                  onClick={() => onBulkList(unlistedShown.map((i) => i.id))}
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-moss/15 text-moss border border-moss/30 hover:bg-moss/25 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  List all unlisted ({unlistedShown.length})
                </button>
              )}
              {items.length > 0 && (
                <button onClick={exportStock} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-line text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">
                  <IconDownload /> Export CSV
                </button>
              )}
              <button
                onClick={() => { if (canBulk) { setSelectMode(true); } else { window.dispatchEvent(new CustomEvent("sellganise:upsell-bulk")); } }}
                title={canBulk ? "Select items for bulk actions" : "Pro feature — upgrade to use bulk actions"}
                className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${canBulk ? "border-line text-paper-dim hover:text-paper hover:border-paper-faint" : "border-line text-paper-faint cursor-default opacity-60"}`}
              >
                {!canBulk && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                )}
                Select
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-ink-card">
        {/* ── Quick-action header strip ── */}
        {shown.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-line-soft bg-ink-soft/30">
            {/* select-all checkbox */}
            <button
              onClick={() => {
                if (!selectMode) { setSelectMode(true); setSelectedIds(new Set(shown.map((i) => i.id))); }
                else toggleAll();
              }}
              title={selectMode && allSelected ? "Deselect all" : "Select all"}
              className="shrink-0 grid place-items-center w-5 h-5 rounded border-2 transition-colors"
              style={{
                background: selectMode && allSelected ? "var(--color-amber)" : "transparent",
                borderColor: selectMode && selectedIds.size > 0 ? "var(--color-amber)" : "var(--color-line)",
              }}
            >
              {selectMode && allSelected && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" style={{ color: "var(--color-ink)" }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {selectMode && !allSelected && selectedIds.size > 0 && (
                <span className="w-2 h-0.5 rounded-full" style={{ background: "var(--color-amber)" }} />
              )}
            </button>

            <span className="text-xs text-paper-faint">
              {selectMode && selectedIds.size > 0
                ? `${selectedIds.size} of ${shown.length} selected`
                : `${shown.length} item${shown.length !== 1 ? "s" : ""}`}
            </span>
            {!selectMode && (
              <>
                <span className="text-xs text-paper-faint/40">·</span>
                <span className="text-xs text-paper-faint">
                  Total cost <span className="font-mono text-amber">{gbp(shown.reduce((s, i) => s + i.paid, 0))}</span>
                </span>
              </>
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* List all unlisted */}
              {unlistedShown.length > 0 && !selectMode && (
                <button
                  onClick={() => onBulkList(unlistedShown.map((i) => i.id))}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-moss/12 text-moss border border-moss/25 hover:bg-moss/20 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  List all ({unlistedShown.length})
                </button>
              )}

              {/* Assign all to storage */}
              {storageLocations.length > 0 && !selectMode && (
                <div className="relative" ref={headerBinRef}>
                  <button
                    onClick={() => setHeaderBinOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-line text-paper-dim hover:text-paper hover:border-paper-faint transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-amber shrink-0">
                      <rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/>
                      <rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/>
                    </svg>
                    Assign storage
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {headerBinOpen && (
                    <div className="absolute right-0 top-[calc(100%+4px)] z-20 bg-ink-card border border-line rounded-xl shadow-xl shadow-black/50 min-w-[160px] overflow-hidden">
                      <p className="px-3 pt-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-paper-faint">Assign all to</p>
                      {storageLocations.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => { onBulkAssignBin(shown.map((i) => i.id), loc); setHeaderBinOpen(false); }}
                          className="w-full px-3 py-2 text-left text-sm text-paper-dim hover:bg-ink-soft hover:text-paper transition-colors flex items-center gap-2"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-amber shrink-0">
                            <rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/>
                            <rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/>
                          </svg>
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cancel select mode */}
              {selectMode && (
                <button onClick={exitSelect} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-line text-paper-dim hover:text-paper hover:border-paper-faint transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {shown.length > 0
          ? <div>{shown.map((it) => (
              <ItemRow
                key={it.id} item={it}
                onSell={onSell} onToggleListed={onToggleListed} onEdit={onEdit}
                onRemove={onRemove} onUnsell={onUnsell}
                storageLocations={storageLocations} onAssignBin={onAssignBin}
                selectMode={selectMode} isSelected={selectedIds.has(it.id)} onToggleSelect={toggleId}
              />
            ))}</div>
          : q
            ? <p className="px-4 py-8 text-center text-sm text-paper-faint">No results for &ldquo;{query}&rdquo; — try a different name, code, or bin.</p>
            : <p className="px-4 py-8 text-center text-sm text-paper-faint">No stock yet — hit Add stock to get started.</p>}
      </div>

      {/* ── Bulk action bar ── */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed inset-x-0 bottom-16 md:bottom-0 z-40 bg-ink/95 backdrop-blur-md border-t border-line shadow-2xl shadow-black/30">
          <div className="max-w-[1152px] mx-auto px-4 py-3 flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <span className="text-sm font-medium text-paper mr-auto shrink-0">{selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { onBulkList([...selectedIds]); exitSelect(); }}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-moss/15 text-moss border border-moss/30 hover:bg-moss/25 transition-colors"
              >
                Mark listed
              </button>
              <button
                onClick={() => { onBulkUnlist([...selectedIds]); exitSelect(); }}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber/15 text-amber border border-amber/30 hover:bg-amber/25 transition-colors"
              >
                Mark unlisted
              </button>
              {storageLocations.length > 0 && (
                <div className="relative" ref={actionBinRef}>
                  <button
                    onClick={() => setActionBinOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-ink-card border border-line text-paper-dim hover:text-paper hover:border-paper-faint transition-colors"
                  >
                    Assign bin
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {actionBinOpen && (
                    <div className="absolute bottom-[calc(100%+6px)] left-0 bg-ink-card border border-line rounded-xl shadow-2xl shadow-black/50 min-w-[160px] overflow-hidden z-50">
                      <p className="px-3 pt-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-paper-faint">Pick a location</p>
                      {storageLocations.map((loc) => (
                        <button key={loc} onClick={() => { onBulkAssignBin([...selectedIds], loc); exitSelect(); }}
                          className="w-full px-3 py-2 text-left text-sm text-paper-dim hover:bg-ink-soft hover:text-paper transition-colors">
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {confirmBulkDelete ? (
                <button
                  autoFocus
                  onBlur={() => setConfirmBulkDelete(false)}
                  onClick={() => { onBulkRemove([...selectedIds]); exitSelect(); }}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-rust/20 text-rust border border-rust/40 hover:bg-rust/30 transition-colors"
                >
                  Delete {selectedIds.size}? Confirm
                </button>
              ) : (
                <button
                  onClick={() => setConfirmBulkDelete(true)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-ink-card border border-line text-rust hover:bg-rust/10 hover:border-rust/30 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LocationDetailModal({ location, items, onClose, onRemove }: {
  location: string; items: Item[]; onClose: () => void; onRemove: (id: number) => void;
}) {
  useEscClose(onClose);
  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-line">
        <div>
          <h2 className="font-display font-medium text-lg">{location}</h2>
          <p className="text-paper-faint text-xs mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""} stored here</p>
        </div>
        <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"><IconClose /></button>
      </div>
      <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-paper-faint text-center py-8">No items assigned to this location yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((it) => {
              const c = COND[it.cond];
              return (
                <div key={it.id} className="flex items-center justify-between gap-3 rounded-xl border border-line-soft bg-ink-soft px-4 py-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{it.name}</p>
                      <p className="text-xs text-paper-faint font-mono mt-0.5">{it.code}</p>
                      {it.notes && <p className="text-xs text-paper-faint mt-0.5 truncate">{it.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: c.bg, color: c.fg }}>{c.label}</span>
                    {it.stage === "unlisted" && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber/12 text-amber border border-amber/25">Not listed</span>
                    )}
                    {it.stage === "listed" && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-moss/12 text-moss border border-moss/25">Listed</span>
                    )}
                    {it.stage === "sold" && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-paper-faint/10 text-paper-faint border border-line">Sold</span>
                    )}
                    <span className="text-xs text-paper-faint font-mono">£{it.paid}</span>
                    <button
                      onClick={() => onRemove(it.id)}
                      className="grid place-items-center w-7 h-7 rounded-lg text-paper-faint hover:text-rust hover:bg-rust/10 transition-colors"
                      title="Remove item"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function StorageMap({ items, storageLocations, onAddStorage, onRemoveItem }: {
  items: Item[];
  storageLocations: string[];
  onAddStorage: () => void;
  onRemoveItem: (id: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const byBin: Record<string, Item[]> = {};
  items.forEach((i) => { if (i.bin) (byBin[i.bin] = byBin[i.bin] ?? []).push(i); });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium">Storage map</h1>
          <p className="text-paper-dim text-sm mt-1">What&apos;s inside each location — find any item instantly</p>
        </div>
        <button
          onClick={onAddStorage}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-amber text-ink hover:bg-paper transition-colors shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add storage
        </button>
      </div>

      {selected && (
        <LocationDetailModal
          location={selected}
          items={byBin[selected] ?? []}
          onClose={() => setSelected(null)}
          onRemove={(id) => { onRemoveItem(id); if ((byBin[selected] ?? []).length <= 1) setSelected(null); }}
        />
      )}

      {storageLocations.length === 0 ? (
        <div className="rounded-2xl border border-line bg-ink-card px-8 py-16 text-center">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-ink-soft border border-line-soft text-amber mx-auto mb-4">
            <IconBin />
          </span>
          <p className="font-medium text-paper mb-1">No storage locations yet</p>
          <p className="text-sm text-paper-faint mb-5">Create a location like "Bin A1" or "Shelf 2" to start organising your stock.</p>
          <button onClick={onAddStorage} className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-amber text-ink hover:bg-paper transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add first location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {storageLocations.map((loc) => {
            const locItems = byBin[loc] ?? [];
            return (
              <button
                key={loc}
                onClick={() => setSelected(loc)}
                className="rounded-2xl border border-line bg-ink-card p-4 text-left hover:border-paper-faint/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/25 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 font-medium text-paper group-hover:text-amber transition-colors"><IconBin />{loc}</span>
                  <span className="text-xs text-paper-faint font-mono">{locItems.length} items</span>
                </div>
                {locItems.length > 0 ? locItems.map((it) => (
                  <div key={it.id} className="flex items-center gap-2 text-sm text-paper-dim mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: COND[it.cond].dot }} />
                    <span className="truncate">{it.name}</span>
                  </div>
                )) : <p className="text-xs text-paper-faint">Empty — assign items here when adding stock</p>}
                <p className="text-[11px] text-paper-faint mt-3 group-hover:text-amber/60 transition-colors">Click to view details →</p>
              </button>
            );
          })}
        </div>
      )}
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
  const [otherCosts, setOtherCosts] = useState(0);
  const [plat, setPlat] = useState<Plat>("ebay");
  const [ebayType, setEbayType] = useState<EbayType>("private");
  const [payer, setPayer] = useState<Payer>("buyer");

  const isVinted = plat === "vinted", isFb = plat === "facebook", isEbay = plat === "ebay", isDepop = plat === "depop";
  const choosable = isEbay || isDepop;
  const sellerPays = (isVinted || isFb) ? false : payer === "free";

  let fee = 0, feeLabel = "Seller fee (£0)";
  if (isDepop) { const base = prc + (payer === "buyer" ? postCost : 0); fee = base > 0 ? base * 0.029 + 0.30 : 0; feeLabel = "Depop processing (2.9% + 30p, incl. postage)"; }
  else if (isEbay) { if (ebayType === "private") { fee = 0; feeLabel = "eBay private (£0, standard cats)"; } else { const po = prc > 10 ? 0.40 : 0; fee = prc * 0.128 + 0.30 + po; feeLabel = "eBay business (12.8% + 30p + 40p)"; } }

  const postDed = sellerPays ? postCost : 0;
  const net = prc - fee - postDed - cst - otherCosts;
  const margin = prc > 0 ? Math.round(net / prc * 100) : 0;
  const roi = cst > 0 ? net / cst : 0;

  let note = "";
  if (isVinted) note = "On Vinted the buyer always pays postage — it never comes out of your payout.";
  else if (isFb) note = "Facebook is usually local pickup or seller-arranged — no platform postage.";
  else if (payer === "buyer") note = "Buyer pays postage, so it doesn't reduce your take-home." + (isDepop ? " (Depop still charges processing on it.)" : "");
  else note = "Free postage means you absorb the cost — it comes straight out of your margin.";

  const fieldCls = "w-full bg-ink border border-line rounded-lg px-3 py-2.5 text-sm text-paper outline-none focus:border-amber/50 transition-colors";
  const seg = (on: boolean) => `flex-1 text-sm py-2 px-3 rounded-lg border transition-colors ${on ? "border-amber/50 bg-amber/10 text-amber" : "border-line text-paper-dim hover:text-paper"}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Profit calculator</h1>
        <p className="text-paper-dim text-sm mt-1">Work out your real take-home before you list — 2026 UK fees</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-line bg-ink-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm text-paper-dim mb-1.5">You paid</label><input className={fieldCls} type="number" value={cst} onChange={(e) => setCst(+e.target.value)} /></div>
            <div><label className="block text-sm text-paper-dim mb-1.5">List price</label><input className={fieldCls} type="number" value={prc} onChange={(e) => setPrc(+e.target.value)} /></div>
          </div>
          <div><label className="block text-sm text-paper-dim mb-1.5">Platform</label>
            <select className={fieldCls} value={plat} onChange={(e) => setPlat(e.target.value as Plat)}>
              <option value="vinted">Vinted</option><option value="ebay">eBay</option><option value="depop">Depop</option><option value="facebook">Facebook</option>
            </select>
          </div>
          {isEbay && <div><label className="block text-sm text-paper-dim mb-1.5">eBay account type</label><div className="flex gap-2"><button className={seg(ebayType==="private")} onClick={()=>setEbayType("private")}>Private seller</button><button className={seg(ebayType==="business")} onClick={()=>setEbayType("business")}>Business seller</button></div></div>}
          <div><label className="block text-sm text-paper-dim mb-1.5">Who pays postage?</label>
            {choosable && <div className="flex gap-2 mb-3"><button className={seg(payer==="buyer")} onClick={()=>setPayer("buyer")}>Buyer pays</button><button className={seg(payer==="free")} onClick={()=>setPayer("free")}>Free postage (you pay)</button></div>}
            {choosable && payer==="free" && <div className="flex items-center gap-3 mb-2"><label className="text-sm text-paper-dim whitespace-nowrap">Postage cost</label><input className={fieldCls} type="number" value={postCost} onChange={(e)=>setPostCost(+e.target.value)}/></div>}
            <p className="text-xs text-paper-faint">{note}</p>
          </div>
          <div>
            <label className="block text-sm text-paper-dim mb-1.5">Other costs <span className="text-paper-faint font-normal">(packaging, equipment, etc.)</span></label>
            <input className={fieldCls} type="number" min="0" step="0.01" value={otherCosts || ""} placeholder="0.00" onChange={(e) => setOtherCosts(+e.target.value)} />
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-ink-card p-5 flex flex-col">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-paper-dim"><span>Sale price</span><span className="font-mono text-paper">{gbp(prc)}</span></div>
            <div className="flex items-center justify-between text-paper-dim"><span>{feeLabel}</span><span className="font-mono text-rust">{gbp(-fee)}</span></div>
            {postDed > 0 && <div className="flex items-center justify-between text-paper-dim"><span>Postage</span><span className="font-mono text-rust">{gbp(-postDed)}</span></div>}
            <div className="flex items-center justify-between text-paper-dim"><span>Cost of item</span><span className="font-mono text-rust">{gbp(-cst)}</span></div>
            {otherCosts > 0 && <div className="flex items-center justify-between text-paper-dim"><span>Other costs</span><span className="font-mono text-rust">{gbp(-otherCosts)}</span></div>}
          </div>
          <div className="mt-auto pt-5">
            <div className="rounded-xl bg-ink-soft px-4 py-4 flex items-center justify-between">
              <div><span className="font-medium text-sm">Net profit</span><span className="text-xs text-paper-dim ml-2">{margin}% margin</span></div>
              <span className="font-mono text-2xl" style={{ color: net >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>{gbp(net)}</span>
            </div>
            <p className="text-xs text-paper-faint text-center mt-3">{cst > 0 ? `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}× return on what you paid` : "—"}</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-paper-faint mt-5">Fees reflect 2026 UK rates. Vinted &amp; Facebook charge sellers £0; Depop keeps payment processing; eBay depends on private vs business.</p>
    </div>
  );
}

/* ---------- edit sale modal ---------- */

function EditSaleModal({ record, onSave, onClose }: { record: SaleRecord; onSave: (r: SaleRecord) => void; onClose: () => void }) {
  const [name, setName]                   = useState(record.itemName);
  const [paid, setPaid]                   = useState(String(record.paid));
  const [soldFor, setSoldFor]             = useState(String(record.soldFor));
  const [adCost, setAdCost]               = useState(String(record.adCost ?? ""));
  const [packagingCost, setPackagingCost] = useState(String(record.packagingCost ?? ""));
  const [equipmentCost, setEquipmentCost] = useState(String(record.equipmentCost ?? ""));
  const [otherCost, setOtherCost]         = useState(String(record.otherCost ?? ""));
  useEscClose(onClose);

  const totalExtra = (parseFloat(adCost) || 0) + (parseFloat(packagingCost) || 0) + (parseFloat(equipmentCost) || 0) + (parseFloat(otherCost) || 0);
  const profit = (parseFloat(soldFor) || 0) - (parseFloat(paid) || 0) - totalExtra;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...record,
      itemName: name.trim(),
      paid: parseFloat(paid) || 0,
      soldFor: parseFloat(soldFor) || 0,
      profit,
      adCost:        parseFloat(adCost)        || undefined,
      packagingCost: parseFloat(packagingCost) || undefined,
      equipmentCost: parseFloat(equipmentCost) || undefined,
      otherCost:     parseFloat(otherCost)     || undefined,
    });
    onClose();
  }

  const inputCls = "w-full bg-ink-soft border border-line-soft rounded-xl px-3 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:border-amber/50";
  const costCls  = "w-full bg-ink-soft border border-line-soft rounded-xl pl-6 pr-2 py-2 text-sm text-paper placeholder:text-paper-faint focus:outline-none focus:border-amber/50";

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-line">
        <h2 className="font-display text-lg font-medium">Edit sale record</h2>
        <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"><IconClose /></button>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-xs text-paper-faint mb-1.5">Item name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-paper-faint mb-1.5">Cost paid (£)</label>
            <input type="number" min="0" step="0.01" value={paid} onChange={(e) => setPaid(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-paper-faint mb-1.5">Sold for (£)</label>
            <input type="number" min="0" step="0.01" value={soldFor} onChange={(e) => setSoldFor(e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* extra costs */}
        <div>
          <p className="text-xs text-paper-faint mb-2">Extra costs (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              ["Advertising", adCost, setAdCost],
              ["Packaging", packagingCost, setPackagingCost],
              ["Equipment", equipmentCost, setEquipmentCost],
              ["Other", otherCost, setOtherCost],
            ] as [string, string, (v: string) => void][]).map(([label, value, set]) => (
              <div key={label}>
                <label className="block text-xs text-paper-faint mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-paper-faint text-xs">£</span>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={value} onChange={(e) => set(e.target.value)} className={costCls} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-ink-soft border border-line-soft px-3 py-2.5 flex items-center justify-between text-sm">
          <span className="text-paper-faint">Net profit</span>
          <span className="font-mono font-medium" style={{ color: profit >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>
            {profit >= 0 ? "+" : ""}{gbp(profit)}
          </span>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-line-soft text-sm text-paper-dim hover:text-paper transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber text-ink font-medium text-sm hover:bg-amber-deep transition-colors">Save changes</button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---------- archives ---------- */

function Archives({ saleRecords, onDeleteSale, onEditSale, onBulkSold }: {
  saleRecords: SaleRecord[];
  onDeleteSale: (id: number) => void;
  onEditSale: (record: SaleRecord) => void;
  onBulkSold: () => void;
}) {
  const [openMonth, setOpenMonth]         = useState<string | null>(null);
  const [editTarget, setEditTarget]       = useState<SaleRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // group sale records by month
  const byMonth = saleRecords.reduce<Record<string, SaleRecord[]>>((acc, r) => {
    (acc[r.month] = acc[r.month] ?? []).push(r);
    return acc;
  }, {});

  const months = Object.entries(byMonth).map(([m, records]) => {
    const revenue    = records.reduce((s, r) => s + r.soldFor, 0);
    const cost       = records.reduce((s, r) => s + r.paid, 0);
    const extraCosts = records.reduce((s, r) => s + (r.adCost ?? 0) + (r.packagingCost ?? 0) + (r.equipmentCost ?? 0) + (r.otherCost ?? 0), 0);
    const profit     = records.reduce((s, r) => s + r.profit, 0);
    const margin     = revenue > 0 ? Math.round(profit / revenue * 100) : 0;
    return { m, sold: records.length, revenue, cost, extraCosts, profit, margin, records };
  });

  function exportAll() {
    const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    const totalRevenue = saleRecords.reduce((s, r) => s + r.soldFor, 0);
    const totalCost    = saleRecords.reduce((s, r) => s + r.paid, 0);
    const totalProfit  = saleRecords.reduce((s, r) => s + r.profit, 0);
    const totalMargin  = totalRevenue > 0 ? Math.round(totalProfit / totalRevenue * 100) : 0;

    const rows: string[][] = [
      ["Sellganise — Full Export"],
      [],
      ["Month", "Item Name", "Cost Paid (£)", "Sold For (£)", "Advertising (£)", "Packaging (£)", "Equipment (£)", "Other (£)", "Net Profit (£)"],
      ...saleRecords.map((r) => [
        r.month, r.itemName, r.paid.toFixed(2), r.soldFor.toFixed(2),
        (r.adCost ?? 0).toFixed(2), (r.packagingCost ?? 0).toFixed(2),
        (r.equipmentCost ?? 0).toFixed(2), (r.otherCost ?? 0).toFixed(2),
        r.profit.toFixed(2),
      ]),
      [],
      ["Monthly summary"],
      ["Month", "Items Sold", "Revenue (£)", "Cost (£)", "Net Profit (£)", "Margin"],
      ...months.map((mo) => [mo.m, String(mo.sold), mo.revenue.toFixed(2), mo.cost.toFixed(2), mo.profit.toFixed(2), `${mo.margin}%`]),
      [],
      ["Total", String(saleRecords.length), totalRevenue.toFixed(2), totalCost.toFixed(2), totalProfit.toFixed(2), `${totalMargin}%`],
    ];

    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sellganise-all-months.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {editTarget && (
        <EditSaleModal
          record={editTarget}
          onSave={(r) => { onEditSale(r); setEditTarget(null); }}
          onClose={() => setEditTarget(null)}
        />
      )}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-medium">Monthly archives</h1>
          <p className="text-paper-dim text-sm mt-1">Your sales grouped by month — tax-ready P&amp;L</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onBulkSold}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-moss/15 text-moss border border-moss/30 hover:bg-moss/25 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Import sold list
          </button>
          {months.length > 0 && (
            <button
              onClick={exportAll}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-line text-paper-dim hover:text-paper hover:border-paper-faint transition-colors"
            >
              <IconDownload /> Export all
            </button>
          )}
        </div>
      </div>

      {months.length === 0 ? (
        <div className="rounded-2xl border border-line bg-ink-card px-8 py-16 text-center">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-ink-soft border border-line-soft text-amber mx-auto mb-4">
            <IconArchive />
          </span>
          <p className="font-medium text-paper mb-1">No sales yet</p>
          <p className="text-sm text-paper-faint">Mark an item as sold and it will appear here with full P&amp;L.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {months.map((mo) => {
            const isOpen = openMonth === mo.m;
            return (
              <div key={mo.m} className="rounded-2xl border border-amber/20 bg-amber/[0.04] overflow-hidden">
                {/* clickable header row */}
                <button
                  onClick={() => setOpenMonth(isOpen ? null : mo.m)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-amber/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-ink-soft border border-line-soft text-amber shrink-0">
                      <IconArchive />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{mo.m}</p>
                        {mo.m === CURRENT_MONTH && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber/15 text-amber border border-amber/25">LIVE</span>}
                      </div>
                      <p className="text-sm text-paper-dim mt-0.5">{mo.sold} items sold · {mo.margin}% margin</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="font-mono text-xl text-moss">{gbp(mo.profit)}</p>
                      <p className="text-xs text-paper-faint">net profit</p>
                    </div>
                    <svg
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`w-4 h-4 text-paper-faint transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>

                {/* expandable body */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-amber/10">
                    {/* P&L breakdown */}
                    <div className={`mt-4 grid gap-4 text-sm ${mo.extraCosts > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
                      <div>
                        <p className="text-xs text-paper-faint mb-1">Revenue</p>
                        <p className="font-mono text-paper">{gbp(mo.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-paper-faint mb-1">Stock cost</p>
                        <p className="font-mono text-rust">{gbp(mo.cost)}</p>
                      </div>
                      {mo.extraCosts > 0 && (
                        <div>
                          <p className="text-xs text-paper-faint mb-1">Extra costs</p>
                          <p className="font-mono text-rust">{gbp(mo.extraCosts)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-paper-faint mb-1">Net profit</p>
                        <p className="font-mono text-moss">{gbp(mo.profit)}</p>
                      </div>
                    </div>

                    {/* individual sale rows */}
                    <div className="mt-4 pt-4 border-t border-line-soft space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-paper-faint pb-2">
                        <span>Item</span>
                        <div className="flex items-center gap-8 pr-1">
                          <span>Cost</span>
                          <span>Sold</span>
                          <span>Profit</span>
                        </div>
                      </div>
                      {mo.records.map((r) => (
                        <div key={r.id} className="flex items-center justify-between text-sm py-1.5 border-t border-line-soft/50 first:border-t-0 group">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-paper-dim truncate max-w-[160px]">{r.itemName}</span>
                            {r.platform && <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-line text-paper-faint font-mono">{r.platform}</span>}
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-paper-faint font-mono text-xs w-14 text-right">{gbp(r.paid)}</span>
                            <span className="text-paper font-mono text-xs w-14 text-right">{gbp(r.soldFor)}</span>
                            <span className="font-mono text-xs font-medium w-14 text-right" style={{ color: r.profit >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>{gbp(r.profit)}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditTarget(r)}
                                className="grid place-items-center w-6 h-6 rounded-md text-paper-faint hover:text-amber hover:bg-amber/10 transition-colors"
                                title="Edit sale"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              {confirmDeleteId === r.id ? (
                                <button
                                  onClick={() => { onDeleteSale(r.id); setConfirmDeleteId(null); }}
                                  onBlur={() => setConfirmDeleteId(null)}
                                  autoFocus
                                  className="px-2 h-6 rounded-md text-[10px] font-medium bg-rust/20 text-rust border border-rust/30 hover:bg-rust/30 transition-colors"
                                >
                                  Confirm?
                                </button>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(r.id)}
                                  className="grid place-items-center w-6 h-6 rounded-md text-paper-faint hover:text-rust hover:bg-rust/10 transition-colors"
                                  title="Delete sale"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* export button */}
                    <div className="mt-4 pt-4 border-t border-line-soft flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); exportMonthCSV(mo.m, mo.records, mo.revenue, mo.cost, mo.profit, mo.margin); }}
                        className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-line-soft text-paper-dim hover:text-paper hover:border-paper-faint transition-colors"
                      >
                        <IconDownload /> Export CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- notification panel ---------- */

function NotificationPanel({ saleRecords, items, dismissedAlertIds, salesClearedAt, onClear }: {
  saleRecords: SaleRecord[];
  items: Item[];
  dismissedAlertIds: number[];
  salesClearedAt: number;
  onClear: (alertIds: number[]) => void;
}) {
  const now = Date.now();
  const allAgingAlerts = items
    .filter((i) => i.stage !== "sold" && i.createdAt)
    .map((i) => ({ ...i, ageDays: Math.floor((now - i.createdAt!) / 86_400_000) }))
    .filter((i) => i.ageDays >= 15)
    .sort((a, b) => b.ageDays - a.ageDays);

  const agingAlerts = allAgingAlerts.filter((i) => !dismissedAlertIds.includes(i.id));
  const recent = saleRecords.filter((r) => r.id > salesClearedAt).slice(0, 10);
  const total = agingAlerts.length + recent.length;

  return (
    <div className="rise absolute right-0 top-[calc(100%+8px)] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-ink-card shadow-2xl shadow-black/60 overflow-hidden z-50">
      <div className="px-4 py-3.5 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-medium text-sm">Notifications</span>
          {total > 0 && <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-line text-paper-faint border border-line-soft">{total}</span>}
        </div>
        {total > 0 && (
          <button
            onClick={() => onClear(allAgingAlerts.map((a) => a.id))}
            className="grid place-items-center w-7 h-7 rounded-lg text-paper-faint hover:text-rust hover:bg-rust/10 transition-colors"
            title="Clear all notifications"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        )}
      </div>

      {total === 0 && (
        <p className="px-4 py-10 text-center text-sm text-paper-faint">Nothing yet — add stock and make sales to see updates here.</p>
      )}

      {/* ── Aging alerts ── */}
      {agingAlerts.length > 0 && (
        <div className={saleRecords.length > 0 ? "border-b border-line" : ""}>
          <p className="px-4 pt-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-paper-faint">Aging stock</p>
          <div className="max-h-[220px] overflow-y-auto divide-y divide-line-soft">
            {agingAlerts.map((item) => {
              const isRed = item.ageDays >= 30;
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-ink-soft/40 transition-colors">
                  <span className={`grid place-items-center w-8 h-8 rounded-lg shrink-0 ${isRed ? "bg-rust/10 text-rust" : "bg-amber/10 text-amber"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-paper-faint mt-0.5">
                      {isRed
                        ? `Listed for ${item.ageDays} days — needs attention`
                        : `Listed for ${item.ageDays} days — consider relisting`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${isRed ? "bg-rust/15 text-rust border-rust/20" : "bg-amber/15 text-amber border-amber/20"}`}>
                    {item.ageDays}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent sales ── */}
      {recent.length > 0 && (
        <>
          <p className="px-4 pt-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-paper-faint">Recent sales</p>
          <div className="max-h-[220px] overflow-y-auto divide-y divide-line-soft">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-ink-soft/40 transition-colors">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-moss/10 text-moss shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.itemName}</p>
                  <p className="text-xs text-paper-faint mt-0.5">{r.month}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono text-paper">{gbp(r.soldFor)}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: r.profit >= 0 ? "var(--color-moss)" : "var(--color-rust)" }}>
                    {r.profit >= 0 ? "+" : ""}{gbp(r.profit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- analytics extension ---------- */

function AnalyticsExtension() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium">Analytics extension</h1>
        <p className="text-paper-dim text-sm mt-1">Instant market price analytics on every Vinted UK listing</p>
      </div>

      <div className="rounded-2xl border border-line bg-ink-card overflow-hidden">
        <div className="grid md:grid-cols-2">

          {/* left — what it does + download */}
          <div className="px-8 py-10 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-amber/15 border border-amber/25 text-amber shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </span>
              <div>
                <p className="font-medium text-sm">Sellganise Analytics</p>
                <p className="text-[11px] text-paper-faint">Chrome extension · Vinted UK · v1.0.0</p>
              </div>
            </div>

            <p className="text-sm text-paper-dim leading-relaxed mb-6">
              Browses Vinted alongside you. On every listing page it automatically scans comparable items, strips outlier prices, and injects a live market card into the sidebar — so you know instantly whether an item is a bargain, fairly priced, or overpriced before you buy.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                ["Est. resale value", "Average price of matching live listings, filtered by size and condition where possible."],
                ["Bargain / Fair / Overpriced", "Flags when a listing is ≤85% or ≥115% of the calculated market average."],
                ["List at & Offer at", "75th and 25th percentile price suggestions — ambitious asking vs quick-sale pricing."],
                ["Sell speed estimate", "Rough demand signal derived from favourites-per-day on comparable listings."],
                ["100% private", "Every calculation happens locally in your browser. No data is sent to any third-party server."],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-2.5 text-sm">
                  <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-moss/15 border border-moss/25 grid place-items-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-moss"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <span className="text-paper-dim"><span className="text-paper font-medium">{title}</span> — {desc}</span>
                </li>
              ))}
            </ul>

            <a
              href="/sellganise-analytics.zip"
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber text-ink font-semibold text-sm hover:brightness-110 transition-all w-fit"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download extension
            </a>
            <p className="text-xs text-paper-faint mt-2.5">Chrome only · Vinted UK only · no account required</p>
          </div>

          {/* right — install steps */}
          <div className="border-t md:border-t-0 md:border-l border-line bg-ink-soft/40 px-8 py-10">
            <p className="text-xs font-mono uppercase tracking-widest text-paper-faint mb-6">How to install</p>
            <ol className="space-y-5">
              {[
                { n: "1", title: "Download the zip", body: "Click Download extension and save the file anywhere on your computer." },
                { n: "2", title: "Unzip it", body: "Double-click the zip to extract the Sellganise Extension folder." },
                { n: "3", title: "Open Chrome extensions", body: <>Type <span className="font-mono text-[11px] text-amber bg-amber/10 px-1.5 py-0.5 rounded">chrome://extensions</span> in your address bar and enable <strong>Developer mode</strong> (top-right toggle).</> },
                { n: "4", title: "Load unpacked", body: 'Click "Load unpacked" and select the extracted Sellganise Extension folder.' },
                { n: "5", title: "Browse Vinted", body: "Open any Vinted UK item listing. The analytics card appears automatically in the sidebar within a second." },
              ].map(({ n, title, body }) => (
                <li key={n} className="flex gap-3">
                  <span className="w-6 h-6 shrink-0 rounded-full border border-amber/30 bg-amber/10 grid place-items-center text-xs font-mono text-amber">{n}</span>
                  <div>
                    <p className="text-sm font-medium text-paper mb-0.5">{title}</p>
                    <p className="text-sm text-paper-dim leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 rounded-xl border border-line-soft bg-ink px-4 py-4">
              <p className="text-xs font-mono uppercase tracking-widest text-paper-faint mb-2">What you see on each listing</p>
              <div className="space-y-1.5 text-sm">
                {[
                  ["Est. Resale Value", "£28.00", "amber"],
                  ["List at (75th %ile)", "£32.00", "moss"],
                  ["Offer at (25th %ile)", "£22.00", "paper-faint"],
                  ["Sell speed", "Fast", "moss"],
                  ["Market range", "£14 – £45", "paper-faint"],
                ].map(([label, val, color]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-paper-faint">{label}</span>
                    <span className={`font-mono font-medium text-${color}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------- settings ---------- */

function SettingsSection({ userName, userEmail, onNameChange, currentTier, onUpgrade, onManageSubscription }: { userName: string; userEmail: string; onNameChange: (name: string) => void; currentTier: TierKey; onUpgrade: () => void; onManageSubscription: () => void }) {
  const [nameVal, setNameVal]       = useState(userName);
  const [emailVal, setEmailVal]     = useState(userEmail);
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [saving, setSaving]         = useState<string | null>(null);
  const [msg, setMsg]               = useState<{ key: string; text: string; ok: boolean } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting]     = useState(false);

  function flash(key: string, text: string, ok: boolean) {
    setMsg({ key, text, ok });
    setTimeout(() => setMsg(null), 4000);
  }

  async function saveName() {
    if (!nameVal.trim() || nameVal === userName) return;
    setSaving("name");
    const { error } = await createClient().auth.updateUser({ data: { full_name: nameVal.trim() } });
    setSaving(null);
    if (error) flash("name", error.message, false);
    else { onNameChange(nameVal.trim()); flash("name", "Name updated", true); }
  }

  async function saveEmail() {
    if (!emailVal.trim() || emailVal === userEmail) return;
    setSaving("email");
    const { error } = await createClient().auth.updateUser({ email: emailVal.trim() });
    setSaving(null);
    if (error) flash("email", error.message, false);
    else flash("email", "Confirmation sent to your new email address", true);
  }

  async function savePassword() {
    if (!newPw || newPw !== confirmPw) { flash("pw", "Passwords do not match", false); return; }
    if (newPw.length < 8) { flash("pw", "Password must be at least 8 characters", false); return; }
    setSaving("pw");
    const { error } = await createClient().auth.updateUser({ password: newPw });
    setSaving(null);
    if (error) flash("pw", error.message, false);
    else { setCurrentPw(""); setNewPw(""); setConfirmPw(""); flash("pw", "Password updated", true); }
  }

  async function handleDelete() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    await deleteAccount();
  }

  function Feedback({ k }: { k: string }) {
    if (!msg || msg.key !== k) return null;
    return <p className={`text-xs mt-2 ${msg.ok ? "text-moss" : "text-rust"}`}>{msg.text}</p>;
  }

  return (
    <div className="max-w-[620px] space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-paper-faint text-sm mt-1">Manage your account and subscription</p>
      </div>

      {/* Profile */}
      <section className="rounded-xl border border-line bg-ink-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-paper-dim uppercase tracking-wider">Profile</h2>
        <div className="space-y-1">
          <label className="text-xs text-paper-faint">Display name</label>
          <div className="flex gap-2">
            <input value={nameVal} onChange={(e) => setNameVal(e.target.value)}
              className="flex-1 bg-ink border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber transition-colors" />
            <button onClick={saveName} disabled={saving === "name" || !nameVal.trim() || nameVal === userName}
              className="px-4 py-2 rounded-lg bg-amber text-ink text-sm font-medium hover:bg-amber-deep transition-colors disabled:opacity-40">
              {saving === "name" ? "Saving…" : "Save"}
            </button>
          </div>
          <Feedback k="name" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-paper-faint">Email address</label>
          <div className="flex gap-2">
            <input type="email" value={emailVal} onChange={(e) => setEmailVal(e.target.value)}
              className="flex-1 bg-ink border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber transition-colors" />
            <button onClick={saveEmail} disabled={saving === "email" || !emailVal.trim() || emailVal === userEmail}
              className="px-4 py-2 rounded-lg bg-amber text-ink text-sm font-medium hover:bg-amber-deep transition-colors disabled:opacity-40">
              {saving === "email" ? "Saving…" : "Save"}
            </button>
          </div>
          <Feedback k="email" />
        </div>
      </section>

      {/* Security */}
      <section className="rounded-xl border border-line bg-ink-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-paper-dim uppercase tracking-wider">Security</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-paper-faint">New password</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters"
              className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-paper-faint">Confirm new password</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber transition-colors" />
          </div>
          <button onClick={savePassword} disabled={saving === "pw" || !newPw || !confirmPw}
            className="px-4 py-2 rounded-lg bg-amber text-ink text-sm font-medium hover:bg-amber-deep transition-colors disabled:opacity-40">
            {saving === "pw" ? "Saving…" : "Update password"}
          </button>
          <Feedback k="pw" />
        </div>
      </section>

      {/* Subscription */}
      <section className="rounded-xl border border-line bg-ink-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-paper-dim uppercase tracking-wider">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{currentTier === "pro" ? "Sellganise Pro" : "Free plan"}</p>
            <p className="text-xs text-paper-faint mt-0.5">
              {currentTier === "pro" ? "Unlimited stock · £19.99/mo" : "Up to 50 items · Free"}
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber/10 text-amber font-medium">Active</span>
        </div>
        <div className="pt-2 border-t border-line">
          {currentTier === "pro" ? (
            <>
              <p className="text-xs text-paper-faint mb-3">You're on Pro — unlimited stock, bulk actions, monthly archives, and CSV export. Manage or cancel your subscription below.</p>
              <button onClick={onManageSubscription} className="px-4 py-2 rounded-lg border border-line text-paper-dim text-sm font-medium hover:text-paper hover:border-paper-faint transition-colors">
                Manage subscription
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-paper-faint mb-3">Upgrade to Pro for unlimited stock, bulk actions, monthly profit archives, CSV export, and multi-platform tracking — £19.99/mo, cancel anytime.</p>
              <button onClick={onUpgrade} className="px-4 py-2 rounded-lg bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors">
                Upgrade to Pro
              </button>
            </>
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-rust/30 bg-ink-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-rust uppercase tracking-wider">Danger zone</h2>
        <p className="text-sm text-paper-faint">Permanently delete your account and all data. This cannot be undone.</p>
        <div className="space-y-2">
          <label className="text-xs text-paper-faint">Type <span className="font-mono text-paper">DELETE</span> to confirm</label>
          <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
            className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rust transition-colors font-mono" />
          <button onClick={handleDelete} disabled={deleteConfirm !== "DELETE" || deleting}
            className="px-4 py-2 rounded-lg bg-rust/10 border border-rust/40 text-rust text-sm font-medium hover:bg-rust/20 transition-colors disabled:opacity-40">
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------- upgrade modal ---------- */

function UpgradeModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  useEscClose(onClose);
  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-line">
        <div>
          <h2 className="font-display font-medium text-lg">You've hit your item limit</h2>
          <p className="text-paper-faint text-xs mt-0.5">Free plan includes up to 50 items</p>
        </div>
        <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg text-paper-faint hover:text-paper hover:bg-ink-soft transition-colors"><IconClose /></button>
      </div>
      <div className="px-6 py-6 space-y-5">
        <div className="rounded-xl border border-amber/25 bg-amber/[0.06] p-4">
          <p className="text-sm text-paper-dim leading-relaxed">
            You have <span className="text-paper font-medium">50 items</span> in your inventory — the maximum on the free plan. Upgrade to Pro to add unlimited stock and unlock advanced features.
          </p>
        </div>
        <div className="space-y-2">
          {["Unlimited stock items", "Monthly profit archives", "CSV export", "Advanced analytics", "Multi-platform tracking"].map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-paper-dim">
              <span className="w-4 h-4 rounded-full bg-moss/20 text-moss text-[10px] grid place-items-center shrink-0 font-bold">✓</span>
              {f}
            </div>
          ))}
        </div>
        <div className="pt-1 space-y-2">
          <button
            onClick={onUpgrade}
            className="block text-center w-full py-3 rounded-xl bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors"
          >
            Upgrade to Pro — £19.99/mo
          </button>
          <button onClick={onClose} className="w-full py-2 text-xs text-paper-faint hover:text-paper transition-colors">
            Maybe later
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------- onboarding ---------- */

function OnboardingGuide({ onAddStock, userName }: { onAddStock: () => void; userName: string }) {
  const firstName = userName ? userName.split(" ")[0] : "";

  const steps = [
    {
      num: "1",
      title: "Add your stock",
      desc: "Log every item you buy to resell — name, price paid, and condition. Click 'Add stock' in the top right.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>
        </svg>
      ),
    },
    {
      num: "2",
      title: "List it",
      desc: "Once it's live on Vinted, eBay or Depop, tap the status badge on the item to mark it as Listed.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/>
        </svg>
      ),
    },
    {
      num: "3",
      title: "Record the sale",
      desc: "When it sells, click 'Mark sold', enter what you got, and your profit is tracked automatically.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Arrow pointing to Add stock button */}
      <div className="flex justify-end items-center gap-2 mb-4 pr-1">
        <span className="text-xs font-medium text-amber animate-pulse">Start here</span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className="w-5 h-5 text-amber animate-bounce"
          style={{ transform: "rotate(-45deg)" }}
        >
          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
      </div>

      {/* Welcome hero */}
      <div className="rounded-2xl border border-amber/30 bg-amber/[0.06] p-8 mb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber/15 text-amber grid place-items-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>
          </svg>
        </div>
        <h1 className="font-display text-2xl font-medium mb-2">
          {firstName ? `Welcome, ${firstName}!` : "Welcome to Sellganise!"}
        </h1>
        <p className="text-paper-dim text-sm max-w-sm mx-auto leading-relaxed mb-6">
          Your inventory tracker is ready. Follow the 3 steps below to log your first haul and start tracking profit.
        </p>
        <button
          onClick={onAddStock}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add your first item
        </button>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-3 gap-3">
        {steps.map((step, i) => (
          <div key={step.num} className="relative">
            <div className="rounded-2xl border border-line bg-ink-card p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-amber text-ink text-xs font-bold grid place-items-center shrink-0">{step.num}</span>
                <span className="text-amber">{step.icon}</span>
              </div>
              <h3 className="font-display font-medium text-paper mb-2">{step.title}</h3>
              <p className="text-paper-dim text-sm leading-relaxed">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <>
                {/* Desktop arrow (between columns) */}
                <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-amber">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </div>
                {/* Mobile arrow (between rows) */}
                <div className="md:hidden flex justify-center my-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber rotate-90">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function DashboardPage() {
  const [currentTier, setCurrentTier] = useState<TierKey>("starter");

  const [navKey, setNavKey]       = useState<NavKey>("overview");
  const [stage, setStage]         = useState<Stage>("unlisted");
  const [addModalOpen, setAddModalOpen]         = useState(false);
  const [storageModalOpen, setStorageModalOpen] = useState(false);
  const [bulkSoldOpen, setBulkSoldOpen]         = useState(false);
  const [sellTarget, setSellTarget]         = useState<Item | null>(null);
  const [items, setItems]                   = useState<Item[]>([]);
  const [saleRecords, setSaleRecords]       = useState<SaleRecord[]>([]);
  const [storageLocations, setStorageLocations] = useState<string[]>([]);
  const [toasts, setToasts]               = useState<Toast[]>([]);
  const [query, setQuery]                 = useState("");
  const [hydrated, setHydrated]           = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [editTarget, setEditTarget]       = useState<Item | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<number[]>([]);
  const [salesClearedAt, setSalesClearedAt]       = useState(0);
  const notifRef                          = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const userMenuRef                       = useRef<HTMLDivElement>(null);
  const [userEmail, setUserEmail]         = useState("");
  const [userInitials, setUserInitials]   = useState("?");
  const [userName, setUserName]           = useState("");
  const [userId, setUserId]               = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen]     = useState(false);

  function clearNotifications(alertIds: number[]) {
    setDismissedAlertIds((prev) => [...new Set([...prev, ...alertIds])]);
    setSalesClearedAt(Date.now());
  }

  useEffect(() => {
    if (!notifOpen) return;
    function handleOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [notifOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const email = user.email ?? "";
      const name = (user.user_metadata?.full_name as string) ?? email.split("@")[0] ?? "";
      const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || email[0]?.toUpperCase() || "?";
      setUserEmail(email);
      setUserName(name);
      setUserInitials(initials);
    });
  }, []);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (!userId) return;
    const db = createClient();
    Promise.all([
      db.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      db.from("sale_records").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      db.from("storage_locations").select("name").eq("user_id", userId).order("name"),
      db.from("profiles").select("tier").eq("id", userId).single(),
    ]).then(([itemsRes, salesRes, locsRes, profileRes]) => {
      if (itemsRes.data) setItems((itemsRes.data as DbItemRow[]).map(rowToItem));
      if (salesRes.data) setSaleRecords((salesRes.data as DbSaleRow[]).map(rowToSale));
      if (locsRes.data) setStorageLocations((locsRes.data as { name: string }[]).map((r) => r.name));
      const tier = (profileRes.data as { tier?: string } | null)?.tier;
      if (tier === "pro") setCurrentTier("pro");
      setHydrated(true);
      // Show success toast if redirected back from Stripe checkout
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("upgraded") === "1") {
          addToast("You're now on Pro — enjoy unlimited stock!", "success");
          window.history.replaceState({}, "", "/dashboard");
        }
      }
    });
  }, [userId]);

  function editItem(updated: Item) {
    setItems((prev) => prev.map((i) => i.id === updated.id ? updated : i));
    addToast(`${updated.name} updated`);
    if (!userId) return;
    createClient().from("items").update({
      code: updated.code, name: updated.name, cond: updated.cond,
      paid: updated.paid, stage: updated.stage,
      bin: updated.bin ?? null, notes: updated.notes ?? null,
      size: updated.size ?? null, platform: updated.platform ?? null,
    }).eq("id", updated.id).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to save changes", "warning"); });
  }

  function addToast(message: string, type: Toast["type"] = "success") {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  }
  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleUpgrade() {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url, error } = await res.json();
    if (error) { addToast(error, "warning"); return; }
    if (url) window.location.href = url;
  }

  async function handleManageSubscription() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url, error } = await res.json();
    if (error) { addToast(error, "warning"); return; }
    if (url) window.location.href = url;
  }

  async function addItem(item: Item) {
    if (!canAddItem(currentTier, items.length)) { setUpgradeOpen(true); return; }
    setItems((prev) => [item, ...prev]);
    addToast(`${item.name} added to stock`);
    if (!userId) return;
    const { data, error } = await createClient().from("items").insert({
      user_id: userId, code: item.code, name: item.name, cond: item.cond,
      paid: item.paid, stage: item.stage, bin: item.bin ?? null,
      notes: item.notes ?? null, size: item.size ?? null, platform: item.platform ?? null,
      created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    }).select("id").single();
    if (error) { addToast("Failed to save item", "warning"); return; }
    if (data) setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, id: (data as { id: number }).id } : i));
  }

  async function addItemAndSale(item: Item, sale: SaleRecord) {
    if (!canAddItem(currentTier, items.length)) { setUpgradeOpen(true); return; }
    setItems((prev) => [item, ...prev]);
    setSaleRecords((prev) => [sale, ...prev]);
    addToast(`${item.name} added and recorded as sold`, "success");
    if (!userId) return;
    const { data: itemData, error: itemError } = await createClient().from("items").insert({
      user_id: userId, code: item.code, name: item.name, cond: item.cond,
      paid: item.paid, stage: item.stage, bin: item.bin ?? null,
      notes: item.notes ?? null, size: item.size ?? null, platform: item.platform ?? null,
      created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    }).select("id").single();
    if (itemError) { addToast("Failed to save item", "warning"); return; }
    const realItemId = itemData ? (itemData as { id: number }).id : undefined;
    if (realItemId) setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, id: realItemId } : i));
    const { data: saleData, error: saleError } = await createClient().from("sale_records").insert({
      user_id: userId, item_id: realItemId ?? null, item_name: sale.itemName,
      paid: sale.paid, sold_for: sale.soldFor, profit: sale.profit, month: sale.month,
      platform: sale.platform ?? null, ad_cost: null, packaging_cost: null,
      equipment_cost: null, other_cost: null,
    }).select("id").single();
    if (saleError) { addToast("Failed to save sale record", "warning"); return; }
    if (saleData) {
      const realSaleId = (saleData as { id: number }).id;
      setSaleRecords((prev) => prev.map((r) => r.id === sale.id ? { ...r, id: realSaleId } : r));
    }
  }

  async function addManyItems(newItems: Item[]) {
    const cap = TIERS[currentTier].itemCap;
    const remaining = cap === Infinity ? newItems.length : Math.max(0, cap - items.length);
    if (remaining === 0) { setUpgradeOpen(true); return; }
    const toAdd = newItems.slice(0, remaining);
    if (toAdd.length < newItems.length) addToast(`Free plan limit: ${toAdd.length} of ${newItems.length} items added. Upgrade for unlimited.`, "warning");
    setItems((prev) => [...toAdd, ...prev]);
    addToast(`${toAdd.length} item${toAdd.length === 1 ? "" : "s"} added to stock`, "info");
    if (!userId) return;
    const { data, error } = await createClient().from("items").insert(
      toAdd.map((item) => ({
        user_id: userId!, code: item.code, name: item.name, cond: item.cond,
        paid: item.paid, stage: item.stage, bin: item.bin ?? null,
        notes: item.notes ?? null, size: item.size ?? null, platform: item.platform ?? null,
        created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      }))
    ).select("id");
    if (error) { addToast("Failed to save items", "warning"); return; }
    if (data) {
      const dbIds = data as { id: number }[];
      setItems((prev) => {
        const tempIds = toAdd.map((i) => i.id);
        return prev.map((i) => {
          const pos = tempIds.indexOf(i.id);
          if (pos !== -1 && dbIds[pos]) return { ...i, id: dbIds[pos].id };
          return i;
        });
      });
    }
  }

  async function addStorageLocation(name: string) {
    if (storageLocations.includes(name)) return;
    setStorageLocations((prev) => [...prev, name]);
    addToast(`Storage location "${name}" created`, "info");
    if (!userId) return;
    const { error } = await createClient().from("storage_locations").insert({ user_id: userId, name });
    if (error) {
      setStorageLocations((prev) => prev.filter((l) => l !== name));
      addToast("Failed to create storage location", "warning");
    }
  }

  function removeItem(id: number) {
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (target) addToast(`${target.name} removed`, "warning");
    if (!userId) return;
    createClient().from("items").delete().eq("id", id).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to remove item", "warning"); });
  }

  function unassignFromStorage(id: number) {
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, bin: undefined } : i));
    if (target) addToast(`${target.name} removed from storage`);
    if (!userId) return;
    createClient().from("items").update({ bin: null }).eq("id", id).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to update storage", "warning"); });
  }

  function assignBin(id: number, bin: string) {
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, bin } : i));
    if (target) addToast(`${target.name} added to ${bin}`, "info");
    if (!userId) return;
    createClient().from("items").update({ bin }).eq("id", id).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to assign storage", "warning"); });
  }

  function bulkList(ids: number[]) {
    setItems((prev) => prev.map((i) => ids.includes(i.id) ? { ...i, stage: "listed" as Stage } : i));
    addToast(`${ids.length} item${ids.length !== 1 ? "s" : ""} marked listed`);
    if (!userId) return;
    createClient().from("items").update({ stage: "listed" }).in("id", ids).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to update items", "warning"); });
  }
  function bulkUnlist(ids: number[]) {
    setItems((prev) => prev.map((i) => ids.includes(i.id) ? { ...i, stage: "unlisted" as Stage } : i));
    addToast(`${ids.length} item${ids.length !== 1 ? "s" : ""} marked unlisted`, "info");
    if (!userId) return;
    createClient().from("items").update({ stage: "unlisted" }).in("id", ids).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to update items", "warning"); });
  }
  function bulkRemove(ids: number[]) {
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    addToast(`${ids.length} item${ids.length !== 1 ? "s" : ""} removed`, "info");
    if (!userId) return;
    createClient().from("items").delete().in("id", ids).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to remove items", "warning"); });
  }
  function bulkAssignBin(ids: number[], bin: string) {
    setItems((prev) => prev.map((i) => ids.includes(i.id) ? { ...i, bin } : i));
    addToast(`${ids.length} item${ids.length !== 1 ? "s" : ""} moved to ${bin}`, "info");
    if (!userId) return;
    createClient().from("items").update({ bin }).in("id", ids).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to assign storage", "warning"); });
  }

  useEffect(() => {
    function handleUpsell() { addToast("Bulk actions are a Pro feature — upgrade to unlock", "info"); }
    window.addEventListener("sellganise:upsell-bulk", handleUpsell);
    return () => window.removeEventListener("sellganise:upsell-bulk", handleUpsell);
  }, []);

  function toggleListed(item: Item, platforms?: string[]) {
    const next: Stage = item.stage === "unlisted" ? "listed" : "unlisted";
    const newPlatform = next === "listed" ? (platforms ?? item.platform) : [];
    setItems((prev) => prev.map((i) =>
      i.id === item.id ? { ...i, stage: next, platform: newPlatform } : i
    ));
    addToast(next === "listed" ? `${item.name} marked as listed` : `${item.name} moved back to unlisted`);
    if (!userId) return;
    createClient().from("items").update({ stage: next, platform: newPlatform ?? null })
      .eq("id", item.id).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to update item", "warning"); });
  }

  async function confirmSale(item: Item, soldFor: number, platform: string, costs: ExtraCosts) {
    const totalExtra = costs.adCost + costs.packagingCost + costs.equipmentCost + costs.otherCost;
    const profit = soldFor - item.paid - totalExtra;
    const tempId = -Date.now();
    const newSale: SaleRecord = {
      id: tempId, itemId: item.id, itemName: item.name, paid: item.paid, soldFor, profit,
      month: CURRENT_MONTH, platform: platform || undefined,
      adCost: costs.adCost || undefined, packagingCost: costs.packagingCost || undefined,
      equipmentCost: costs.equipmentCost || undefined, otherCost: costs.otherCost || undefined,
    };
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, stage: "sold" as Stage } : i));
    setSaleRecords((prev) => [newSale, ...prev]);
    addToast(`${item.name} sold for ${gbp(soldFor)} · ${profit >= 0 ? "+" : ""}${gbp(profit)}`);
    if (!userId) return;
    const db = createClient();
    const [, saleRes] = await Promise.all([
      db.from("items").update({ stage: "sold" }).eq("id", item.id).eq("user_id", userId),
      db.from("sale_records").insert({
        user_id: userId, item_id: item.id, item_name: item.name,
        paid: item.paid, sold_for: soldFor, profit, month: CURRENT_MONTH,
        platform: platform || null,
        ad_cost: costs.adCost || null, packaging_cost: costs.packagingCost || null,
        equipment_cost: costs.equipmentCost || null, other_cost: costs.otherCost || null,
      }).select("id").single(),
    ]);
    if (saleRes.data) {
      const realId = (saleRes.data as { id: number }).id;
      setSaleRecords((prev) => prev.map((r) => r.id === tempId ? { ...r, id: realId } : r));
    }
    if (saleRes.error) addToast("Failed to record sale", "warning");
  }

  function unsellItem(id: number) {
    const item = items.find((i) => i.id === id);
    const latest = [...saleRecords].filter((r) => r.itemId === id).sort((a, b) => b.id - a.id)[0];
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stage: "unlisted" as Stage } : i));
    setSaleRecords((prev) => latest ? prev.filter((r) => r.id !== latest.id) : prev);
    if (item) addToast(`${item.name} moved back to unlisted`, "info");
    if (!userId) return;
    const db = createClient();
    db.from("items").update({ stage: "unlisted" }).eq("id", id).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to revert sale", "warning"); });
    if (latest && latest.id > 0) {
      db.from("sale_records").delete().eq("id", latest.id).eq("user_id", userId)
        .then(({ error }) => { if (error) addToast("Failed to revert sale", "warning"); });
    }
  }

  function deleteSale(id: number) {
    const record = saleRecords.find((r) => r.id === id);
    setSaleRecords((prev) => prev.filter((r) => r.id !== id));
    if (record?.itemId) {
      setItems((prev) => prev.map((i) => i.id === record.itemId ? { ...i, stage: "unlisted" as Stage } : i));
    }
    if (record) addToast(`${record.itemName} returned to stock`, "info");
    if (!userId) return;
    const db = createClient();
    db.from("sale_records").delete().eq("id", id).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to delete sale", "warning"); });
    if (record?.itemId) {
      db.from("items").update({ stage: "unlisted" }).eq("id", record.itemId).eq("user_id", userId)
        .then(({ error }) => { if (error) addToast("Failed to delete sale", "warning"); });
    }
  }

  function editSale(updated: SaleRecord) {
    setSaleRecords((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    addToast(`Sale record for "${updated.itemName}" updated`);
    if (!userId) return;
    createClient().from("sale_records").update({
      item_name: updated.itemName, paid: updated.paid, sold_for: updated.soldFor,
      profit: updated.profit, month: updated.month, platform: updated.platform ?? null,
      ad_cost: updated.adCost ?? null, packaging_cost: updated.packagingCost ?? null,
      equipment_cost: updated.equipmentCost ?? null, other_cost: updated.otherCost ?? null,
    }).eq("id", updated.id).eq("user_id", userId)
      .then(({ error }) => { if (error) addToast("Failed to save sale record", "warning"); });
  }

  async function addManySales(records: SaleRecord[]) {
    setSaleRecords((prev) => [...records, ...prev]);
    addToast(`${records.length} sale${records.length === 1 ? "" : "s"} imported`, "success");
    if (!userId) return;
    const { data, error } = await createClient().from("sale_records").insert(
      records.map((r) => ({
        user_id: userId!, item_id: r.itemId ?? null, item_name: r.itemName,
        paid: r.paid, sold_for: r.soldFor, profit: r.profit, month: r.month,
        platform: r.platform ?? null, ad_cost: r.adCost ?? null,
        packaging_cost: r.packagingCost ?? null, equipment_cost: r.equipmentCost ?? null,
        other_cost: r.otherCost ?? null,
      }))
    ).select("id");
    if (error) { addToast("Failed to import sales", "warning"); return; }
    if (data) {
      const dbIds = data as { id: number }[];
      setSaleRecords((prev) => {
        const tempIds = records.map((r) => r.id);
        return prev.map((r) => {
          const pos = tempIds.indexOf(r.id);
          if (pos !== -1 && dbIds[pos]) return { ...r, id: dbIds[pos].id };
          return r;
        });
      });
    }
  }

  const liveProfit = saleRecords.reduce((s, r) => s + r.profit, 0);
  const liveSold   = saleRecords.length;

  const [migrating, setMigrating] = useState(false);
  const hasLocalData = hydrated && items.length === 0 && typeof window !== "undefined" && !!localStorage.getItem("sellganise-items") && JSON.parse(localStorage.getItem("sellganise-items") || "[]").length > 0;

  async function migrateFromLocalStorage() {
    if (!userId || migrating) return;
    setMigrating(true);
    try {
      const rawItems: Item[] = JSON.parse(localStorage.getItem("sellganise-items") || "[]");
      const rawSales: SaleRecord[] = JSON.parse(localStorage.getItem("sellganise-sales") || "[]");
      const rawLocs: string[] = JSON.parse(localStorage.getItem("sellganise-locations") || "[]");
      const db = createClient();

      if (rawLocs.length) {
        await db.from("storage_locations").insert(rawLocs.map((name) => ({ user_id: userId, name }))).select();
      }

      let itemIdMap: Map<number, number> = new Map();
      if (rawItems.length) {
        const { data } = await db.from("items").insert(
          rawItems.map((item) => ({
            user_id: userId, code: item.code ?? "", name: item.name, cond: item.cond ?? "good",
            paid: item.paid ?? 0, stage: item.stage ?? "unlisted",
            bin: item.bin ?? null, notes: item.notes ?? null,
            size: item.size ?? null, platform: item.platform ?? null,
            created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
          }))
        ).select("id");
        if (data) rawItems.forEach((item, i) => { if ((data as {id:number}[])[i]) itemIdMap.set(item.id, (data as {id:number}[])[i].id); });
      }

      if (rawSales.length) {
        await db.from("sale_records").insert(
          rawSales.map((r) => ({
            user_id: userId, item_id: r.itemId ? (itemIdMap.get(r.itemId) ?? null) : null,
            item_name: r.itemName, paid: r.paid ?? 0, sold_for: r.soldFor ?? 0,
            profit: r.profit ?? 0, month: r.month ?? CURRENT_MONTH,
            platform: r.platform ?? null, ad_cost: r.adCost ?? null,
            packaging_cost: r.packagingCost ?? null, equipment_cost: r.equipmentCost ?? null,
            other_cost: r.otherCost ?? null,
          }))
        );
      }

      localStorage.removeItem("sellganise-items");
      localStorage.removeItem("sellganise-sales");
      localStorage.removeItem("sellganise-locations");

      const [itemsRes, salesRes, locsRes] = await Promise.all([
        db.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        db.from("sale_records").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        db.from("storage_locations").select("name").eq("user_id", userId).order("name"),
      ]);
      if (itemsRes.data) setItems((itemsRes.data as DbItemRow[]).map(rowToItem));
      if (salesRes.data) setSaleRecords((salesRes.data as DbSaleRow[]).map(rowToSale));
      if (locsRes.data) setStorageLocations((locsRes.data as { name: string }[]).map((r) => r.name));
      addToast(`Restored ${rawItems.length} items and ${rawSales.length} sales`, "success");
    } catch {
      addToast("Migration failed — try again", "warning");
    }
    setMigrating(false);
  }

  return (
    <div className="flex min-h-screen bg-ink">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {hasLocalData && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-4 sm:px-5 py-3 rounded-xl bg-amber text-ink shadow-xl text-sm font-medium text-center w-[calc(100vw-3rem)] sm:w-auto max-w-sm sm:max-w-none">
          <span>Previous data found in this browser —</span>
          <button onClick={migrateFromLocalStorage} disabled={migrating} className="underline underline-offset-2 font-semibold disabled:opacity-50 whitespace-nowrap">
            {migrating ? "Restoring…" : "Restore it now"}
          </button>
        </div>
      )}
      {addModalOpen && <AddStockModal onClose={() => setAddModalOpen(false)} onAdd={addItem} onAddMany={addManyItems} onAddAndSold={addItemAndSale} storageLocations={storageLocations} />}
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} onUpgrade={() => { setUpgradeOpen(false); handleUpgrade(); }} />}
      {storageModalOpen && <AddStorageModal onClose={() => setStorageModalOpen(false)} onAdd={addStorageLocation} />}
      {editTarget && (
        <EditStockModal
          item={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(updated) => { editItem(updated); setEditTarget(null); }}
          storageLocations={storageLocations}
        />
      )}
      {sellTarget && (
        <SellModal
          item={sellTarget}
          onClose={() => setSellTarget(null)}
          onConfirm={(price, platform, costs) => confirmSale(sellTarget, price, platform, costs)}
        />
      )}
      {bulkSoldOpen && (
        <BulkSoldModal onClose={() => setBulkSoldOpen(false)} onAdd={addManySales} />
      )}

      {/* sidebar */}
      <aside className="hidden md:flex fixed md:sticky top-0 h-screen w-[230px] shrink-0 border-r border-line bg-ink-soft/40 flex-col z-40">
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-line">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <span className="font-display text-[16px] font-medium">Sellganise</span>
          </a>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setNavKey(n.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left w-full transition-colors ${n.key === navKey ? "bg-amber/12 text-amber" : "text-paper-dim hover:text-paper hover:bg-ink-card"}`}>
              {n.icon}<span>{n.label}</span>
            </button>
          ))}
        </nav>

        {/* Resources */}
        <div className="px-3 pb-2 border-t border-line">
          <p className="px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-[0.15em] text-paper-faint/50">Resources</p>
          {([
            {
              label: "What's New",
              href: "/blog",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0"><path d="M11 5L6 9H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>,
            },
            {
              label: "Feedback",
              href: "mailto:sellganise@gmail.com?subject=Sellganise%20Feedback",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="8" x2="12" y2="11"/><line x1="12" y1="14" x2="12.01" y2="14"/></svg>,
            },
            {
              label: "Help Center",
              href: "/help",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
            },
          ] as { label: string; href: string; icon: React.ReactNode }[]).map(({ label, href, icon }) => (
            <a key={label} href={href} target={href.startsWith("/help") ? "_blank" : undefined} rel={href.startsWith("/help") ? "noopener noreferrer" : undefined} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-paper-dim hover:text-paper hover:bg-ink-card transition-colors">
              {icon}<span>{label}</span>
            </a>
          ))}
        </div>

        <div className="p-3 border-t border-line">
          <div className="rounded-lg bg-ink-card border border-line-soft p-3 mb-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-paper-faint">
                {items.length} / {TIERS[currentTier].itemCap === Infinity ? "∞" : TIERS[currentTier].itemCap} items
              </span>
              <span className="text-amber">{TIERS[currentTier].name}</span>
            </div>
            <div className="h-1.5 rounded-full bg-line overflow-hidden">
              <div
                className="h-full bg-amber rounded-full transition-all duration-500"
                style={{ width: TIERS[currentTier].itemCap === Infinity ? "0%" : `${Math.min(items.length / TIERS[currentTier].itemCap * 100, 100)}%` }}
              />
            </div>
            {currentTier === "starter" ? (
              <button
                onClick={handleUpgrade}
                className="mt-3 w-full text-center text-xs py-1.5 rounded-md border border-amber/30 text-amber hover:bg-amber/10 transition-colors"
              >
                Upgrade to Pro
              </button>
            ) : (
              <button
                onClick={handleManageSubscription}
                className="mt-3 w-full text-center text-xs py-1.5 rounded-md border border-line text-paper-faint hover:text-paper hover:border-paper-faint transition-colors"
              >
                Manage subscription
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-ink/95 backdrop-blur-md border-t border-line flex items-stretch">
        {NAV.map((n) => {
          const shortLabel: Record<NavKey, string> = { overview: "Home", stock: "Stock", storage: "Map", calculator: "Calc", archives: "Archive", analytics: "Ext", settings: "More" };
          return (
            <button
              key={n.key}
              onClick={() => setNavKey(n.key)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-medium transition-colors ${n.key === navKey ? "text-amber" : "text-paper-faint"}`}
            >
              {n.icon}
              <span>{shortLabel[n.key]}</span>
            </button>
          );
        })}
      </nav>

      {/* main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-line flex items-center gap-4 px-6 sticky top-0 bg-ink/85 backdrop-blur-md z-10">
          <a href="/" className="md:hidden flex items-center gap-2 shrink-0">
            <span className="font-display text-[15px] font-medium tracking-tight">Sellganise</span>
          </a>
          <div className="flex items-center gap-2.5 flex-1 min-w-0 max-w-[420px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-paper-faint shrink-0"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              placeholder="Search…"
              className="bg-transparent border-none outline-none text-sm text-paper placeholder:text-paper-faint w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-paper-faint hover:text-paper transition-colors shrink-0"><IconClose /></button>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
          <button onClick={() => { if (!canAddItem(currentTier, items.length)) { setUpgradeOpen(true); return; } setAddModalOpen(true); }} className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg bg-amber text-ink hover:bg-paper transition-colors shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span className="hidden sm:block">Add stock</span>
          </button>
          <div ref={notifRef} className="relative shrink-0">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative grid place-items-center w-9 h-9 rounded-lg text-paper-dim hover:text-paper hover:bg-ink-card transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {(() => {
                const now = Date.now();
                const hasAging = items.some(
                  (i) => i.stage !== "sold" && i.createdAt &&
                    Math.floor((now - i.createdAt) / 86_400_000) >= 15 &&
                    !dismissedAlertIds.includes(i.id)
                );
                const hasSales = saleRecords.some((r) => r.id > salesClearedAt);
                if (hasAging) return <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber border-2 border-ink" />;
                if (hasSales) return <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-moss border-2 border-ink" />;
                return null;
              })()}
            </button>
            {notifOpen && (
              <NotificationPanel
                saleRecords={saleRecords}
                items={items}
                dismissedAlertIds={dismissedAlertIds}
                salesClearedAt={salesClearedAt}
                onClear={clearNotifications}
              />
            )}
          </div>
          <ThemeToggle className="hidden md:grid" />
          <div ref={userMenuRef} className="relative shrink-0">
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="grid place-items-center w-9 h-9 rounded-full bg-ink-card border border-line text-xs font-medium text-paper-dim hover:text-paper hover:border-paper-faint transition-colors"
            >
              {userInitials}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-52 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-ink-card shadow-2xl shadow-black/60 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-line">
                  {userName && <p className="text-sm font-medium text-paper">{userName}</p>}
                  <p className="text-xs text-paper-faint mt-0.5">{userEmail}</p>
                </div>
                <div className="py-1">
                  {currentTier === "pro" && (
                    <button
                      onClick={() => { setUserMenuOpen(false); handleManageSubscription(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-paper-dim hover:text-paper hover:bg-ink-soft transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      Manage subscription
                    </button>
                  )}
                  <button
                    onClick={async () => { const sb = createClient(); await sb.auth.signOut(); window.location.href = "/"; }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rust hover:bg-rust/10 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </header>

        <main className="flex-1 p-6 pb-24 md:pb-6 max-w-[1152px] w-full mx-auto">
          {navKey === "overview" && (
            hydrated && items.length === 0
              ? <OnboardingGuide onAddStock={() => setAddModalOpen(true)} userName={userName} />
              : <Overview items={items} stage={stage} setStage={setStage} onSell={setSellTarget} onToggleListed={toggleListed} onEdit={setEditTarget} onUnsell={unsellItem} liveProfit={liveProfit} liveSold={liveSold} query={query} storageLocations={storageLocations} onAssignBin={assignBin} />
          )}
          {navKey === "stock"      && <Stock items={items} onSell={setSellTarget} onToggleListed={toggleListed} onEdit={setEditTarget} onRemove={removeItem} onUnsell={unsellItem} query={query} storageLocations={storageLocations} onAssignBin={assignBin} currentTier={currentTier} onBulkList={bulkList} onBulkUnlist={bulkUnlist} onBulkRemove={bulkRemove} onBulkAssignBin={bulkAssignBin} />}
          {navKey === "storage"    && <StorageMap items={items} storageLocations={storageLocations} onAddStorage={() => setStorageModalOpen(true)} onRemoveItem={unassignFromStorage} />}
          {navKey === "calculator" && <ProfitCalculator />}
          {navKey === "archives"   && <Archives saleRecords={saleRecords} onDeleteSale={deleteSale} onEditSale={editSale} onBulkSold={() => setBulkSoldOpen(true)} />}
          {navKey === "analytics"  && <AnalyticsExtension />}
          {navKey === "settings"   && <SettingsSection userName={userName} userEmail={userEmail} onNameChange={(n) => { setUserName(n); const initials = n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || n[0]?.toUpperCase() || "?"; setUserInitials(initials); }} currentTier={currentTier} onUpgrade={handleUpgrade} onManageSubscription={handleManageSubscription} />}
        </main>
      </div>
    </div>
  );
}
