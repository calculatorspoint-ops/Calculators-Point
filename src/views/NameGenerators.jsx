import Link from '@/compat/link';

const generators = [
  ['baby-name-generator', 'Baby Name Generator', '👶', 'Browse baby names by origin, style, length, and gender.'],
  ['islamic-baby-names', 'Islamic Baby Names', '🌙', 'Explore meaningful Islamic names with origins and meanings.'],
  ['business-name-generator', 'Business Name Generator', '💼', 'Find a memorable name for your new business.'],
  ['brand-name-generator', 'Brand Name Generator', '✨', 'Create distinctive brand name ideas for your next venture.'],
  ['domain-name-generator', 'Domain Name Generator', '🌐', 'Generate domain ideas for a project, product, or company.'],
  ['app-name-generator', 'App Name Generator', '📱', 'Explore short, recognizable names for your app.'],
  ['youtube-channel-name-generator', 'YouTube Channel Name Generator', '🎬', 'Find a channel name that fits your content.'],
  ['instagram-username-generator', 'Instagram Username Generator', '📸', 'Generate social username ideas that match your style.'],
];

export default function NameGenerators() {
  return <section style={{ maxWidth: 1080, margin: '48px auto', padding: 24 }}>
    <p style={{ color: 'var(--brand)', fontWeight: 800 }}>FREE CREATIVE TOOLS</p><h1>Name Generators</h1>
    <p>Explore name ideas for people, businesses, brands, apps, domains, and social channels.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18, marginTop: 28 }}>
      {generators.map(([slug, name, icon, description]) => <Link key={slug} href={`/name-generators/${slug}`} className="premium-card-bg" style={{ display: 'block', padding: 22, border: '1px solid var(--border)', borderRadius: 16, textDecoration: 'none' }}>
        <span style={{ fontSize: 28 }}>{icon}</span><h2 style={{ fontSize: 20 }}>{name}</h2><p>{description}</p><strong>Open generator →</strong>
      </Link>)}
    </div>
  </section>;
}
