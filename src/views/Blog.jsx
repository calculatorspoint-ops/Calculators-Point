import Link from '@/compat/link';
import { useParams } from '@/compat/navigation';
import { getPostBySlug, getPublishedPosts, getCategoryMeta, calcReadingTime } from '@/data/blogPosts';

export default function Blog() {
  const { slug } = useParams();
  const post = slug ? getPostBySlug(slug) : null;
  if (slug && !post) return <section className="page-shell"><h1>Article not found</h1><Link href="/blog">Browse all articles</Link></section>;
  if (post) {
    const category = getCategoryMeta(post.category);
    return <article className="page-shell" style={{ maxWidth: 880, margin: '48px auto', padding: 24 }}>
      <Link href="/blog">← All articles</Link>
      <p style={{ color: 'var(--brand)', fontWeight: 700, marginTop: 28 }}>{category?.name || 'Guides'} · {calcReadingTime(post.content)} min read</p>
      <h1>{post.title}</h1><p>{post.description}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>;
  }
  return <section className="page-shell" style={{ maxWidth: 1080, margin: '48px auto', padding: 24 }}>
    <p style={{ color: 'var(--brand)', fontWeight: 700 }}>CALCULATORS POINT JOURNAL</p><h1>Guides and insights</h1>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18, marginTop: 28 }}>
      {getPublishedPosts().map((item) => <article key={item.slug} className="premium-card-bg" style={{ padding: 22, border: '1px solid var(--border)', borderRadius: 16 }}>
        <p>{getCategoryMeta(item.category)?.name || 'Guide'}</p><h2 style={{ fontSize: 20 }}><Link href={`/blog/${item.slug}`}>{item.title}</Link></h2>
        <p>{item.description}</p><Link href={`/blog/${item.slug}`}>Read article →</Link>
      </article>)}
    </div>
  </section>;
}
