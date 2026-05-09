import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

// Rastgele 7 haneli promo code üret
function generatePromoCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');
  
  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Wallet required' });
  }
  
  const promoKey = `promocode:${wallet}`;
  const promoCode = await redis.get(promoKey);
  const hasToken = await redis.sismember(KEYS.users, wallet);
  
  return NextResponse.json({
    success: true,
    hasPromoCode: !!promoCode,
    promoCode,
    hasToken,
  });
}

export async function POST(req: NextRequest) {
  const { wallet, hasToken } = await req.json();
  
  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Wallet required' });
  }
  
  const promoKey = `promocode:${wallet}`;
  let promoCode = await redis.get(promoKey);
  
  if (!promoCode) {
    promoCode = generatePromoCode();
    await redis.set(promoKey, promoCode);
  }
  
  if (hasToken === true) {
    await redis.sadd(KEYS.users, wallet);
  }
  
  return NextResponse.json({
    success: true,
    promoCode,
    hasToken: hasToken === true,
  });
}