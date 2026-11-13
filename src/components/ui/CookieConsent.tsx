'use client';

import { useEffect, useState } from 'react';
import Link from '@/compat/link';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    __cpAnalyticsConfigured?: boolean;
  }
}

const CONSENT_KEY = 'cp_cookie_consent';
const GA_ID = 'G-RZ1T9JVXMV';
const ADSENSE_ID = 'ca-pub-5164672592255197';

function loadOptionalScripts() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function (...args: unknown[]) { window.dataLayer.push(args); };
  window.gtag('consent', 'update', {
    analytics_storage: 'granted', ad_storage: 'granted',
    ad_user_data: 'granted', ad_personalization: 'granted',
  });

  if (!document.getElementById('cp-ga4-script')) {
    const script = document.createElement('script');
    script.id = 'cp-ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.onload = () => {
      if (!window.__cpAnalyticsConfigured) {
        window.gtag('js', new Date());
        window.gtag('config', GA_ID, { send_page_view: true });
        window.__cpAnalyticsConfigured = true;
      }
    };
    document.head.appendChild(script);
  }

  if (!document.getElementById('cp-adsense-script')) {
    const script = document.createElement('script');
    script.id = 'cp-adsense-script';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`;
    document.head.appendChild(script);
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored === 'accepted') loadOptionalScripts();
      if (!stored) setVisible(true);
    } catch {
      // If storage is unavailable, ask each visit and keep optional scripts off by default.
      setVisible(true);
    }
    const openPreferences = () => setVisible(true);
    window.addEventListener('cookie-preferences:open', openPreferences);
    return () => window.removeEventListener('cookie-preferences:open', openPreferences);
  }, []);

  const choose = (accepted: boolean) => {
    let previouslyAccepted = false;
    try {
      previouslyAccepted = localStorage.getItem(CONSENT_KEY) === 'accepted';
      localStorage.setItem(CONSENT_KEY, accepted ? 'accepted' : 'declined');
    } catch { /* storage may be disabled */ }
    if (accepted) loadOptionalScripts();
    else {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function (...args: unknown[]) { window.dataLayer.push(args); };
      window.gtag('consent', 'update', {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied',
      });
      document.getElementById('cp-ga4-script')?.remove();
      document.getElementById('cp-adsense-script')?.remove();
      if (previouslyAccepted) {
        window.location.reload();
        return;
      }
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <section
      role="dialog"
      aria-label="Cookie and analytics preferences"
      aria-modal="false"
      style={{
        position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 9999,
        maxWidth: 560, margin: '0 auto', padding: 18,
        background: '#fff', color: '#1e293b', border: '1px solid #cbd5e1',
        borderRadius: 16, boxShadow: '0 8px 32px rgba(15,23,42,.18)',
      }}
    >
      <p style={{ fontSize: 14, lineHeight: 1.65, margin: '0 0 8px' }}>
        <strong>Privacy preferences</strong><br />
        Optional Google Analytics and Google AdSense load only if you accept. Your calculator inputs stay in your browser. See our{' '}
        <Link href="/cookie-policy" style={{ color: '#17483f', textDecoration: 'underline' }}>Cookie Policy</Link> and{' '}
        <Link href="/privacy-policy" style={{ color: '#17483f', textDecoration: 'underline' }}>Privacy Policy</Link>.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        <button type="button" onClick={() => choose(true)} style={{ padding: '9px 16px', background: '#17483f', color: '#fff', border: 0, borderRadius: 9, fontWeight: 700, cursor: 'pointer' }}>
          Accept optional
        </button>
        <button type="button" onClick={() => choose(false)} style={{ padding: '9px 16px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #94a3b8', borderRadius: 9, fontWeight: 700, cursor: 'pointer' }}>
          Necessary only
        </button>
      </div>
    </section>
  );
}
