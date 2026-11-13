'use client';
import dynamic from '@/compat/dynamic';
const Sitemap = dynamic(() => import('@/views/Sitemap'));
export default function SitemapClient() { return <Sitemap />; }
