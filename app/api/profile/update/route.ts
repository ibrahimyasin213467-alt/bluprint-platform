import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, name, bio, avatar } = body;

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet is required' }, { status: 400 });
    }

    const profileKey = `profile:${wallet}`;
    
    // Mevcut profili al
    let profile = await redis.get(profileKey);
    let profileData = profile ? JSON.parse(profile as string) : {};
    
    // Güncelle
    if (name !== undefined) profileData.name = name;
    if (bio !== undefined) profileData.bio = bio;
    if (avatar !== undefined) profileData.avatar = avatar;
    profileData.updatedAt = new Date().toISOString();
    
    // Kaydet
    await redis.set(profileKey, JSON.stringify(profileData));
    
    return NextResponse.json({
      success: true,
      profile: profileData,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet is required' }, { status: 400 });
    }

    const profileKey = `profile:${wallet}`;
    const profile = await redis.get(profileKey);
    const profileData = profile ? JSON.parse(profile as string) : { name: null, bio: null, avatar: null };

    return NextResponse.json({
      success: true,
      profile: profileData,
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}