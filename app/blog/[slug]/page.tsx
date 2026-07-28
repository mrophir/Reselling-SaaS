import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "../../../lib/blog";
import { HowToOrganiseVintedStock } from "./posts/how-to-organise-vinted-stock";
import { HowToTrackProfitDepop } from "./posts/how-to-track-profit-depop";
import { HowToStartResellingOnVinted } from "./posts/how-to-start-reselling-on-vinted";

const CONTENT: Record<string, React.ComponentType> = {
  "how-to-organise-vinted-stock": HowToOrganiseVintedStock,
  "how-to-track-profit-depop": HowToTrackProfitDepop,
  "how-to-start-reselling-on-vinted": HowToStartResellingOnVinted,
};

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://sellganise.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://sellganise.com/blog/${slug}`,
      type: "article",
      publishedTime: new Date(post.date).toISOString(),
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const Content = CONTENT[slug];
  if (!Content) notFound();

  return (
    <div className="min-h-screen bg-ink text-paper" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* nav */}
      <header className="border-b border-line px-6 h-16 flex items-center justify-between sticky top-0 bg-ink/90 backdrop-blur-md z-50">
        <Link href="/" className="font-display text-[17px] font-medium tracking-tight hover:text-amber transition-colors">
          Sellganise
        </Link>
        <div className="flex items-center gap-5 text-sm text-paper-faint">
          <Link href="/blog" className="hover:text-paper transition-colors">← Blog</Link>
          <Link href="/signup" className="px-4 py-2 rounded-lg bg-amber text-ink font-medium hover:bg-paper transition-colors text-sm">
            Get started free
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* tags */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {post.tags.map((tag) => (
            <span key={tag} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber/10 text-amber border border-amber/20">
              {tag}
            </span>
          ))}
        </div>

        {/* title */}
        <h1 className="font-display font-medium text-3xl md:text-4xl tracking-tight leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-paper-dim text-lg leading-relaxed mb-8">{post.description}</p>

        {/* meta */}
        <div className="flex items-center gap-4 text-sm text-paper-faint pb-8 mb-10 border-b border-line">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>

        {/* content */}
        <div className="prose-sellganise">
          <Content />
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-amber/30 bg-amber/[0.06] p-8 text-center">
          <p className="font-display text-xl font-medium mb-2">Ready to get organised?</p>
          <p className="text-paper-dim text-sm mb-6">
            Sellganise is free to start. Track up to 50 items.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber text-ink font-medium text-sm hover:bg-paper transition-colors"
          >
            Start for free
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>

        {/* back */}
        <div className="mt-10 text-center">
          <Link href="/blog" className="text-sm text-paper-faint hover:text-amber transition-colors">
            ← Back to all articles
          </Link>
        </div>
      </main>

      <footer className="border-t border-line px-6 py-10 mt-10">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-paper-faint">
          <p>© {new Date().getFullYear()} Sellganise. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-paper transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-paper transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-paper transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
