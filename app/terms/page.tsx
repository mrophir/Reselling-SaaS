import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Sellganise terms of service — read our terms before using the platform.",
  alternates: { canonical: "https://sellganise.com/terms" },
  robots: { index: true, follow: false },
};

function LegalNav() {
  return (
    <header className="border-b border-line px-6 h-16 flex items-center justify-between sticky top-0 bg-ink/90 backdrop-blur-md z-50">
      <Link href="/" className="flex items-center gap-2.5 group">
        <span className="font-display text-[17px] font-medium tracking-tight">Sellganise</span>
      </Link>
      <div className="flex items-center gap-5 text-sm text-paper-faint">
        <Link href="/privacy" className="hover:text-paper transition-colors">Privacy Policy</Link>
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

export default function TermsPage() {
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
          <h1 className="font-display text-4xl font-medium tracking-tight mb-3">Terms of Service</h1>
          <p className="text-paper-faint text-sm">Last updated: 4 July 2026</p>
          <p className="mt-4 text-paper-dim leading-relaxed">
            Please read these Terms of Service carefully before using Sellganise. By creating an account or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>
          <div className="mt-5 p-4 rounded-xl bg-amber/[0.06] border border-amber/25 text-sm text-paper-dim">
            <span className="text-amber font-medium">Quick summary (not a substitute for reading the full terms):</span> Sellganise is a paid inventory tool for resellers. You own your data. We own the software. Pay on time, use it lawfully, and we'll keep the service running. Cancel anytime.
          </div>
        </div>

        <Section title="1. Agreement to these Terms">
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("you", "user") and <strong className="text-paper">Sellganise</strong> ("Sellganise", "we", "us"), a company registered in England and Wales, governing your access to and use of the Sellganise web application and related services (collectively, "the Service").
          </p>
          <p>
            By registering for an account, accessing, or using the Service, you confirm that you have read, understood, and agree to these Terms and our{" "}
            <Link href="/privacy" className="text-amber hover:underline">Privacy Policy</Link>, which is incorporated by reference.
          </p>
        </Section>

        <Section title="2. Description of the Service">
          <p>
            Sellganise is a web-based inventory management and profit-tracking application designed for resellers. It allows you to log stock items, track their status through a sales pipeline, manage physical storage locations, record sales, and analyse your financial performance across platforms such as Vinted, eBay, Depop, and Facebook Marketplace.
          </p>
          <p>
            We may add, modify, or discontinue features of the Service at any time. We will provide reasonable notice of material changes where practicable. The Service is not intended as a substitute for professional accounting, tax, or financial advice.
          </p>
        </Section>

        <Section title="3. Eligibility">
          <p>
            To use the Service you must:
          </p>
          <ul className="list-none space-y-2 mt-2">
            {[
              "Be at least 18 years old",
              "Have the legal capacity to enter into a binding contract in your jurisdiction",
              "Not be prohibited from receiving the Service under the laws of any applicable jurisdiction",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-moss/20 text-moss text-[10px] grid place-items-center shrink-0 font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            If you are accessing the Service on behalf of a business, you represent that you have authority to bind that business to these Terms.
          </p>
        </Section>

        <Section title="4. Account registration">
          <p>You must create an account to use the Service. By registering, you agree to:</p>
          <ul className="list-none space-y-2 mt-2">
            {[
              "Provide accurate, current, and complete registration information",
              "Maintain and promptly update your account information",
              "Keep your password confidential and not share it with any third party",
              "Notify us immediately at sellganise@gmail.com of any suspected unauthorised access",
              "Accept responsibility for all activity that occurs under your account",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            You may not create more than one free account, transfer your account to another person, or sublicense access to any third party without our written permission.
          </p>
        </Section>

        <Section title="5. Subscription plans and billing">
          <div className="space-y-5">
            <div className="p-5 rounded-xl bg-ink-card border border-line">
              <p className="text-sm font-medium text-paper mb-2">Free Plan</p>
              <p className="text-sm text-paper-dim">Access to core features up to the item limit stated on our pricing page. No payment required. Item limits may change with 30 days' notice.</p>
            </div>
            <div className="p-5 rounded-xl bg-ink-card border border-amber/30">
              <p className="text-sm font-medium text-amber mb-2">Pro Plan — £19.99 / month</p>
              <p className="text-sm text-paper-dim">Full access to all features with no item cap. All prices are inclusive of VAT where applicable. Billed monthly in advance via Stripe.</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-paper mb-1">Automatic renewal</p>
              <p className="text-sm">Subscriptions renew automatically each month. By subscribing, you authorise us to charge your payment method on a recurring monthly basis until you cancel.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-paper mb-1">Cancellation</p>
              <p className="text-sm">You may cancel at any time via your account settings. Cancellation takes effect at the end of the current billing period. We do not provide pro-rata refunds for partial months of use, except as required by law.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-paper mb-1">Failed payments</p>
              <p className="text-sm">If a payment fails, we will notify you and retry. If payment remains outstanding after 7 days, your account may be downgraded to the free tier until payment is resolved. Outstanding amounts remain due.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-paper mb-1">Price changes</p>
              <p className="text-sm">We may change subscription prices with at least 30 days' written notice. Continuing to use the Service after the effective date constitutes acceptance of the new pricing.</p>
            </div>
          </div>
        </Section>

        <Section title="6. Acceptable use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-none space-y-2 mt-3">
            {[
              "Violate any applicable law or regulation",
              "Upload or transmit fraudulent, defamatory, or infringing content",
              "Attempt to gain unauthorised access to any part of the Service, its infrastructure, or other users' accounts",
              "Interfere with or disrupt the integrity, performance, or security of the Service",
              "Scrape, crawl, or extract data from the Service by automated means without our prior written consent",
              "Introduce malicious code, viruses, or harmful components",
              "Resell, sublicense, or otherwise commercialise the Service without our prior written permission",
              "Impersonate another person or entity, or misrepresent your affiliation",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <span className="text-rust shrink-0 mt-0.5">✕</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4">
            We reserve the right to suspend or terminate access to any account that breaches these provisions, with or without notice depending on the severity of the breach.
          </p>
        </Section>

        <Section title="7. Your data">
          <p>
            <strong className="text-paper">You retain full ownership of all data you input into the Service</strong> — your inventory records, sale records, notes, and any other content you create. We claim no ownership rights over your data.
          </p>
          <p>
            You grant Sellganise a limited, non-exclusive, royalty-free licence to host, store, process, and display your data solely to the extent necessary to provide and operate the Service. This licence ends when you delete your data or close your account.
          </p>
          <p>
            On account termination (by either party), you may request a full export of your data within 30 days of termination. We will provide it in CSV or JSON format. After 30 days, your data will be deleted in accordance with our Privacy Policy, except where legal retention obligations apply.
          </p>
          <p>
            You are responsible for ensuring your use of the Service complies with all applicable data protection laws regarding any personal data of third parties you may enter.
          </p>
        </Section>

        <Section title="8. Intellectual property">
          <p>
            All software, design, trademarks, trade names, logos, and content that form part of the Sellganise Service (excluding your data) are owned by or licensed to Sellganise and are protected by intellectual property laws.
          </p>
          <p>You may not:</p>
          <ul className="list-none space-y-2 mt-2">
            {[
              "Copy, modify, distribute, or create derivative works from the Service or its content",
              "Reverse engineer, decompile, or disassemble any part of the Service",
              "Remove or obscure any proprietary notices or labels",
              "Use our trade names or trademarks without written permission",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <span className="text-rust shrink-0 mt-0.5">✕</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Any feedback, suggestions, or ideas you provide about the Service may be used by us without restriction or compensation.
          </p>
        </Section>

        <Section title="9. Service availability">
          <p>
            We aim to provide a reliable service but do not guarantee uninterrupted, error-free, or secure operation. Planned maintenance will be communicated in advance where reasonably practicable.
          </p>
          <p>
            We are not liable for losses caused by service downtime, data unavailability, or interruptions caused by factors outside our reasonable control (including internet outages, third-party service failures, or acts of God).
          </p>
        </Section>

        <Section title="10. Disclaimer of warranties">
          <p>
            To the maximum extent permitted by applicable law, the Service is provided on an <strong className="text-paper">"as is" and "as available"</strong> basis without any warranties of any kind, whether express or implied, including (without limitation) implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p>
            We do not warrant that the Service will meet your specific requirements, that results obtained from using the Service will be accurate or reliable, or that any errors will be corrected.
          </p>
          <p>
            Financial figures (profit calculations, fee estimates) generated by the Service are indicative only. You should verify all figures with a qualified accountant or financial adviser before making business decisions or submitting tax returns.
          </p>
        </Section>

        <Section title="11. Limitation of liability">
          <div className="p-4 rounded-xl bg-amber/[0.05] border border-amber/20 text-sm mb-4">
            <p className="text-amber font-medium mb-1">Important — please read carefully</p>
            <p className="text-paper-dim">Nothing in these Terms excludes or limits our liability for fraud, death or personal injury caused by negligence, or any other liability that cannot lawfully be excluded or limited under English law, including your rights under the Consumer Rights Act 2015.</p>
          </div>
          <p>Subject to the above, to the maximum extent permitted by law:</p>
          <ul className="list-none space-y-2 mt-3">
            {[
              "Our total aggregate liability to you arising out of or in connection with the Service in any 12-month period shall not exceed the greater of: (a) the total fees you paid to us in the three months preceding the claim, or (b) £100.",
              "We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, revenue, data, business opportunity, or goodwill, even if we have been advised of the possibility of such damages.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="12. Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless Sellganise and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in connection with:
          </p>
          <ul className="list-none space-y-1.5 mt-3">
            {[
              "Your use of or access to the Service",
              "Your breach of these Terms",
              "Your violation of any third-party rights, including intellectual property or privacy rights",
              "Any content you submit, post, or transmit through the Service",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="13. Termination">
          <p>
            <strong className="text-paper">By you:</strong> You may close your account at any time via account settings or by emailing{" "}
            <a href="mailto:sellganise@gmail.com" className="text-amber hover:underline">sellganise@gmail.com</a>.
            Closing your account cancels any active subscription at the end of the current billing period.
          </p>
          <p>
            <strong className="text-paper">By us:</strong> We may suspend or terminate your account immediately and without notice if you materially breach these Terms. We may terminate or suspend the Service generally with 30 days' written notice for any other reason.
          </p>
          <p>
            On termination, your right to access and use the Service ends immediately. Provisions of these Terms that by their nature should survive termination (including Sections 7, 8, 10, 11, 12, 14, and 15) will continue to apply.
          </p>
        </Section>

        <Section title="14. Governing law and dispute resolution">
          <p>
            These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes) shall be governed by and construed in accordance with the laws of <strong className="text-paper">England and Wales</strong>.
          </p>
          <p>
            The courts of England and Wales shall have exclusive jurisdiction to settle any dispute arising out of or in connection with these Terms, subject to any mandatory consumer protection rights you may have in your country of residence.
          </p>
          <p>
            Before commencing legal proceedings, we encourage you to contact us at{" "}
            <a href="mailto:sellganise@gmail.com" className="text-amber hover:underline">sellganise@gmail.com</a>{" "}
            to attempt to resolve the dispute informally.
          </p>
        </Section>

        <Section title="15. Consumer rights (UK)">
          <p>
            If you are a consumer resident in the UK, nothing in these Terms affects your statutory rights. In particular:
          </p>
          <ul className="list-none space-y-2 mt-3">
            {[
              "Consumer Rights Act 2015 — services must be provided with reasonable care and skill, within a reasonable time, and at a reasonable price where no price is agreed.",
              "Consumer Protection from Unfair Trading Regulations 2008 — we will not engage in misleading or aggressive commercial practices.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-moss/20 text-moss text-[10px] grid place-items-center shrink-0 font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="16. Changes to these Terms">
          <p>
            We may revise these Terms at any time. For material changes, we will notify registered users by email at least <strong className="text-paper">14 days before</strong> the changes take effect. The "Last updated" date at the top of this page reflects the most recent revision.
          </p>
          <p>
            Continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the Service before the effective date.
          </p>
        </Section>

        <Section title="17. General">
          <p><strong className="text-paper">Entire agreement.</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Sellganise regarding the Service and supersede all prior agreements.</p>
          <p><strong className="text-paper">Severability.</strong> If any provision of these Terms is found to be unenforceable, that provision will be modified to the minimum extent necessary to make it enforceable, and the remaining provisions will continue in full force.</p>
          <p><strong className="text-paper">Waiver.</strong> Our failure to enforce any provision of these Terms does not constitute a waiver of our right to enforce that provision in the future.</p>
          <p><strong className="text-paper">Assignment.</strong> You may not assign or transfer these Terms or any rights hereunder without our prior written consent. We may assign these Terms in connection with a merger, acquisition, or sale of all or substantially all of our assets.</p>
        </Section>

        <Section title="18. Contact">
          <p>For questions about these Terms:</p>
          <div className="mt-3 p-5 rounded-xl bg-ink-card border border-line text-sm space-y-2">
            <p><span className="text-paper-faint w-20 inline-block">Email</span><a href="mailto:sellganise@gmail.com" className="text-amber hover:underline">sellganise@gmail.com</a></p>
            <p><span className="text-paper-faint w-20 inline-block">Support</span><a href="mailto:sellganise@gmail.com" className="text-amber hover:underline">sellganise@gmail.com</a></p>
            <p><span className="text-paper-faint w-20 inline-block">Privacy</span><a href="mailto:sellganise@gmail.com" className="text-amber hover:underline">sellganise@gmail.com</a></p>
          </div>
        </Section>

        <div className="mt-12 pt-8 border-t border-line flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-sm text-paper-faint">
          <p>© {new Date().getFullYear()} Sellganise. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-paper transition-colors">Privacy Policy</Link>
            <a href="mailto:sellganise@gmail.com" className="hover:text-paper transition-colors">sellganise@gmail.com</a>
          </div>
        </div>
      </main>
    </div>
  );
}
