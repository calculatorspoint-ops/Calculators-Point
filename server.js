import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const isProduction = !process.argv.includes('--dev');
const isVercel = Boolean(process.env.VERCEL);

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  const forceHttps = process.env.FORCE_HTTPS === 'true' || (isProduction && process.env.FORCE_HTTPS !== 'false');
  if (forceHttps && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(308, `https://${req.get('host')}${req.originalUrl}`);
  }
  next();
});

const submissions = new Map();
const allowedTypes = new Set(['bug', 'suggestion', 'accuracy', 'general', 'business']);

app.get('/api/contact', (_req, res) => res.json({ version: 'node-rest-api', status: 'ok' }));
app.post('/api/contact', async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Invalid request' });
    const { name, email, type, subject, message, companyWebsite } = body;
    if (typeof companyWebsite === 'string' && companyWebsite.trim()) return res.json({ success: true });

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedSubject = typeof subject === 'string' ? subject.trim() : '';
    const normalizedMessage = typeof message === 'string' ? message.trim() : '';
    if (!normalizedName || !normalizedEmail || !allowedTypes.has(type) || !normalizedMessage) {
      return res.status(400).json({ error: 'Please complete all required fields with valid values.' });
    }
    if (normalizedName.length > 100 || normalizedEmail.length > 254 || normalizedSubject.length > 160 || normalizedMessage.length > 5000 || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please check the field lengths and email address.' });
    }
    if (normalizedMessage.length < 20) return res.status(400).json({ error: 'Message must be at least 20 characters' });
    const origin = req.get('origin');
    const host = req.get('x-forwarded-host') || req.get('host');
    if (origin && host) {
      try { if (new URL(origin).host !== host) return res.status(403).json({ error: 'Invalid request origin.' }); }
      catch { return res.status(403).json({ error: 'Invalid request origin.' }); }
    }

    const now = Date.now();
    const address = req.ip || 'unknown';
    const bucket = submissions.get(address);
    if (!bucket || bucket.resetAt <= now) submissions.set(address, { count: 1, resetAt: now + 600_000 });
    else if (bucket.count >= 5) return res.status(429).json({ error: 'Too many messages. Please try again later.' });
    else bucket.count++;
    if (submissions.size > 5000) for (const [key, value] of submissions) if (value.resetAt <= now) submissions.delete(key);

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!projectId || !apiKey) return res.status(500).json({ error: 'Server configuration error' });
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/contact_messages?key=${apiKey}`;
    const doc = { fields: {
      name: { stringValue: normalizedName }, email: { stringValue: normalizedEmail }, type: { stringValue: type },
      subject: { stringValue: normalizedSubject }, message: { stringValue: normalizedMessage },
      submittedAt: { timestampValue: new Date().toISOString() }, status: { stringValue: 'unread' },
    } };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let firestoreResponse;
    try {
      firestoreResponse = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc), signal: controller.signal });
    } finally { clearTimeout(timeout); }
    if (!firestoreResponse.ok) return res.status(500).json({ error: 'Failed to save message' });
    const result = await firestoreResponse.json();
    return res.json({ success: true, id: result.name?.split('/').pop() || 'unknown' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error && error.name === 'AbortError' ? 'Request timed out' : 'Failed to submit. Please try again.' });
  }
});

app.get('/api/og', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'og-image.png')));
const indexNowKey = 'b21dafd8307e48edbbeea8902e9e6a6d';
const indexNowHost = 'calculatorspoint.com';
const submitIndexNow = async (urls) => {
  const errors = [];
  for (let i = 0; i < urls.length; i += 10_000) {
    const batch = urls.slice(i, i + 10_000);
    try {
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: indexNowHost, key: indexNowKey, keyLocation: `https://${indexNowHost}/${indexNowKey}.txt`, urlList: batch }),
      });
      if (!response.ok) errors.push(`IndexNow HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
    } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  }
  return { submitted: urls.length, batches: Math.ceil(urls.length / 10_000), errors };
};
app.get('/api/indexnow', async (req, res) => {
  const sitemapDir = isVercel ? 'public' : isProduction ? 'dist' : 'public';
  const xml = await readFile(path.join(__dirname, sitemapDir, 'sitemap.xml'), 'utf8').catch(() => '');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (req.query.all !== 'true') return res.json({ message: 'Add ?all=true to submit all sitemap URLs to Bing IndexNow', keyFile: `https://${indexNowHost}/${indexNowKey}.txt`, totalUrls: urls.length });
  const result = await submitIndexNow(urls);
  res.status(result.errors.length ? 207 : 200).json({ success: result.errors.length === 0, ...result, timestamp: new Date().toISOString() });
});
app.post('/api/indexnow', async (req, res) => {
  if (!Array.isArray(req.body?.urls) || req.body.urls.length === 0 || req.body.urls.length > 10_000) return res.status(400).json({ error: 'Body must contain between 1 and 10,000 URLs.' });
  const urls = req.body.urls;
  if (urls.some((url) => { try { const parsed = new URL(url); return !['http:', 'https:'].includes(parsed.protocol) || ![indexNowHost, `www.${indexNowHost}`].includes(parsed.hostname); } catch { return true; } })) return res.status(400).json({ error: 'Only Calculators Point URLs can be submitted.' });
  const result = await submitIndexNow(urls);
  res.status(result.errors.length ? 207 : 200).json({ success: result.errors.length === 0, ...result, timestamp: new Date().toISOString() });
});

if (isProduction && !isVercel) {
  app.use(express.static(path.join(__dirname, 'dist'), {
    index: false,
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  }));
  const routesPath = path.join(__dirname, 'dist', 'routes.json');
  const knownRoutes = new Set(JSON.parse(await readFile(routesPath, 'utf8').catch(() => '[]')));
  app.use((req, res) => {
    const route = req.path.replace(/\/$/, '') || '/';
    const known = knownRoutes.has(route);
    const routeHtml = known
      ? path.join(__dirname, 'dist', ...route.split('/').filter(Boolean), 'index.html')
      : path.join(__dirname, 'dist', 'index.html');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.status(known ? 200 : 404).sendFile(routeHtml);
  });
} else if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  const routesPath = path.join(__dirname, 'public', 'routes.json');
  const knownRoutes = new Set(JSON.parse(await readFile(routesPath, 'utf8').catch(() => '[]')));
  app.use(async (req, res, next) => {
    const route = req.path.replace(/\/$/, '') || '/';
    const isPageNavigation = req.get('accept')?.includes('text/html') && !path.extname(req.path);
    if (isPageNavigation && !knownRoutes.has(route)) {
      const template = await readFile(path.join(__dirname, 'index.html'), 'utf8');
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      return res.status(404).type('html').send(html);
    }
    next();
  });
  app.use(vite.middlewares);
}

if (!isVercel) {
  app.listen(port, '0.0.0.0', () => console.log(`Calculators Point running on http://localhost:${port}`));
}

export default app;
