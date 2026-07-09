import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "../../lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides, tips and strategies for UK resellers. Learn how to manage stock, track profit and grow your reselling business on Vinted, eBay, Depop and more.",
  alternates: { canonical: "https://sellganise.com/blog" },
  openGraph: {
    title: "Sellganise Blog — Reseller Tips & Guides",
    description: "Guides, tips and strategies for UK resellers selling on Vinted, eBay, Depop and Facebook Marketplace.",
    url: "https://sellganise.com/blog",
  },
};

export default function BlogIndex() {
  const published = POSTS.filter((p) => new Date(p.date) <= new Date());

  return (
    <div className="min-h-screen bg-ink text-paper" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* nav */}
      <header className="border-b border-line px-6 h-16 flex items-center justify-between sticky top-0 bg-ink/90 backdrop-blur-md z-50">
        <Link href="/" className="font-display text-[17px] font-medium tracking-tight hover:text-amber transition-colors">
          Sellganise
        </Link>
        <div className="flex items-center gap-4 text-sm text-paper-faint">
          <Link href="/pricing" className="hidden sm:block hover:text-paper transition-colors">Pricing</Link>
          <Link href="/login" className="hidden sm:block hover:text-paper transition-colors">Log in</Link>
          <Link href="/signup" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-amber text-ink font-medium hover:bg-paper transition-colors text-sm whitespace-nowrap">
            <span className="hidden sm:inline">Get started free</span>
            <span className="sm:hidden">Sign up</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* header */}
        <div className="mb-14">
          <p className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-amber mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            Blog
          </p>
          <h1 className="font-display font-medium text-4xl md:text-5xl tracking-tight mb-4">
            Reseller guides & tips
          </h1>
          <p className="text-paper-dim text-lg max-w-xl">
            Practical advice for UK resellers selling on Vinted, eBay, Depop and Facebook Marketplace.
          </p>
        </div>

        {/* posts */}
        <div className="space-y-4">
          {POSTS.map((post) => {
            const isPublished = new Date(post.date) <= new Date();
            return (
              <article key={post.slug}>
                {isPublished ? (
                  <Link href={`/blog/${post.slug}`} className="group block rounded-2xl border border-line bg-ink-card p-8 hover:border-amber/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/25 transition-all duration-200">
                    <PostCard post={post} />
                  </Link>
                ) : (
                  <div className="block rounded-2xl border border-line bg-ink-card/50 p-8 opacity-50 cursor-not-allowed">
                    <PostCard post={post} upcoming />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* coming soon note */}
        {POSTS.some((p) => new Date(p.date) > new Date()) && (
          <p className="mt-10 text-sm text-paper-faint text-center">
            More articles coming weekly. Bookmark this page or{" "}
            <Link href="/signup" className="text-amber hover:underline">sign up free</Link>{" "}
            to stay in the loop.
          </p>
        )}
      </main>

      <footer className="border-t border-line px-6 py-10 mt-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-paper-faint">
          <p>© {new Date().getFullYear()} Sellganise. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-paper transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-paper transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-paper transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-paper transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PostCard({ post, upcoming = false }: { post: (typeof POSTS)[number]; upcoming?: boolean }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {post.tags.map((tag) => (
          <span key={tag} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber/10 text-amber border border-amber/20">
            {tag}
          </span>
        ))}
        {upcoming && (
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-line text-paper-faint border border-line">
            Coming {post.date}
          </span>
        )}
      </div>
      <h2 className="font-display text-xl font-medium text-paper mb-2 group-hover:text-amber transition-colors leading-snug">
        {post.title}
      </h2>
      <p className="text-paper-dim text-sm leading-relaxed mb-5">{post.description}</p>
      <div className="flex items-center gap-4 text-xs text-paper-faint">
        <span>{post.date}</span>
        <span>·</span>
        <span>{post.readTime}</span>
        {!upcoming && (
          <>
            <span>·</span>
            <span className="text-amber group-hover:underline">Read article →</span>
          </>
        )}
      </div>
    </>
  );
}
