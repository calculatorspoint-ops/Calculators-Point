'use client';
import dynamic from '@/compat/dynamic';
const Terms = dynamic(() => import('@/views/TermsOfService'));
export default function TermsClient() { return <Terms />; }
