import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    
    // Tüm token'ları al (boş olabilir)
    const allTokens = await redis.lrange(KEYS.tokens, 0, -1);
    const userTokens: any[] = [];
    
    // Token'lar varsa döngüye gir
    if (allTokens && allTokens.length > 0) {
      for (const token of allTokens) {
        try {
          const tokenData = typeof token === 'string' ? JSON.parse(token) : token;
          if (tokenData && tokenData.createdBy === wallet) {
            userTokens.push(tokenData);
          }
        } catch (e) {
          console.error('Token parse error:', e);
        }
      }
    }
    
    // Referans kazancını al
    const earningsKey = `${KEYS.earnings}:${wallet}`;
    let earningsData = { pending: 0, claimed: 0, referrals: [] };
    try {
      const earnings = await redis.get(earningsKey);
      if (earnings) {
        earningsData = typeof earnings === 'string' ? JSON.parse(earnings) : earnings;
      }
    } catch (e) {
      console.error('Earnings parse error:', e);
    }
    
    // Promo code
    let promoCode = null;
    if (userTokens.length > 0) {
      try {
        promoCode = await redis.get(`promocode:${wallet}`);
        if (promoCode && typeof promoCode !== 'string') {
          promoCode = null;
        }
      } catch (e) {
        console.error('Promo code error:', e);
      }
    }
    
    // Profil verileri
    const profileKey = `profile:${wallet}`;
    let profileData = { bio: null, avatar: null };
    try {
      const profile = await redis.get(profileKey);
      if (profile) {
        profileData = typeof profile === 'string' ? JSON.parse(profile) : profile;
      }
    } catch (e) {
      console.error('Profile parse error:', e);
    }
    
    return NextResponse.json({
      success: true,
      user: {
        wallet,
        totalTokens: userTokens.length,
        totalReferrals: earningsData.referrals?.length || 0,
        totalEarned: earningsData.claimed || 0,
        pendingEarnings: earningsData.pending || 0,
        promoCode: promoCode || null,
        hasCreatedToken: userTokens.length > 0,
        tokens: userTokens.slice(0, 10),
        bio: profileData.bio,
        avatar: profileData.avatar,
      }
    });
  } catch (error: any) {
    console.error('Profile API error:', error);
    // Her durumda başarılı false dönme, default data dön
    return NextResponse.json({ 
      success: true,
      user: {
        wallet: typeof params === 'object' && params ? (params as any).wallet || 'unknown' : 'unknown',
        totalTokens: 0,
        totalReferrals: 0,
        totalEarned: 0,
        pendingEarnings: 0,
        promoCode: null,
        hasCreatedToken: false,
        tokens: [],
        bio: null,
        avatar: null,
      }
    });
  }
}