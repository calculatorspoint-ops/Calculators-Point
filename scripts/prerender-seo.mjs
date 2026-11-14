import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const routes = JSON.parse(await readFile(path.join(dist, 'routes.json'), 'utf8'));
const metadata = JSON.parse(await readFile(path.join(dist, 'seo-meta.json'), 'utf8'));
const seoContent = JSON.parse(await readFile(path.join(dist, 'seo-content.json'), 'utf8'));
const localizedPairs = new Set(JSON.parse(await readFile(path.join(dist, 'seo-localized-pairs.json'), 'utf8')));
const viteManifest = JSON.parse(await readFile(path.join(dist, '.vite', 'manifest.json'), 'utf8'));
const site = (process.env.SITE_URL || 'https://calculatorspoint.com').replace(/\/$/, '');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

const precache = new Set();
const visitedChunks = new Set();
function addChunk(key) {
  if (!key || visitedChunks.has(key) || !viteManifest[key]) return;
  visitedChunks.add(key);
  const chunk = viteManifest[key];
  if (chunk.file) precache.add(`/${chunk.file}`);
  for (const css of chunk.css || []) precache.add(`/${css}`);
  for (const dependency of chunk.imports || []) addChunk(dependency);
}

addChunk('index.html');
const homeChunk = Object.keys(viteManifest).find((key) => key.endsWith('/views/Home.jsx'));
addChunk(homeChunk);
await writeFile(path.join(dist, 'precache-assets.json'), JSON.stringify([...precache]), 'utf8');

for (const route of routes) {
  const [title, description] = metadata[route] || ['Calculators Point', 'Free online calculators for everyday needs.'];
  const canonical = `${site}${route === '/' ? '' : route}`;
  const isPtBr = route === '/pt-br' || route.startsWith('/pt-br/');
  const language = isPtBr ? 'pt-BR' : 'en';
  const content = seoContent[route] || { heading: title, intro: description };
  const englishRoute = isPtBr ? (route.replace(/^\/pt-br(?=\/|$)/, '') || '/') : route;
  const ptBrRoute = isPtBr ? route : `/pt-br${route === '/' ? '' : route}`;
  const hasTranslation = localizedPairs.has(ptBrRoute);
  const fallbackHtml = `<main id="seo-fallback" style="max-width:960px;margin:24px auto;padding:24px;line-height:1.65;color:#263238"><h1>${escapeHtml(content.heading || title)}</h1><p>${escapeHtml(content.intro || description)}</p>${content.formula ? `<h2>${isPtBr ? 'Fórmula' : 'Formula'}</h2><pre style="white-space:pre-wrap">${escapeHtml(content.formula)}</pre>` : ''}${content.example ? `<h2>${escapeHtml(content.example.title || (isPtBr ? 'Exemplo' : 'Example'))}</h2>${(content.example.steps || []).map(step => `<p>${escapeHtml(step)}</p>`).join('')}${content.example.result ? `<p>${escapeHtml(content.example.result)}</p>` : ''}` : ''}${content.links?.length ? `<nav aria-label="${isPtBr ? 'Calculadoras relacionadas' : 'Related calculators'}"><h2>${isPtBr ? 'Calculadoras relacionadas' : 'Related calculators'}</h2><ul>${content.links.map(link => `<li><a href="${escapeHtml(link.path)}">${escapeHtml(link.label)}</a></li>`).join('')}</ul></nav>` : ''}${content.categoryLink ? `<p><a href="${escapeHtml(content.categoryLink.path)}">Browse ${escapeHtml(content.categoryLink.label)}</a></p>` : ''}${content.sources?.length ? `<section><h2>${isPtBr ? 'Fontes e referências' : 'Sources and references'}</h2><ul>${content.sources.map(source => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a></li>`).join('')}</ul></section>` : ''}</main>`;
  const alternates = hasTranslation ? [
    `<link rel="alternate" hreflang="en" href="${escapeHtml(`${site}${englishRoute === '/' ? '' : englishRoute}`)}" />`,
    `<link rel="alternate" hreflang="pt-BR" href="${escapeHtml(`${site}${ptBrRoute}`)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(`${site}${englishRoute === '/' ? '' : englishRoute}`)}" />`,
  ] : [];
  const page = template
    .replace(/<html lang="[^"]*"/, `<html lang="${language}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)} | Calculators Point</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace('</head>', [
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
      ...(route === '/search' ? ['<meta name="robots" content="noindex,follow" />'] : []),
      ...alternates,
      '<meta property="og:type" content="website" />',
      `<meta property="og:title" content="${escapeHtml(title)} | Calculators Point" />`,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
      `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
      `<meta property="og:image" content="${site}/og-image.png" />`,
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:title" content="${escapeHtml(title)} | Calculators Point" />`,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    ].join('\n    ') + '\n  </head>')
    .replace('<div id="root"></div>', `<div id="root"></div>${fallbackHtml}`);

  const routeDir = path.join(dist, ...route.split('/').filter(Boolean));
  await mkdir(routeDir, { recursive: true });
  await writeFile(path.join(routeDir, 'index.html'), page, 'utf8');
}

await rm(path.join(dist, 'seo-meta.json'), { force: true });
await rm(path.join(dist, 'seo-content.json'), { force: true });
await rm(path.join(dist, 'seo-localized-pairs.json'), { force: true });
await rm(path.join(root, 'public', 'seo-content.json'), { force: true });
await rm(path.join(root, 'public', 'seo-localized-pairs.json'), { force: true });
console.log(`Generated route-specific metadata for ${routes.length} pages.`);
