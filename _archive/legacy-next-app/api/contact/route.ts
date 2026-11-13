/**
 * POST /api/contact — v3 (REST API + AbortController timeout)
 *
 * Server-side API route for contact form submissions.
 * Uses the Firestore REST API directly (no Firebase SDK).
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10; // Vercel function timeout
const submissions = new Map<string, { count: number; resetAt: number }>();
const allowedTypes = new Set(['bug', 'suggestion', 'accuracy', 'general', 'business']);

// GET endpoint to verify which version is deployed
export async function GET() {
  return NextResponse.json({ version: 'v3-rest-api', status: 'ok' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { name, email, type, subject, message, companyWebsite } = body;

    // Honeypot submissions receive a success response without being stored.
    if (typeof companyWebsite === 'string' && companyWebsite.trim()) {
      return NextResponse.json({ success: true });
    }

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedSubject = typeof subject === 'string' ? subject.trim() : '';
    const normalizedMessage = typeof message === 'string' ? message.trim() : '';

    if (!normalizedName || !normalizedEmail || !allowedTypes.has(type) || !normalizedMessage) {
      return NextResponse.json(
        { error: 'Please complete all required fields with valid values.' },
        { status: 400 }
      );
    }

    if (normalizedName.length > 100 || normalizedEmail.length > 254 || normalizedSubject.length > 160 || normalizedMessage.length > 5000 || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Please check the field lengths and email address.' }, { status: 400 });
    }
    if (normalizedMessage.length < 20) {
      return NextResponse.json(
        { error: 'Message must be at least 20 characters' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin');
    const forwardedHost = request.headers.get('x-forwarded-host');
    const requestHost = forwardedHost || request.headers.get('host');
    if (origin && requestHost) {
      try {
        if (new URL(origin).host !== requestHost) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
      } catch {
        return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
      }
    }

    const now = Date.now();
    const address = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const bucket = submissions.get(address);
    if (!bucket || bucket.resetAt <= now) submissions.set(address, { count: 1, resetAt: now + 10 * 60_000 });
    else if (bucket.count >= 5) return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
    else bucket.count++;
    if (submissions.size > 5000) {
      for (const [key, value] of submissions) if (value.resetAt <= now) submissions.delete(key);
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      console.error('Firebase config missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Firestore REST API URL
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/contact_messages?key=${apiKey}`;

    const firestoreDoc = {
      fields: {
        name:        { stringValue: normalizedName },
        email:       { stringValue: normalizedEmail },
        type:        { stringValue: type },
        subject:     { stringValue: normalizedSubject },
        message:     { stringValue: normalizedMessage },
        submittedAt: { timestampValue: new Date().toISOString() },
        status:      { stringValue: 'unread' },
      },
    };

    // Abort after 8 seconds to avoid Vercel function hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(firestoreUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firestoreDoc),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error('Firestore REST error status:', res.status);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    const result = await res.json();
    const docId = result.name?.split('/').pop() || 'unknown';

    return NextResponse.json({ success: true, id: docId });
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error('Contact form request failed');
    return NextResponse.json(
      { error: isTimeout ? 'Request timed out' : 'Failed to submit. Please try again.' },
      { status: 500 }
    );
  }
}
