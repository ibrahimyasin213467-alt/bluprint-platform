import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  createUpdateMetadataAccountV2Instruction,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata';

export async function POST(req: NextRequest) {
  try {
    const { mintAddress, name, symbol, uri } = await req.json();
    
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), new PublicKey(mintAddress).toBuffer()],
      METADATA_PROGRAM_ID
    );

    const instruction = createUpdateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        updateAuthority: new PublicKey(mintAddress),
      },
      {
        updateMetadataAccountArgsV2: {
          data: {
            name,
            symbol,
            uri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          updateAuthority: null,
          primarySaleHappened: null,
          isMutable: null,
        },
      }
    );

    return NextResponse.json({ success: true, metadataPDA: metadataPDA.toString() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}