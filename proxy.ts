import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

function getIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0];
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const ip = getIp(request);
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (record.count >= MAX_REQUESTS) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  record.count++;
  rateLimit.set(ip, record);
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};