"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { useToast } from "../components/ToastProvider";

interface Stats {
  total: number;
  vip: number;
  premium: number;
  maxLimit: number;
  vipLimit: number;
  launchReady: boolean;
}

export default function PreregisterPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [userTier, setUserTier] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats();
    if (publicKey) {
      checkRegistration();
    }
  }, [publicKey]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/preregister");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkRegistration = async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`/api/preregister?wallet=${publicKey.toString()}`);
      const data = await res.json();
      if (data.success && data.registered) {
        setRegistered(true);
        setUserTier(data.tier);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/preregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistered(true);
        setUserTier(data.tier);
        showToast(`🎉 You secured ${data.tier.toUpperCase()} access! Rank #${data.rank}`, "success");
        fetchStats();
      } else {
        showToast(`❌ ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercent = () => {
    if (!stats) return 0;
    return (stats.total / stats.maxLimit) * 100;
  };

  const spotsRemaining = stats ? stats.maxLimit - stats.total : 2000;

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
        {/* Arkaplan Efektleri */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-600/20 to-transparent blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/20 to-transparent blur-3xl animate-pulse" />
        
        {/* Floating Particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full opacity-50 animate-ping" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full opacity-50 animate-ping delay-150" />
        <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-cyan-400 rounded-full opacity-50 animate-ping delay-300" />
        
        <div className="relative z-10 pt-20 sm:pt-28 max-w-4xl mx-auto px-3 sm:px-4 pb-16">
          
          {/* HERO SECTION */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block mb-4"
            >
              <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                LIMITED EARLY ACCESS
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            >
              BluPrint Early Access
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-lg"
            >
              Limited to <span className="text-blue-400 font-bold">2,000 early members</span>. First 500 unlock <span className="text-yellow-400 font-bold">VIP status</span>.
            </motion.p>
          </div>

          {/* PROGRESS SECTION */}
          {stats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-400 text-sm">🔥 Spots Claimed</span>
                  <span className="text-blue-400 font-bold text-sm">{stats.total} / {stats.maxLimit}</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercent()}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-blue-500/30"
                  />
                </div>
                <div className="text-center mt-4">
                  <p className="text-3xl font-bold text-white">{spotsRemaining}</p>
                  <p className="text-gray-500 text-sm">spots remaining</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* CARDS */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            
            {/* VIP CARD */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">👑</span>
                  <h3 className="text-xl font-bold text-yellow-400">VIP Access</h3>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full ml-auto">First 500 Members</span>
                </div>
                <ul className="space-y-3 mb-4">
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-yellow-400">✓</span> Monthly platform rewards
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-yellow-400">✓</span> Priority access to new features
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-yellow-400">✓</span> Exclusive Telegram community
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-yellow-400">✓</span> Early access to bonding curve launchpad
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-yellow-400">✓</span> VIP profile badge
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 text-xs mt-2">
                    <span className="text-yellow-500/70">✦</span> Eligibility for future ecosystem rewards
                  </li>
                </ul>
                {stats && stats.total >= stats.vipLimit ? (
                  <div className="text-center text-red-400 text-sm py-2">🔒 VIP spots filled</div>
                ) : (
                  <div className="text-center text-yellow-500/70 text-xs">Limited availability. VIP access closes after 500 registrations.</div>
                )}
              </div>
            </motion.div>

            {/* PREMIUM CARD */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">⭐</span>
                  <h3 className="text-xl font-bold text-blue-400">Premium Access</h3>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full ml-auto">Members 501–2000</span>
                </div>
                <ul className="space-y-3 mb-4">
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-blue-400">✓</span> Monthly free token creation
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-blue-400">✓</span> Early access to upcoming tools
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-blue-400">✓</span> Premium community access
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-blue-400">✓</span> Future feature previews
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-blue-400">✓</span> Premium profile badge
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 text-xs mt-2">
                    <span className="text-blue-500/70">✦</span> Eligibility for future ecosystem rewards
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* ACTIVATION SECTION */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 text-center"
          >
            <p className="text-yellow-400 text-sm">
              ⚡ To activate your membership perks, you must launch at least one token on BluPrint.
              <br />
              <span className="text-yellow-500/70 text-xs">Inactive registrations may be removed.</span>
            </p>
          </motion.div>

          {/* REGISTRATION CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-md mx-auto text-center"
          >
            {!connected ? (
              <button
                onClick={() => setVisible(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] text-lg"
              >
                Connect Wallet
              </button>
            ) : registered ? (
              <div>
                <div className="text-5xl mb-3">✅</div>
                <div className="text-green-400 font-bold text-lg mb-1">Access Secured!</div>
                <div className={`text-2xl font-bold mb-2 ${userTier === 'vip' ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {userTier?.toUpperCase()} Member
                </div>
                <div className="text-gray-400 text-sm">
                  {userTier === 'vip' ? '👑 VIP perks will be activated after token launch' : '⭐ Premium perks will be activated after token launch'}
                </div>
              </div>
            ) : stats && stats.total >= stats.maxLimit ? (
              <div>
                <div className="text-5xl mb-3">🔒</div>
                <div className="text-red-400 font-bold text-lg">All spots filled</div>
                <div className="text-gray-400 text-sm mt-2">2,000 spots have been claimed. Early access closed.</div>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] text-lg"
              >
                {loading ? "Securing..." : "🚀 Secure Your Spot"}
              </button>
            )}
          </motion.div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}