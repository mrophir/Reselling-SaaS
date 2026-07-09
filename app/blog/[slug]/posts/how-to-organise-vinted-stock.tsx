export function HowToOrganiseVintedStock() {
  return (
    <article className="space-y-6 text-[16px] leading-relaxed text-paper-dim">

      <p>
        If you&apos;re selling on Vinted with more than a handful of items, you&apos;ve probably hit the wall. You know the one — a sale comes in, you spend 20 minutes hunting through bags and boxes, and by the time you find it you&apos;re wondering if reselling is actually worth it.
      </p>

      <p>
        The problem isn&apos;t you. It&apos;s the lack of a proper system. Most Vinted sellers start with a spreadsheet or just their memory, and both break down fast once you cross 30-40 items.
      </p>

      <p>
        This guide covers exactly how to organise your Vinted stock — from physical storage to digital tracking — so you can find anything in under 60 seconds and always know what you&apos;ve got.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Why Vinted stock management matters</h2>

      <p>
        Most resellers underestimate how much disorganisation costs them. It&apos;s not just the time spent searching — it&apos;s the items you forget about entirely. They sit in a box for three months, paid for, earning nothing, while you&apos;re out sourcing more.
      </p>

      <p>
        Good reseller stock management means you can:
      </p>

      <ul className="list-none space-y-2 pl-0">
        {[
          "See everything you own at a glance",
          "Know exactly which items aren't listed yet",
          "Find any item in under a minute when it sells",
          "Know your actual profit, not a rough guess",
          "Spot dead stock before it becomes a problem",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Step 1 — Set up physical storage locations</h2>

      <p>
        Before you track anything digitally, you need your physical space sorted. The goal is simple: every item lives in one specific, named place.
      </p>

      <p>
        The easiest system for most Vinted sellers is labelled boxes or bags. Give each one a short code — A1, B2, Shelf 1 — and stick to it. When something sells, you go directly to that location. No hunting.
      </p>

      <p>
        A few things that work well in practice:
      </p>

      <ul className="list-none space-y-2 pl-0">
        {[
          "Clear lidded boxes labelled on the front and top",
          "IKEA KALLAX units with each cube as a named zone",
          "Zip-lock bags inside boxes for small items",
          "A dedicated sold shelf for items packed and ready to post",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <p>
        The specifics don&apos;t matter as much as the consistency. Pick a system and stick to it.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Step 2 — Track every item digitally</h2>

      <p>
        Physical organisation only solves half the problem. The other half is knowing what&apos;s in each location without having to look. That&apos;s where digital tracking comes in.
      </p>

      <p>
        When you add a new item to your Vinted stock, you want to record:
      </p>

      <ul className="list-none space-y-2 pl-0">
        {[
          "Item name and description",
          "What you paid for it",
          "Its condition",
          "Which storage location it's in",
          "Whether it's listed on Vinted yet",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <p>
        Spreadsheets can do this but they have a critical flaw: they&apos;re passive. They store what you type and do nothing else. They won&apos;t tell you which items have been sitting unlisted for three weeks, or flag stock that&apos;s been with you too long.
      </p>

      <p>
        Purpose-built reseller inventory software like <a href="https://sellganise.com" className="text-amber hover:underline">Sellganise</a> tracks all of this and actively surfaces the items you need to act on — without you having to dig through rows looking for them.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Step 3 — Have a listing workflow</h2>

      <p>
        The unlisted pile is where most Vinted sellers leak money. Items get sourced, logged, put in a box, and then forgotten about because there&apos;s always something more urgent.
      </p>

      <p>
        A simple weekly workflow fixes this:
      </p>

      <div className="space-y-3 my-4">
        {[
          { n: "1", t: "Source and log", b: "When you buy something, add it to your inventory immediately. Don't let it sit in a bag unlogged." },
          { n: "2", t: "Set aside listing time", b: "Block out one session a week — even 90 minutes — dedicated to listing unlisted items." },
          { n: "3", t: "Work through your unlisted queue", b: "Your inventory tracker should show you exactly what's not live yet. Work from oldest to newest." },
          { n: "4", t: "Mark as listed", b: "Update each item's status when it goes live. This keeps your numbers accurate." },
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

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">Step 4 — Know your numbers</h2>

      <p>
        Vinted takes fees on every sale. Postage costs money. The item cost money. By the time you factor all of that in, your profit on a given item can look very different from what you thought.
      </p>

      <p>
        Track what you paid and what you sold for on every single sale. After a month, you&apos;ll have a clear picture of which types of items are actually profitable and which ones are eating your time for minimal return.
      </p>

      <p>
        This is the single most useful thing you can do to grow as a reseller — knowing your actual numbers rather than a rough feeling.
      </p>

      <h2 className="font-display text-2xl font-medium text-paper mt-10 mb-4">The bottom line</h2>

      <p>
        Organising your Vinted stock isn&apos;t complicated, but it does require a system and the discipline to stick to it. Physical labels plus digital tracking plus a weekly listing habit will transform how your reselling operation runs.
      </p>

      <p>
        Once you have it set up, sourcing becomes more fun, selling becomes faster, and you actually know whether your business is growing.
      </p>

      <p>
        If you&apos;re looking for reseller stock management software built specifically for UK Vinted sellers, <a href="https://sellganise.com" className="text-amber hover:underline">Sellganise</a> is free to start with up to 50 items — no card needed.
      </p>

    </article>
  );
}
