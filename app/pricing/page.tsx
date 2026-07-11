import type { Metadata } from "next";
import Link from "next/link";
import { getTier, formatItemCap, type FeatureFlag } from "../../lib/tiers";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start free with 50 items. Upgrade to Pro for £19.99/mo — unlimited stock, monthly archives, CSV export, and advanced analytics. No hidden fees, cancel anytime.",
  alternates: { canonical: "https://sellganise.com/pricing" },
  openGraph: {
    title: "Sellganise Pricing — Free plan + Pro at £19.99/mo",
    description: "Start free with 50 items. Upgrade to Pro for unlimited stock, monthly archives, CSV export and advanced analytics.",
    url: "https://sellganise.com/pricing",
  },
};

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

export default function PricingPage() {
  const free = getTier("starter");
  const pro  = getTier("pro");

  return (
    <div className="min-h-screen bg-ink text-paper" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* nav */}
      <header className="border-b border-line px-6 h-16 flex items-center justify-between sticky top-0 bg-ink/90 backdrop-blur-md z-50">
        <Link href="/" className="font-display text-[17px] font-medium tracking-tight hover:text-amber transition-colors">
          Sellganise
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-paper-faint hover:text-paper transition-colors">Log in</Link>
          <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-lg bg-amber text-ink hover:bg-paper transition-colors">
            Get started free
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* header */}
        <div className="text-center mb-16">
          <p className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-amber mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            Pricing
          </p>
          <h1 className="font-display font-medium text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.02] tracking-tight mb-5">
            Simple pricing. No surprises.
          </h1>
          <p className="text-paper-dim text-lg max-w-xl mx-auto">
            Start free, log your first haul, see how it works. Upgrade when it&apos;s earning its keep.
          </p>
        </div>

        {/* cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">

          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-line bg-ink-card p-9 h-full">
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
            <Link href="/signup" className="block text-center px-5 py-3.5 rounded-xl border border-line text-paper font-medium text-sm hover:border-paper-faint hover:bg-ink-soft transition-colors">
              Start free, no card needed
            </Link>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col rounded-2xl border border-amber/50 bg-gradient-to-b from-amber/[0.07] to-transparent p-9 h-full">
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
            <Link href="/signup" className="block text-center px-5 py-3.5 rounded-xl bg-amber text-ink font-medium text-sm hover:bg-paper transition-colors">
              Get started
            </Link>
            <p className="text-center text-xs text-paper-faint mt-3">Cancel anytime · No hidden fees</p>
          </div>

        </div>

        <p className="text-center text-sm text-paper-faint mt-10">
          All prices in GBP · Secure billing via Stripe · Cancel anytime
        </p>
        <p className="text-center text-xs text-paper-faint/50 mt-3 max-w-lg mx-auto">
          Platform fee rates used in the profit calculator are indicative and based on published 2026 UK rates. Fees may change — always verify current rates on each platform before making pricing decisions.
        </p>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-20 space-y-6">
          <h2 className="font-display text-2xl font-medium tracking-tight text-center mb-10">Common questions</h2>
          {[
            { q: "Can I cancel anytime?", a: "Yes. Cancel from your account settings with one click. Your subscription ends at the close of your current billing period and you will not be charged again. You keep full access until that date. No partial refunds are issued for unused time." },
            { q: "What happens when I hit 50 items on the free plan?", a: "You won't be able to add more items until you upgrade. Your existing data stays safe and nothing is deleted." },
            { q: "Is my data safe?", a: "Yes. All data is stored securely in Supabase with row-level security. Only you can access your inventory. We never sell your data." },
            { q: "Do I need a card to sign up?", a: "No. The free plan is genuinely free with no card required. You only need payment details when upgrading to Pro." },
            { q: "What is the Analytics Chrome extension?", a: "A browser extension that overlays live resale price estimates directly on Vinted listings so you can spot bargains instantly." },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-line pb-6">
              <p className="font-medium text-paper mb-2">{q}</p>
              <p className="text-paper-dim text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-line px-6 py-10 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-paper-faint">
          <p>© {new Date().getFullYear()} Sellganise. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-paper transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-paper transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-paper transition-colors">← Back to home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
