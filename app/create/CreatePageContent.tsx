"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useSearchParams } from "next/navigation";
import { Connection, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, createMetadataAccountV3, updateMetadataAccountV2 } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey as umiPublicKey, keypairIdentity, createSignerFromKeypair } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import SuccessModal from "../components/SuccessModal";
import { useToast } from "../components/ToastProvider";
import { useI18n } from "../lib/i18n-provider";

// ==================== KONFIGÜRASYON ====================
const RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/HOfnwF22z5T8BCHNl_KIo";
const PLATFORM_WALLET = "FPLcpDVhRTMTMGquiyeK3AwNtCaQQgNp6UwHPTcWDS2n";
const OWNER_WALLET = "aJCqEsDgSXhkLUYAnq4tA2T3LfG7rMbfcdJapf9af9x";
const KUZEN_WALLET = "2WyCLgg2vuvzmExak8WAeF9kBfvfcD4ahcKfm9P18gSc";
const REFERRAL_REWARD = 0.05 * LAMPORTS_PER_SOL;
const BASE_FEE = 0.15 * LAMPORTS_PER_SOL;
const REFERRAL_FEE = 0.10 * LAMPORTS_PER_SOL;
const MAX_RETRIES = 3;

export default function CreatePageContent() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [successData, setSuccessData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [time, setTime] = useState(0);
  const [mintAddress, setMintAddress] = useState("");
  const [tokensLeft, setTokensLeft] = useState(100);

  // Form state
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState(1_000_000_000);
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [tokenImage, setTokenImage] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [revokeMint, setRevokeMint] = useState(false);
  const [revokeFreeze, setRevokeFreeze] = useState(false);
  const [revokeUpdate, setRevokeUpdate] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const referrerAddress = searchParams.get("ref");
  const validReferrer = referrerAddress && referrerAddress.length === 44 ? referrerAddress : null;
  const secureToken = revokeMint || revokeFreeze || revokeUpdate;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch("/api/token-stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTokensLeft(data.tokensLeft);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (validReferrer) showToast(t("toast_referral"), "info");
  }, [validReferrer]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(t("toast_uploading"), "info");
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setTokenImage(data.url);
        setPreviewImage(URL.createObjectURL(file));
        showToast(t("toast_upload_success"), "success");
      } else {
        showToast(`❌ ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
    }
  };

  const uploadMetadataToIPFS = async (): Promise<string | null> => {
    const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!pinataJwt) return null;
    
    const metadata = {
      name: tokenName,
      symbol: tokenSymbol.toUpperCase(),
      description: description || "Launched on BluPrint Platform",
      image: tokenImage || "https://gateway.pinata.cloud/ipfs/QmaZYRoR1eBSqESX4Fo5NR28CZPNig9YuZfJsBzmG7KPe3",
      external_url: website || "https://bluprint.fun",
      attributes: [
        { trait_type: "Platform", value: "BluPrint" },
        { trait_type: "Type", value: "Meme Coin" },
        { trait_type: "Secure Token", value: secureToken ? "Yes (3 Revokes)" : "No" },
        { trait_type: "Mint Revoked", value: revokeMint ? "Yes" : "No" },
        { trait_type: "Freeze Revoked", value: revokeFreeze ? "Yes" : "No" },
        { trait_type: "Update Revoked", value: revokeUpdate ? "Yes" : "No" },
      ],
    };
    
    try {
      const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          pinataContent: metadata, 
          pinataMetadata: { name: `metadata-${tokenName}-${Date.now()}` } 
        }),
      });
      const data = await res.json();
      if (!data.IpfsHash) throw new Error("IPFS upload failed");
      return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    } catch (err) {
      console.error("IPFS upload error:", err);
      return null;
    }
  };

  const createMetadata = async (
    mintKeypair: Keypair,
    metadataUri: string,
    connection: Connection
  ): Promise<void> => {
    if (!metadataUri) return;
    
    try {
      const umi = createUmi(RPC_URL);
      const umiKeypair = fromWeb3JsKeypair(mintKeypair);
      const mintSigner = createSignerFromKeypair(umi, umiKeypair);
      umi.use(keypairIdentity(mintSigner));
      umi.use(mplTokenMetadata());

      const mintPublicKey = umiPublicKey(mintKeypair.publicKey.toBase58());

      // Create metadata account
      const tx = await createMetadataAccountV3(umi, {
        mint: mintPublicKey,
        mintAuthority: mintSigner,
        updateAuthority: mintSigner,
        data: {
          name: tokenName,
          symbol: tokenSymbol.toUpperCase(),
          uri: metadataUri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: !revokeUpdate,
        collectionDetails: null,
      }).buildAndSign(umi);

      const txBytes = umi.transactions.serialize(tx);
      const transaction = Transaction.from(Buffer.from(txBytes));
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey!;

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: MAX_RETRIES,
      });
      
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

      // 3. REVOKE: Update Authority'yi revoke et
      if (revokeUpdate) {
        const updateTx = await updateMetadataAccountV2(umi, {
          metadata: mintPublicKey,
          updateAuthority: mintSigner,
          newUpdateAuthority: null,
          data: null,
          primarySaleHappened: null,
          isMutable: false,
        }).buildAndSign(umi);

        const updateTxBytes = umi.transactions.serialize(updateTx);
        const updateTransaction = Transaction.from(Buffer.from(updateTxBytes));
        const { blockhash: blockhash2, lastValidBlockHeight: lastValidBlockHeight2 } = await connection.getLatestBlockhash();
        updateTransaction.recentBlockhash = blockhash2;
        updateTransaction.feePayer = publicKey!;

        const signature2 = await sendTransaction(updateTransaction, connection, {
          skipPreflight: false,
          maxRetries: MAX_RETRIES,
        });
        
        await connection.confirmTransaction({ signature: signature2, blockhash: blockhash2, lastValidBlockHeight: lastValidBlockHeight2 }, "confirmed");
      }
    } catch (err) {
      console.error("Metadata creation error:", err);
    }
  };

  const createToken = async () => {
    if (isProcessing || loading) return;
    if (!publicKey) {
      setVisible(true);
      return;
    }

    if (!tokenName || !tokenSymbol) {
      showToast("Please enter token name and symbol", "error");
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setProgress(0);
    setStep("🚀 Initializing...");
    setStatus("Preparing token...");

    const start = Date.now();

    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        const elapsed = (Date.now() - start) / 1000;
        return Math.min(90, Math.floor((elapsed / 15) * 100));
      });
    }, 100);

    try {
      const connection = new Connection(RPC_URL, "confirmed");
      
      // Fee hesaplama
      const feeAmount = validReferrer ? REFERRAL_FEE : BASE_FEE;
      const platformShare = Math.floor(feeAmount * 0.10);
      const yourShare = Math.floor(feeAmount * 0.58);
      const kuzenShare = feeAmount - platformShare - yourShare;
      
      // IPFS metadata yükle
      setStep("📤 Uploading metadata to IPFS...");
      const metadataUri = await uploadMetadataToIPFS();
      
      // Mint keypair oluştur
      setStep("🔑 Creating mint account...");
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      
      // ATA oluştur
      setStep("📝 Creating token account...");
      const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);
      
      // Supply hesapla
      const supply = Number(tokenSupply) * Math.pow(10, tokenDecimals);
      
      // Ana Transaction oluştur
      setStep("📦 Building transaction...");
      const transaction = new Transaction();
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Instruction'ları ekle
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey, 
          tokenDecimals, 
          publicKey, 
          secureToken ? publicKey : null
        ),
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(PLATFORM_WALLET), lamports: platformShare }),
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(OWNER_WALLET), lamports: yourShare }),
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(KUZEN_WALLET), lamports: kuzenShare }),
        createAssociatedTokenAccountInstruction(publicKey, ata, publicKey, mintKeypair.publicKey),
        createMintToInstruction(mintKeypair.publicKey, ata, publicKey, supply)
      );

      // Referral transfer
      if (validReferrer) {
        transaction.add(
          SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(validReferrer), lamports: REFERRAL_REWARD })
        );
      }

      // 1. ve 2. Revoke: Mint Authority ve Freeze Authority
      if (secureToken) {
        if (revokeMint) {
          transaction.add(createSetAuthorityInstruction(mintKeypair.publicKey, publicKey, AuthorityType.MintTokens, null));
        }
        if (revokeFreeze) {
          transaction.add(createSetAuthorityInstruction(mintKeypair.publicKey, publicKey, AuthorityType.FreezeAccount, null));
        }
      }

      transaction.partialSign(mintKeypair);

      // Ana transaction'ı imzala ve gönder
      setStep("📝 Please sign the main transaction...");
      setProgress(92);
      
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: MAX_RETRIES,
      });
      
      setStep("⏳ Confirming main transaction...");
      setProgress(95);
      
      // ========== FIX: confirmTransaction hatasını yönet ==========
      let confirmed = false;
      try {
        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
        confirmed = true;
      } catch (confirmError) {
        console.warn("Confirm error:", confirmError);
        // Token'ın gerçekten oluşup oluşmadığını kontrol et
        const statusCheck = await connection.getSignatureStatus(signature);
        if (statusCheck.value?.confirmationStatus === "confirmed" || statusCheck.value?.confirmationStatus === "finalized") {
          console.log("Transaction confirmed despite timeout error");
          confirmed = true;
        } else {
          throw confirmError;
        }
      }
      
      if (!confirmed) {
        throw new Error("Transaction confirmation failed");
      }

      // Metaplex metadata ve 3. revoke (Update Authority)
      if (metadataUri) {
        setStep("🎨 Creating metadata...");
        setProgress(98);
        await createMetadata(mintKeypair, metadataUri, connection);
      }

      clearInterval(progressInterval.current!);
      setProgress(100);
      setStep("✅ Done! Your token is ready!");

      setTime((Date.now() - start) / 1000);
      setMintAddress(mintKeypair.publicKey.toBase58());
      setSuccessData({
        mint: mintKeypair.publicKey.toBase58(),
        name: tokenName,
        symbol: tokenSymbol,
        supply: tokenSupply,
        decimals: tokenDecimals,
        secureToken: secureToken,
        revokeMint,
        revokeFreeze,
        revokeUpdate,
        referralApplied: !!validReferrer,
        tokensLeft: tokensLeft - 1,
        feePaid: feeAmount / LAMPORTS_PER_SOL,
        twitter,
        telegram,
        website,
      });
      setStatus("");
      showToast(t("toast_created"), "success");
      setTokensLeft((prev) => prev - 1);
    } catch (err: any) {
      clearInterval(progressInterval.current!);
      console.error("Create token error:", err);
      
      let errorMessage = err.message || "Unknown error";
      if (err.message?.includes("block height exceeded")) {
        errorMessage = "Transaction took too long. Please try again.";
      } else if (err.message?.includes("User rejected")) {
        errorMessage = "You rejected the transaction.";
      } else if (err.message?.includes("insufficient")) {
        errorMessage = "Insufficient SOL balance. Need at least 0.15 SOL.";
      }
      
      setStatus(`❌ ${errorMessage}`);
      setProgress(0);
      showToast(`❌ ${errorMessage}`, "error");
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  if (successData) {
    return (
      <SuccessModal
        successData={successData}
        mintAddress={mintAddress}
        time={time}
        onReset={() => {
          setSuccessData(null);
          setTokenImage("");
          setPreviewImage(null);
          setRevokeMint(false);
          setRevokeFreeze(false);
          setRevokeUpdate(false);
          setTwitter("");
          setTelegram("");
          setWebsite("");
          setShowSocialLinks(false);
        }}
        onHome={() => setSuccessData(null)}
      />
    );
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Premium Arkaplan Efektleri */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-600/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/20 to-transparent blur-3xl" />
        
        <div className="relative z-10 pt-20 sm:pt-28 max-w-5xl mx-auto px-3 sm:px-4 pb-16">
          {/* Banner */}
          {tokensLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="mb-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-3 sm:p-4 text-white text-center shadow-2xl"
            >
              <div className="flex items-center justify-center gap-2 flex-wrap text-sm sm:text-base font-bold">
                <span>🎁</span>
                <span>{t("pool_title")}</span>
                <span>🎁</span>
              </div>
              <div className="text-xs sm:text-sm mt-1">
                ⚡ {t("pool_first")} <span className="font-bold text-xl">{tokensLeft}</span> {t("pool_tokens")}:{" "}
                <span className="font-bold">0.15 SOL</span>
              </div>
            </motion.div>
          )}

          {/* Başlık */}
          <div className="text-center mb-6 sm:mb-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              {t("create_title")}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 mt-3 text-sm sm:text-base"
            >
              {t("create_subtitle")}
            </motion.p>
          </div>

          {/* Form + Panel */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8">
            {/* SOL TARAF - FORM */}
            <div className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_name_label")}</label>
                  <input type="text" value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder={t("create_name_placeholder")} className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_symbol_label")}</label>
                  <input type="text" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())} placeholder={t("create_symbol_placeholder")} className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_supply_label")}</label>
                  <input type="number" value={tokenSupply} onChange={(e) => setTokenSupply(Number(e.target.value))} className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_decimals_label")}</label>
                  <input type="number" value={tokenDecimals} onChange={(e) => setTokenDecimals(Number(e.target.value))} className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_logo_label")}</label>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 sm:p-6 text-center cursor-pointer hover:border-blue-500 transition bg-gray-800/30" onClick={() => fileInputRef.current?.click()}>
                  {previewImage ? <img src={previewImage} alt="Preview" className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl object-cover" /> : <div className="text-gray-400 text-sm">{t("create_logo_placeholder")}</div>}
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">{t("create_desc_label")}</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("create_desc_placeholder")} className="w-full px-3 sm:px-4 py-3 text-sm border border-gray-700 rounded-xl bg-gray-800/50 text-white outline-none resize-none" />
              </div>
            </div>

            {/* SAĞ TARAF - LAUNCH PANEL */}
            <div className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-8 lg:sticky lg:top-28 space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-2 animate-pulse">⚡</div>
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{t("create_launch")}</div>
                {tokensLeft > 0 && <div className="inline-flex items-center gap-1 mt-2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/30">🎁 {t("create_first100")}</div>}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t("create_launch_fee")}</span>
                    <span className="font-bold text-green-400">{validReferrer ? "0.10 SOL" : "0.15 SOL"}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between font-semibold">
                    <span className="text-gray-300">{t("create_total_fee")}</span>
                    <span className="text-green-400 font-bold text-lg">{validReferrer ? "0.10 SOL" : "0.15 SOL"}</span>
                  </div>
                  {validReferrer && <div className="text-xs text-green-400 mt-1 animate-pulse">🎉 Referral active! You saved 0.05 SOL</div>}
                </div>
              </div>

              {/* Secure Token - 3 Revoke */}
              <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm border border-blue-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="text-base font-bold text-white">🔒 {t("create_secure_label")}</span>
                  <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full font-bold">⭐ 3 REVOKES ⭐</span>
                </div>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={revokeMint} onChange={(e) => setRevokeMint(e.target.checked)} className="w-4 h-4 rounded" />
                    <span className="text-sm text-white/90 group-hover:text-white transition">🚫 Revoke Mint Authority</span>
                    <span className="text-[10px] text-white/50 hidden sm:inline">(No new tokens)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={revokeFreeze} onChange={(e) => setRevokeFreeze(e.target.checked)} className="w-4 h-4 rounded" />
                    <span className="text-sm text-white/90 group-hover:text-white transition">❄️ Revoke Freeze Authority</span>
                    <span className="text-[10px] text-white/50 hidden sm:inline">(No account freezes)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={revokeUpdate} onChange={(e) => setRevokeUpdate(e.target.checked)} className="w-4 h-4 rounded" />
                    <span className="text-sm text-white/90 group-hover:text-white transition">📝 Revoke Update Authority</span>
                    <span className="text-[10px] text-white/50 hidden sm:inline">(Immutable metadata)</span>
                  </label>
                </div>
              </div>

              <button onClick={() => setShowSocialLinks(!showSocialLinks)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg">
                🌐 {t("create_social_button")}
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{t("common_free")}</span>
              </button>

              <AnimatePresence>
                {showSocialLinks && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="space-y-2 p-3 bg-gray-800/50 rounded-xl">
                      <input type="url" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder={t("create_twitter")} className="w-full h-10 px-3 text-sm border border-gray-700 rounded-lg bg-gray-900 text-white outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="url" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder={t("create_telegram")} className="w-full h-10 px-3 text-sm border border-gray-700 rounded-lg bg-gray-900 text-white outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder={t("create_website")} className="w-full h-10 px-3 text-sm border border-gray-700 rounded-lg bg-gray-900 text-white outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {mounted && (
                <button onClick={createToken} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t("create_deploying")}
                    </span>
                  ) : !connected ? t("nav_connect") : t("create_button")}
                </button>
              )}

              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{step}</span>
                    <span className="font-mono text-blue-400">{Math.floor(progress)}%</span>
                  </div>
                </motion.div>
              )}

              {status && (
                <div className="text-xs sm:text-sm text-center text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  {status}
                </div>
              )}

              {validReferrer && (
                <div className="text-xs text-center text-green-400 bg-green-500/10 border border-green-500/30 rounded-xl p-2">
                  🎉 {t("create_referral_active")}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}