'use client';
/**
 * app/search/search-client.tsx
 * Client-side search UI component.
 */
import { useState, useEffect } from 'react';
import Link from '@/compat/link';
import { Search, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/data/calculatorCategories';
import { POPULAR } from '@/data/calculatorCatalog';
import { CALC_COUNT_LABEL } from '@/data/calculatorCount';
import { searchCalculators } from '@/utils/calculatorSearch';

function SearchResult({ calc, cat }: { calc: any; cat: any }) {
  return (
    <Link
      href={`/calculator/${calc.slug}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        background: 'var(--surface)', border: '1.5px solid var(--border)',
        borderRadius: 14, textDecoration: 'none', transition: 'all .15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = cat?.color || 'var(--brand)';
        el.style.background = cat?.bg || 'var(--brand-l)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border)';
        el.style.background = 'var(--surface)';
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: cat?.bg || 'var(--surface2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>
        {calc.icon || '🧮'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {calc.name}
          </span>
          {calc.popular && <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--amber-text)', background: 'var(--amber-l)', padding: '3px 7px', borderRadius: 100, flexShrink: 0 }}>HOT</span>}
          {calc.isNew && <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--green-text)', background: 'var(--green-l)', padding: '3px 7px', borderRadius: 100, flexShrink: 0 }}>NEW</span>}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{calc.desc}</p>
        {cat && <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, marginTop: 4, display: 'inline-block' }}>{cat.icon} {cat.name}</span>}
      </div>
      <ArrowRight size={14} style={{ color: 'var(--text3)', flexShrink: 0 }} />
    </Link>
  );
}

export default function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ReturnType<typeof searchCalculators>>([]);

  const catMap = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setResults(searchCalculators(query));
  }, [query]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px,4vw,48px) 20px' }}>
      {/* Page title */}
      <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 900, color: 'var(--text)', marginBottom: 16, letterSpacing: '-.03em' }}>
        {query ? `Results for "${query}"` : 'Search Calculators'}
      </h1>

      {/* Search input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
        background: 'var(--surface)', border: '2px solid var(--brand)',
        borderRadius: 14, marginBottom: 28,
        boxShadow: '0 0 0 4px rgba(33, 100, 89,.08)',
      }}>
        <Search size={18} style={{ color: 'var(--brand)', flexShrink: 0 }} />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${CALC_COUNT_LABEL} calculators…`}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 16, color: 'var(--text)', fontFamily: 'var(--font)',
          }}
          aria-label="Search calculators"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 20, lineHeight: 1, padding: '0 4px', fontFamily: 'var(--font)' }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Results */}
      {!query.trim() ? (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14, fontWeight: 600 }}>⭐ Popular calculators</p>
          <div style={{ display: 'grid', gap: 10 }}>
            {POPULAR.slice(0, 8).map(c => (
              <SearchResult key={c.id} calc={c} cat={catMap[c.cat]} />
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No results found</h2>
          <p style={{ fontSize: 14 }}>Try different keywords or{' '}
            <Link href="/calculators" style={{ color: 'var(--brand)', fontWeight: 700 }}>browse all tools</Link>
          </p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14, fontWeight: 600 }}>
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            {results.map(c => (
              <SearchResult key={c.id} calc={c} cat={catMap[c.cat]} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
