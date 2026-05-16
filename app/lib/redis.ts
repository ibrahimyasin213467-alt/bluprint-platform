import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const KEYS = {
  tokens: 'tokens',
  tokenCount: 'token:count',
  referrals: 'referrals',
  earnings: 'earnings',
  users: 'users',
  boostLeaderboard: 'boost:leaderboard',  // YENİ EKLE
};

// ==================== SLIDING WINDOW RATE LIMITER ====================
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfter?: number;
  resetTime?: number;
}

export async function rateLimitByIP(
  ip: string, 
  limit: number = 20, 
  windowMs: number = 60 * 1000
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const key = `ratelimit:${ip}`;
  
  try {
    // 1. Window dışındaki eski kayıtları temizle
    await redis.zremrangebyscore(key, 0, windowStart);
    
    // 2. Mevcut istek sayısını al
    const count = await redis.zcard(key);
    
    // 3. Limit kontrolü
    if (count >= limit) {
      // En eski kaydın zamanını al (retryAfter için)
      const oldest = await redis.zrange(key, 0, 0, { withScores: true });
      const oldestTimestamp = oldest[0] && typeof oldest[0] === 'object' && 'score' in oldest[0] 
        ? (oldest[0] as { score: string }).score 
        : now;
      const retryAfter = Math.ceil((parseInt(String(oldestTimestamp)) + windowMs - now) / 1000);
      
      return { 
        success: false, 
        limit, 
        remaining: 0, 
        retryAfter: Math.max(1, retryAfter),
        resetTime: parseInt(String(oldestTimestamp)) + windowMs
      };
    }
    
    // 4. Yeni isteği ekle
    await redis.zadd(key, { score: now, member: `${now}:${Math.random().toString(36).slice(2)}` });
    
    // 5. Key'in ömrünü ayarla (window süresi + buffer)
    await redis.expire(key, Math.ceil(windowMs / 1000) + 60);
    
    return { 
      success: true, 
      limit, 
      remaining: limit - (count + 1),
      resetTime: now + windowMs
    };
    
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail-open: hata durumunda rate limit uygulama
    return { success: true, limit, remaining: 0 };
  }
}

// ==================== GÜVENLİ IP DETECTION ====================
export function getClientIp(req: NextRequest): string {
  return (
    // Vercel Forwarded-For (EN GÜVENİLİR)
    req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    
    // Cloudflare Real IP
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    
    // Standart Forwarded-For (güvenilmez, fallback)
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    
    // Local dev fallback
    (process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'unknown')
  ) || 'unknown';
}