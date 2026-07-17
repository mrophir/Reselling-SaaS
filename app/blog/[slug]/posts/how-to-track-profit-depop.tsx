export function HowToTrackProfitDepop() {
  return (
    <article className="space-y-6 text-[16px] leading-relaxed text-paper-dim">

      <p>
        Most Depop sellers dramatically overestimate what they make. They see £30 land in their account and think they&apos;ve made £30 profit. They haven&apos;t. By the time you account for Depop&apos;s fee, payment processing, postage, and what they paid for the item in the first place, that £30 sale might be £8 of actual profit — or less.
      </p>

      <p>
        Tracking your real Depop profit isn&apos;t complicated once you have the right system. This guide walks through exactly how to do it — what fees to account for, what most sellers miss, and how to know your actual margin on every sale.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">What Depop actually charges you</h2>

      <p>
        Depop&apos;s fee structure has changed several times, so always verify the current rates on their seller help pages. As of 2026, UK sellers pay a platform selling fee on each transaction. On top of that, payment processing fees apply — these cover the cost of handling the transaction through the payment provider.
      </p>

      <p>
        The key point most sellers miss: fees are calculated on the <strong className="text-paper font-medium">total the buyer pays</strong>, which includes shipping if the buyer pays for it. This means your fee bill is higher than if it were calculated on the item price alone.
      </p>

      <div className="space-y-3 my-6">
        {[
          { label: "Platform selling fee", detail: "Charged as a percentage of the total sale (item + buyer shipping). Check Depop's current rates — they update periodically." },
          { label: "Payment processing fee", detail: "A small percentage plus a fixed amount per transaction. Applies to every sale." },
          { label: "Postage cost", detail: "If you offer free shipping or subsidise it, this comes directly out of your margin." },
          { label: "Item cost", detail: "What you paid for the item. Often underweighted in informal calculations." },
        ].map(({ label, detail }) => (
          <div key={label} className="flex gap-4 p-4 rounded-xl bg-ink-card border border-line">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
            <div>
              <p className="font-medium text-paper text-sm mb-1">{label}</p>
              <p className="text-sm text-paper-dim">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">The real profit formula</h2>

      <p>
        Here&apos;s the formula every Depop seller should be using:
      </p>

      <div className="my-6 p-5 rounded-xl bg-ink-card border border-amber/20 font-mono text-sm">
        <p className="text-paper mb-2">Profit = Sale price</p>
        <p className="text-paper-dim ml-4">− Depop platform fee</p>
        <p className="text-paper-dim ml-4">− Payment processing fee</p>
        <p className="text-paper-dim ml-4">− Postage cost</p>
        <p className="text-paper-dim ml-4">− Item purchase cost</p>
        <p className="text-paper-dim ml-4">− Packaging cost</p>
        <p className="text-amber mt-3">= Your actual profit</p>
      </div>

      <p>
        Run the numbers on your last 10 sales using this formula. For most sellers, the result is eye-opening — not necessarily because they&apos;re losing money, but because the margins are much tighter than the headline sale price suggests.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">A worked example</h2>

      <p>
        Say you sell a jacket on Depop for £45 and the buyer pays £3.99 shipping — total transaction £48.99.
      </p>

      <ul className="list-none space-y-2 pl-0">
        {[
          "Sale price received: £45.00",
          "Depop platform fee (~10% of £48.99): −£4.90",
          "Payment processing (~2.9% + fixed): −£1.72",
          "Royal Mail postage (you paid): −£3.99",
          "Item purchase cost: −£12.00",
          "Packaging (bag + tape): −£0.40",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <p className="font-medium text-paper">
        Actual profit: £21.99 — not £45, and not even close to £33 (sale minus item cost). Your margin here is around 49%.
      </p>

      <p>
        That&apos;s a decent result on this item. But run the same exercise on a £12 item you bought for £4, and the picture looks very different once fees and postage eat into it.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">What most Depop sellers get wrong</h2>

      <p>
        The most common mistakes when calculating Depop profit:
      </p>

      <div className="space-y-4 my-4">
        {[
          {
            n: "1",
            t: "Forgetting payment processing fees",
            b: "These are separate from Depop's platform fee and get missed constantly. They're not huge on each sale but add up significantly across dozens of transactions.",
          },
          {
            n: "2",
            t: "Not tracking postage accurately",
            b: "Sellers often absorb part of the postage cost (especially when offering 'free shipping' or undercharging). This is a direct hit to margin that many don't record.",
          },
          {
            n: "3",
            t: "Ignoring packaging costs",
            b: "Bubble mailers, poly bags, tissue paper, tape — small per unit but it adds up to a real number across a month of selling.",
          },
          {
            n: "4",
            t: "Only tracking revenue, not cost",
            b: "Some sellers track total Depop income without logging what they paid for each item. This makes it impossible to know actual profit — only turnover.",
          },
          {
            n: "5",
            t: "Not tracking per item",
            b: "Looking at total monthly profit is useful, but you also need item-level data to know which categories are worth sourcing and which are wasting your time.",
          },
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

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Why spreadsheets don&apos;t cut it long-term</h2>

      <p>
        A spreadsheet can technically track all of the above, and many sellers start there. The problem is friction. Every sale means opening the spreadsheet, finding the right row, entering the sale price, looking up the fee calculation, and updating the item status. Most sellers stop doing this consistently after a few weeks.
      </p>

      <p>
        The other issue: spreadsheets are static. They show you what you enter, but they don&apos;t tell you which items have been sitting unsold for 30 days, or surface patterns in what sells and what doesn&apos;t.
      </p>

      <p>
        Once you&apos;re selling more than 20–30 items regularly, the spreadsheet becomes a chore rather than a tool.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Using dedicated reseller software to track Depop profit</h2>

      <p>
        Purpose-built reseller stock management software handles the friction that kills spreadsheet habits. When you record a sale, the profit calculation happens automatically — fees, postage costs, and item cost are all factored in based on what you logged when you added the item.
      </p>

      <p>
        <a href="https://sellganise.com" className="text-amber hover:underline">Sellganise</a> is built specifically for UK resellers selling across Depop, Vinted, eBay, and Facebook Marketplace. The profit calculator uses current UK platform fee rates, so you get accurate margin figures without manual calculation. You can track every item from purchase through to sold, see your monthly profit totals, and export the data when you need it for tax records.
      </p>

      <p>
        The key advantage isn&apos;t just the maths — it&apos;s that the data stays live. You can see at any point exactly what your profit is for the month, which items are still unlisted, and which have been sitting too long.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">How to start tracking properly today</h2>

      <p>
        If you&apos;re starting from scratch, here&apos;s the minimum you need to track on every Depop sale:
      </p>

      <ul className="list-none space-y-2 pl-0">
        {[
          "Item description",
          "What you paid for it (including any sourcing trip costs if applicable)",
          "Sale price",
          "Depop platform fee (from your seller account)",
          "Payment processing fee",
          "Postage cost you actually paid",
          "Net profit (sale price minus all of the above)",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <p>
        Do this for every sale for a month and you&apos;ll have a very clear picture of what your Depop selling is actually worth — and which items or categories are driving most of your profit.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">The bottom line</h2>

      <p>
        Tracking Depop profit properly isn&apos;t optional if you want to grow your reselling business — it&apos;s the foundation everything else is built on. Knowing your real margins tells you what to source, what to price, and whether your operation is actually scaling.
      </p>

      <p>
        The sellers who build consistent income on Depop are almost always the ones who know their numbers. The ones who burn out are usually the ones who were busier than they were profitable, without realising it until too late.
      </p>

      <p>
        Start tracking every sale this week. Use a spreadsheet if that&apos;s where you are — but commit to it. Or use <a href="https://sellganise.com" className="text-amber hover:underline">Sellganise</a> to make the whole process automatic. Either way, knowing your numbers is what separates a hobby from a business.
      </p>

    </article>
  );
}
