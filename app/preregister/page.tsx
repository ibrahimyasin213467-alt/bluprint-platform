"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

export default function PreregisterPage() {
  const { publicKey, connected, signMessage } = useWallet();
  const [stats, setStats] = useState({ total: 0, vip: 0, premium: 0, maxLimit: 2000, vipLimit: 500 });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [userTier, setUserTier] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/preregister/stats");
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      let signature = null;
      let message = null;

      if (signMessage) {
        message = `Register for BluPrint preregistration at ${Date.now()}`;
        const encodedMessage = new TextEncoder().encode(message);
        const sig = await signMessage(encodedMessage);
        signature = Buffer.from(sig).toString("base64");
      }

      const res = await fetch("/api/preregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toString(),
          signature,
          message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistered(true);
        setUserTier(data.tier);
        setUserRank(data.rank);
        fetchStats();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const vipProgress = (stats.vip / stats.vipLimit) * 100;
  const premiumProgress = (stats.premium / (stats.maxLimit - stats.vipLimit)) * 100;

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <Navbar mounted={true} />
        <div className="pt-28 max-w-4xl mx-auto px-4 pb-16">
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">BluPrint Preregistration</h1>
            <p className="text-gray-600 dark:text-gray-400">Register before launch to get VIP/Premium benefits</p>
          </div>

          {/* Progress bars */}
          <div className="space-y-6 mb-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">👑 VIP (0-500)</span>
                <span>{stats.vip} / {stats.vipLimit}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${vipProgress}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">⭐ Premium (501-2000)</span>
                <span>{stats.premium} / {stats.maxLimit - stats.vipLimit}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-500 rounded-full" style={{ width: `${premiumProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Register button */}
          {!registered ? (
            <div className="text-center">
              <button
                onClick={handleRegister}
                disabled={loading || stats.total >= stats.maxLimit}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-xl disabled:opacity-50 transition"
              >
                {loading ? "Registering..." : stats.total >= stats.maxLimit ? "Registration Full" : "🔗 Preregister Now"}
              </button>
            </div>
          ) : (
            <div className="bg-green-100 dark:bg-green-900/30 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-xl font-bold text-green-700 dark:text-green-400">Registration Complete!</h2>
              <p className="mt-2">
                You are {userTier === "vip" ? "👑 VIP Member" : "⭐ Premium Member"}. Rank: {userRank}
              </p>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}