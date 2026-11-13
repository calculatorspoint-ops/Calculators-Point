'use client';
import dynamic from '@/compat/dynamic';
const Privacy = dynamic(() => import('@/views/PrivacyPolicy'));
export default function PrivacyClient() { return <Privacy />; }
