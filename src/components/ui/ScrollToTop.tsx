'use client';
import { useEffect } from 'react';
import { usePathname } from '@/compat/navigation';

/**
 * Scroll to top on every route change.
 * Uses the native scrollTo API — no layout thrash.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
