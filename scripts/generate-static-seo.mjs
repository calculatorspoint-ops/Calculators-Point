import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vite = await createServer({
  configFile: path.join(root, 'vite.config.js'),
  configLoader: 'runner',
  root,
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const [{ INDEXABLE_CALCULATORS, ALL_CALCULATORS, CATEGORIES, LIVE_CALC_COUNT }, { SEO_LANDING_PAGES }, { getPublishedPosts }] = await Promise.all([
    vite.ssrLoadModule('/src/data/calculatorConfigs.ts'),
    vite.ssrLoadModule('/src/data/seoLandingData.ts'),
    vite.ssrLoadModule('/src/data/blogPosts.ts'),
  ]);
  const base = process.env.SITE_URL || 'https://calculatorspoint.com';
  const urls = new Set([
    '/', '/calculators', '/cheat-sheets', '/about', '/contact', '/privacy-policy', '/search',
    '/terms-of-service', '/disclaimer', '/cookie-policy', '/sitemap', '/blog',
    '/name-generators',
    ...CATEGORIES.map(({ id }) => `/category/${id}`),
    ...INDEXABLE_CALCULATORS.map(({ slug }) => `/calculator/${slug}`),
    ...SEO_LANDING_PAGES.map(({ slug }) => `/tools/${slug}`),
    ...['education', 'finance', 'fitness'].map((id) => `/ecosystem/${id}`),
    ...['baby-name-generator', 'business-name-generator', 'brand-name-generator', 'domain-name-generator', 'app-name-generator', 'youtube-channel-name-generator', 'instagram-username-generator', 'islamic-baby-names'].map((slug) => `/name-generators/${slug}`),
    ...(getPublishedPosts?.() || []).map(({ slug }) => `/blog/${slug}`),
    '/pt-br', '/pt-br/calculators', '/pt-br/about', '/pt-br/contact',
    '/pt-br/privacy-policy', '/pt-br/terms-of-service', '/pt-br/disclaimer', '/pt-br/cookie-policy',
    ...CATEGORIES.map(({ id }) => `/pt-br/category/${id}`),
    ...INDEXABLE_CALCULATORS.map(({ slug }) => `/pt-br/calculator/${slug}`),
  ]);
  const metadata = {};
  const staticPages = {
    '/': ['Free Online Calculators', 'Free online calculators for finance, health, math, education, and everyday life. Fast, accurate, and private.'],
    '/calculators': ['All Online Calculators', 'Browse free calculators for finance, health, math, education, construction, business, and everyday needs.'],
    '/cheat-sheets': ['Calculator Cheat Sheets', 'Quick reference guides and worked examples for common calculations.'],
    '/about': ['About Calculators Point', 'Learn about Calculators Point and how its free online calculators work.'],
    '/contact': ['Contact Calculators Point', 'Contact us with calculator feedback, bug reports, and accuracy concerns.'],
    '/privacy-policy': ['Privacy Policy', 'Read how Calculators Point handles information, cookies, analytics, and privacy.'],
    '/terms-of-service': ['Terms of Service', 'Read the terms for using Calculators Point tools and content.'],
    '/cookie-policy': ['Cookie Policy', 'Learn about the cookies and optional analytics used on Calculators Point.'],
    '/disclaimer': ['Calculator Disclaimer', 'Important information about using online calculator results.'],
    '/sitemap': ['Sitemap', 'Browse the pages and calculator tools available on Calculators Point.'],
    '/blog': ['Guides and Insights', 'Practical guides and explainers for finance, health, math, and everyday calculations.'],
    '/name-generators': ['Free Name Generators', 'Explore free generators for baby names, businesses, brands, domains, and social channels.'],
    '/search': ['Search Calculators', 'Find a calculator by name, category, keyword, or common use.'],
  };
  const generatorNames = {
    'baby-name-generator': 'Baby Name Generator', 'business-name-generator': 'Business Name Generator',
    'brand-name-generator': 'Brand Name Generator', 'domain-name-generator': 'Domain Name Generator',
    'app-name-generator': 'App Name Generator', 'youtube-channel-name-generator': 'YouTube Channel Name Generator',
    'instagram-username-generator': 'Instagram Username Generator', 'islamic-baby-names': 'Islamic Baby Names',
  };
  const blogPosts = getPublishedPosts?.() || [];
  const routeTitle = (route) => {
    const cleanRoute = route.replace(/^\/pt-br(?=\/|$)/, '') || '/';
    const calcMatch = cleanRoute.match(/^\/calculator\/([^/]+)$/);
    if (calcMatch) {
      const calc = ALL_CALCULATORS.find(({ slug }) => slug === calcMatch[1]);
      if (calc) return [calc.metaTitle || `${calc.name} — Free Online Calculator`, calc.metaDescription || calc.desc];
    }
    const categoryMatch = cleanRoute.match(/^\/category\/([^/]+)$/);
    if (categoryMatch) {
      const category = CATEGORIES.find(({ id }) => id === categoryMatch[1]);
      if (category) return [`${category.name} Calculators`, `Browse free ${category.name.toLowerCase()} calculators. ${category.desc}`];
    }
    const toolMatch = cleanRoute.match(/^\/tools\/([^/]+)$/);
    if (toolMatch) {
      const tool = SEO_LANDING_PAGES.find(({ slug }) => slug === toolMatch[1]);
      if (tool) return [tool.title, tool.description];
    }
    const postMatch = cleanRoute.match(/^\/blog\/([^/]+)$/);
    if (postMatch) {
      const post = blogPosts.find(({ slug }) => slug === postMatch[1]);
      if (post) return [post.title, post.description];
    }
    const generatorMatch = cleanRoute.match(/^\/name-generators\/([^/]+)$/);
    if (generatorMatch && generatorNames[generatorMatch[1]]) {
      const name = generatorNames[generatorMatch[1]];
      return [`${name} — Free Online Tool`, `Use our free ${name.toLowerCase()} to explore options and generate ideas instantly.`];
    }
    return staticPages[cleanRoute] || ['Calculators Point', 'Free online calculators for finance, health, math, education, and everyday life.'];
  };
  for (const route of urls) metadata[route] = routeTitle(route);
  const modified = new Date().toISOString().slice(0, 10);
  const entries = [...urls].map((route) => `  <url><loc>${base}${route}</loc><lastmod>${modified}</lastmod></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  await mkdir(path.join(root, 'public'), { recursive: true });
  await writeFile(path.join(root, 'public', 'sitemap.xml'), xml, 'utf8');
  await writeFile(path.join(root, 'public', 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`, 'utf8');
  await writeFile(path.join(root, 'public', 'routes.json'), JSON.stringify([...urls]), 'utf8');
  await writeFile(path.join(root, 'public', 'seo-meta.json'), JSON.stringify(metadata), 'utf8');
  await writeFile(path.join(root, 'src', 'data', 'calculatorCount.ts'), `/* Generated by scripts/generate-static-seo.mjs. Do not edit by hand. */\nexport const CALC_COUNT_LABEL = '${LIVE_CALC_COUNT}+';\n`, 'utf8');
  const catalog = ALL_CALCULATORS.map(({ id, slug, name, desc, cat, icon, popular, isNew, keywords, tags }) => ({
    id, slug, name, desc: desc || '', cat, icon, popular, isNew, keywords, tags,
  }));
  const catalogSource = `/* Generated by scripts/generate-static-seo.mjs. Do not edit by hand. */
export interface CalculatorCatalogEntry {
  id: string; slug: string; name: string; desc: string; cat: string; icon?: string;
  popular?: boolean; isNew?: boolean; keywords?: string[]; tags?: string[];
}
export const ALL_CALCULATORS: CalculatorCatalogEntry[] = ${JSON.stringify(catalog)};
export const BY_CATEGORY: Record<string, CalculatorCatalogEntry[]> = ALL_CALCULATORS.reduce((groups, calc) => {
  (groups[calc.cat] ||= []).push(calc);
  return groups;
}, {} as Record<string, CalculatorCatalogEntry[]>);
export const POPULAR = ALL_CALCULATORS.filter((calc) => calc.popular);
export const NEW_CALCS = ALL_CALCULATORS.filter((calc) => calc.isNew);
`;
  await writeFile(path.join(root, 'src', 'data', 'calculatorCatalog.ts'), catalogSource, 'utf8');
  console.log(`Generated sitemap.xml with ${urls.size} routes and robots.txt`);
} finally {
  await vite.close();
}
