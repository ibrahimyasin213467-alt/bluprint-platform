import { NextRequest, NextResponse } from 'next/server';
import {
  Connection, Keypair, SystemProgram,
  LAMPORTS_PER_SOL, PublicKey, Transaction,
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE, TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  mplTokenMetadata,
  createMetadataAccountV3,
  updateMetadataAccountV2,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  publicKey as umiPublicKey,
  keypairIdentity,
  createSignerFromKeypair,
} from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { redis, KEYS } from '@/app/lib/redis';
import { checkRateLimit } from '@/app/lib/security/rateLimit';
import { tryLockWallet, unlockWallet } from '@/app/lib/security/activeWallets';
import { checkRequestId } from '@/app/lib/security/replayGuard';
import { checkAbuse, recordCreateAttempt } from '@/app/lib/security/abuseDetection';
import { validateTokenInput, sanitizeString } from '@/app/lib/security/validateInput';

const MIN_SOL_REQUIRED = 0.15;
const INITIAL_SUPPLY = 1_000_000_000;
const BASE_FEE = 0.15 * LAMPORTS_PER_SOL;
const REFERRAL_FEE = 0.10 * LAMPORTS_PER_SOL;
const REFERRAL_REWARD = 0.05 * LAMPORTS_PER_SOL;
const DEFAULT_IMAGE_HASH = 'QmaZYRoR1eBSqESX4Fo5NR28CZPNig9YuZfJsBzmG7KPe3';
const DEFAULT_IMAGE_URL = `https://gateway.pinata.cloud/ipfs/${DEFAULT_IMAGE_HASH}`;

const MILESTONES = [
  { count: 10, bonus: 0.1 },
  { count: 25, bonus: 0.2 },
  { count: 50, bonus: 0.5 },
  { count: 100, bonus: 1.0 },
];

// ========== ALCHEMY RPC - SON VE KESİN ==========
const ALCHEMY_RPC = 'https://solana-mainnet.g.alchemy.com/v2/HOfnwF22z5T8BCHNl_KIo';

function getRpcUrl(): string {
  console.log('🔌 Using Alchemy RPC');
  return ALCHEMY_RPC;
}

function getWallets() {
  const platform = process.env.PLATFORM_WALLET;
  const owner    = process.env.OWNER_WALLET;
  const kuzen    = process.env.KUZEN_WALLET;
  if (!platform || !owner || !kuzen) throw new Error('Wallet env variables not configured');
  return {
    PLATFORM_WALLET: new PublicKey(platform),
    YOUR_WALLET:     new PublicKey(owner),
    KUZEN_WALLET:    new PublicKey(kuzen),
  };
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-vercel-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    'unknown'
  );
}

function logCreation(wallet: string, success: boolean, mintAddress?: string, error?: string, ip?: string) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), wallet, success, mintAddress, error, ip }));
}

async function getConnection(): Promise<Connection> {
  const conn = new Connection(getRpcUrl(), 'confirmed');
  await conn.getSlot();
  return conn;
}

async function uploadJSONToIPFS(json: object, pinataJwt: string): Promise<string> {
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: { name: `metadata-${(json as any).name}` },
    }),
  });
  const data = await res.json();
  if (!data.IpfsHash) throw new Error('IPFS upload failed: ' + JSON.stringify(data));
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
}

