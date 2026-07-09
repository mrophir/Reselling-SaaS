import Link from "next/link";

function LegalNav() {
  return (
    <header className="border-b border-line px-6 h-16 flex items-center justify-between sticky top-0 bg-ink/90 backdrop-blur-md z-50">
      <Link href="/" className="flex items-center gap-2.5 group">
        <span className="font-display text-[17px] font-medium tracking-tight">Sellganise</span>
      </Link>
      <div className="flex items-center gap-5 text-sm text-paper-faint">
        <Link href="/terms" className="hover:text-paper transition-colors">Terms of Service</Link>
        <Link href="/" className="hover:text-paper transition-colors">← Back to home</Link>
      </div>
    </header>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-medium text-paper mb-4 pb-3 border-b border-line">{title}</h2>
      <div className="space-y-3 text-paper-dim leading-relaxed text-[15px]">{children}</div>
    </section>
  );
}

function TableRow({ label, value, alt }: { label: string; value: string; alt?: boolean }) {
  return (
    <div className={`grid grid-cols-[1fr_1.5fr] gap-4 px-4 py-3 rounded-lg text-sm ${alt ? "bg-ink-soft" : "bg-ink-card"}`}>
      <span className="text-paper-dim">{label}</span>
      <span className="text-paper">{value}</span>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ink text-paper" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <LegalNav />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-amber mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            Legal
          </div>
          <h1 className="font-display text-4xl font-medium tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-paper-faint text-sm">Last updated: 4 July 2026</p>
          <p className="mt-4 text-paper-dim leading-relaxed">
            This policy explains what personal data Sellganise collects, why we collect it, how we use and protect it, and what your rights are under UK data protection law. We are committed to handling your data responsibly.
          </p>
        </div>

        <Section title="1. Who we are">
          <p>
            Sellganise ("we", "us", "our") is operated by <strong className="text-paper">Sellganise</strong>, a company registered in England and Wales. We are the data controller for personal data collected through sellganise.com and our associated services.
          </p>
          <p>
            We are registered with the Information Commissioner's Office (ICO). Our registration reference and registered office details are available on request.
          </p>
          <p>
            For all data protection queries, contact us at:{" "}
            <a href="mailto:privacy@sellganise.com" className="text-amber hover:underline">privacy@sellganise.com</a>
          </p>
        </Section>

        <Section title="2. Data we collect">
          <p>We collect the following categories of personal data:</p>
          <div className="space-y-2 mt-4">
            <TableRow label="Account data" value="Your name and email address, collected when you register or sign in." />
            <TableRow label="Inventory & sale data" value="Item names, prices, conditions, storage locations, notes, and sale records you create. This data belongs to you." alt />
            <TableRow label="Billing data" value="Subscription status and a Stripe Customer ID. We never store your card number or CVV — payments are handled entirely by Stripe." />
            <TableRow label="Technical data" value="IP address, browser type, device type, pages visited, referrer URL, and access timestamps." alt />
            <TableRow label="Support communications" value="Records of any emails or messages you send us." />
          </div>
          <p className="mt-4 text-sm text-paper-faint">
            We do not collect any special-category personal data (health, ethnicity, biometrics, etc.).
          </p>
        </Section>

        <Section title="3. How we use your data">
          <p>We use your data only for the following purposes:</p>
          <ul className="list-none space-y-2 mt-2">
            {[
              "Provide, maintain, and improve the Sellganise service",
              "Process subscription payments and send billing confirmations",
              "Send essential service notifications (security alerts, planned maintenance)",
              "Respond to support requests and enquiries",
              "Detect and prevent fraud, abuse, or Terms of Service violations",
              "Generate anonymised, aggregated analytics to improve the product",
              "Comply with our legal and regulatory obligations",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1 w-4 h-4 rounded-full bg-moss/20 text-moss text-[10px] grid place-items-center shrink-0 font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 p-4 rounded-xl border border-rust/25 bg-rust/[0.05]">
            <p className="text-sm font-medium text-paper mb-1">What we never do</p>
            <p className="text-sm text-paper-dim">We do not sell your personal data to third parties. We do not use your inventory or sale data for advertising. We do not share your data with data brokers.</p>
          </div>
        </Section>

        <Section title="4. Legal basis for processing (UK GDPR)">
          <p>We rely on the following legal grounds under UK GDPR Article 6:</p>
          <div className="space-y-3 mt-3">
            {[
              { basis: "Contract (Art. 6(1)(b))", desc: "Processing necessary to provide the service — account management, storing your inventory, processing subscriptions." },
              { basis: "Legitimate interests (Art. 6(1)(f))", desc: "Operating and securing the platform, sending product update announcements, preventing fraud. We have carried out a balancing test and these interests do not override your rights." },
              { basis: "Legal obligation (Art. 6(1)(c))", desc: "Retaining billing records for HMRC tax purposes (6 years)." },
              { basis: "Consent (Art. 6(1)(a))", desc: "Optional marketing communications. You can withdraw consent at any time by clicking 'unsubscribe' or emailing us." },
            ].map((row) => (
              <div key={row.basis} className="p-4 rounded-xl bg-ink-card border border-line">
                <p className="text-sm font-medium text-amber font-mono mb-1">{row.basis}</p>
                <p className="text-sm text-paper-dim">{row.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="5. Data retention">
          <div className="space-y-2">
            <TableRow label="Account & inventory data" value="Retained while your account is active; deleted within 30 days of account closure on request." />
            <TableRow label="Billing records" value="6 years from the end of the relevant tax year, as required by HMRC." alt />
            <TableRow label="Support communications" value="2 years from last contact." />
            <TableRow label="Technical server logs" value="90 days, then automatically purged." alt />
          </div>
          <p className="mt-4 text-sm">
            You may request deletion of your account at any time via your account settings or by emailing{" "}
            <a href="mailto:privacy@sellganise.com" className="text-amber hover:underline">privacy@sellganise.com</a>.
            Billing records are retained for legal compliance and cannot be deleted early.
          </p>
        </Section>

        <Section title="6. Third-party processors">
          <p>We share data with the following processors, each bound by data processing agreements:</p>
          <div className="space-y-3 mt-3">
            {[
              { name: "Stripe, Inc.", role: "Payment processing", detail: "Processes subscription payments. Stripe is PCI-DSS Level 1 certified. Data may be transferred to the United States under Standard Contractual Clauses. Stripe's privacy policy: stripe.com/gb/privacy" },
              { name: "Vercel, Inc.", role: "Website hosting", detail: "Hosts the Sellganise web application. Vercel is GDPR-compliant and processes data within the EU/UK where possible." },
              { name: "Supabase, Inc.", role: "Database hosting", detail: "Stores your account, inventory, and sale data. Supabase is SOC 2 Type II certified." },
            ].map((p) => (
              <div key={p.name} className="p-4 rounded-xl bg-ink-card border border-line">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-paper">{p.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-line text-paper-faint">{p.role}</span>
                </div>
                <p className="text-sm text-paper-dim">{p.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">
            We do not share your personal data with any other third parties. We will disclose data to law enforcement or regulatory bodies only when legally required to do so.
          </p>
        </Section>

        <Section title="7. Your rights under UK GDPR">
          <p>You have the following rights, which you can exercise free of charge. We will respond within one calendar month.</p>
          <div className="space-y-2 mt-3">
            {[
              { right: "Right of access", desc: "Request a copy of all personal data we hold about you." },
              { right: "Right to rectification", desc: "Ask us to correct inaccurate or incomplete personal data." },
              { right: "Right to erasure", desc: "Request deletion of your personal data, subject to legal obligations (e.g. billing records)." },
              { right: "Right to restriction", desc: "Ask us to restrict processing of your data in certain circumstances." },
              { right: "Right to data portability", desc: "Receive your data in a structured, machine-readable format (JSON or CSV)." },
              { right: "Right to object", desc: "Object to processing based on legitimate interests, or to direct marketing at any time." },
              { right: "Right to withdraw consent", desc: "Where processing is based on consent, withdraw it at any time without affecting the lawfulness of prior processing." },
            ].map((r, i) => (
              <TableRow key={r.right} label={r.right} value={r.desc} alt={i % 2 !== 0} />
            ))}
          </div>
          <p className="mt-4">
            To exercise any right, email{" "}
            <a href="mailto:privacy@sellganise.com" className="text-amber hover:underline">privacy@sellganise.com</a>{" "}
            with "Data Rights Request" in the subject line. We may ask you to verify your identity before proceeding.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>We use only essential cookies required to operate the service. We do not use advertising or tracking cookies, and we do not share cookie data with third parties for marketing.</p>
          <div className="space-y-2 mt-3">
            <TableRow label="session / auth-token" value="Authentication — keeps you signed in. Duration: session." />
            <TableRow label="sb-* (Supabase)" value="Authentication state. Duration: up to 1 year." alt />
            <TableRow label="stripe-mid" value="Stripe fraud prevention. Duration: 1 year." />
          </div>
        </Section>

        <Section title="9. Security">
          <p>We implement appropriate technical and organisational measures including:</p>
          <ul className="list-none space-y-2 mt-2">
            {[
              "HTTPS/TLS encryption for all data in transit",
              "Encrypted database storage at rest",
              "Role-based access controls — only essential personnel can access production data",
              "Regular security dependency updates and vulnerability reviews",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            In the unlikely event of a data breach that poses a risk to your rights and freedoms, we will notify you and the ICO within 72 hours as required by UK GDPR Article 33.
          </p>
        </Section>

        <Section title="10. Children's privacy">
          <p>
            Sellganise is intended for adults aged 18 and over. We do not knowingly collect personal data from anyone under 13. If you believe we have inadvertently collected data from a child, contact us at{" "}
            <a href="mailto:privacy@sellganise.com" className="text-amber hover:underline">privacy@sellganise.com</a>{" "}
            and we will delete it promptly.
          </p>
        </Section>

        <Section title="11. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify registered users of any material changes by email at least 14 days before they take effect. The "Last updated" date at the top of this page always reflects the most recent revision. Minor changes (e.g. clarifications) may be made without notice.
          </p>
        </Section>

        <Section title="12. How to complain">
          <p>
            If you are unhappy with how we handle your personal data, please contact us first at{" "}
            <a href="mailto:privacy@sellganise.com" className="text-amber hover:underline">privacy@sellganise.com</a>{" "}
            and we will do our best to resolve the issue.
          </p>
          <p>
            You also have the right to lodge a complaint with the UK's data protection supervisory authority:
          </p>
          <div className="mt-4 p-5 rounded-xl bg-ink-card border border-line text-sm space-y-1">
            <p className="font-medium text-paper">Information Commissioner's Office (ICO)</p>
            <p className="text-paper-dim">Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF</p>
            <p className="text-paper-dim">Telephone: 0303 123 1113</p>
            <a href="https://ico.org.uk" className="text-amber hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a>
          </div>
        </Section>

        <div className="mt-12 pt-8 border-t border-line flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-sm text-paper-faint">
          <p>© {new Date().getFullYear()} Sellganise. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-paper transition-colors">Terms of Service</Link>
            <a href="mailto:privacy@sellganise.com" className="hover:text-paper transition-colors">privacy@sellganise.com</a>
          </div>
        </div>
      </main>
    </div>
  );
}
