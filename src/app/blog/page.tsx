import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Blog',
  description: 'Tips, guides, and strategies for independent barbers — no-show protection, deposit policies, booking software, and growing your clientele.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">Blog</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Guides for independent barbers
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Practical advice on reducing no-shows, collecting deposits, booking software, and growing your shop.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium mb-1">No posts yet</p>
              <p className="text-slate-500 text-sm">Check back soon — new content is on the way.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block bg-slate-900/80 border border-slate-800 rounded-2xl p-7 hover:border-slate-700 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-2">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors mb-2">
                        {post.title}
                      </h2>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                    <span className="text-amber-400 text-sm font-medium shrink-0 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
