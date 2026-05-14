import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

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
    return NextResponse.json({ success: false, error: 'Wallet required' }, { status: 400 });
  }
  
  try {
    // Kullanıcının promo code'unu bul
    let promoCode = await redis.get(`promocode:${wallet}`);
    
    // Eğer yoksa oluştur (sadece token oluşturmuşsa)
    const hasCreatedToken = await redis.sismember('users', wallet);
    
    if (hasCreatedToken && !promoCode) {
      promoCode = generatePromoCode();
      await redis.set(`promocode:${wallet}`, promoCode);
      await redis.set(`promocode:wallet:${promoCode}`, wallet);
    }
    
    return NextResponse.json({
      success: true,
      promoCode: promoCode || null,
      hasCreatedToken,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { wallet } = await req.json();
  
  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Wallet required' }, { status: 400 });
  }
  
  try {
    let promoCode = await redis.get(`promocode:${wallet}`);
    
    if (!promoCode) {
      promoCode = generatePromoCode();
      await redis.set(`promocode:${wallet}`, promoCode);
      await redis.set(`promocode:wallet:${promoCode}`, wallet);
    }
    
    return NextResponse.json({
      success: true,
      promoCode,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}