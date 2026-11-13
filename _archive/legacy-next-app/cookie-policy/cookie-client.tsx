'use client';
import dynamic from '@/compat/dynamic';
const CookiePolicy = dynamic(() => import('@/views/CookiePolicy'));
export default function CookieClient() { return <CookiePolicy />; }
