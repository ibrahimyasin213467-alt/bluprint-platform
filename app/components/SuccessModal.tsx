"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { motion } from "framer-motion";
import { useToast } from "./ToastProvider";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://solana-mainnet.g.alchemy.com/v2/HOfnwF22z5T8BCHNl_KIo";

function findMetadataPda(mint: PublicKey): PublicKey {
  const seeds = [
    Buffer.from("metadata"),
    METADATA_PROGRAM_ID.toBuffer(),
    mint.toBuffer(),
  ];
  return PublicKey.findProgramAddressSync(seeds, METADATA_PROGRAM_ID)[0];
}

export default function SuccessModal({
  successData,
  mintAddress,
  time,
  onReset,
  onHome,
}: {
  successData: any;
  mintAddress: string;
  time: number;
  onReset: () => void;
  onHome: () => void;
}) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { showToast } = useToast();
  const [addingMetadata, setAddingMetadata] = useState(false);
  const [metadataAdded, setMetadataAdded] = useState(successData.metadataAdded || false);

  const addMetadata = async () => {
    if (!publicKey || !connected) {
      showToast("Please connect your wallet", "error");
      return;
    }

    setAddingMetadata(true);
    try {
      const connection = new Connection(RPC_URL, "confirmed");
      const mint = new PublicKey(mintAddress);
      const metadataPDA = findMetadataPda(mint);

      // IPFS'e metadata yükle
      const metadataRes = await fetch("/api/upload-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: successData.metadataName || successData.name,
          symbol: successData.metadataSymbol || successData.symbol,
          description: successData.description || "Launched on BluPrint Platform",
          image: successData.tokenImage || successData.image || "https://gateway.pinata.cloud/ipfs/QmaZYRoR1eBSqESX4Fo5NR28CZPNig9YuZfJsBzmG7KPe3",
          external_url: successData.website || "https://bluprint.fun",
          twitter: successData.twitter || "",
          telegram: successData.telegram || "",
        }),
      });

      const metadataData = await metadataRes.json();
      if (!metadataData.success) throw new Error("IPFS upload failed: " + (metadataData.error || "Unknown"));

      // ========== METADATA INSTRUCTION - updateAuthority = null ==========
      const instruction = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint,
          mintAuthority: publicKey,
          payer: publicKey,
          updateAuthority: publicKey,

        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: successData.metadataName || successData.name,
              symbol: (successData.metadataSymbol || successData.symbol).toUpperCase(),
              uri: metadataData.uri,
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            isMutable: false,
            collectionDetails: null,
          },
        }
      );

      const transaction = new Transaction().add(instruction);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        maxRetries: 2,
      });

      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

      setMetadataAdded(true);
      showToast("✨ Metadata added successfully! Your token now has a name and logo on Solscan.", "success");
    } catch (err: any) {
      console.error("Metadata error:", err);
      let errorMsg = err.message || "Unknown error";
      if (errorMsg.includes("Custom program error: 0x0")) {
        errorMsg = "Metadata already exists for this token.";
      } else if (errorMsg.includes("0x10")) {
        errorMsg = "Authority error. Please try again.";
      }
      showToast(`❌ Failed to add metadata: ${errorMsg}`, "error");
    } finally {
      setAddingMetadata(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl max-w-md w-full mx-4 p-6 border border-gray-700 shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-2">YOUR TOKEN IS LIVE!</h2>
          <p className="text-green-400 text-sm mb-4">⚡ Created in {time.toFixed(2)} seconds</p>
        </div>

        <div className="space-y-3 bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Token Name:</span>
            <span className="text-white font-semibold">{successData.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Symbol:</span>
            <span className="text-white font-semibold">{successData.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Supply:</span>
            <span className="text-white font-semibold">{successData.supply.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Mint:</span>
            <div className="flex gap-2">
              <code className="text-xs text-blue-400 truncate max-w-[150px]">{mintAddress.slice(0, 8)}...{mintAddress.slice(-6)}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(mintAddress);
                  showToast("Mint address copied!", "success");
                }}
                className="text-gray-400 hover:text-white text-xs"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {/* METADATA BUTONU */}
        {!metadataAdded && (
          <button
            onClick={addMetadata}
            disabled={addingMetadata}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition mb-3 flex items-center justify-center gap-2"
          >
            {addingMetadata ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding Metadata...
              </>
            ) : (
              "✨ Add Metadata (Name, Logo, Symbol)"
            )}
          </button>
        )}

        {/* METADATA EKLENDİ MESAJI */}
        {metadataAdded && (
          <div className="text-center text-green-400 text-sm mb-3">
            ✅ Metadata added! Your token now has a name and logo on Solscan.
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              window.open(`https://solscan.io/token/${mintAddress}`, "_blank");
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-xl transition text-sm"
          >
            🔍 View on Solscan
          </button>
          <button
            onClick={() => {
              window.open(`https://twitter.com/intent/tweet?text=I just created a token on BluPrint! 🚀%0aName: ${successData.name} ($${successData.symbol})%0aMint: ${mintAddress}%0aCreate yours at https://bluprint.fun`, "_blank");
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition text-sm"
          >
            🐦 Share on Twitter
          </button>
        </div>

        <div className="flex gap-3 mt-3">
          <button
            onClick={onReset}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition text-sm"
          >
            ✨ Create Another
          </button>
          <button
            onClick={onHome}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-xl transition text-sm"
          >
            🏠 Home
          </button>
        </div>
      </div>
    </motion.div>
  );
}