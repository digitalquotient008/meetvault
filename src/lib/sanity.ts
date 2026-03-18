import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { apiVersion, dataset, projectId } from '@/sanity/env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return builder.image(source as any);
}

// ── Queries ──────────────────────────────────────────────

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  publishedAt: string;
  mainImage?: unknown;
  body?: unknown[];
}

const postFields = `
  _id,
  title,
  slug,
  description,
  publishedAt,
  mainImage,
  body
`;

export async function getAllPosts(): Promise<SanityPost[]> {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) { ${postFields} }`,
    {},
    { next: { revalidate: 60 } },
  );
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0] { ${postFields} }`,
    { slug },
    { next: { revalidate: 60 } },
  );
  return post || null;
}

export async function getAllPostSlugs(): Promise<string[]> {
  const slugs: Array<{ current: string }> = await client.fetch(
    `*[_type == "post"].slug`,
    {},
    { next: { revalidate: 60 } },
  );
  return slugs.map((s) => s.current);
}
