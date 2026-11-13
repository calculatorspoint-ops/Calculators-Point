import Link from "@/compat/link";

export function CalcCard({ calc }) {
  return (
    <Link href={`/calculator/${calc.slug}`}
      className="block no-underline rounded-2xl border p-5 card-hover"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: "#eff8f5" }}>
          {calc.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold truncate" style={{ color: "var(--txt)" }}>{calc.name}</h3>
            {calc.popular && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#eff8f5", color: "#216459", border: "1px solid #99cabc" }}>
                Popular
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--txt3)" }}>{calc.description}</p>
        </div>
      </div>
    </Link>
  );
}
