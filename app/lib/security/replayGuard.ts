import { redis } from '@/app/lib/redis';

const TTL_SEC = 60 * 60; // 1 saat

export async function checkRequestId(requestId: string): Promise<boolean> {
  const key = `replay:${requestId}`;
  const result = await redis.set(key, '1', { nx: true, ex: TTL_SEC });
  return result === 'OK';
}