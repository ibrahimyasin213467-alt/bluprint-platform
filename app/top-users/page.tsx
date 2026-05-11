"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

interface TopUser {
  wallet: string;
  tier: string;
  referrals: number;
  tokensCreated: number;
  totalEarned: number;
  rank: number;
}

export default function TopUsersPage() {
  const [users, setUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<"all" | "weekly" | "monthly">("all");

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    try {
      // Mock data - will be replaced with real API
      const mockUsers: TopUser[] = [
        { wallet: "aJCqEsDgSXhkLUYAnq4tA2T3LfG7rMbfcdJapf9af9x", tier: "vip", referrals: 156, tokensCreated: 23, totalEarned: 7.8, rank: 1 },
        { wallet: "2WyCLgg2vuvzmExak8WAeF9kBfvfcD4ahcKfm9P18gSc", tier: "vip", referrals: 98, tokensCreated: 15, totalEarned: 4.9, rank: 2 },
        { wallet: "8x3k7jm9p2qL4r5t6y7u8i9o0p1a2s3d4f5g6h7j8k9", tier: "premium", referrals: 67, tokensCreated: 12, totalEarned: 3.35, rank: 3 },
        { wallet: "5m9j2n4k6p8r0t2v4x6z8b0d2f4h6j8l0n2p4r6t8", tier: "premium", referrals: 45, tokensCreated: 8, totalEarned: 2.25, rank: 4 },
        { wallet: "2n7k4t8r2v5x9c3f6h9l2o5r8u1x4m7q0w3e6r9t2", tier: "premium", referrals: 34, tokensCreated: 6, totalEarned: 1.7, rank: 5 },
      ];
      setUsers(mockUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTierBadge = (tier: string) => {
    if (tier === "vip") {
      return <span className="text-yellow-500 text-sm">👑 VIP</span>;
    }
    return <span className="text-gray-400 text-sm">⭐ Premium</span>;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-950">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950">
        <div className="pt-6 px-6">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">🏆 Top Users</h1>
              <p className="text-gray-500 text-sm">Leaderboard by referrals and activity</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeFrame("all")}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  timeFrame === "all" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeFrame("weekly")}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  timeFrame === "weekly" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeFrame("monthly")}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  timeFrame === "monthly" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 rounded-xl border border-yellow-500/30 p-4">
              <div className="text-2xl mb-1">👑</div>
              <div className="text-2xl font-bold text-white">{users.filter(u => u.tier === "vip").length}</div>
              <div className="text-xs text-gray-400">VIP Members</div>
            </div>
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-xl border border-blue-500/30 p-4">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-2xl font-bold text-white">{users.filter(u => u.tier === "premium").length}</div>
              <div className="text-xs text-gray-400">Premium Members</div>
            </div>
            <div className="bg-gradient-to-r from-green-600/20 to-green-500/10 rounded-xl border border-green-500/30 p-4">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-2xl font-bold text-white">{users.reduce((sum, u) => sum + u.totalEarned, 0).toFixed(1)} SOL</div>
              <div className="text-xs text-gray-400">Total Referral Earnings</div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="p-4 text-left text-xs font-mono text-gray-400">RANK</th>
                    <th className="p-4 text-left text-xs font-mono text-gray-400">USER</th>
                    <th className="p-4 text-left text-xs font-mono text-gray-400">TIER</th>
                    <th className="p-4 text-right text-xs font-mono text-gray-400">REFERRALS</th>
                    <th className="p-4 text-right text-xs font-mono text-gray-400">TOKENS</th>
                    <th className="p-4 text-right text-xs font-mono text-gray-400">EARNED (SOL)</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <motion.tr
                      key={user.wallet}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {user.rank === 1 && <span className="text-2xl">🥇</span>}
                          {user.rank === 2 && <span className="text-2xl">🥈</span>}
                          {user.rank === 3 && <span className="text-2xl">🥉</span>}
                          {user.rank > 3 && <span className="text-gray-400 font-mono">#{user.rank}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-mono text-sm text-white">{shortenAddress(user.wallet)}</div>
                          {user.rank === 1 && <div className="text-xs text-yellow-500">🏆 Top Referrer</div>}
                        </div>
                      </td>
                      <td className="p-4">{getTierBadge(user.tier)}</td>
                      <td className="p-4 text-right">
                        <span className="text-green-500 font-mono font-bold">{user.referrals}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-blue-400 font-mono">{user.tokensCreated}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-yellow-500 font-mono">{user.totalEarned.toFixed(2)} SOL</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-500/30 p-6 text-center">
            <h3 className="text-lg font-semibold text-white">Want to be on top?</h3>
            <p className="text-gray-400 text-sm mt-1">Create tokens and invite friends to climb the leaderboard!</p>
            <a href="/create" className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
              Create Token Now
            </a>
          </div>

        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}