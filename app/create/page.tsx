"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useSearchParams } from "next/navigation";
import { Connection, Transaction } from "@solana/web3.js";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import SuccessModal from "../components/SuccessModal";
import { useToast } from "../components/ToastProvider";
import CountdownTimer from "../components/CountdownTimer";
import { useI18n } from "../lib/i18n-provider";

const RPC_URL = 'https://solana-mainnet.g.alchemy.com/v2/HOfnwF22z5T8BCHNl_KIo';

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
      .then(r => r.json())
      .then(data => { if (data.success) setTokensLeft(data.tokensLeft); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (validReferrer) showToast(t('toast_referral'), "info");
  }, [validReferrer]);

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
        showToast(`❌ ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
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
      setVisible(true);
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
    setStatus("Preparing token...");

    const start = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        const elapsed = (Date.now() - start) / 1000;
        return Math.min(90, Math.floor((elapsed / 8) * 100));
      });
    }, 100);

    try {
      // 1. API'den transaction al
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

      // 2. Transaction deserialize
      const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));

      // 3. Connection
      const connection = new Connection(RPC_URL, 'confirmed');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // 4. Cüzdana gönder
      setStep("📝 Sign in your wallet...");
      setProgress(92);
      const signature = await sendTransaction(transaction, connection);

      // 5. Onay bekle
      setStep("⏳ Confirming...");
      setProgress(96);
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

      clearInterval(progressInterval.current!);
      setProgress(100);
      setStep("✅ Done!");

      setTime((Date.now() - start) / 1000);
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
      clearInterval(progressInterval.current!);
      setStatus(`❌ ${err.message}`);
      setProgress(0);
      showToast(`❌ ${err.message}`, "error");
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
                <span>{t('pool_title')}</span>
                <span>🎁</span>
              </div>
              <div className="text-xs sm:text-sm mt-1">
                ⚡ {t('pool_first')} <span className="font-bold text-lg">{tokensLeft}</span> {t('pool_tokens')}: <span className="font-bold">0.15 SOL</span>
              </div>
            </motion.div>
          )}

          {tokensLeft > 0 && <CountdownTimer tokensLeft={tokensLeft} />}

          {/* Başlık */}
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('create_title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">{t('create_subtitle')}</p>
          </div>

          {/* Form + Panel */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8">

            {/* Form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-8 space-y-4 sm:space-y-6">

              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_name_label')}</label>
                  <input type="text" value={tokenName} onChange={e => setTokenName(e.target.value)} placeholder={t('create_name_placeholder')} className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_symbol_label')}</label>
                  <input type="text" value={tokenSymbol} onChange={e => setTokenSymbol(e.target.value.toUpperCase())} placeholder={t('create_symbol_placeholder')} className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_supply_label')}</label>
                  <input type="number" value={tokenSupply} onChange={e => setTokenSupply(Number(e.target.value))} className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_decimals_label')}</label>
                  <input type="number" value={tokenDecimals} onChange={e => setTokenDecimals(Number(e.target.value))} className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_logo_label')}</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 text-center cursor-pointer hover:border-blue-400 transition" onClick={() => fileInputRef.current?.click()}>
                  {previewImage ? <img src={previewImage} alt="Preview" className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl object-cover" /> : <div className="text-gray-400 dark:text-gray-500 text-sm">{t('create_logo_placeholder')}</div>}
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('create_desc_label')}</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder={t('create_desc_placeholder')} className="w-full px-3 sm:px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none" />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🎫 {t('common_promo')} <span className="text-gray-400">({t('common_optional')})</span></label>
                <input type="text" value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value.toUpperCase())} placeholder={t('create_promo_placeholder')} className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
              </div>
            </div>

            {/* Launch Panel */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-8 lg:sticky lg:top-28 space-y-4">

              <div className="text-center">
                <div className="text-4xl mb-1">⚡</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('create_launch')}</div>
                {tokensLeft > 0 && <div className="inline-flex items-center gap-1 mt-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-medium">🎁 {t('create_first100')}</div>}
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('create_launch_fee')}</span><span className="font-bold text-green-600">0.15 SOL</span></div>
                  <div className="border-t dark:border-gray-700 pt-2 flex justify-between font-semibold"><span className="text-gray-700 dark:text-gray-300">{t('create_total_fee')}</span><span className="text-green-600 font-bold text-lg">0.15 SOL</span></div>
                </div>
              </div>

              {/* Revoke */}
              <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2"><span className="text-base font-bold text-white">🔒 {t('create_secure_label')}</span><span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">⭐ {t('common_free')} ⭐</span></div>
                <div className="space-y-2.5">
                  {[
                    { label: "🚫 Revoke Mint Authority", sub: "(No new tokens)", val: revokeMint, set: setRevokeMint },
                    { label: "❄️ Revoke Freeze Authority", sub: "(No account freezes)", val: revokeFreeze, set: setRevokeFreeze },
                    { label: "📝 Revoke Update Authority", sub: "(Immutable metadata)", val: revokeUpdate, set: setRevokeUpdate },
                  ].map(item => (
                    <label key={item.label} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={item.val} onChange={e => item.set(e.target.checked)} className="w-4 h-4 rounded flex-shrink-0" /><span className="text-sm text-white/90">{item.label}</span><span className="text-[10px] text-white/60 hidden sm:inline">{item.sub}</span></label>
                  ))}
                </div>
              </div>

              {/* Social */}
              <button onClick={() => setShowSocialLinks(!showSocialLinks)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm">🌐 {t('create_social_button')}<span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{t('common_free')}</span></button>
              <AnimatePresence>{showSocialLinks && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">{twitter !== undefined && telegram !== undefined && website !== undefined && [twitter, telegram, website].map((val, idx) => (<input key={idx} type="url" value={val} onChange={e => idx === 0 ? setTwitter(e.target.value) : idx === 1 ? setTelegram(e.target.value) : setWebsite(e.target.value)} placeholder={idx === 0 ? t('create_twitter') : idx === 1 ? t('create_telegram') : t('create_website')} className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none" />))}</div></motion.div>)}</AnimatePresence>

              {/* Button */}
              {mounted && <button onClick={createToken} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white