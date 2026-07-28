export function HowToStartResellingOnVinted() {
  return (
    <article className="space-y-6 text-[16px] leading-relaxed text-paper-dim">

      <p>
        Vinted has quietly become one of the best places to make money reselling in the UK. No selling fees, a massive built-in buyer base, and a checkout experience that handles everything for you. But most people who try it either quit early or plateau because they&apos;re running it like a hobby instead of a business.
      </p>

      <p>
        This guide covers how to actually start reselling on Vinted — from sourcing your first items to tracking profit and scaling with the right tools — so you can treat it like the income stream it genuinely can be.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Why Vinted reselling works in 2026</h2>

      <p>
        Vinted removed seller fees entirely, which changed the maths compared to eBay or Depop. On those platforms, 10–15% disappears before you even think about postage. On Vinted, you keep everything the buyer pays you above the listed price.
      </p>

      <p>
        That single difference makes thin-margin items viable that simply wouldn&apos;t work elsewhere. A £6 item that costs £2 to post gives you a £4 return. On Depop, fees eat £1–2 of that before postage. On Vinted, it&apos;s yours.
      </p>

      <p>
        The buyers are there too. Vinted passed 30 million users in the UK — second-hand shopping has completely normalised, and the Vinted audience actively searches for deals rather than just browsing. That means if your listing is right, it gets found.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">What to resell on Vinted</h2>

      <p>
        Clothing dominates Vinted, but not all categories perform equally. The items that move fastest tend to be:
      </p>

      <ul className="list-none space-y-2 pl-0">
        {[
          "Branded basics — Nike, Adidas, Ralph Lauren, Tommy Hilfiger",
          "Women's going-out tops and dresses in current styles",
          "Men's hoodies and joggers, especially in neutral colours",
          "Kids' clothing in good condition (sells extremely fast)",
          "Vintage and Y2K pieces with clear labels",
          "Designer accessories — belts, bags, sunglasses",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <p>
        The mistake most beginners make is buying whatever looks cheap, rather than buying what actually sells. Before you source anything, spend 20 minutes searching completed listings on Vinted. If recent sold listings exist at a price that gives you margin, it&apos;s a viable item.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Where to source stock for Vinted reselling</h2>

      <p>
        Your sourcing strategy determines your margins more than anything else. The best Vinted resellers spread their sourcing across multiple channels so they&apos;re not competing with every other reseller in the same charity shop on a Saturday morning.
      </p>

      <div className="space-y-3 my-4">
        {[
          { n: "1", t: "Charity shops", b: "Best for branded clothing, especially if you go mid-week when stock hasn't been picked over. Train yourself to spot labels quickly — you're looking for Nike, Adidas, Stone Island, Barbour, The North Face in good condition." },
          { n: "2", t: "Car boot sales and markets", b: "Early entry fees are worth it. Sellers often undervalue branded items because they just want gone. Bring cash and be decisive." },
          { n: "3", t: "Facebook Marketplace and Gumtree", b: "Job lots and house clearances can yield huge margins. Search 'bundle', 'joblot', and 'clearance' regularly and move fast on good listings." },
          { n: "4", t: "Vinted itself", b: "Buy underpriced items on Vinted and relist at correct market value. This works especially well for items with poor photos or vague descriptions." },
          { n: "5", t: "Retail clearance", b: "End-of-season sales at TK Maxx, Sports Direct and department stores can produce brand-new items that sell for multiples on Vinted." },
        ].map((step) => (
          <div key={step.n} className="flex gap-4 p-4 rounded-xl bg-ink-card border border-line">
            <span className="font-mono text-amber text-sm shrink-0 mt-0.5">{step.n}.</span>
            <div>
              <p className="font-medium text-paper text-sm mb-1">{step.t}</p>
              <p className="text-sm text-paper-dim">{step.b}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">How to write Vinted listings that rank and convert</h2>

      <p>
        Vinted&apos;s search algorithm works similarly to Google — it matches buyer searches to seller listings based on keywords in your title and description. Most sellers write lazy titles. That&apos;s your competitive advantage.
      </p>

      <p>
        A strong Vinted listing title includes: brand, item type, colour, size, and a style descriptor if relevant. Instead of <em>"Nike hoodie"</em>, write <em>"Nike Tech Fleece Hoodie Grey Men&apos;s Medium"</em>. Buyers searching &ldquo;nike tech fleece hoodie grey&rdquo; will find yours. They won&apos;t find the generic listing.
      </p>

      <p>
        For the description, include:
      </p>

      <ul className="list-none space-y-2 pl-0">
        {[
          "Exact condition with specific detail (\"tiny mark on inner hem, not visible when worn\")",
          "Measurements where relevant — buyers trust sellers who provide these",
          "The label size AND how it fits (\"labelled L, fits more like M\")",
          "Repeat keywords naturally — brand, item type, colour",
          "Postage turnaround time if you ship quickly",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <p>
        Photos matter more than anything else. Natural light, clean background, flat lay or on a hanger. Show the label, show any flaws. Buyers don&apos;t open returns because an item was as described — they open them when it wasn&apos;t. Good photos protect you and convert better.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Pricing your items correctly</h2>

      <p>
        Pricing is where most beginners either leave money on the table or price themselves out of sales entirely. The right approach is to research completed sales, not just current listings.
      </p>

      <p>
        Current listings tell you what people are asking. Completed sales tell you what people actually paid. Search for your item, filter to &ldquo;sold&rdquo; listings, and look at the last 3–5 comparable sales. Price in that range, slightly below if you want a faster sale.
      </p>

      <p>
        Account for your costs before you list. Every item should pass a simple profit check:
      </p>

      <ul className="list-none space-y-2 pl-0">
        {[
          "Sale price (what you'll receive)",
          "Minus sourcing cost (what you paid)",
          "Minus packaging (bags, boxes, labels)",
          "Minus postage (if you're covering it)",
          "= Actual profit",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <p>
        If that number is under £3–4 for a standard item, the margin is probably too thin once you factor in your time. Reselling software like <a href="https://sellganise.com" className="text-amber hover:underline">Sellganise</a> tracks this automatically for every item — so you always know your real profit rather than guessing.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Managing your Vinted inventory as you scale</h2>

      <p>
        The biggest operational problem for growing Vinted resellers isn&apos;t sourcing or selling — it&apos;s managing stock. Once you have 50+ items, things start to break down. You&apos;ve got unlisted items sitting in bags, items you can&apos;t find when they sell, and no clear picture of what your inventory is actually worth.
      </p>

      <p>
        The resellers who scale past a few hundred items have all solved this the same way: a dedicated inventory system with a location for every item. Every piece of stock gets logged with:
      </p>

      <ul className="list-none space-y-2 pl-0">
        {[
          "Item name and description",
          "What you paid (cost price)",
          "Physical storage location (Box A, Shelf 2, etc.)",
          "Current status — unlisted, listed, sold, dispatched",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <p>
        Spreadsheets work until they don&apos;t. They won&apos;t alert you to items that have been sitting unlisted for a month, won&apos;t calculate your margins automatically, and don&apos;t give you a dashboard view of how your business is performing.
      </p>

      <p>
        Purpose-built reselling software like <a href="https://sellganise.com" className="text-amber hover:underline">Sellganise</a> is designed specifically for UK resellers. It tracks your inventory, logs profit on every sale, and shows you which items need attention — so nothing falls through the cracks. It&apos;s free to start with up to 50 items.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Vinted reselling tips that most guides miss</h2>

      <p>
        Beyond the basics, a few less-obvious things make a real difference:
      </p>

      <div className="space-y-3 my-4">
        {[
          { n: "→", t: "Bundle listings increase average order value", b: "Vinted has a bundles feature — promote it in your listings and offer a discount when buyers take multiple items. It saves you on packaging and postage per item." },
          { n: "→", t: "Refresh stale listings", b: "If an item hasn't sold in 3–4 weeks, take it down and relist it. Fresh listings get pushed in search. Also try tweaking the title keywords or dropping the price by 10%." },
          { n: "→", t: "Follow and be followed", b: "Vinted notifies your followers when you add new items. Growing your follower count is free marketing — follow active buyers, share your items, and respond to questions quickly." },
          { n: "→", t: "Track your best and worst categories", b: "After 3 months, look at your data. Which item types sell fastest? Which sit for weeks? Double down on what works and stop buying what doesn't." },
          { n: "→", t: "Dispatch same-day or next-day", b: "Seller ratings matter on Vinted. Fast dispatch earns positive reviews, which builds trust and improves your search visibility." },
        ].map((tip) => (
          <div key={tip.n} className="flex gap-4 p-4 rounded-xl bg-ink-card border border-line">
            <span className="font-mono text-amber text-sm shrink-0 mt-0.5">{tip.n}</span>
            <div>
              <p className="font-medium text-paper text-sm mb-1">{tip.t}</p>
              <p className="text-sm text-paper-dim">{tip.b}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Is Vinted reselling worth it in 2026?</h2>

      <p>
        Yes — but only if you run it properly. The sellers who make £500–2,000+ per month on Vinted aren&apos;t doing anything magical. They&apos;ve built consistent sourcing habits, they write good listings, they track their numbers, and they use the right tools to stay organised.
      </p>

      <p>
        The ceiling on Vinted reselling is genuinely high for a side income. It doesn&apos;t require upfront investment beyond your first sourcing run, it can be done entirely around a full-time job, and there&apos;s no limit on how many items you can list.
      </p>

      <p>
        The difference between resellers who grow and those who plateau almost always comes down to organisation and data. You need to know what you own, what it cost you, and what you&apos;re actually making. Without that, you&apos;re flying blind.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">The right reselling software makes the difference</h2>

      <p>
        Most UK Vinted resellers start with a notes app or a spreadsheet. That&apos;s fine for your first 20 items. After that, the cracks start to show — lost items, forgotten listings, no idea of actual profit.
      </p>

      <p>
        <a href="https://sellganise.com" className="text-amber hover:underline">Sellganise</a> is reselling inventory software built specifically for UK resellers on Vinted, Depop, eBay, and beyond. It gives you a single place to log stock, track profit per item, and see exactly where your business stands — without the hassle of maintaining a spreadsheet manually.
      </p>

      <p>
        If you&apos;re serious about growing your Vinted reselling income in 2026, getting organised is the single most valuable thing you can do. Start free with up to 50 items and see the difference a proper system makes.
      </p>

    </article>
  );
}
