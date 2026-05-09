import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP, getClientIp } from '@/app/lib/redis';

// Rate limit uygulanacak path'ler
const RATE_LIMIT_PATHS = ['/api/', '/launch', '/create', '/revoke'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Sadece API route'larına rate limit uygula
  if (!RATE_LIMIT_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  const ip = getClientIp(request);
  
  // Farklı endpoint'ler için farklı limitler
  let limit = 20;
  let windowMs = 60 * 1000;
  
  if (pathname === '/api/create-token') {
    limit = 5;  // Token oluşturma: 5 istek/dakika
  } else if (pathname === '/api/claim-referral') {
    limit = 3;  // Claim: 3 istek/dakika
  }
  
  const result = await rateLimitByIP(ip, limit, windowMs);
  
  if (!result.success) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Too many requests. Please slow down.', 
        retryAfter: result.retryAfter 
      },
      {
        status: 429,
        headers: {
          'Retry-After': result.retryAfter?.toString() || '60',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }
  
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Limit', limit.toString());
  
  return response;
}

// Middleware sadece API route'larında çalışsın
export const config = {
  matcher: '/api/:path*',
};