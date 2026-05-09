"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useI18n } from "../lib/i18n-provider";
import confetti from "canvas-confetti";

const ADMIN_WALLETS = [
  "aJCqEsDgSXhkLUYAnq4tA2T3LfG7rMbfcdJapf9af9x",
  "2WyCLgg2vuvzmExak8WAeF9kBfvfcD4ahcKfm9P18gSc",
];

interface Stats {
  totalTokens: number;
  totalUsers: number;
  activeUsers: number;
  totalEarnings: number;
  totalReferrals: number;
  totalPaidOut: number;
  netProfit: number;
  dailyGrowth: number;
  weeklyGrowth: number;
}

interface Token {
  mint: string;
  name: string;
  symbol: string;
  createdAt: string;
  createdBy?: string;
}

interface ReferralUser {
  wallet: string;
  referrals: number;
  earnings: number;
}

interface ActivityLog {
  id: string;
  type: "token" | "referral" | "claim";
  wallet: string;
  amount?: number;
  timestamp: string;
}

export default function AdminPage() {
  const { publicKey, connected } = useWallet();
  const { t } = useI18n();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tokens" | "referrals" | "analytics" | "logs">("overview");
  const [stats, setStats] = useState<Stats>({
    totalTokens: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalEarnings: 0,
    totalReferrals: 0,
    totalPaidOut: 0,
    netProfit: 0,
    dailyGrowth: 0,
    weeklyGrowth: 0,
  });
  const [recentTokens, setRecentTokens] = useState<Token[]>([]);
  const [topReferrers, setTopReferrers] = useState<ReferralUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"day" | "week" | "month" | "all">("week");

  const walletAddress = publicKey?.toString();

  const authHeaders = {
    'x-wallet-address': walletAddress || '',
  };

  useEffect(() => {
    if (!connected || !publicKey) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    const isAdmin = ADMIN_WALLETS.some(
      (addr) => addr.toLowerCase() === publicKey.toString().toLowerCase()
    );

    if (!isAdmin) {
      setIsAuthorized(false);
      setLoading(false);
    } else {
      setIsAuthorized(true);
      fetchAllData();
      setLoading(false);
    }
  }, [publicKey, connected]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchRecentTokens(),
      fetchTopReferrers(),
      fetchActivityLogs(),
    ]);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAllData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin-stats", { headers: authHeaders });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentTokens = async () => {
    try {
      const res = await fetch("/api/track-token", { headers: authHeaders });
      const data = await res.json();
      if (data.success) setRecentTokens(data.tokens.slice(-30).reverse());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopReferrers = async () => {
    try {
      const res = await fetch("/api/referral-leaderboard", { headers: authHeaders });
      const data = await res.json();
      if (data.success) setTopReferrers(data.leaderboard);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await fetch("/api/activity-logs", { headers: authHeaders });
      const data = await res.json();
      if (data.success) setActivityLogs(data.logs.slice(-50).reverse());
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 mt-4 font-mono">{t('admin_secure')}...</p>
        </div>
      </div>
    );
  }

  if (!connected || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="text-7xl mb-6 animate-pulse">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">{t('admin_denied')}</h1>
          <p className="text-gray-400 mb-6 font-mono text-sm">
            {!connected
              ? `>_ ${t('admin_connect_req')}`
              : `>_ ${t('admin_unauth')}`}
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-red-500/30">
            <p className="text-xs text-gray-500 font-mono">
              AUTHORIZED_WALLETS: {ADMIN_WALLETS.map(w => `${w.slice(0, 6)}...`).join(", ")}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    { label: t('admin_total_tokens'), value: stats.totalTokens, icon: "🪙", color: "blue", change: "+" + stats.dailyGrowth },
    { label: t('admin_active_users'), value: stats.activeUsers, icon: "👥", color: "green", change: stats.activeUsers > 0 ? "+" + Math.floor(stats.activeUsers * 0.1) : "+0" },
    { label: t('admin_total_ref'), value: stats.totalReferrals, icon: "🔗", color: "purple", change: "+" + Math.floor(stats.totalReferrals * 0.05) },
    { label: t('admin_net_profit'), value: stats.netProfit.toFixed(2) + " SOL", icon: "💎", color: "yellow", change: "+" + (stats.netProfit * 0.1).toFixed(2) + " SOL" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="border-b border-gray-800/50 sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                BLUPRINT_ADMIN
              </div>
              <div className="h-6 w-px bg-gray-700" />
              <div className="flex items-center gap-2 text-xs font-mono text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {t('admin_secure')}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 font-mono">{t('admin_authorized')}</p>
                <p className="text-xs font-mono text-green-500">
                  {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-6)}
                </p>
              </div>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition disabled:opacity-50"
              >
                <svg className={`w-5 h-5 text-gray-400 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex gap-1 mt-6 border-b border-gray-800">
            {[
              { id: "overview", label: t('admin_overview'), icon: "📊" },
              { id: "tokens", label: t('admin_tokens'), icon: "🪙" },
              { id: "referrals", label: t('admin_total_ref'), icon: "🔗" },
              { id: "analytics", label: t('admin_analytics'), icon: "📈" },
              { id: "logs", label: t('admin_logs'), icon: "📋" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-mono transition relative ${
                  activeTab === tab.id ? "text-blue-500" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">{tab.icon} {tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{card.icon}</span>
                      <span className={`text-xs font-mono ${card.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                        {card.change}
                      </span>
                    </div>
                    <div className={`text-3xl font-bold text-${card.color}-500 mb-1 font-mono`}>
                      {card.value}
                    </div>
                    <div className="text-xs text-gray-500 font-mono tracking-wider">{card.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-sm font-bold text-gray-300">{t('admin_recent')}</h3>
                  <span className="text-xs text-gray-500">{recentTokens.length} total</span>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentTokens.slice(0, 10).map((token, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-800/50">
                      <div>
                        <p className="font-medium text-sm">{token.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{token.mint.slice(0, 12)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-500 font-mono">0.15 SOL</p>
                        <p className="text-xs text-gray-600">{new Date(token.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-sm font-bold text-gray-300">{t('admin_top_ref')}</h3>
                  <span className="text-xs text-gray-500">leaderboard</span>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {topReferrers.slice(0, 10).map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50" :
                          idx === 1 ? "bg-gray-400/20 text-gray-400 border border-gray-400/50" :
                          idx === 2 ? "bg-orange-500/20 text-orange-500 border border-orange-500/50" :
                          "bg-gray-700 text-gray-500"
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="font-mono text-sm">{user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-500 font-mono">{user.referrals} {t('ref_referrals')}</p>
                        <p className="text-xs text-gray-500">{user.earnings.toFixed(2)} SOL {t('admin_earned')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "tokens" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-950 border-b border-gray-800">
                    <tr>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">#</th>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">{t('tokenNameLabel')}</th>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">{t('tokenSymbolLabel')}</th>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">MINT ADDRESS</th>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">CREATED</th>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">CREATOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTokens.map((token, idx) => (
                      <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                        <td className="p-4 text-sm text-gray-400 font-mono">{idx + 1}</td>
                        <td className="p-4 font-medium">{token.name}</td>
                        <td className="p-4 text-sm text-gray-400">{token.symbol}</td>
                        <td className="p-4 text-xs font-mono text-gray-500">{token.mint.slice(0, 16)}...</td>
                        <td className="p-4 text-xs text-gray-500">{new Date(token.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-xs font-mono text-gray-500">{token.createdBy?.slice(0, 8)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "referrals" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-950 border-b border-gray-800">
                    <tr>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">#</th>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">WALLET</th>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">{t('ref_total')}</th>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">{t('admin_earned')}</th>
                      <th className="text-left p-4 text-xs font-mono text-gray-500">CLAIMED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topReferrers.map((user, idx) => (
                      <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                        <td className="p-4 text-sm text-gray-400 font-mono">{idx + 1}</td>
                        <td className="p-4 font-mono text-sm">{user.wallet.slice(0, 8)}...{user.wallet.slice(-6)}</td>
                        <td className="p-4"><span className="text-green-500 font-mono">{user.referrals}</span></td>
                        <td className="p-4 text-sm text-gray-400">{user.earnings.toFixed(2)} SOL</td>
                        <td className="p-4 text-sm text-gray-400">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                <h3 className="font-mono text-sm font-bold text-gray-300 mb-4">GROWTH METRICS</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Daily Growth</span>
                      <span className="text-green-500 font-mono">+{stats.dailyGrowth}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, stats.dailyGrowth)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Weekly Growth</span>
                      <span className="text-green-500 font-mono">+{stats.weeklyGrowth}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, stats.weeklyGrowth)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                <h3 className="font-mono text-sm font-bold text-gray-300 mb-4">FINANCIAL SUMMARY</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Total Revenue</span>
                    <span className="text-green-500 font-mono">{stats.totalEarnings.toFixed(2)} SOL</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Paid to Referrers</span>
                    <span className="text-orange-500 font-mono">{stats.totalPaidOut.toFixed(2)} SOL</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Net Profit</span>
                    <span className="text-yellow-500 font-mono font-bold">{stats.netProfit.toFixed(2)} SOL</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "logs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-sm font-bold text-gray-300">ACTIVITY LOGS</h3>
                <div className="flex gap-2">
                  {["day", "week", "month", "all"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf as any)}
                      className={`px-3 py-1 text-xs font-mono rounded-lg transition ${
                        selectedTimeframe === tf
                          ? "bg-blue-500 text-white"
                          : "bg-gray-800 text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      {tf.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activityLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-800/50 text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${
                        log.type === "token" ? "text-blue-500" :
                        log.type === "referral" ? "text-green-500" : "text-orange-500"
                      }`}>
                        [{log.type.toUpperCase()}]
                      </span>
                      <span className="font-mono text-xs text-gray-400">{log.wallet.slice(0, 8)}...</span>
                    </div>
                    <div className="text-right">
                      {log.amount && <span className="text-xs text-green-500 font-mono mr-3">+{log.amount} SOL</span>}
                      <span className="text-xs text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}