/**
 * app/layout.tsx — Root Layout (Next.js App Router)
 *
 * CSS STRATEGY: All CSS imported here as ES module imports so Next.js
 * bundles them and emits parallel <link> tags in the HTML head.
 * CSS @import in globals.css creates serial waterfall; direct imports don't.
 *
 * PERFORMANCE:
 * - Uses system font fallbacks to avoid build-time font downloads and external
 *   font requests; the site uses a fixed light color scheme.
 *
 * OPTIONAL TRACKING: Google Analytics and AdSense are injected by the consent
 * banner only after the visitor accepts optional cookies.
 */
import type { Viewport, Metadata } from 'next';
import './globals.css';
import '../src/styles/index.css';
// calculator-layout-fix.css is now imported in app/(calc-routes)/layout.tsx
// so it only loads on /calculator, /calculators, and /category pages.
import '../src/styles/mobile.css';
import '../src/styles/mobile-overflow-killer.css';
// NOTE: all-calculators.css is imported inside AllCalculators.jsx (page-scoped)
// Do NOT import it here — that would load 8.9KB on every page globally.
import { ClientProviders } from './client-providers';
import { CALC_COUNT_LABEL } from '@/data/calculatorConfigs';

export const viewport: Viewport = {
  themeColor: [
    { color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://calculatorspoint.com'),
  title: {
    // Root default title — uses CALC_COUNT_LABEL (single source of truth, no hardcoding)
    default: `Calculators Point — ${CALC_COUNT_LABEL} Free Online Calculators`,
    template: '%s | Calculators Point',
  },
  description:
    `${CALC_COUNT_LABEL} free online calculators for finance, health, math, education, and everyday life. Fast, accurate, and always free.`,

  authors: [{ name: 'Calculators Point' }],
  creator: 'Calculators Point',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://calculatorspoint.com',
    siteName: 'Calculators Point',
    title: `Calculators Point — ${CALC_COUNT_LABEL} Free Online Calculators`,
    description: `${CALC_COUNT_LABEL} free online calculators for finance, health, math, and everyday life.`,
    images: [{
      url: 'https://calculatorspoint.com/og-image.png',
      width: 1200,
      height: 630,
      alt: `Calculators Point — ${CALC_COUNT_LABEL} Free Online Calculators`,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Calculators Point — ${CALC_COUNT_LABEL} Free Online Calculators`,
    description: `${CALC_COUNT_LABEL} free online calculators for finance, health, math, and everyday life.`,
    images: ['https://calculatorspoint.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ── Google Analytics Consent Mode v2 — MUST run before gtag.js loads ────
            Setting consent defaults BEFORE the gtag.js script fires ensures
            GA4 never collects data before the user has made a choice.
            This is required for Consent Mode v2 (Google's enforcement from 2024).
        ──────────────────────────────────────────────────────────────────────── */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){dataLayer.push(arguments);};
          window.gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
        ` }} />

        {/* ── AdSense site ownership verification ─────────────────────────────────
            Required by Google for AdSense review. Must be in <head> on every page.
        ─────────────────────────────────────────────────────────────────── */}
        <meta name="google-adsense-account" content="ca-pub-5164672592255197" />

        {/* ── Bing Webmaster Tools site ownership verification ─────────────────────
            Option 2 (meta tag) verification — complements the txt file at
            /b21dafd8307e48edbbeea8902e9e6a6d.txt (Option 1).
            See: https://www.bing.com/webmasters
        ─────────────────────────────────────────────────────────────────── */}
        <meta name="msvalidate.01" content="b21dafd8307e48edbbeea8902e9e6a6d" />

        {/* ── Resource hints ────────────────────────────────────────────────────
            REMOVED: self-preconnect to calculatorspoint.com was a no-op that
            Lighthouse flagged as an unnecessary resource hint error.

            preconnect: establishes TCP+TLS to external origins before the
            browser discovers the resource, eliminating connection setup latency.
        ─────────────────────────────────────────────────────────────────── */}

        {/* No analytics or advertising network hints before optional consent. */}
      </head>
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ClientProviders>
          {children}
        </ClientProviders>

      </body>
    </html>
  );
}
