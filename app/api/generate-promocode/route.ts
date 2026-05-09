import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROMOCODES_FILE = path.join(process.cwd(), 'data', 'promocodes.json');

// Benzersiz kod oluştur (6 karakter, harf+rakam)
function generateUniqueCode(existingCodes: string[]): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let code: string;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (existingCodes.includes(code));
  return code;
}

// Promocode'ları oku
function getPromoCodes() {
  try {
    if (fs.existsSync(PROMOCODES_FILE)) {
      return JSON.parse(fs.readFileSync(PROMOCODES_FILE, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

// Promocode kaydet
function savePromoCodes(codes: any) {
  const dir = path.dirname(PROMOCODES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PROMOCODES_FILE, JSON.stringify(codes, null, 2));
}

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();
    const promoCodes = getPromoCodes();
    
    // Zaten promocode'u varsa gönder
    if (promoCodes[walletAddress] && promoCodes[walletAddress].code) {
      return NextResponse.json({
        success: true,
        code: promoCodes[walletAddress].code,
        isNew: false,
      });
    }
    
    // Yeni promocode oluştur
    const existingCodes = Object.values(promoCodes).map((p: any) => p.code);
    const newCode = generateUniqueCode(existingCodes);
    
    promoCodes[walletAddress] = {
      code: newCode,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    savePromoCodes(promoCodes);
    
    return NextResponse.json({
      success: true,
      code: newCode,
      isNew: true,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');
  
  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Wallet required' });
  }
  
  const promoCodes = getPromoCodes();
  const userCode = promoCodes[wallet];
  
  return NextResponse.json({
    success: true,
    hasCode: !!userCode,
    code: userCode?.code || null,
  });
}