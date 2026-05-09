import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

const MILESTONES = [
  { count: 10, bonus: 0.1 },
  { count: 25, bonus: 0.2 },
  { count: 50, bonus: 0.5 },
  { count: 100, bonus: 1.0 },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Wallet required' }, { status: 400 });
  }

  try {
    const earningsKey = `${KEYS.earnings}:${wallet}`;
    const raw = await redis.get(earningsKey);
    const data: { pending: number; claimed: number; referrals: string[]; milestones?: number[] } =
      raw
        ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
        : { pending: 0, claimed: 0, referrals: [], milestones: [] };

    const totalReferrals = data.referrals?.length || 0;
    const claimedMilestones = data.milestones || [];

    const milestoneInfo = MILESTONES.map((m) => ({
      count: m.count,
      bonus: m.bonus,
      reached: totalReferrals >= m.count,
      claimed: claimedMilestones.includes(m.count),
    }));

    const nextMilestone = MILESTONES.find((m) => totalReferrals < m.count) || null;

    return NextResponse.json({
      success: true,
      earnings: data.pending || 0,
      claimed: data.claimed || 0,
      totalReferrals,
      milestones: milestoneInfo,
      nextMilestone: nextMilestone ? nextMilestone.count : null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { wallet, amount } = await req.json();

    if (!wallet || amount === undefined) {
      return NextResponse.json({ success: false, error: 'Wallet and amount required' });
    }

    const earningsKey = `${KEYS.earnings}:${wallet}`;
    const raw = await redis.get(earningsKey);
    const data: { pending: number; claimed: number; referrals: string[]; milestones?: number[] } =
      raw
        ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
        : { pending: 0, claimed: 0, referrals: [], milestones: [] };

    if ((data.pending || 0) < amount) {
      return NextResponse.json({ success: false, error: 'Insufficient earnings' });
    }

    data.pending = (data.pending || 0) - amount;
    data.claimed = (data.claimed || 0) + amount;

    await redis.set(earningsKey, JSON.stringify(data));

    return NextResponse.json({ success: true, amount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}