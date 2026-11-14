import React, { lazy, Suspense, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Helmet } from 'react-helmet-async';
import { ClientProviders } from './app-shell';
import { SITE_URL } from './config/site';
import './styles/globals.css';
import './styles/index.css';
import './styles/name-generators.css';
import './styles/mobile.css';
import './styles/mobile-overflow-killer.css';
import './styles/calculator-layout-fix.css';
import './styles/redesign.css';

type Page = ComponentType<any>;
const lazyPage = (load: () => Promise<{ default: Page }>) => lazy(load);
const pages: Record<string, Page> = {
  home: lazyPage(() => import('./views/Home')),
  calculator: lazyPage(() => import('./views/Calculator')),
  category: lazyPage(() => import('./views/Category')),
  calculators: lazyPage(() => import('./views/AllCalculators')),
  cheatSheets: lazyPage(() => import('./views/CheatSheets')),
  nameGeneratorIndex: lazyPage(() => import('./views/NameGenerators')),
  seoLanding: lazyPage(() => import('./views/SEOLandingPage')),
  blog: lazyPage(() => import('./views/Blog')),
  about: lazyPage(() => import('./views/About')),
  contact: lazyPage(() => import('./views/Contact')),
  privacy: lazyPage(() => import('./views/PrivacyPolicy')),
  terms: lazyPage(() => import('./views/TermsOfService')),
  cookies: lazyPage(() => import('./views/CookiePolicy')),
  disclaimer: lazyPage(() => import('./views/Disclaimer')),
  sitemap: lazyPage(() => import('./views/Sitemap')),
  ecosystem: lazyPage(() => import('./routes/ecosystem-client')),
  search: lazyPage(() => import('./routes/search-client')),
  names: lazyPage(() => import('./routes/name-generators/BabyNameGeneratorClient')),
  businessNames: lazyPage(() => import('./routes/name-generators/BusinessNameClient')),
  brandNames: lazyPage(() => import('./routes/name-generators/BrandNameClient')),
  domainNames: lazyPage(() => import('./routes/name-generators/DomainNameClient')),
  appNames: lazyPage(() => import('./routes/name-generators/AppNameClient')),
  youtubeNames: lazyPage(() => import('./routes/name-generators/YouTubeNameClient')),
  instagramNames: lazyPage(() => import('./routes/name-generators/InstagramNameClient')),
  islamicNames: lazyPage(() => import('./routes/name-generators/IslamicNamesClient')),
  notFound: lazyPage(() => import('./views/NotFound')),
};

function resolvePage(path: string): Page {
  if (path === '/' || path === '/pt-br') return pages.home;
  if (/^\/(pt-br\/)?calculator\/[^/]+\/?$/.test(path)) return pages.calculator;
  if (/^\/(pt-br\/)?category\/[^/]+\/?$/.test(path)) return pages.category;
  if (/^\/(calculators|pt-br\/calculators)\/?$/.test(path)) return pages.calculators;
  if (/^\/ecosystem\/[^/]+\/?$/.test(path)) return pages.ecosystem;
  if (/^\/search\/?$/.test(path)) return pages.search;
  if (/^\/(about|pt-br\/about)\/?$/.test(path)) return pages.about;
  if (/^\/(contact|pt-br\/contact)\/?$/.test(path)) return pages.contact;
  if (/^\/(privacy-policy|pt-br\/privacy-policy)\/?$/.test(path)) return pages.privacy;
  if (/^\/(terms-of-service|pt-br\/terms-of-service)\/?$/.test(path)) return pages.terms;
  if (/^\/(cookie-policy|pt-br\/cookie-policy)\/?$/.test(path)) return pages.cookies;
  if (/^\/(disclaimer|pt-br\/disclaimer)\/?$/.test(path)) return pages.disclaimer;
  if (/^\/sitemap\/?$/.test(path)) return pages.sitemap;
  if (/^\/cheat-sheets\/?$/.test(path)) return pages.cheatSheets;
  if (/^\/blog(?:\/[^/]+)?\/?$/.test(path)) return pages.blog;
  if (/^\/name-generators\/?$/.test(path)) return pages.nameGeneratorIndex;
  const generators: Record<string, Page> = {
    'baby-name-generator': pages.names, 'business-name-generator': pages.businessNames,
    'brand-name-generator': pages.brandNames, 'domain-name-generator': pages.domainNames,
    'app-name-generator': pages.appNames, 'youtube-channel-name-generator': pages.youtubeNames,
    'instagram-username-generator': pages.instagramNames, 'islamic-baby-names': pages.islamicNames,
  };
  const nameMatch = path.match(/^\/name-generators\/([^/]+)\/?$/);
  if (nameMatch && generators[nameMatch[1]]) return generators[nameMatch[1]];
  if (/^\/tools\/[^/]+\/?$/.test(path)) return pages.seoLanding;
  return pages.notFound;
}

