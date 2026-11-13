import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const routes = JSON.parse(await readFile(path.join(dist, 'routes.json'), 'utf8'));
const metadata = JSON.parse(await readFile(path.join(dist, 'seo-meta.json'), 'utf8'));
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
  const page = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)} | Calculators Point</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace('</head>', [
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
      '<meta property="og:type" content="website" />',
      `<meta property="og:title" content="${escapeHtml(title)} | Calculators Point" />`,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
      `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
      `<meta property="og:image" content="${site}/og-image.png" />`,
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:title" content="${escapeHtml(title)} | Calculators Point" />`,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    ].join('\n    ') + '\n  </head>');

  const routeDir = path.join(dist, ...route.split('/').filter(Boolean));
  await mkdir(routeDir, { recursive: true });
  await writeFile(path.join(routeDir, 'index.html'), page, 'utf8');
}

await rm(path.join(dist, 'seo-meta.json'), { force: true });
console.log(`Generated route-specific metadata for ${routes.length} pages.`);
