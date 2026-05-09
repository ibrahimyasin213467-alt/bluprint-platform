"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { useToast } from "../components/ToastProvider";
import { useI18n } from "../lib/i18n-provider";
import confetti from "canvas-confetti";

export default function ReferralPage() {
  const { publicKey } = useWallet();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<{ wallet: string; referrals: number }[]>([]);
  const [nextMilestone, setNextMilestone] = useState(10);
  const [animateMilestone, setAnimateMilestone] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (publicKey) {
      fetchPromoCode();
      fetchEarnings();
      fetchLeaderboard();
    }
  }, [publicKey]);

  const fetchPromoCode = async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`/api/user-promocode?wallet=${publicKey.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPromoCode(data.promoCode);
        setHasToken(data.hasToken);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`/api/referral-earnings?wallet=${publicKey.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEarnings(data.earnings);
        setTotalReferrals(data.totalReferrals);
        
        const milestone = Math.floor(data.totalReferrals / 10) * 10 + 10;
        setNextMilestone(milestone);
        if (data.totalReferrals > 0 && data.totalReferrals % 10 === 0) {
          setAnimateMilestone(true);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#3b82f6", "#8b5cf6", "#06b6d4"],
          });
          setTimeout(() => setAnimateMilestone(false), 3000);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/referral-leaderboard");
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaim = async () => {
    if (!publicKey) {
      showToast(t('toast_connect'), "warning");
      return;
    }
    if (earnings <= 0) {
      showToast(t('ref_no_earnings'), "info");
      return;
    }

    setClaiming(true);
    showToast(t('ref_processing'), "info");

    try {
      const res = await fetch("/api/claim-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toString(),
          amount: earnings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ ${t('toast_claimed')} ${earnings.toFixed(4)} SOL!`, "success");
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#10b981", "#14b8a6"],
        });
        setEarnings(0);
        setTimeout(() => fetchEarnings(), 1000);
      } else {
        showToast(`❌ ${t('toast_claim_error')}: ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setClaiming(false);
    }
  };

  const copyToClipboard = () => {
    if (!promoCode) return;
    navigator.clipboard.writeText(promoCode);
    showToast(t('toast_copied'), "success");
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#60a5fa"],
    });
  };

  const shareOnTwitter = () => {
    if (!promoCode) return;
    const text = `🚀 ${t('common_per_ref')} on @BluPrint! Use my promo code: ${promoCode}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnTelegram = () => {
    if (!promoCode) return;
    const text = `🚀 ${t('common_per_ref')} on BluPrint! My promo code: ${promoCode}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    if (!promoCode) return;
    const text = `🚀 ${t('common_per_ref')} on BluPrint! My promo code: ${promoCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnDiscord = () => {
    if (!promoCode) return;
    const text = `🚀 ${t('common_per_ref')} on BluPrint! My promo code: ${promoCode}`;
    window.open(`https://discord.com/channels/@me`, "_blank");
  };

  const progressToMilestone = Math.min(100, (totalReferrals / nextMilestone) * 100);

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <Navbar mounted={mounted} />
        <div className="pt-28 max-w-6xl mx-auto px-4 pb-16">
          
          {/* HERO */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium mb-4 shadow-lg"
            >
              💰 {t('ref_badge')}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {t('ref_title')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
                {t('ref_highlight')}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              {t('ref_subtitle')}
            </motion.p>
          </div>

          {/* STATS CARDS */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition"
            >
              <div className="text-4xl mb-3">👥</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalReferrals}</div>
              <div className="text-sm text-gray-500">{t('ref_total')}</div>
              {totalReferrals > 0 && (
                <div className="mt-2 text-xs text-green-600">
                  🎯 {nextMilestone - totalReferrals} {t('ref_milestone')?.toLowerCase()}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-center text-white shadow-lg hover:shadow-xl transition"
            >
              <div className="text-4xl mb-3">💰</div>
              <div className="text-3xl font-bold">{earnings.toFixed(4)} SOL</div>
              <div className="text-sm opacity-90">{t('ref_unclaimed')}</div>
              {earnings > 0 && (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="mt-3 bg-white/20 hover:bg-white/30 font-semibold py-2 px-4 rounded-xl transition text-sm"
                >
                  {claiming ? t('ref_processing') : t('ref_claim')}
                </button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition"
            >
              <div className="text-4xl mb-3">⚡</div>
              <div className="text-3xl font-bold text-green-600">0.05 SOL</div>
              <div className="text-sm text-gray-500">{t('ref_per')}</div>
            </motion.div>
          </div>

          {/* MILESTONE PROGRESS */}
          <AnimatePresence>
            {animateMilestone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-6 text-center shadow-2xl"
              >
                <div className="text-5xl mb-2">🎉</div>
                <div className="text-xl font-bold">{t('ref_milestone')}</div>
                <div className="text-sm">{t('ref_you_reached')} {totalReferrals} {t('ref_referrals')}!</div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6 mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>{t('ref_progress')} {nextMilestone} {t('ref_referrals')}</span>
              <span className="font-bold">{totalReferrals}/{nextMilestone}</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToMilestone}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-center text-gray-500 mt-3">
              🎁 {t('ref_milestone')} {nextMilestone} {t('ref_referrals')}!
            </p>
          </div>

          {/* PROMO CODE SECTION */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 mb-12 border border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🔐</span> {t('ref_promo_title')}
            </h2>
            
            {!publicKey ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🔌</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{t('ref_connect_first')}</p>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : hasToken && promoCode ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl px-6 py-4 font-mono text-3xl font-bold text-center tracking-wider border border-blue-200 dark:border-blue-700">
                    {promoCode}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center gap-2"
                  >
                    📋 {t('ref_claim')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={shareOnTwitter}
                    className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm"
                  >
                    🐦 {t('ref_twitter')}
                  </button>
                  <button
                    onClick={shareOnTelegram}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm"
                  >
                    💬 {t('ref_telegram')}
                  </button>
                  <button
                    onClick={shareOnDiscord}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm"
                  >
                    💜 {t('ref_discord')}
                  </button>
                  <button
                    onClick={shareOnWhatsApp}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm"
                  >
                    💚 {t('ref_whatsapp')}
                  </button>
                </div>
                <p className="text-center text-sm text-gray-500">
                  {t('ref_share_desc')}
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="blur-md select-none">
                  <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 font-mono text-2xl font-bold text-center tracking-wider border border-gray-200 dark:border-gray-700">
                    •••••••
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white">
                    <span className="text-lg">🔒</span>
                    <span className="text-sm font-medium">{t('ref_create_first')}</span>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <a
                    href="/create"
                    className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-xl transition"
                  >
                    ✨ {t('ref_create_btn')}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* LEADERBOARD */}
          {leaderboard.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-12 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🏆</span> {t('ref_top')}
              </h3>
              <div className="space-y-2">
                {leaderboard.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-mono text-sm">
                        {user.wallet.slice(0, 4)}...{user.wallet.slice(-4)}
                      </span>
                    </div>
                    <div className="font-bold text-green-600">{user.referrals} {t('ref_referrals')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOW IT WORKS */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">{t('ref_how_title')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  1️⃣
                </div>
                <h3 className="font-bold mb-2">{t('ref_step1')}</h3>
                <p className="text-sm text-gray-500">{t('ref_step1_desc')}</p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  2️⃣
                </div>
                <h3 className="font-bold mb-2">{t('ref_step2')}</h3>
                <p className="text-sm text-gray-500">{t('ref_step2_desc')}</p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  3️⃣
                </div>
                <h3 className="font-bold mb-2">{t('ref_step3')}</h3>
                <p className="text-sm text-gray-500">{t('ref_step3_desc')}</p>
              </div>
            </div>
          </div>

        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}