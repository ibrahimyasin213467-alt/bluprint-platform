import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, SystemProgram, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from '@solana/spl-token';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata, createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey as umiPublicKey, keypairIdentity } from '@metaplex-foundation/umi';
import fs from 'fs';
import path from 'path';

const MIN_SOL_REQUIRED = 0.3;
const INITIAL_SUPPLY = 1_000_000_000;

export async function POST(req: NextRequest) {
  try {
    const { userPublicKey, name, symbol, supply, decimals, imageUrl, description } = await req.json();
    const userPubkey = new PublicKey(userPublicKey);
    const connection = new Connection('http://localhost:8899', 'confirmed');

    // Balance check
    const balance = await connection.getBalance(userPubkey);
    if (balance / LAMPORTS_PER_SOL < MIN_SOL_REQUIRED) {
      return NextResponse.json({ success: false, error: `Yetersiz bakiye. En az ${MIN_SOL_REQUIRED} SOL gerekli.` });
    }

    // Hazine cüzdanı
    const walletPath = path.join(process.cwd(), 'wallet.json');
    const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    const treasuryWallet = Keypair.fromSecretKey(new Uint8Array(secretKey));

    // Mint keypair
    const mintKeypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // 1. Mint account
    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: userPubkey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    });

    // 2. Initialize mint
    const initMintIx = createInitializeMintInstruction(mintKeypair.publicKey, decimals || 6, userPubkey, null);

    // 3. Fee transfer
    const feeIx = SystemProgram.transfer({
      fromPubkey: userPubkey,
      toPubkey: treasuryWallet.publicKey,
      lamports: 0.25 * LAMPORTS_PER_SOL,
    });

    // 4. ATA
    const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, userPubkey);
    const createAtaIx = createAssociatedTokenAccountInstruction(userPubkey, ata, userPubkey, mintKeypair.publicKey);

    // 5. Mint to
    const mintAmount = (supply || INITIAL_SUPPLY) * Math.pow(10, decimals || 6);
    const mintToIx = createMintToInstruction(mintKeypair.publicKey, ata, userPubkey, BigInt(mintAmount));

    // Transaction
    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPubkey;
    transaction.add(createMintAccountIx, initMintIx, feeIx, createAtaIx, mintToIx);
    transaction.partialSign(mintKeypair);

    // ================= IPFS METADATA =================
    const pinataJwt = process.env.PINATA_JWT;
    let metadataUri = '';

    if (pinataJwt) {
      try {
        // Önce resmi IPFS'e yükle
        const defaultImage = 'https://i.imgur.com/P1mMuAL.png';
        const imageFile = await fetch(defaultImage);
        const imageBuffer = await imageFile.arrayBuffer();
        const formData = new FormData();
        const blob = new Blob([imageBuffer]);
        formData.append('file', blob, 'logo.png');

        const imageUpload = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: { Authorization: `Bearer ${pinataJwt}` },
          body: formData,
        });
        const imageResult = await imageUpload.json();
        const imageIpfsUrl = `https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`;

        // Metadata JSON'u oluştur
        const metadata = {
          name,
          symbol,
          description: description || 'Launched on BluPrint Platform',
          image: imageIpfsUrl,
          external_url: 'https://BluPrint.io',
        };

        const metadataUpload = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${pinataJwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: { name: `metadata-${name}` },
          }),
        });
        const metadataResult = await metadataUpload.json();
        metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`;

        // Metaplex ile metadata hesabı oluştur
        const umi = createUmi('http://localhost:8899');
        const umiKeypair = umi.eddsa.createKeypairFromSecretKey(treasuryWallet.secretKey);
        umi.use(keypairIdentity(umiKeypair));
        umi.use(mplTokenMetadata());

        const umiMint = umiPublicKey(mintKeypair.publicKey.toBase58());

        await createMetadataAccountV3(umi, {
          mint: umiMint,
          mintAuthority: umi.identity,
          data: {
            name,
            symbol,
            uri: metadataUri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        }).sendAndConfirm(umi);

        console.log('✅ IPFS metadata eklendi:', metadataUri);
      } catch (ipfsError) {
        console.error('⚠️ IPFS metadata yüklenemedi:', ipfsError);
      }
    }

    return NextResponse.json({
      success: true,
      transaction: transaction.serialize({ requireAllSignatures: false }).toString('base64'),
      mintAddress: mintKeypair.publicKey.toBase58(),
      metadataUri,
    });
  } catch (error: any) {
    console.error('❌ HATA:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}