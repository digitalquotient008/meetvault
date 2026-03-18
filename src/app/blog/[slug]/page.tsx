import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import BlogCTA from '@/components/BlogCTA';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      url: `/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://meetvault.app';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'MeetVault',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MeetVault',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };

  return (
    <div className="bg-slate-950 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-8 transition-colors"
          >
            &larr; All posts
          </Link>

          {/* Header */}
          <header className="mb-10">
            <p className="text-amber-400 text-sm font-medium mb-3">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              {post.description}
            </p>
          </header>

          {/* Divider */}
          <div className="border-t border-slate-800 mb-10" />

          {/* MDX content */}
          <div className="prose prose-lg prose-invert max-w-none
            prose-headings:text-white prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-3
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-5
            prose-strong:text-white prose-strong:font-semibold
            prose-a:text-amber-400 prose-a:underline prose-a:underline-offset-2 prose-a:decoration-amber-500/30 hover:prose-a:text-amber-300 hover:prose-a:decoration-amber-400/50
            prose-ul:text-slate-300 prose-ol:text-slate-300 prose-ul:my-5 prose-ol:my-5
            prose-li:text-slate-300 prose-li:marker:text-amber-500 prose-li:my-1.5
            prose-blockquote:border-l-2 prose-blockquote:border-amber-500/50 prose-blockquote:bg-slate-900/50 prose-blockquote:rounded-r-xl prose-blockquote:px-5 prose-blockquote:py-4 prose-blockquote:not-italic prose-blockquote:text-slate-300 prose-blockquote:my-6
            prose-code:text-amber-400 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-hr:border-slate-800 prose-hr:my-10
            prose-table:my-6 prose-table:overflow-hidden prose-table:rounded-xl prose-table:border prose-table:border-slate-800
            prose-thead:bg-slate-800/50 prose-thead:text-slate-300
            prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-xs prose-th:font-medium prose-th:uppercase prose-th:tracking-wide prose-th:text-slate-400
            prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:text-slate-300 prose-td:border-t prose-td:border-slate-800/60
            prose-tr:even:bg-slate-900/30
            prose-img:rounded-xl prose-img:border prose-img:border-slate-800
          ">
            <MDXRemote
              source={post.content}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>

          {/* CTA */}
          <BlogCTA />
        </div>
      </article>
    </div>
  );
}
