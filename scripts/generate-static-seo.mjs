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
  const [{ INDEXABLE_CALCULATORS, ALL_CALCULATORS, CATEGORIES, LIVE_CALC_COUNT, getRelatedCalcs }, { SEO_LANDING_PAGES }, { getPublishedPosts }, { getPtBrCalcAsync }, { UI_PT_BR }, { STATIC_PAGES_PT_BR }] = await Promise.all([
    vite.ssrLoadModule('/src/data/calculatorConfigs.ts'),
    vite.ssrLoadModule('/src/data/seoLandingData.ts'),
    vite.ssrLoadModule('/src/data/blogPosts.ts'),
    vite.ssrLoadModule('/src/data/pt-br/index.ts'),
    vite.ssrLoadModule('/src/data/pt-br/ui.ts'),
    vite.ssrLoadModule('/src/data/pt-br/static-pages.ts'),
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
  for (const route of [...urls]) {
    const translatedCalc = route.match(/^\/pt-br\/calculator\/([^/]+)$/);
    if (translatedCalc && !(await getPtBrCalcAsync(translatedCalc[1]))) urls.delete(route);
  }
  const metadata = {};
  const seoContent = {};
  const localizedPairs = new Set();
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
  const ecosystems = {
    education: {
      title: 'Free Education Calculators for GPA, Grades & Exams',
      description: 'Plan grades, GPA, attendance, IELTS and exam targets with free education calculators for students.',
      heading: 'Education Calculator Suite',
      intro: 'Plan academic goals with connected tools for GPA, grades, attendance and international exams. Compare your current results with the scores you need next.',
    },
    finance: {
      title: 'Free Finance Calculators for Loans, Savings & Investing',
      description: 'Compare loan payments, investment growth, savings and income with free finance calculators.',
      heading: 'Finance & Money Suite',
      intro: 'Explore connected calculators for loan payments, mortgages, investments, savings, tax and income. See how monthly decisions affect long-term totals.',
    },
    fitness: {
      title: 'Free Fitness Calculators for BMI, Calories & Nutrition',
      description: 'Estimate BMI, calories, body composition and nutrition with free fitness calculators and clear health disclaimers.',
      heading: 'Fitness Calculator Suite',
      intro: 'Use connected fitness and health calculators to estimate BMI, calorie needs, body composition and nutrition. Results are educational estimates, not a medical diagnosis.',
    },
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
    const ecosystemMatch = cleanRoute.match(/^\/ecosystem\/([^/]+)$/);
    if (ecosystemMatch && ecosystems[ecosystemMatch[1]]) {
      const ecosystem = ecosystems[ecosystemMatch[1]];
      return [ecosystem.title, ecosystem.description];
    }
    return staticPages[cleanRoute] || ['Calculators Point', 'Free online calculators for finance, health, math, education, and everyday life.'];
  };
  for (const route of urls) {
    const cleanRoute = route.replace(/^\/pt-br(?=\/|$)/, '') || '/';
    const calcMatch = cleanRoute.match(/^\/calculator\/([^/]+)$/);
    const calc = calcMatch ? ALL_CALCULATORS.find(({ slug }) => slug === calcMatch[1]) : null;
    const isPtBr = route === '/pt-br' || route.startsWith('/pt-br/');
    let localizedCalc = null;
    if (isPtBr && calc) localizedCalc = await getPtBrCalcAsync(calc.slug);
    if (isPtBr && calc && localizedCalc) {
      metadata[route] = [localizedCalc.metaTitle || `${localizedCalc.name} — Calculadora Online Grátis`, localizedCalc.metaDescription || localizedCalc.desc];
      localizedPairs.add(route);
    } else if (isPtBr && cleanRoute.startsWith('/category/')) {
      const category = CATEGORIES.find(({ id }) => cleanRoute === `/category/${id}`);
      const label = category ? UI_PT_BR.categories[category.id] || category.name : 'Calculadoras';
      metadata[route] = [`Calculadoras de ${label} — Calculators Point`, `Explore calculadoras online gratuitas de ${label.toLowerCase()} para uso rápido e fácil.`];
      localizedPairs.add(route);
    } else if (isPtBr && cleanRoute === '/') {
      metadata[route] = ['Calculadoras Online Gratuitas — Calculators Point', 'Calculadoras gratuitas para finanças, saúde, matemática, educação e tarefas do dia a dia.'];
      localizedPairs.add(route);
    } else if (isPtBr && cleanRoute === '/calculators') {
      metadata[route] = ['Todas as Calculadoras — Calculators Point', 'Encontre calculadoras gratuitas para finanças, saúde, matemática, educação e muito mais.'];
      localizedPairs.add(route);
    } else if (isPtBr && ['/about','/contact','/privacy-policy','/terms-of-service','/disclaimer','/cookie-policy'].includes(cleanRoute)) {
      const key = ({ '/privacy-policy': 'privacyPolicy', '/terms-of-service': 'termsOfService', '/cookie-policy': 'cookiePolicy' })[cleanRoute] || cleanRoute.slice(1);
      const translatedPage = STATIC_PAGES_PT_BR[key]?.meta;
      if (translatedPage) {
        metadata[route] = [translatedPage.title, translatedPage.description];
        localizedPairs.add(route);
      } else {
        urls.delete(route);
        continue;
      }
    } else {
      metadata[route] = routeTitle(route);
    }

    const landing = cleanRoute.startsWith('/tools/') ? SEO_LANDING_PAGES.find(({ slug }) => cleanRoute === `/tools/${slug}`) : null;
    const post = cleanRoute.startsWith('/blog/') ? blogPosts.find(({ slug }) => cleanRoute === `/blog/${slug}`) : null;
    const category = cleanRoute.startsWith('/category/') ? CATEGORIES.find(({ id }) => cleanRoute === `/category/${id}`) : null;
    const ecosystem = cleanRoute.startsWith('/ecosystem/') ? ecosystems[cleanRoute.split('/')[2]] : null;
    const heading = localizedCalc?.name || calc?.name || landing?.h1 || post?.title || ecosystem?.heading || (category ? (isPtBr ? UI_PT_BR.categories[category.id] || category.name : category.name) + ' Calculators' : metadata[route][0]);
    const categoryLabel = category ? (isPtBr ? UI_PT_BR.categories[category.id] || category.name : category.name) : '';
    const intro = localizedCalc?.intro || localizedCalc?.desc || calc?.intro || calc?.desc || landing?.content?.intro || landing?.description || post?.excerpt || ecosystem?.intro || (category ? (isPtBr ? `Explore calculadoras gratuitas de ${categoryLabel.toLowerCase()} para tarefas do dia a dia, estudos e planejamento.` : category.desc) : metadata[route][1]);
    const relatedCalculators = calc ? await Promise.all(getRelatedCalcs(calc, 6).map(async (related) => {
      const translated = isPtBr ? await getPtBrCalcAsync(related.slug) : null;
      return isPtBr && !translated ? null : {
        path: `${isPtBr ? '/pt-br' : ''}/calculator/${related.slug}`,
        label: translated?.name || related.name,
      };
    })) : [];
    seoContent[route] = {
      heading,
      intro,
      formula: isPtBr ? localizedCalc?.formula || '' : calc?.formula || '',
      example: (isPtBr ? localizedCalc?.workedExample : calc?.workedExample)
        ? { title: (isPtBr ? localizedCalc.workedExample : calc.workedExample).title, steps: (isPtBr ? localizedCalc.workedExample : calc.workedExample).steps, result: (isPtBr ? localizedCalc.workedExample : calc.workedExample).result }
        : null,
      sources: localizedCalc?.sources || calc?.sources || [],
      links: calc ? relatedCalculators.filter(Boolean) : category ? (await Promise.all(INDEXABLE_CALCULATORS.filter(item => item.cat === category.id).map(async item => {
        const translated = isPtBr ? await getPtBrCalcAsync(item.slug) : null;
        return isPtBr && !translated ? null : { path: `${isPtBr ? '/pt-br' : ''}/calculator/${item.slug}`, label: translated?.name || item.name };
      }))).filter(Boolean).slice(0, 12) : [],
      categoryLink: calc ? {
        path: `${isPtBr ? '/pt-br' : ''}/category/${calc.cat}`,
        label: `${CATEGORIES.find(({ id }) => id === calc.cat)?.name || 'All'} calculators`,
      } : null,
    };
    if (isPtBr && localizedCalc) localizedPairs.add(route);
  }
  // Do not claim every URL changed on each build. Add per-page lastmod only
  // when a reliable content-update timestamp is available.
  // Site search is useful to visitors but is a thin index target. Keep its
  // static route available while excluding it from search indexing and sitemap.
  const indexableUrls = [...urls].filter((route) => route !== '/search');
  const entries = indexableUrls.map((route) => `  <url><loc>${base}${route}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  await mkdir(path.join(root, 'public'), { recursive: true });
  await writeFile(path.join(root, 'public', 'sitemap.xml'), xml, 'utf8');
  await writeFile(path.join(root, 'public', 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`, 'utf8');
  await writeFile(path.join(root, 'public', 'routes.json'), JSON.stringify([...urls]), 'utf8');
  await writeFile(path.join(root, 'public', 'seo-meta.json'), JSON.stringify(metadata), 'utf8');
  await writeFile(path.join(root, 'public', 'seo-content.json'), JSON.stringify(seoContent), 'utf8');
  await writeFile(path.join(root, 'public', 'seo-localized-pairs.json'), JSON.stringify([...localizedPairs]), 'utf8');
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
