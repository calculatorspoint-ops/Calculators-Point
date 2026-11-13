import Link from '@/compat/link';
import { ALL_CALCULATORS, CATEGORIES } from '@/data/calculatorConfigs';

export default function CheatSheets() {
  const featured = ALL_CALCULATORS.filter((calc) => calc.formula).slice(0, 80);
  return <section style={{ maxWidth: 1080, margin: '48px auto', padding: 24 }}>
    <p style={{ color: 'var(--brand)', fontWeight: 800 }}>FORMULAS AND REFERENCES</p><h1>Calculator Cheat Sheets</h1>
    <p>Review common formulas and open the calculator for a complete, interactive breakdown.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginTop: 28 }}>
      {featured.map((calc) => <article key={calc.id} className="premium-card-bg" style={{ padding: 20, border: '1px solid var(--border)', borderRadius: 14 }}>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>{CATEGORIES.find((cat) => cat.id === calc.cat)?.name}</p>
        <h2 style={{ fontSize: 19 }}>{calc.name}</h2><code style={{ display: 'block', whiteSpace: 'normal', padding: 12, borderRadius: 8, background: 'var(--surf2)' }}>{calc.formula}</code>
        <p style={{ marginTop: 14 }}><Link href={`/calculator/${calc.slug}`}>Open calculator →</Link></p>
      </article>)}
    </div>
  </section>;
}
