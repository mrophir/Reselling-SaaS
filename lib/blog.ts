export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "how-to-organise-vinted-stock",
    title: "How to Organise Your Vinted Stock (Without Losing Your Mind)",
    description: "Selling on Vinted with more than 50 items? Here's how to organise your reselling stock so you always know what you own, where it is, and what it's worth.",
    date: "9 July 2026",
    readTime: "6 min read",
    tags: ["Vinted", "Stock management", "Organisation"],
  },
  {
    slug: "how-to-track-profit-depop",
    title: "How to Track Your Profit on Depop Properly",
    description: "Most Depop sellers have no idea what they actually make after fees, postage and sourcing costs. Here's how to track your real profit on every sale.",
    date: "16 July 2026",
    readTime: "5 min read",
    tags: ["Depop", "Profit tracking", "Reseller tips"],
  },
  {
    slug: "best-apps-for-resellers-uk",
    title: "Best Apps for Resellers UK 2026",
    description: "A no-nonsense rundown of the best tools UK resellers are actually using in 2026 — from stock management to pricing and listing.",
    date: "23 July 2026",
    readTime: "7 min read",
    tags: ["Tools", "UK resellers", "Apps"],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
