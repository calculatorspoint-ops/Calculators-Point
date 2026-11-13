'use client';
import dynamic from '@/compat/dynamic';
const Contact = dynamic(() => import('@/views/Contact'));
export default function ContactClient() { return <Contact />; }
