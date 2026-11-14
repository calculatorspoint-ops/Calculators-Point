import { financeCalculators } from './categories/finance';
import { healthCalculators } from './categories/health';
import { mathCalculators } from './categories/math';
import { educationCalculators } from './categories/education';
import { convertersCalculators } from './categories/converters';
import { everydayCalculators } from './categories/everyday';
import { constructionCalculators } from './categories/construction';
import { technologyCalculators } from './categories/technology';
import { businessCalculators } from './categories/business';
import { CATEGORIES, type CalculatorCategory } from './calculatorCategories';

export { CATEGORIES };
export type { CalculatorCategory };

export interface CalculatorConfig {
  id: string;
  slug: string;
  name: string;
  desc: string;
  cat: string;
  icon?: string;
  popular?: boolean;
  isNew?: boolean;
  hasChart?: boolean;
  hasSteps?: boolean;
  formula?: string;
  tips?: string[];
  tags?: string[];
  keywords?: string[];
  status?: "live" | "draft" | "coming-soon";
  disclaimer?: string;
  privacy?: "normal" | "sensitive";
  howToUse?: string[];
  examples?: { scenario: string; result: string }[];
  limitations?: string[];
  whenToUse?: string;
  resultMeaning?: string;
  about?: string;

  // ── SEO Content Fields (Phase 2) ────────────────────────────────────────
  /** Short 2–3 sentence unique intro shown above the calculator UI */
  intro?: string;

  /** Structured worked example with inputs, calculation steps, and final result */
  workedExample?: {
    title: string;
    inputs: string[];
    steps: string[];
    result: string;
  };

  /**
   * Manually curated related calculator slugs (cross-category OK).
   * Falls back to same-category calcs if omitted.
   */
  relatedCalculators?: string[];

  /** Custom <title> tag override (replaces auto-generated title) */
  metaTitle?: string;

  /** Custom meta description override (replaces template-generated description) */
  metaDescription?: string;
  /** Authoritative sources supporting time-sensitive or health-related claims. */
  sources?: { title: string; url: string }[];

  /**
   * Mark as needing content work.
   * true  → noindex in metadata + excluded from sitemap.
   * false / undefined → treated as normal live page.
   */
  needsContent?: boolean;
}

export const ALL_CALCULATORS: CalculatorConfig[] = [
  ...financeCalculators,
  ...healthCalculators,
  ...mathCalculators,
  ...educationCalculators,
  ...convertersCalculators,
  ...everydayCalculators,
  ...constructionCalculators,
  ...technologyCalculators,
  ...businessCalculators
];

export const BY_CATEGORY: Record<string, CalculatorConfig[]> = ALL_CALCULATORS.reduce((acc: Record<string, CalculatorConfig[]>, c) => {
  if (!acc[c.cat]) acc[c.cat] = [];
  acc[c.cat].push(c);
  return acc;
}, {});

export const POPULAR: CalculatorConfig[] = ALL_CALCULATORS.filter(c => c.popular);
export const NEW_CALCS: CalculatorConfig[] = ALL_CALCULATORS.filter(c => c.isNew);

export function getCalcBySlug(slug: string): CalculatorConfig | null {
  return ALL_CALCULATORS.find(c => c.slug === slug) || null;
}
export function getRelated(calc: CalculatorConfig, limit = 7): CalculatorConfig[] {
  return ALL_CALCULATORS.filter(c => c.cat === calc.cat && c.id !== calc.id).slice(0, limit);
}

/**
 * Resolve related calculators for a given calc.
 * Priority: calc.relatedCalculators (manual, cross-category OK) → same-category fallback.
 * Excludes the current calc itself and any needsContent / coming-soon calcs.
 */
export function getRelatedCalcs(calc: CalculatorConfig, limit = 6): CalculatorConfig[] {
  if (calc.relatedCalculators && calc.relatedCalculators.length > 0) {
    const resolved = calc.relatedCalculators
      .map(slug => ALL_CALCULATORS.find(c => c.slug === slug))
      .filter((c): c is CalculatorConfig =>
        !!c && c.slug !== calc.slug && !c.needsContent && c.status !== 'coming-soon'
      )
      .slice(0, limit);
    if (resolved.length > 0) return resolved;
  }
  // Fallback: same-category calcs (excluding self and needsContent)
  return ALL_CALCULATORS
    .filter(c => c.cat === calc.cat && c.slug !== calc.slug && !c.needsContent && c.status !== 'coming-soon')
    .slice(0, limit);
}

/**
 * SINGLE SOURCE OF TRUTH for calculator count.
 *
 * Use CALC_COUNT_LABEL (e.g. "183+") everywhere you need to display
 * the count in UI copy, metadata titles, and descriptions.
 *
 * Do NOT hardcode "180+", "195+", or any other count string anywhere.
 * Import CALC_COUNT_LABEL and use it instead.
 */
export const LIVE_CALC_COUNT: number = ALL_CALCULATORS.filter(
  (c) => c.status !== 'coming-soon' && c.status !== 'draft'
).length;

/** User-facing label, e.g. "183+" */
export const CALC_COUNT_LABEL: string = `${LIVE_CALC_COUNT}+`;

/**
 * Calculators that are indexable by search engines.
 * Excludes needsContent: true, draft, and coming-soon calculators.
 */
export const INDEXABLE_CALCULATORS: CalculatorConfig[] = ALL_CALCULATORS.filter(
  (c) => !c.needsContent && c.status !== 'coming-soon' && c.status !== 'draft'
);
