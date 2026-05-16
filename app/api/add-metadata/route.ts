import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import {
  ExtensionType,
  getMintLen,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMetadataPointerInstruction,
  createInitializeInstruction,
} from '@solana/spl-token';
import { pack, TokenMetadata } from '@solana/spl-token-metadata';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.helius-rpc.com/?api-key=fdbb8762-06b5-4bbd-ab1e-33310587e2d4";

export async function POST(req: NextRequest) {
  try {
    const { mintAddress, name, symbol, uri, description, twitter, telegram, website } = await req.json();

    const connection = new Connection(RPC_URL, "confirmed");
    const mint = new PublicKey(mintAddress);

    // Token Metadata nesnesi
    const tokenMetadata: TokenMetadata = {
      mint,
      name,
      symbol: symbol.toUpperCase(),
      uri,
      additionalMetadata: [
        ["description", description || "Launched on BluPrint Platform"],
        ["twitter", twitter || ""],
        ["telegram", telegram || ""],
        ["website", website || ""],
      ],
    };

    // Mint hesabının mevcut boyutunu kontrol et
    const mintAccountInfo = await connection.getAccountInfo(mint);
    if (!mintAccountInfo) {
      return NextResponse.json({ success: false, error: "Mint account not found" }, { status: 404 });
    }

    // Metadata için gerekli ek alan
    const metadataLen = pack(tokenMetadata).length;
    const currentLen = mintAccountInfo.data.length;
    const neededLen = currentLen + metadataLen;

    // Transaction oluştur
    const transaction = new Transaction();
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = mint;

    // Not: Token-2022 mint hesapları yeniden boyutlandırılamaz (realloc yok)
    // Bu yüzden metadata'nın mint oluşturulurken eklenmesi gerekir.
    // Eğer mint oluşturulurken yeterli alan ayrılmadıysa, bu işlem başarısız olur.
    
    // Metadata Pointer Extension
    transaction.add(
      createInitializeMetadataPointerInstruction(
        mint,
        mint, // update authority
        mint, // metadata address (self)
        TOKEN_2022_PROGRAM_ID
      )
    );

    // Metadata'yı yaz
    transaction.add(
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint,
        metadata: mint,
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        uri: tokenMetadata.uri,
        mintAuthority: mint,
        updateAuthority: mint,
      })
    );

    return NextResponse.json({
      success: true,
      transaction: transaction.serialize({ requireAllSignatures: false }).toString('base64'),
      blockhash,
      lastValidBlockHeight,
    });
  } catch (error: any) {
    console.error("Add metadata error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}