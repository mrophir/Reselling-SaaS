import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Learn how to use Sellganise — adding stock, exporting data, resetting your password, upgrading your plan, and more.",
  robots: { index: false, follow: false },
};

const SECTIONS = [
  {
    id: "adding-stock",
    title: "Adding stock",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>
      </svg>
    ),
    steps: [
      { title: "Open the Add stock panel", body: 'Click the "Add stock" button in the top-right of your dashboard. On mobile it appears as a floating button.' },
      { title: "Fill in the item details", body: "Enter a description, the platform you plan to sell on, your purchase cost, and your target selling price. Description, cost and price are required — everything else is optional." },
      { title: "Save the item", body: 'Click "Add item". The item appears in your Overview and Stock tab instantly. If you hit your plan\'s item limit, you\'ll be prompted to upgrade.' },
    ],
  },
  {
    id: "pipeline",
    title: "Moving items through the pipeline",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    steps: [
      { title: "Unlisted → Listed", body: 'Find the item in your Stock tab and click the "Mark as listed" toggle. This moves it from Unlisted to Listed so you can track what\'s live on platforms.' },
      { title: "Listed → Sold", body: 'Click "Record sale" on any listed item. Enter the final sale price and the platform it sold on. The item moves to your Monthly Archives and your profit stats update immediately.' },
      { title: "Undo a sale", body: 'Open the Monthly Archives tab, find the sale, and click "Undo". The item is restored to your active stock.' },
    ],
  },
  {
    id: "storage",
    title: "Storage map",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/>
        <rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/>
      </svg>
    ),
    steps: [
      { title: "Create a storage location", body: 'Go to the Storage map tab and click "Add location". Give it a name (e.g. "Box A", "Shelf 2") and save.' },
      { title: "Assign items to a bin", body: 'In the Stock tab, click the bin icon on any item and choose a storage location. You can reassign at any time.' },
      { title: "Look up where something is", body: "Open Storage map and click a location to see every item assigned to it — useful for finding stock when it's time to ship." },
    ],
  },
  {
    id: "calculator",
    title: "Profit calculator",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="14" x2="8" y2="14"/>
        <line x1="16" y1="14" x2="16" y2="18"/><line x1="8" y1="18" x2="12" y2="18"/>
      </svg>
    ),
    steps: [
      { title: "Open the calculator", body: "Click \"Profit calculator\" in the sidebar. Select the platform you're selling on (Vinted, eBay, Depop, or Facebook Marketplace)." },
      { title: "Enter your numbers", body: "Type in your cost price and selling price. The calculator applies the platform's 2026 UK fee rates and shows your net profit and margin instantly." },
      { title: "Note on fees", body: "Fee rates are indicative based on published 2026 UK rates. Always verify current rates on each platform before making pricing decisions." },
    ],
  },
  {
    id: "export",
    title: "Exporting your data (CSV)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    steps: [
      { title: "Pro plan required", body: "CSV export is a Pro feature. If you're on the free plan, upgrade first via the \"Upgrade to Pro\" button in the sidebar or Settings." },
      { title: "Export from Monthly Archives", body: "Go to the Monthly Archives tab, select the month you want, and click the \"Export CSV\" button. A file downloads to your device." },
      { title: "What's included", body: "Each row is a sale record: item description, platform, purchase cost, sale price, profit, margin, and sale date. Ready to use for tax records or spreadsheet analysis." },
    ],
  },
  {
    id: "password",
    title: "Resetting your password",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    steps: [
      { title: "Go to the login page", body: 'Visit sellganise.com/login and click "Forgot password?" below the password field.' },
      { title: "Enter your email", body: 'Type the email address you signed up with and click "Send reset link". Check your inbox (and spam folder).' },
      { title: "Set your new password", body: "Click the link in the email immediately — it expires after a few minutes. You'll be taken to a page to choose a new password. Enter it twice and click \"Set new password\"." },
    ],
  },
  {
    id: "upgrade",
    title: "Upgrading to Pro",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/>
      </svg>
    ),
    steps: [
      { title: "From the sidebar", body: "If you're on the free plan, click \"Upgrade to Pro\" in the sidebar. This opens the upgrade panel." },
      { title: "From Settings", body: "Go to Settings → Subscription and click the upgrade button there. Pro is £19.99/month with no contract." },
      { title: "What you get", body: "Unlimited items, monthly archives, CSV export, aging flags, bulk actions, advanced reporting, CSV import, and the Sellganise Analytics Chrome extension." },
    ],
  },
  {
    id: "delete",
    title: "Deleting your account",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    ),
    steps: [
      { title: "Go to Settings", body: "Click \"Settings\" in the sidebar and scroll to the bottom of the page." },
      { title: "Delete account", body: "Click \"Delete my account\". You'll be asked to confirm — this action is permanent and cannot be undone." },
      { title: "What gets deleted", body: "All your items, sale records, and storage locations are permanently removed. If you're on a paid plan, cancel your subscription first to avoid further charges." },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-ink text-paper" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <header className="border-b border-line px-6 h-16 flex items-center justify-between sticky top-0 bg-ink/90 backdrop-blur-md z-50">
        <Link href="/" className="font-display text-[17px] font-medium tracking-tight hover:text-amber transition-colors">
          Sellganise
        </Link>
        <Link href="/dashboard" className="text-sm text-paper-faint hover:text-paper transition-colors">
          ← Back to dashboard
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-amber mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            Help Center
          </p>
          <h1 className="font-display font-medium text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight mb-4">
            How to use Sellganise
          </h1>
          <p className="text-paper-dim text-lg">
            Everything you need to get set up and make the most of your account.
          </p>
        </div>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 mb-12">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs px-3 py-1.5 rounded-full border border-line text-paper-dim hover:border-amber/50 hover:text-amber transition-colors"
            >
              {s.title}
            </a>
          ))}
        </div>

        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-5">
                <span className="p-2 rounded-lg bg-amber/10 text-amber">{section.icon}</span>
                <h2 className="font-display font-medium text-xl tracking-tight">{section.title}</h2>
              </div>
              <div className="space-y-4 pl-1">
                {section.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="w-6 h-6 rounded-full bg-ink-card border border-line text-xs font-mono flex items-center justify-center text-paper-faint shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {i < section.steps.length - 1 && (
                        <div className="w-px flex-1 bg-line mt-1.5 mb-0" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-paper text-sm mb-1">{step.title}</p>
                      <p className="text-paper-dim text-sm leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-b border-line mt-2" />
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-line bg-ink-card p-8 text-center">
          <p className="font-medium text-paper mb-2">Still stuck?</p>
          <p className="text-paper-dim text-sm mb-5">
            Send us an email and we'll get back to you as soon as possible.
          </p>
          <a
            href="mailto:sellganise@gmail.com?subject=Help%20request"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber text-ink text-sm font-medium hover:bg-paper transition-colors"
          >
            Email support
          </a>
        </div>
      </main>

      <footer className="border-t border-line px-6 py-8 mt-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-paper-faint">
          <p>© {new Date().getFullYear()} Sellganise. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/pricing" className="hover:text-paper transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-paper transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-paper transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
