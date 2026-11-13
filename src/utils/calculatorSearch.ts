import { ALL_CALCULATORS, type CalculatorCatalogEntry } from '@/data/calculatorCatalog';
import { CATEGORIES } from '@/data/calculatorCategories';

function normalize(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/** One shared search index for the navbar, catalog, and search results page. */
export function searchCalculators(query: string, limit = ALL_CALCULATORS.length): CalculatorCatalogEntry[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  return ALL_CALCULATORS.map((calc) => {
    const name = normalize(calc.name);
    const description = normalize(calc.desc || '');
    const category = normalize(CATEGORIES.find((item) => item.id === calc.cat)?.name || '');
    const keywords = (calc.keywords || []).map(normalize);
    const tags = (calc.tags || []).map(normalize);
    const searchable = [name, description, category, ...keywords, ...tags].join(' ');

    let score = 0;
    if (name === normalizedQuery) score += 120;
    else if (name.startsWith(normalizedQuery)) score += 80;
    else if (name.includes(normalizedQuery)) score += 55;
    if (keywords.some((word) => word === normalizedQuery)) score += 70;
    else if (keywords.some((word) => word.includes(normalizedQuery) || normalizedQuery.includes(word))) score += 45;
    if (description.includes(normalizedQuery)) score += 20;
    if (category.includes(normalizedQuery)) score += 18;
    const matchingWords = words.filter((word) => searchable.includes(word)).length;
    if (matchingWords === words.length) score += words.length > 1 ? 25 : 8;
    if (calc.popular && score > 0) score += 3;

    return { calc, score };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.calc.name.localeCompare(b.calc.name))
    .slice(0, limit)
    .map(({ calc }) => calc);
}

export function popularCalculators(limit = 4): CalculatorCatalogEntry[] {
  return ALL_CALCULATORS.filter((calc) => calc.popular).slice(0, limit);
}
