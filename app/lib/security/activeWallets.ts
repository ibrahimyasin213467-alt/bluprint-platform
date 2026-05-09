import { redis } from '@/app/lib/redis';

const LOCK_TTL = 60; // saniye

export async function tryLockWallet(wallet: string): Promise<boolean> {
  const key = `lock:wallet:${wallet}`;
  const result = await redis.set(key, '1', { nx: true, ex: LOCK_TTL });
  return result === 'OK';
}

export async function unlockWallet(wallet: string): Promise<void> {
  await redis.del(`lock:wallet:${wallet}`);
}