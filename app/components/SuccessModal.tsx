"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import {
  ExtensionType,
  getMintLen,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMetadataPointerInstruction,
  createInitializeInstruction,
} from "@solana/spl-token";
import { pack, TokenMetadata } from "@solana/spl-token-metadata";
import { motion } from "framer-motion";
import { useToast } from "./ToastProvider";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://solana-mainnet.g.alchemy.com/v2/HOfnwF22z5T8BCHNl_KIo";

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
      const mintPubkey = new PublicKey(mintAddress);

      // 1. Metadata nesnesi
      const tokenMetadata: TokenMetadata = {
        mint: mintPubkey,
        name: successData.name,
        symbol: successData.symbol,
        uri: `https://bluprint.fun/api/metadata/${mintAddress}`,
        additionalMetadata: [
          ["description", successData.description || "Launched on BluPrint Platform"],
          ["twitter", successData.twitter || ""],
          ["telegram", successData.telegram || ""],
          ["website", successData.website || ""],
          ["image", successData.tokenImage || ""],
        ],
      };

      // 2. Gerekli alan boyutunu hesapla
      const metadataExtensionSize = pack(tokenMetadata).length;
      const mintWithPointerSize = getMintLen([ExtensionType.MetadataPointer]);
      const totalRequiredSpace = mintWithPointerSize + metadataExtensionSize;

      // 3. Rent-exempt lamport miktarını hesapla
      const requiredLamports = await connection.getMinimumBalanceForRentExemption(totalRequiredSpace);

      // 4. Mint hesabının mevcut durumunu kontrol et
      const mintAccountInfo = await connection.getAccountInfo(mintPubkey);
      const currentBalance = mintAccountInfo?.lamports || 0;

      const transaction = new Transaction();

      // 5. Eğer bakiye yetersizse, lamport ekle
      if (currentBalance < requiredLamports) {
        const transferIx = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: mintPubkey,
          lamports: requiredLamports - currentBalance,
        });
        transaction.add(transferIx);
      }

      // 6. Metadata Pointer Extension'ı başlat
      transaction.add(
        createInitializeMetadataPointerInstruction(
          mintPubkey,
          publicKey,
          mintPubkey,
          TOKEN_2022_PROGRAM_ID
        )
      );

      // 7. Metadata'yı mint hesabına yaz
      transaction.add(
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintPubkey,
          metadata: mintPubkey,
          name: tokenMetadata.name,
          symbol: tokenMetadata.symbol,
          uri: tokenMetadata.uri,
          mintAuthority: publicKey,
          updateAuthority: publicKey,
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        maxRetries: 2,
      });

      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

      setMetadataAdded(true);
      showToast("✨ Metadata added! Your token now has a name and logo on Solscan.", "success");
    } catch (err: any) {
      console.error("Metadata error:", err);
      showToast(`❌ Failed to add metadata: ${err.message}`, "error");
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