async function createAndRevokeMetadata(
  mintKeypair: Keypair,
  name: string,
  symbol: string,
  metadataUri: string,
  secureToken: boolean,
): Promise<void> {
  const umi = createUmi(getRpcUrl());
  const umiKeypair = fromWeb3JsKeypair(mintKeypair);
  const mintSigner = createSignerFromKeypair(umi, umiKeypair);

  umi.use(keypairIdentity(mintSigner));
  umi.use(mplTokenMetadata());

  const mintPublicKey = umiPublicKey(mintKeypair.publicKey.toBase58());

  await createMetadataAccountV3(umi, {
    mint: mintPublicKey,
    mintAuthority: mintSigner,
    updateAuthority: mintSigner,
    data: {
      name: sanitizeString(name),
      symbol: sanitizeString(symbol).toUpperCase(),
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: !secureToken,
    collectionDetails: null,
  }).sendAndConfirm(umi);

  if (secureToken) {
    await updateMetadataAccountV2(umi, {
      metadata: mintPublicKey,
      updateAuthority: mintSigner,
      newUpdateAuthority: null,
      data: null,
      primarySaleHappened: null,
      isMutable: false,
    }).sendAndConfirm(umi);
    console.log('✅ Update Authority revoked');
  }
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  try {
    const body = await req.json();
    const {
      userPublicKey, name, symbol, supply, decimals,
      imageUrl, description, secureToken, referrer,
      twitter, telegram, website, promoCode, requestId,
    } = body;

    const validation = validateTokenInput({
      name, symbol,
      supply: supply || INITIAL_SUPPLY,
      decimals: decimals ?? 9,
      description: description || '',
    });
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    if (!requestId || !(await checkRequestId(requestId))) {
      return NextResponse.json({ success: false, error: 'Invalid or reused request ID' }, { status: 409 });
    }

    const abuse = checkAbuse(ip);
    if (!abuse.allowed) {
      return NextResponse.json({ success: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const rateLimit = await checkRateLimit(ip, userPublicKey);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded', retryAfter: rateLimit.retryAfter }, { status: 429 });
    }

    if (!(await tryLockWallet(userPublicKey))) {
      return NextResponse.json({ success: false, error: 'Another request is already processing' }, { status: 409 });
    }

    // ========== REFERRAL ==========
    let feeAmount = BASE_FEE;
    let referralIx = null;
    let referralApplied = false;
    let finalReferrer = referrer;

    if (promoCode && !finalReferrer) {
      try {
        const walletForCode = await redis.get(`promocode:wallet:${promoCode}`);
        if (walletForCode) finalReferrer = walletForCode;
      } catch (e) {
        console.log('Promo code lookup error:', e);
      }
    }

    if (finalReferrer) {
      try {
        const referrerPubkey = new PublicKey(finalReferrer);
        feeAmount = REFERRAL_FEE;
        referralIx = SystemProgram.transfer({
          fromPubkey: new PublicKey(userPublicKey),
          toPubkey: referrerPubkey,
          lamports: REFERRAL_REWARD,
        });
        referralApplied = true;

        const earningsKey = `${KEYS.earnings}:${finalReferrer}`;
        const existing = await redis.get(earningsKey);
        const data: { pending: number; claimed: number; referrals: string[]; milestones: number[] } =
          existing
            ? (typeof existing === 'string' ? JSON.parse(existing) : existing)
            : { pending: 0, claimed: 0, referrals: [], milestones: [] };

        if (!data.milestones) data.milestones = [];

        data.pending += REFERRAL_REWARD / LAMPORTS_PER_SOL;
        if (!data.referrals.includes(userPublicKey)) data.referrals.push(userPublicKey);

        const refCount = data.referrals.length;
        for (const m of MILESTONES) {
          if (refCount >= m.count && !data.milestones.includes(m.count)) {
            data.pending += m.bonus;
            data.milestones.push(m.count);
            console.log(`🎉 Milestone: ${finalReferrer} → +${m.bonus} SOL (${m.count} refs)`);
          }
        }

        await redis.set(earningsKey, JSON.stringify(data));
      } catch (e) {
        console.log('Invalid referrer:', e);
      }
    }

    // ========== BALANCE CHECK ==========
    const userPubkey = new PublicKey(userPublicKey);
    const connection = await getConnection();
    const balance = await connection.getBalance(userPubkey);

    if (balance / LAMPORTS_PER_SOL < MIN_SOL_REQUIRED) {
      await unlockWallet(userPublicKey);
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. Need ${MIN_SOL_REQUIRED} SOL, you have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`,
      }, { status: 400 });
    }

    // ========== MINT ==========
    const mintKeypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // ========== IPFS ==========
    let metadataUri = '';
    const pinataJwt = process.env.PINATA_JWT;

    if (pinataJwt) {
      try {
        const metadata = {
          name: sanitizeString(name),
          symbol: sanitizeString(symbol).toUpperCase(),
          description: sanitizeString(description || 'Launched on BluPrint Platform'),
          image: DEFAULT_IMAGE_URL,
          external_url: sanitizeString(website || 'https://bluprint.io'),
          attributes: [
            { trait_type: 'Platform', value: 'BluPrint' },
            { trait_type: 'Type', value: 'Meme Coin' },
            { trait_type: 'Secure', value: secureToken },
            { trait_type: 'Referral', value: referralApplied ? 'Yes' : 'No' },
            { trait_type: 'Twitter', value: sanitizeString(twitter || '') },
            { trait_type: 'Telegram', value: sanitizeString(telegram || '') },
          ],
        };
        metadataUri = await uploadJSONToIPFS(metadata, pinataJwt);
        console.log('✅ IPFS:', metadataUri);
      } catch (e) {
        console.error('IPFS error:', e);
        await unlockWallet(userPublicKey);
        return NextResponse.json({ success: false, error: 'Failed to upload metadata. Please try again.' }, { status: 500 });
      }
    }

    // ========== TRANSACTION ==========
    const { PLATFORM_WALLET, YOUR_WALLET, KUZEN_WALLET } = getWallets();

    const platformShare = Math.floor(feeAmount * 0.10);
    const yourShare     = Math.floor(feeAmount * 0.58);
    const kuzenShare    = feeAmount - platformShare - yourShare;

    const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, userPubkey);
    const supplyBigInt = BigInt(supply || INITIAL_SUPPLY) * BigInt(10) ** BigInt(decimals ?? 9);

    const transaction = new Transaction();
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPubkey;

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: userPubkey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(mintKeypair.publicKey, decimals ?? 9, userPubkey, secureToken ? userPubkey : null),
      SystemProgram.transfer({ fromPubkey: userPubkey, toPubkey: PLATFORM_WALLET, lamports: platformShare }),
      SystemProgram.transfer({ fromPubkey: userPubkey, toPubkey: YOUR_WALLET,     lamports: yourShare }),
      SystemProgram.transfer({ fromPubkey: userPubkey, toPubkey: KUZEN_WALLET,    lamports: kuzenShare }),
      createAssociatedTokenAccountInstruction(userPubkey, ata, userPubkey, mintKeypair.publicKey),
      createMintToInstruction(mintKeypair.publicKey, ata, userPubkey, supplyBigInt),
    );

    if (referralIx) transaction.add(referralIx);

    if (secureToken) {
      transaction.add(
        createSetAuthorityInstruction(mintKeypair.publicKey, userPubkey, AuthorityType.MintTokens, null),
        createSetAuthorityInstruction(mintKeypair.publicKey, userPubkey, AuthorityType.FreezeAccount, null),
      );
    }

    transaction.partialSign(mintKeypair);

    if (metadataUri && pinataJwt) {
      createAndRevokeMetadata(mintKeypair, name, symbol, metadataUri, secureToken).catch((e) => {
        console.error('❌ Metaplex error:', e);
      });
    }

    // ========== REDIS ==========
    try {
      const tokenData = {
        mint: mintKeypair.publicKey.toBase58(),
        name: sanitizeString(name),
        symbol: sanitizeString(symbol).toUpperCase(),
        createdAt: new Date().toISOString(),
        image: imageUrl || DEFAULT_IMAGE_URL,
        twitter: sanitizeString(twitter || ''),
        telegram: sanitizeString(telegram || ''),
        website: sanitizeString(website || ''),
        createdBy: userPublicKey,
      };

      await redis.lpush(KEYS.tokens, JSON.stringify(tokenData));
      await redis.ltrim(KEYS.tokens, 0, 49);
      await redis.incr(KEYS.tokenCount);
      await redis.sadd(KEYS.users, userPublicKey);

      const promoKey = `promocode:${userPublicKey}`;
      if (!(await redis.get(promoKey))) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
        const code = Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        await redis.set(promoKey, code);
        await redis.set(`promocode:wallet:${code}`, userPublicKey);
      }
    } catch (e) {
      console.error('Redis save error:', e);
    }

    logCreation(userPublicKey, true, mintKeypair.publicKey.toBase58(), undefined, ip);
    await unlockWallet(userPublicKey);

    return NextResponse.json({
      success: true,
      transaction: transaction.serialize({ verifySignatures: false, requireAllSignatures: false }).toString('base64'),
      mintAddress: mintKeypair.publicKey.toBase58(),
      referralApplied,
      feePaid: feeAmount / LAMPORTS_PER_SOL,
    });

  } catch (error: any) {
    logCreation('unknown', false, undefined, error.message, ip);
    recordCreateAttempt(ip);
    console.error('❌ ERROR:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}