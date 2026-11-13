'use client';
import { useState, useMemo } from "react";
import { useSearchParams } from "@/compat/navigation";
import Link from "@/compat/link";
import { Search, ArrowRight } from "lucide-react";

import { CATEGORIES } from "@/data/calculatorCategories";
import { ALL_CALCULATORS } from "@/data/calculatorCatalog";
import { CALC_COUNT_LABEL } from "@/data/calculatorCount";
import { searchCalculators } from "@/utils/calculatorSearch";
import "@/styles/all-calculators.css";

import { Suspense, useEffect } from "react";

function SearchQueryReader({ onSearch }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      onSearch(query);
    }
  }, [searchParams, onSearch]);
  return null;
}

export default function AllCalculators() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const filtered = useMemo(() => {
    const candidates = q.trim() ? searchCalculators(q) : ALL_CALCULATORS;
    return candidates.filter((calc) => cat === "all" || calc.cat === cat);
  }, [q, cat]);

  return (
    <div className="all-calcs-page">
      <Suspense fallback={null}>
        <SearchQueryReader onSearch={setQ} />
      </Suspense>

      {/* Hero Section */}
      <section className="hero-premium">
        <div className="hero-premium-inner">
          <h1 className="hero-title-premium">
            <span className="text-gradient">{CALC_COUNT_LABEL} Powerful Tools</span><br/>
            For Everyday Calculations
          </h1>
          <p className="hero-subtitle-premium">
            From complex financial forecasting to quick health checks, Calculators Point provides professional-grade tools with instant, beautiful results.
          </p>
        </div>
      </section>

      {/* Sticky Search & Filter Bar */}
      <div className="toolbar-premium-wrap">
        <div className="toolbar-premium">
          <div className="search-premium">
            <Search className="search-icon" size={18} />
            <input 
              type="search" 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              placeholder="Search calculators..." 
              aria-label="Search all calculators"
            />
          </div>
          <div className="filters-premium">
            <button 
              onClick={() => setCat("all")} 
              className={`filter-pill-premium ${cat === "all" ? "active" : ""}`}
              aria-pressed={cat === "all"}
            >
              <span className="icon">🔢</span> All
            </button>
            {CATEGORIES.map(c => (
              <button 
                key={c.id} 
                onClick={() => setCat(c.id)} 
                className={`filter-pill-premium ${cat === c.id ? "active" : ""}`}
                aria-pressed={cat === c.id}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ paddingBottom: '80px' }}>
        <p className="catalog-results-count" aria-live="polite" aria-atomic="true">
          Showing {filtered.length} {filtered.length === 1 ? "calculator" : "calculators"}
          {cat !== "all" ? ` in ${CATEGORIES.find(category => category.id === cat)?.name || "this category"}` : ""}
          {q.trim() ? ` for “${q.trim()}”` : ""}
        </p>
        {CATEGORIES.map(category => {
          const calcs = filtered.filter(c => c.cat === category.id);
          if (!calcs.length) return null;
          
          return (
            <section key={category.id}>
              {cat === "all" ? (
                <div className="category-header-premium">
                  <h2>
                    <span style={{ fontSize: '24px' }}>{category.icon}</span> 
                    {category.name}
                  </h2>
                  <div className="line" />
                </div>
              ) : <h2 className="catalog-category-title">{category.icon} {category.name} Calculators</h2>}
              <div className="calc-grid-premium">
                {calcs.map(c => (
                  <Link key={c.id} href={`/calculator/${c.slug}`} className="calc-card-premium">
                    <div className="calc-card-icon">{c.icon}</div>
                    <div className="calc-card-content">
                      <div className="calc-card-title">
                        {c.name}
                        {c.popular && <span className="premium-badge badge-pop">Popular</span>}
                        {c.isNew && <span className="premium-badge badge-new">New</span>}
                      </div>
                      <p className="calc-card-desc">{c.desc}</p>
                    </div>
                    <ArrowRight className="calc-card-arrow" size={20} />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state-premium">
            <div className="icon">🔍</div>
            <h3>No results found for "{q}"</h3>
            <p>Try adjusting your search or switching categories.</p>
            <button type="button" className="btn-outline" style={{ minHeight:44, marginTop:16 }} onClick={() => { setQ(""); setCat("all"); }}>
              Clear search and filters
            </button>
          </div>
        )}

        {/* ═══ NAME GENERATORS SECTION ═══════════════════════════════════════════════ */}
        <div style={{ maxWidth: 1280, margin: "40px auto 0", padding: "0 20px" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--brand-l), var(--surface) 62%, var(--amber-l))",
            border: "1.5px solid var(--border)",
            borderRadius: 20,
            padding: "32px 28px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 24 }}>✨</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Name Generator Tools</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#216459", background: "#21645920", border: "1px solid #21645940", padding: "2px 8px", borderRadius: 100 }}>NEW</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text2)", maxWidth: 560, lineHeight: 1.6 }}>
                  Discover our brand-new suite of professional name generators — baby names, business names, brand identity, YouTube channels, Instagram usernames, domain names, and app names. All free, all instant.
                </p>
              </div>
              <Link href="/name-generators" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", background: "linear-gradient(135deg, #216459, #397f70)",
                borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 13,
                textDecoration: "none", flexShrink: 0, transition: "all .2s",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                View All 8 Generators <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
              {[
                { slug: "baby-name-generator",            icon: "👶", label: "Baby Name Generator",     color: "#A96D2E", bg: "rgba(164,94,116,.1)"  },
                { slug: "islamic-baby-names",             icon: "🌙", label: "Islamic Baby Names",      color: "#357968", bg: "rgba(15,118,110,.1)"  },
                { slug: "business-name-generator",        icon: "💼", label: "Business Name Generator", color: "#216459", bg: "rgba(33, 100, 89,.1)"  },
                { slug: "brand-name-generator",           icon: "✨", label: "Brand Name Generator",   color: "#216459", bg: "rgba(99,91,136,.1)"  },
                { slug: "youtube-channel-name-generator", icon: "🎬", label: "YouTube Channel Names",   color: "#A94F48", bg: "rgba(181,80,74,.1)"   },
                { slug: "instagram-username-generator",   icon: "📸", label: "Instagram Username",      color: "#216459", bg: "rgba(128,107,131,.1)" },
                { slug: "domain-name-generator",          icon: "🌐", label: "Domain Name Generator",   color: "#397f70", bg: "rgba(71,124,135,.1)"  },
                { slug: "app-name-generator",             icon: "📱", label: "App Name Generator",      color: "#A96D2E", bg: "rgba(169,106,34,.1)"  },
              ].map(tool => (
                <Link key={tool.slug} href={`/name-generators/${tool.slug}`} style={{
                  display: "flex", flexDirection: "column", gap: 8,
                  padding: "16px 14px", background: tool.bg,
                  border: `1.5px solid ${tool.color}30`, borderRadius: 14,
                  textDecoration: "none", transition: "all .15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = tool.color; e.currentTarget.style.background = tool.bg.replace("0.1", "0.18"); }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = `${tool.color}30`; e.currentTarget.style.background = tool.bg; }}>
                  <span style={{ fontSize: 26 }}>{tool.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tool.color, lineHeight: 1.4 }}>{tool.label}</span>
                  <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>Free →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
