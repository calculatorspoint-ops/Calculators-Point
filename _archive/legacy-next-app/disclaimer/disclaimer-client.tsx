'use client';
import dynamic from '@/compat/dynamic';
const Disclaimer = dynamic(() => import('@/views/Disclaimer'));
export default function DisclaimerClient() { return <Disclaimer />; }
