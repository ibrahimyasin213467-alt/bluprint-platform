import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TOKEN_FILE = path.join(process.cwd(), 'data', 'tokens.json');

function getTokens() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const data = fs.readFileSync(TOKEN_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {}
  return [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');
  
  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Wallet required' }, { status: 400 });
  }
  
  const tokens = getTokens();
  const hasToken = tokens.some((t: any) => t.createdBy === wallet);
  
  return NextResponse.json({ success: true, hasToken });
}