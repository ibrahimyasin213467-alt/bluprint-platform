import { redis } from '@/app/lib/redis';

const WINDOW_SEC = 5 * 60;
const MAX_REQUESTS = 10;

async function checkKey(key: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - WINDOW_SEC;

  const pipe = redis.pipeline();
  pipe.zremrangebyscore(key, 0, windowStart);
  pipe.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  pipe.zcard(key);
  pipe.expire(key, WINDOW_SEC);

  const results = await pipe.exec();
  const count = results[2] as number;

  if (count > MAX_REQUESTS) {
    const oldest = await redis.zrange(key, 0, 0, { withScores: true });
    const retryAfter = oldest.length
      ? Math.ceil((Number(oldest[1]) + WINDOW_SEC) - now)
      : WINDOW_SEC;
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

export async function checkRateLimit(
  ip: string,
  wallet: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const [ipResult, walletResult] = await Promise.all([
    checkKey(`rl:ip:${ip}`),
    checkKey(`rl:wallet:${wallet}`),
  ]);

  if (!ipResult.allowed) return ipResult;
  if (!walletResult.allowed) return walletResult;

  return { allowed: true };
}