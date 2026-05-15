import { redis } from './redis';

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  // Eski kayıtları temizle
  await redis.zremrangebyscore(key, 0, windowStart);
  
  // Mevcut istek sayısı
  const currentCount = await redis.zcard(key);
  
  if (currentCount >= limit) {
    // En eski isteğin ne zaman olduğunu bul
    const oldest = await redis.zrange(key, 0, 0, { withScores: true });
    let reset = now + windowSeconds;
    
    if (oldest && oldest.length > 0) {
      const oldestItem = oldest[0];
      if (oldestItem && typeof oldestItem === 'object' && 'score' in oldestItem) {
        const score = oldestItem.score;
        if (typeof score === 'number') {
          reset = score + windowSeconds;
        }
      }
    }
    
    return {
      success: false,
      remaining: 0,
      reset,
    };
  }
  
  // Yeni isteği ekle
  const member = `${now}-${Math.random().toString(36).substring(2, 10)}`;
  await redis.zadd(key, { score: now, member: member });
  await redis.expire(key, windowSeconds);
  
  return {
    success: true,
    remaining: limit - (currentCount + 1),
    reset: now + windowSeconds,
  };
}