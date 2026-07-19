import { MetadataRoute } from "next";
import { POSTS } from "../lib/blog";

const BASE = "https://sellganise.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const publishedPosts = POSTS.filter((p) => new Date(p.date) <= new Date());

  return [
    { url: BASE,              lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/signup`,  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.6 },
    { url: `${BASE}/login`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE}/terms`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    ...publishedPosts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
