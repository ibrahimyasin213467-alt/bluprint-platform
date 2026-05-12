// app/lib/activity.ts
import { redis } from './redis';

export type ActivityType = 'token' | 'vip' | 'premium' | 'referral';

export async function addActivity(
  type: ActivityType,
  wallet: string,
  details?: { tokenName?: string; amount?: number; rank?: number }
) {
  const activity = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    wallet,
    details: details || {},
    timestamp: Date.now(),
  };

  // Logu Redis listesine ekle (sağdan)
  await redis.lpush('activity:feed', JSON.stringify(activity));
  // Listeyi 100 aktivite ile sınırla
  await redis.ltrim('activity:feed', 0, 99);
}