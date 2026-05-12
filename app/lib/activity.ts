import { redis } from './redis';

export type ActivityType = 'token' | 'vip' | 'premium' | 'referral' | 'boost';

export async function addActivity(
  type: ActivityType,
  wallet: string,
  details?: { tokenName?: string; tokenSymbol?: string; amount?: number; rank?: number }
) {
  const activity = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    wallet,
    details: details || {},
    timestamp: Date.now(),
  };

  await redis.lpush('activity:feed', JSON.stringify(activity));
  await redis.ltrim('activity:feed', 0, 99);
}

export async function getActivities(limit: number = 50) {
  const activities = await redis.lrange('activity:feed', 0, limit - 1);
  return activities.map(act => JSON.parse(act)).reverse();
}