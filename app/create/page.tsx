"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useSearchParams } from "next/navigation";
import { Connection, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
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
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import SuccessModal from "../components/SuccessModal";
import { useToast } from "../components/ToastProvider";
import { useI18n } from "../lib/i18n-provider";

declare global {
  interface Window {
    solana?: any;
  }
}

const RPC_URL = "https://api.mainnet-beta.solana.com";

function CreatePageContent() {
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
  const [promoCodeInput, setPromoCodeInput] = useState("");

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
        return Math.min(90, Math.floor((elapsed / 10) * 100));
      });
    }, 100);

    try {
      const connection = new Connection(RPC_URL, "confirmed");
      
      // 1. Mint keypair oluştur
      setStep("🔑 Creating mint account...");
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      
      // 2. Token hesabı (ATA)
      setStep("📝 Creating token account...");
      const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);
      
      // 3. Supply hesapla
      const supply = Number(tokenSupply) * Math.pow(10, tokenDecimals);
      
      // 4. Transaction oluştur
      setStep("📦 Building transaction...");
      const transaction = new Transaction();
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // 5. Instruction'ları ekle
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(mintKeypair.publicKey, tokenDecimals, publicKey, secureToken ? publicKey : null),
        createAssociatedTokenAccountInstruction(publicKey, ata, publicKey, mintKeypair.publicKey),
        createMintToInstruction(mintKeypair.publicKey, ata, publicKey, supply)
      );

      // 6. Revoke'lar (secureToken ise)
      if (secureToken) {
        if (revokeMint) {
          transaction.add(createSetAuthorityInstruction(mintKeypair.publicKey, publicKey, AuthorityType.MintTokens, null));
        }
        if (revokeFreeze) {
          transaction.add(createSetAuthorityInstruction(mintKeypair.publicKey, publicKey, AuthorityType.FreezeAccount, null));
        }
      }

      // 7. Mint keypair'i transaction'a ekle
      transaction.partialSign(mintKeypair);

      // 8. İmzala ve gönder
      setStep("📝 Please sign in your wallet...");
      setProgress(92);
      const signature = await sendTransaction(transaction, connection);
      
      setStep("⏳ Confirming transaction...");
      setProgress(96);
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

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
        referralApplied: false,
        tokensLeft: tokensLeft - 1,
        feePaid: 0.15,
        twitter,
        telegram,
        website,
      });
      setStatus("");
      showToast(t("toast_created"), "success");
      
      // Token sayısını azalt
      setTokensLeft((prev) => prev - 1);
    } catch (err: any) {
      clearInterval(progressInterval.current!);
      console.error("Create token error:", err);
      setStatus(`❌ ${err.message || "Unknown error"}`);
      setProgress(0);
      showToast(`❌ ${err.message || "Unknown error"}`, "error");
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
          setPromoCodeInput("");
        }}
        onHome={() => setSuccessData(null)}
      />
    );
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="pt-20 sm:pt-28 max-w-5xl mx-auto px-3 sm:px-4 pb-16">
          {/* Banner */}
          {tokensLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-3 sm:p-4 text-white text-center"
            >
              <div className="flex items-center justify-center gap-2 flex-wrap text-sm sm:text-base font-bold">
                <span>🎁</span>
                <span>{t("pool_title")}</span>
                <span>🎁</span>
              </div>
              <div className="text-xs sm:text-sm mt-1">
                ⚡ {t("pool_first")} <span className="font-bold text-lg">{tokensLeft}</span> {t("pool_tokens")}:{" "}
                <span className="font-bold">0.15 SOL</span>
              </div>
            </motion.div>
          )}

          {/* Başlık */}
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t("create_title")}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">{t("create_subtitle")}</p>
          </div>

          {/* Form + Panel */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8">
            {/* SOL TARAF - FORM */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-8 space-y-4 sm:space-y-6">
              {/* Name + Symbol */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("create_name_label")}
                  </label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder={t("create_name_placeholder")}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("create_symbol_label")}
                  </label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                    placeholder={t("create_symbol_placeholder")}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  />
                </div>
              </div>

              {/* Supply + Decimals */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("create_supply_label")}
                  </label>
                  <input
                    type="number"
                    value={tokenSupply}
                    onChange={(e) => setTokenSupply(Number(e.target.value))}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("create_decimals_label")}
                  </label>
                  <input
                    type="number"
                    value={tokenDecimals}
                    onChange={(e) => setTokenDecimals(Number(e.target.value))}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("create_logo_label")}
                </label>
                <div
                  className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 text-center cursor-pointer hover:border-blue-400 transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 text-sm">{t("create_logo_placeholder")}</div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("create_desc_label")}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("create_desc_placeholder")}
                  className="w-full px-3 sm:px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
                />
              </div>
            </div>

            {/* SAĞ TARAF - LAUNCH PANEL */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-8 lg:sticky lg:top-28 space-y-4">
              {/* Fee Info */}
              <div className="text-center">
                <div className="text-4xl mb-1">⚡</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("create_launch")}</div>
                {tokensLeft > 0 && (
                  <div className="inline-flex items-center gap-1 mt-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-medium">
                    🎁 {t("create_first100")}
                  </div>
                )}
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t("create_launch_fee")}</span>
                    <span className="font-bold text-green-600">0.15 SOL</span>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-2 flex justify-between font-semibold">
                    <span className="text-gray-700 dark:text-gray-300">{t("create_total_fee")}</span>
                    <span className="text-green-600 font-bold text-lg">0.15 SOL</span>
                  </div>
                </div>
              </div>

              {/* Secure Token (Revokes) */}
              <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="text-base font-bold text-white">🔒 {t("create_secure_label")}</span>
                  <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">
                    ⭐ {t("common_free")} ⭐
                  </span>
                </div>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={revokeMint}
                      onChange={(e) => setRevokeMint(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-white/90">🚫 Revoke Mint Authority</span>
                    <span className="text-[10px] text-white/60 hidden sm:inline">(No new tokens)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={revokeFreeze}
                      onChange={(e) => setRevokeFreeze(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-white/90">❄️ Revoke Freeze Authority</span>
                    <span className="text-[10px] text-white/60 hidden sm:inline">(No account freezes)</span>
                  </label>
                </div>
              </div>

              {/* Social Links Button */}
              <button
                onClick={() => setShowSocialLinks(!showSocialLinks)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
              >
                🌐 {t("create_social_button")}
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{t("common_free")}</span>
              </button>

              <AnimatePresence>
                {showSocialLinks && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <input
                        type="url"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder={t("create_twitter")}
                        className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 outline-none"
                      />
                      <input
                        type="url"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder={t("create_telegram")}
                        className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 outline-none"
                      />
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder={t("create_website")}
                        className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CREATE BUTTON */}
              {mounted && (
                <button
                  onClick={createToken}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition text-sm sm:text-base"
                >
                  {loading ? t("create_deploying") : !connected ? t("nav_connect") : t("create_button")}
                </button>
              )}

              {/* Progress Bar */}
              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{step}</span>
                    <span className="font-mono text-blue-600">{Math.floor(progress)}%</span>
                  </div>
                </motion.div>
              )}

              {/* Status Message */}
              {status && (
                <div className="text-xs sm:text-sm text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                  {status}
                </div>
              )}

              {/* Referral Active */}
              {validReferrer && (
                <div className="text-xs text-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl p-2">
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

export default function CreatePage() {
  return (
    <CreatePageContent />
  );
}