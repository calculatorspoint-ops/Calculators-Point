import Link from "@/compat/link";
import { CATEGORIES } from "@/data/calculatorCategories";
import { POPULAR, ALL_CALCULATORS } from "@/data/calculatorCatalog";
import { CALC_COUNT_LABEL } from "@/data/calculatorCount";
import { Calculator } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"var(--font-hd)", fontSize:22, fontWeight:800, color:"#fff", marginBottom:10, letterSpacing:"-.04em" }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#3C8275,#216459)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(33, 100, 89,0.3)" }}>
                <Calculator size={18} color="#ffffff" strokeWidth={2.5} />
              </div>
              <div>Calculators <span style={{ color:"#69aa99" }}>Point</span></div>
            </div>
            <p style={{ fontSize:13, lineHeight:1.7, color:"var(--footer-text)", marginBottom:16 }}>
              {CALC_COUNT_LABEL} free online calculators for finance, health, math, education and daily life.
              Fast, accurate, and 100% free — always.
            </p>

          </div>

          {/* Categories — nav landmark for screen reader navigation */}
          <nav aria-label="Calculator categories">
            <p className="footer-head">Categories</p>
            {CATEGORIES.map(c=>(
              <Link key={c.id} href={`/category/${c.id}`} className="footer-link" style={{ marginBottom:8 }}>
                <span aria-hidden="true">{c.icon}</span> {c.name}
              </Link>
            ))}
          </nav>

          {/* Popular — nav landmark */}
          <nav aria-label="Popular tools">
            <p className="footer-head">Popular Tools</p>
            {POPULAR.slice(0,8).map(c=>(
              <Link key={c.id} href={`/calculator/${c.slug}`} className="footer-link" style={{ marginBottom:8 }}>
                {c.name}
              </Link>
            ))}
          </nav>

          {/* Guides & Tools — nav landmark */}
          <nav aria-label="Guides and tools">
            <p className="footer-head">Guides &amp; Tools</p>
            {[
              ["Home Loan EMI Guide", "/tools/home-loan-emi-calculator"],
              ["Car Loan EMI Guide", "/tools/car-loan-emi-calculator"],
              ["SIP Returns Guide", "/tools/sip-returns-calculator"],
              ["BMI for Adults", "/tools/bmi-calculator-adults"],
              ["TDEE & Calories", "/tools/tdee-calorie-calculator"],
              ["Investment ROI", "/tools/investment-roi-calculator"],
              ["Mortgage Comparison", "/tools/mortgage-comparison-calculator"],
              ["College GPA Guide", "/tools/college-gpa-calculator"],
            ].map(([l,h])=>(
              <Link key={h} href={h} className="footer-link" style={{ marginBottom:8 }}>{l}</Link>
            ))}
          </nav>

          {/* Company — nav landmark */}
          <nav aria-label="Company links">
            <p className="footer-head">Company</p>
            {[["About Us","/about"],["Contact Us","/contact"],["All Calculators","/calculators"],["Sitemap","/sitemap"]].map(([l,h])=>(
              <Link key={h} href={h} className="footer-link" style={{ marginBottom:8 }}>{l}</Link>
            ))}
            <a href="https://linkedin.com/in/m-khurram" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ marginBottom:8 }}>
              Follow me for more insights
            </a>
            <p className="footer-head" style={{ marginTop:20 }}>Legal</p>
            {[["Privacy Policy","/privacy-policy"],["Terms of Service","/terms-of-service"],["Disclaimer","/disclaimer"],["Cookie Policy","/cookie-policy"]].map(([l,h])=>(
              <Link key={h} href={h} className="footer-link" style={{ marginBottom:8 }}>{l}</Link>
            ))}
            <button type="button" className="footer-link" style={{ marginBottom:8, border:0, background:'none', padding:0, cursor:'pointer', textAlign:'left' }} onClick={() => window.dispatchEvent(new Event('cookie-preferences:open'))}>Cookie preferences</button>
            <p className="footer-head" style={{ marginTop:20 }}>Contact</p>
            <a href="mailto:contact@calculatorspoint.com" className="footer-link">contact@calculatorspoint.com</a>
          </nav>
        </div>

        {/* Ad disclosure — FTC / Google AdSense policy require this on every page */}
        <div className="footer-disc">
          <strong style={{ color:"#94a3b8" }}>Advertising Disclosure:</strong>{" "}
          Calculators Point is a free educational platform. We may display advertisements to support the cost of
          running this service. Advertisers have no influence over our calculator formulas,
          results, or editorial content — all outputs are calculated independently.
          See our{" "}
          <Link href="/privacy-policy" style={{ color:"var(--footer-link-hover)" }}>Privacy Policy</Link> and{" "}
          <Link href="/disclaimer" style={{ color:"var(--footer-link-hover)" }}>Disclaimer</Link> for details.
        </div>

        <div className="footer-bottom">
          {/* rel="nofollow" prevents PageRank leaking to external attribution site on every page */}
          <span suppressHydrationWarning>© {new Date().getFullYear()} Calculators Point. All rights reserved. Results are for informational purposes only.</span>
          <span>Made with ❤️ · <a href="https://mkinnovexa.vercel.app/" target="_blank" rel="nofollow noopener noreferrer" style={{color:"var(--brand)",fontWeight:700,textDecoration:"none"}}>MK INNOVEXA</a></span>
        </div>
      </div>
    </footer>
  );
}
