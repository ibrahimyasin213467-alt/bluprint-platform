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
  const [launchReady, setLaunchReady] = useState(false);

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
        setLaunchReady(data.stats.launchReady);
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
        showToast(`🎉 You registered as ${data.tier.toUpperCase()}! Rank #${data.rank}`, "success");
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

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative z-10 pt-20 sm:pt-28 max-w-5xl mx-auto px-3 sm:px-4 pb-16">
          
          {/* Header */}
          <div className="text-center mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
            >
              👑 Preregistration
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 mt-3"
            >
              Limited to 2,000 participants. VIP for first 500.
            </motion.p>
          </div>

          {/* Progress Bar */}
          {stats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
            >
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-yellow-400 font-bold">{stats.total} / {stats.maxLimit}</span>
              </div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercent()}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-4 text-xs">
                <div className="text-center">
                  <div className="text-yellow-400 font-bold">{stats.vip}</div>
                  <div className="text-gray-500">VIP Spots</div>
                  <div className="text-gray-600 text-[10px]">(First 500)</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold">{stats.premium}</div>
                  <div className="text-gray-500">Premium Spots</div>
                  <div className="text-gray-600 text-[10px]">(501-2000)</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Launch Ready Banner */}
          {launchReady && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 text-center"
            >
              <div className="text-2xl mb-1">🚀</div>
              <div className="font-bold text-white">LAUNCH READY!</div>
              <div className="text-sm text-green-200">2,000 preregistrations completed. Launching soon!</div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Registration Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Register Now</h2>
              
              {!connected ? (
                <button
                  onClick={() => setVisible(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
                >
                  Connect Wallet
                </button>
              ) : registered ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-green-400 font-bold mb-1">You are registered!</div>
                  <div className={`text-lg font-bold ${userTier === 'vip' ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {userTier?.toUpperCase()} Member
                  </div>
                  <div className="text-gray-400 text-sm mt-2">
                    {userTier === 'vip' ? '👑 VIP perks will be activated' : '⭐ Premium perks will be activated'}
                  </div>
                </div>
              ) : stats && stats.total >= stats.maxLimit ? (
                <div className="text-center">
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="text-red-400 font-bold">Registration Full</div>
                  <div className="text-gray-400 text-sm mt-2">2,000 spots have been filled</div>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
                >
                  {loading ? "Registering..." : `Register (${stats?.total || 0}/${stats?.maxLimit || 2000} spots left)`}
                </button>
              )}
            </div>

            {/* Perks Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Perks & Benefits</h2>
              
              <div className="space-y-4">
                {/* VIP Perks */}
                <div className="border-b border-gray-700 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👑</span>
                    <span className="font-bold text-yellow-400">VIP (First 500)</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1 ml-6 list-disc">
                    <li>0.1 SOL airdrop every month (1st day)</li>
                    <li>10% of platform revenue share</li>
                    <li>Exclusive Telegram channel with admin</li>
                    <li>Early access to bonding curve features</li>
                    <li>👑 VIP Badge</li>
                  </ul>
                </div>

                {/* Premium Perks */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⭐</span>
                    <span className="font-bold text-blue-400">Premium (501-2000)</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1 ml-6 list-disc">
                    <li>1 free token creation per month</li>
                    <li>5% of platform revenue share</li>
                    <li>Support group with assistant admin</li>
                    <li>Early access to bonding curve features</li>
                    <li>⭐ Premium Badge</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-400 text-center">
                  ⚠️ You must create at least ONE token to activate your perks. Otherwise, your registration will be revoked.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}