import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

const EARNINGS_FILE = path.join(process.cwd(), 'data', 'referral-earnings.json');
const WALLET_FILE = path.join(process.cwd(), 'wallet.json');

// Hazine cüzdanını oku
function getTreasuryWallet(): Keypair {
  const secretKey = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf8'));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

// Kazançları oku
function getEarnings() {
  try {
    if (fs.existsSync(EARNINGS_FILE)) {
      return JSON.parse(fs.readFileSync(EARNINGS_FILE, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

// Kazançları kaydet
function saveEarnings(earnings: any) {
  const dir = path.dirname(EARNINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(EARNINGS_FILE, JSON.stringify(earnings, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const { wallet, amount } = await req.json();
    
    if (!wallet || amount === undefined) {
      return NextResponse.json({ success: false, error: 'Wallet and amount required' });
    }
    
    if (amount <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be greater than 0' });
    }
    
    // Kazançları kontrol et
    const earnings = getEarnings();
    const userEarnings = earnings[wallet] || { total: 0, claimed: 0, pending: 0, referrals: [] };
    
    if (userEarnings.pending < amount) {
      return NextResponse.json({ success: false, error: 'Insufficient earnings' });
    }
    
    // ========== GERÇEK SOL TRANSFERİ ==========
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8899', 'confirmed');
    const treasuryWallet = getTreasuryWallet();
    const toWallet = new PublicKey(wallet);
    
    // Hazinede yeterli SOL var mı kontrol et
    const treasuryBalance = await connection.getBalance(treasuryWallet.publicKey);
    const transferAmount = amount * LAMPORTS_PER_SOL;
    
    if (treasuryBalance < transferAmount) {
      console.error('Havuzda yetersiz bakiye:', treasuryBalance / LAMPORTS_PER_SOL, 'SOL');
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient treasury balance. Please contact support.' 
      });
    }
    
    // Transfer işlemini oluştur
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasuryWallet.publicKey,
        toPubkey: toWallet,
        lamports: transferAmount,
      })
    );
    
    // Son blockhash'i al
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = treasuryWallet.publicKey;
    
    // İmzala ve gönder
    transaction.sign(treasuryWallet);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature);
    
    console.log(`✅ Claim: ${amount} SOL gönderildi ${wallet} adresine. Tx: ${signature}`);
    
    // Kazançları güncelle
    userEarnings.claimed += amount;
    userEarnings.pending -= amount;
    earnings[wallet] = userEarnings;
    saveEarnings(earnings);
    
    return NextResponse.json({ 
      success: true, 
      amount,
      signature,
      message: `${amount} SOL claimed successfully!`
    });
    
  } catch (error: any) {
    console.error('❌ Claim hatası:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}