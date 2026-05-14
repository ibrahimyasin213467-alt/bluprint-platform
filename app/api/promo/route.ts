import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';
import { randomBytes } from 'crypto';

// RASTGELE 7 haneli promo code üret (tamamen random)
function generatePromoCode(): string {
  // 7 haneli hexadecimal (0-9, A-F) 
  // daha karışık için harf+rakam karışımı
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
  const code = searchParams.get('code');
  
  // Eğer code ile sorgulanıyorsa (referrer bulmak için)
  if (code) {
    try {
      const referrerWallet = await redis.get(`promocode:wallet:${code.toUpperCase()}`);
      if (referrerWallet) {
        return NextResponse.json({
          success: true,
          wallet: referrerWallet,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Invalid promo code',
        });
      }
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }
  
  // Wallet için promo code sorgulama
  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Wallet required' }, { status: 400 });
  }
  
  try {
    let promoCode = await redis.get(`promocode:${wallet}`);
    
    // Eğer promo code yoksa YENİ RASTGELE oluştur
    if (!promoCode) {
      promoCode = generatePromoCode();
      await redis.set(`promocode:${wallet}`, promoCode);
      await redis.set(`promocode:wallet:${promoCode}`, wallet);
      console.log(`✅ New promo code generated for ${wallet}: ${promoCode}`);
    }
    
    const hasCreatedToken = await redis.sismember('users', wallet);
    
    return NextResponse.json({
      success: true,
      promoCode,
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
    // Her POST'ta YENİ RASTGELE KOD ÜRET
    const newPromoCode = generatePromoCode();
    
    // Eski kodu sil
    const oldCode = await redis.get(`promocode:${wallet}`);
    if (oldCode) {
      await redis.del(`promocode:wallet:${oldCode}`);
    }
    
    // Yeni kodu kaydet
    await redis.set(`promocode:${wallet}`, newPromoCode);
    await redis.set(`promocode:wallet:${newPromoCode}`, wallet);
    
    console.log(`🔄 Promo code regenerated for ${wallet}: ${oldCode} → ${newPromoCode}`);
    
    return NextResponse.json({
      success: true,
      promoCode: newPromoCode,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}