function RouteLoadingFallback({ title }: { title: string }) {
  return (
    <section className="route-loading" role="status" aria-label={`Preparing ${title}`}>
      <span className="sr-only">Preparing {title}…</span>
      <div className="route-loading-banner" aria-hidden="true">
        <i className="route-loading-title" />
        <i className="route-loading-copy" />
        <div><i /><i /></div>
      </div>
      <div className="route-loading-card" aria-hidden="true">
        <i className="route-loading-heading" />
        <i /><i /><i />
      </div>
    </section>
  );
}

function App() {
  const pathname = window.location.pathname;
  const isPtBr = pathname === '/pt-br' || pathname.startsWith('/pt-br/');
  React.useEffect(() => { document.documentElement.lang = isPtBr ? 'pt-BR' : 'en'; }, [isPtBr]);
  const Page = resolvePage(pathname);
  const match = pathname.match(/^\/(?:tools|blog|calculator|category|ecosystem)\/([^/]+)/);
  const pageSlug = match ? decodeURIComponent(match[1]) : undefined;
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  const pageTitle = pageSlug ? pageSlug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') : ({
    '/': 'Free Online Calculators', '/calculators': 'All Calculators', '/cheat-sheets': 'Calculator Cheat Sheets',
    '/about': 'About Calculators Point', '/contact': 'Contact', '/privacy-policy': 'Privacy Policy',
    '/terms-of-service': 'Terms of Service', '/cookie-policy': 'Cookie Policy', '/disclaimer': 'Disclaimer',
    '/blog': 'Guides and Insights', '/name-generators': 'Name Generators', '/sitemap': 'Sitemap',
  } as Record<string, string>)[cleanPath] || 'Calculators Point';
  // The build prerenders route-specific metadata into each page's HTML. Read it
  // before React mounts so Helmet does not replace useful calculator titles and
  // descriptions with the same generic values on every route during hydration.
  const title = document.title || `${pageTitle} | Calculators Point`;
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content')
    || 'Free online calculators for finance, health, math, education, and everyday life. Fast, accurate, and private.';
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')
    || `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || title;
  const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || description;
  return <HelmetProvider><Helmet><title>{title}</title><meta name="description" content={description} /><link rel="canonical" href={canonical} /><meta property="og:title" content={ogTitle} /><meta property="og:description" content={ogDescription} /><meta property="og:image" content={`${SITE_URL}/og-image.png`} /><meta name="twitter:card" content="summary_large_image" /></Helmet><ClientProviders><Suspense fallback={<RouteLoadingFallback title={pageTitle} />}><Page slug={pageSlug} /></Suspense></ClientProviders></HelmetProvider>;
}

// The build emits a visible route-specific HTML fallback for crawlers and
// visitors without JavaScript. The hydrated app replaces that content.
document.getElementById('seo-fallback')?.remove();
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.warn('Offline support could not be enabled.', error);
    });
  }, { once: true });
}
