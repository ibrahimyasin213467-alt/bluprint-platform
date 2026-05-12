"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

interface Activity {
  id: string;
  type: "token" | "vip" | "premium" | "referral" | "announcement";
  wallet: string;
  details: {
    tokenName?: string;
    tokenSymbol?: string;
    amount?: number;
    rank?: number;
  };
  timestamp: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export default function LivePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcements] = useState<Announcement[]>([
    { id: "1", title: "🔥 Launch Day: May 14th!", content: "Token creation starts on May 14th!", createdAt: Date.now() },
    { id: "2", title: "💰 Referral System Active", content: "Earn 0.05 SOL per referral!", createdAt: Date.now() - 86400000 },
    { id: "3", title: "👑 VIP Benefits Announced", content: "VIP members get 0.10 SOL monthly airdrop!", createdAt: Date.now() - 172800000 },
  ]);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "token": return "🔥";
      case "vip": return "👑";
      case "premium": return "⭐";
      case "referral": return "💰";
      case "announcement": return "📢";
      default: return "📌";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "token": return "text-orange-500";
      case "vip": return "text-yellow-500";
      case "premium": return "text-blue-400";
      case "referral": return "text-green-500";
      case "announcement": return "text-cyan-500";
      default: return "text-gray-400";
    }
  };

  const getActivityMessage = (activity: Activity) => {
    const walletShort = `${activity.wallet.slice(0, 6)}...${activity.wallet.slice(-4)}`;
    switch (activity.type) {
      case "token":
        return `New token "${activity.details.tokenName}" created by ${walletShort}`;
      case "vip":
        return `${walletShort} became VIP member! 👑 (Rank #${activity.details.rank})`;
      case "premium":
        return `${walletShort} joined as Premium member ⭐`;
      case "referral":
        return `${walletShort} earned ${activity.details.amount} SOL from referral`;
      default:
        return "Activity occurred";
    }
  };

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950">
        <div className="pt-6 px-6">
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">📢 Live Feed</h1>
            <p className="text-gray-500 text-sm">Real-time platform activity and announcements</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Activity Feed */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h2 className="font-semibold text-white">🕒 Live Activity Feed</h2>
                </div>
                <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                  <AnimatePresence>
                    {activities.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">No activities yet</div>
                    ) : (
                      activities.map((activity) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="px-4 py-3 hover:bg-gray-800/50 transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`text-xl ${getActivityColor(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-300">{getActivityMessage(activity)}</p>
                              <p className="text-xs text-gray-600 mt-1">{formatTime(activity.timestamp)}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h2 className="font-semibold text-white">📢 Announcements</h2>
                </div>
                <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-cyan-500 text-sm">📢</span>
                        <h3 className="font-medium text-white text-sm">{ann.title}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{ann.content}</p>
                      <p className="text-xs text-gray-600 mt-2">{formatTime(ann.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}