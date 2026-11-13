import { useMemo } from 'react';

export function usePathname(): string {
  return typeof window === 'undefined' ? '/' : window.location.pathname;
}

export function useSearchParams(): URLSearchParams {
  return useMemo(() => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search), []);
}

export function useParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const parts = window.location.pathname.split('/').filter(Boolean);
  const index = parts.findIndex((part) => ['calculator', 'tools', 'category', 'ecosystem', 'blog'].includes(part));
  if (index < 0 || !parts[index + 1]) return {};
  const key = parts[index] === 'category' ? (parts[0] === 'pt-br' ? 'cat' : 'catId')
    : parts[index] === 'ecosystem' ? 'ecosystemId' : 'slug';
  return { [key]: decodeURIComponent(parts[index + 1]) };
}

export function useRouter() {
  return {
    push: (href: string) => window.location.assign(href),
    replace: (href: string) => window.location.replace(href),
    back: () => window.history.back(),
    refresh: () => window.location.reload(),
  };
}

export function redirect(href: string): never {
  if (typeof window !== 'undefined') window.location.replace(href);
  throw new Error(`Redirecting to ${href}`);
}

export function notFound(): never {
  throw new Error('Page not found');
}
