"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSearchParams } from "next/navigation";
import { Connection, Transaction } from "@solana/web3.js";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import SuccessModal from "../components/SuccessModal";
import { useToast } from "../components/ToastProvider";
import CountdownTimer from "../components/CountdownTimer";
import { useI18n } from "../lib/i18n-provider";

function CreatePageContent() {
  const { publicKey, sendTransaction } = useWallet();
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
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [time, setTime] = useState(0);
  const [mintAddress, setMintAddress] = useState("");
  const [tokenCount, setTokenCount] = useState<number | null>(null);
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
    const fetchTokenCount = async () => {
      try {
        const res = await fetch("/api/token-stats");
        const data = await res.json();
        if (data.success) {
          setTokenCount(data.totalTokens);
          setTokensLeft(data.tokensLeft);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTokenCount();
  }, []);

  useEffect(() => {
    if (validReferrer) showToast(t('toast_referral'), "info");
  }, [validReferrer, showToast, t]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(t('toast_uploading'), "info");
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setTokenImage(data.url);
        setPreviewImage(URL.createObjectURL(file));
        showToast(t('toast_upload_success'), "success");
      } else {
        showToast(`${t('toast_upload_error')}: ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast(`${t('toast_upload_error')}: ${err.message}`, "error");
    }
  };

  const validateInputs = () => {
    if (tokenName.length < 3 || tokenName.length > 32) return t('create_name_length_error');
    if (tokenSymbol.length < 2 || tokenSymbol.length > 8) return t('create_symbol_length_error');
    if (!/^[A-Z0-9]+$/i.test(tokenSymbol)) return t('create_symbol_char_error');
    if (tokenSupply < 1000 || tokenSupply > 10_000_000_000) return t('create_supply_error');
    if (tokenDecimals < 0 || tokenDecimals > 9) return t('create_decimals_error');
    return null;
  };

  const createToken = async () => {
    if (isProcessing || loading) return;
    if (!publicKey) {
      showToast(t('toast_connect'), "warning");
      return;
    }

    const validationError = validateInputs();
    if (validationError) {
      showToast(`❌ ${validationError}`, "error");
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setProgress(0);
    setStep("🚀 Initializing...");
    setEstimatedTime(5);
    setStatus("Preparing token...");

    const start = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const elapsed = (Date.now() - start) / 1000;
        const newProgress = Math.min(95, Math.floor((elapsed / 5) * 100));
        setEstimatedTime(Math.max(1, Math.ceil(5 - elapsed)));
        return newProgress;
      });
    }, 100);

    const steps = [
      { progress: 10, text: "🔍 Validating inputs..." },
      { progress: 25, text: "📦 Preparing mint account..." },
      { progress: 40, text: "💰 Processing fee..." },
      { progress: 55, text: "🪙 Creating token account..." },
      { progress: 70, text: "⚡ Minting supply..." },
      { progress: 85, text: "🔒 Finalizing transaction..." },
    ];

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length && progress >= steps[stepIndex].progress) {
        setStep(steps[stepIndex].text);
        stepIndex++;
      }
    }, 200);

    try {
      // 1. API'den transaction'ı al
      const res = await fetch("/api/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPublicKey: publicKey.toString(),
          name: tokenName,
          symbol: tokenSymbol,
          supply: tokenSupply,
          decimals: tokenDecimals,
          imageUrl: tokenImage,
          description,
          secureToken,
          revokeMint,
          revokeFreeze,
          revokeUpdate,
          referrer: validReferrer,
          twitter,
          telegram,
          website,
          promoCode: promoCodeInput,
          requestId,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // 2. Transaction'ı deserialize et
      const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));

      // 3. Connection ve blockhash al
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(rpcUrl, 'confirmed');
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // 4. Phantom'a gönder ve imzala
      setStep("📝 Sign transaction in wallet...");
      const signature = await sendTransaction(transaction, connection);
      
      // 5. Onay bekle
      setStep("⏳ Waiting for confirmation...");
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) throw new Error('Transaction failed');

      clearInterval(progressInterval.current);
      clearInterval(stepInterval);
      setProgress(100);
      setStep("✅ Done! Your token is ready.");

      const end = Date.now();
      setTime((end - start) / 1000);
      setMintAddress(data.mintAddress);
      setSuccessData({
        mint: data.mintAddress,
        name: tokenName,
        symbol: tokenSymbol,
        supply: tokenSupply,
        decimals: tokenDecimals,
        secureToken: data.secureTokenApplied || secureToken,
        referralApplied: data.referralApplied,
        tokensLeft: data.tokensLeft,
        feePaid: data.feePaid,
        twitter,
        telegram,
        website,
      });
      setStatus("");
      showToast(t('toast_created'), "success");
    } catch (err: any) {
      clearInterval(progressInterval.current);
      clearInterval(stepInterval);
      setStatus(`❌ ${err.message}`);
      setProgress(0);
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setLoading(false);
      setIsProcessing(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
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

  const isFirstHundred = tokensLeft && tokensLeft > 0;
  const displayFee = 0.15;

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <div className="pt-28 max-w-6xl mx-auto px-4 pb-16">
          
          {isFirstHundred && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
              <div className="relative z-10 flex items-center justify-center gap-3 flex-wrap">
                <span className="text-3xl animate-bounce">🎁</span>
                <span className="font-bold">{t('pool_title')}</span>
                <span className="text-3xl animate-bounce delay-100">🎁</span>
              </div>
              <div className="relative z-10 text-sm mt-1">
                ⚡ {t('pool_first')} <span className="font-bold text-xl">{tokensLeft}</span> {t('pool_tokens')}: <span className="font-bold text-xl">0.15 SOL</span>
              </div>
            </motion.div>
          )}

          {isFirstHundred && <CountdownTimer tokensLeft={tokensLeft} />}

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('create_title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('create_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* FORM */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_name_label')}</label>
                  <input type="text" value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder={t('create_name_placeholder')} className="w-full h-12 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_symbol_label')}</label>
                  <input type="text" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())} placeholder={t('create_symbol_placeholder')} className="w-full h-12 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 uppercase" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_supply_label')}</label>
                <input type="number" value={tokenSupply} onChange={(e) => setTokenSupply(Number(e.target.value))} className="w-full h-12 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_decimals_label')}</label>
                <input type="number" value={tokenDecimals} onChange={(e) => setTokenDecimals(Number(e.target.value))} className="w-full h-12 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_logo_label')}</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 bg-gray-50 dark:bg-gray-800" onClick={() => fileInputRef.current?.click()}>
                  {previewImage ? <img src={previewImage} alt="Preview" className="w-16 h-16 mx-auto rounded-xl object-cover" /> : <div className="text-gray-400 dark:text-gray-500">{t('create_logo_placeholder')}</div>}
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_desc_label')}</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('create_desc_placeholder')} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🎫 {t('common_promo')} ({t('common_optional')})</label>
                <input type="text" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())} placeholder={t('create_promo_placeholder')} className="w-full h-12 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 uppercase" />
              </div>
            </div>

            {/* LAUNCH PANEL */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 sticky top-28">
              <div className="text-center mb-6">
                <div className="text-5xl mb-2">⚡</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{t('create_launch')}</div>
                {isFirstHundred && <div className="inline-flex items-center gap-1 mt-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs">🎁 {t('create_first100')}</div>}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('create_launch_fee')}</span><span className="font-bold text-green-600">{displayFee} {t('common_sol')}</span></div>
                  <div className="border-t pt-2 mt-2"><div className="flex justify-between font-semibold"><span>{t('create_total_fee')}</span><span className="text-green-600 font-bold text-lg">{displayFee} {t('common_sol')}</span></div></div>
                </div>
              </div>

              {/* Secure Token */}
              <div className="rounded-xl p-5 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3"><label className="text-base font-bold text-white flex items-center gap-2">🔒 {t('create_secure_label')}</label><span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold animate-pulse">⭐ {t('common_free')} ⭐</span></div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-white/90 cursor-pointer"><input type="checkbox" checked={revokeMint} onChange={(e) => setRevokeMint(e.target.checked)} className="w-4 h-4 rounded" /><span>🚫 Revoke Mint Authority</span><span className="text-[10px] text-white/60">(No new tokens)</span></label>
                      <label className="flex items-center gap-2 text-sm text-white/90 cursor-pointer"><input type="checkbox" checked={revokeFreeze} onChange={(e) => setRevokeFreeze(e.target.checked)} className="w-4 h-4 rounded" /><span>❄️ Revoke Freeze Authority</span><span className="text-[10px] text-white/60">(No account freezes)</span></label>
                      <label className="flex items-center gap-2 text-sm text-white/90 cursor-pointer"><input type="checkbox" checked={revokeUpdate} onChange={(e) => setRevokeUpdate(e.target.checked)} className="w-4 h-4 rounded" /><span>📝 Revoke Update Authority</span><span className="text-[10px] text-white/60">(Immutable metadata)</span></label>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowSocialLinks(!showSocialLinks)} className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"><span>🌐</span> {t('create_social_button')}<span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{t('common_free')}</span></button>

              <AnimatePresence>{showSocialLinks && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4"><div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"><input type="url" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder={t('create_twitter')} className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" /><input type="url" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder={t('create_telegram')} className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" /><input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder={t('create_website')} className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" /></div></motion.div>)}</AnimatePresence>

              <button onClick={createToken} disabled={!publicKey || loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50">{loading ? t('create_deploying') : t('create_button')}</button>

              {status && <div className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">{status}</div>}

              {isProcessing && (<motion.div className="mt-6 space-y-3"><div className="relative"><div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden"><motion.div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" style={{ width: `${progress}%` }} /></div></div><div className="flex justify-between items-center text-xs"><span className="text-gray-500 dark:text-gray-400">{step}</span><span className="text-blue-600 font-mono">{Math.floor(progress)}%</span></div></motion.div>)}

              {validReferrer && <div className="mt-4 text-xs text-center text-green-600 dark:text-green-400">🎉 {t('create_referral_active')}</div>}
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
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <CreatePageContent />
    </Suspense>
  );
}