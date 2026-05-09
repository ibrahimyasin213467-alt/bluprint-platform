import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BOOST_FILE = path.join(process.cwd(), 'data', 'boosted.json');
const TOKEN_COUNTER_FILE = path.join(process.cwd(), 'data', 'token-counter.json');

// Boosted token'ları oku
function getBoostedTokens(): string[] {
  try {
    if (fs.existsSync(BOOST_FILE)) {
      const data = fs.readFileSync(BOOST_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {}
  return [];
}

// Boosted token kaydet
function saveBoostedTokens(tokens: string[]) {
  const dir = path.dirname(BOOST_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(BOOST_FILE, JSON.stringify(tokens, null, 2));
}

// Token sayacını oku
function getTokenCount(): number {
  try {
    if (fs.existsSync(TOKEN_COUNTER_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_COUNTER_FILE, 'utf-8'));
      return data.count || 0;
    }
  } catch (e) {}
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    const { mintAddress, userPublicKey, fee } = await req.json();
    
    if (!mintAddress || mintAddress.length !== 44) {
      return NextResponse.json({ success: false, error: "Geçersiz mint adresi" });
    }

    const tokenCount = getTokenCount();
    const isFirstHundred = tokenCount < 100;
    
    // İlk 100 için %50 indirimli boost (0.05 SOL)
    const actualFee = isFirstHundred ? 0.05 : 0.1;
    
    // TODO: Gerçek SOL transferi burada yapılacak
    console.log(`💰 Boost fee: ${actualFee} SOL (First 100: ${isFirstHundred})`);
    
    const boosted = getBoostedTokens();
    if (!boosted.includes(mintAddress)) {
      boosted.push(mintAddress);
      saveBoostedTokens(boosted);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Token boosted!",
      feePaid: actualFee,
      isFirstHundred 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function GET() {
  try {
    const boosted = getBoostedTokens();
    return NextResponse.json({ success: true, boosted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}