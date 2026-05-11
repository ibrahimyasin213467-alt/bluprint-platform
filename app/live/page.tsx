"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

interface Activity {
  id: string;
  type: "token" | "vip" | "premium" | "boost" | "referral" | "announcement";
  wallet?: string;
  tokenName?: string;
  tokenSymbol?: string;
  amount?: number;
  message?: string;
  timestamp: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export default function LivePage() {
  const { publicKey } = useWallet();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "🔥 Launch Day: May 14th!",
      content: "Token creation starts on May 14th. Preregister now for VIP benefits!",
      createdAt: Date.now(),
    },
    {
      id: "2",
      title: "💰 Referral System Active",
      content: "Earn 0.05 SOL per referral! Share your code and start earning.",
      createdAt: Date.now() - 86400000,
    },
    {
      id: "3",
      title: "👑 VIP Benefits Announced",
      content: "VIP members get 0.10 SOL monthly airdrop for life!",
      createdAt: Date.now() - 172800000,
    },
  ]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (publicKey) {
      const adminWallets = [
        "aJCqEsDgSXhkLUYAnq4tA2T3LfG7rMbfcdJapf9af9x",
        "2WyCLgg2vuvzmExak8WAeF9kBfvfcD4ahcKfm9P18gSc",
      ];
      setIsAdmin(adminWallets.includes(publicKey.toString()));
    }
  }, [publicKey]);

  useEffect(() => {
    // Simulate real-time activities
    const demoActivities: Activity[] = [
      { id: "1", type: "token", wallet: "8x3k7...p9Q", tokenName: "BLUEP", tokenSymbol: "BLUEP", amount: 0.15, timestamp: Date.now() - 300000 },
      { id: "2", type: "vip", wallet: "5m9j2...r4L", timestamp: Date.now() - 600000 },
      { id: "3", type: "premium", wallet: "2n7k4...t8R", timestamp: Date.now() - 900000 },
      { id: "4", type: "referral", wallet: "9x3p1...s2M", amount: 0.05, timestamp: Date.now() - 1200000 },
      { id: "5", type: "boost", wallet: "7k2m5...v6N", tokenName: "MEME", amount: 0.1, timestamp: Date.now() - 1800000 },
    ];
    setActivities(demoActivities);

    // Fetch real activities from API later
    // fetchActivities();
    // fetchAnnouncements();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "token": return "🔥";
      case "vip": return "👑";
      case "premium": return "⭐";
      case "boost": return "🪙";
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
      case "boost": return "text-purple-500";
      case "referral": return "text-green-500";
      case "announcement": return "text-cyan-500";
      default: return "text-gray-400";
    }
  };

  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case "token":
        return `New token "${activity.tokenName}" (${activity.tokenSymbol}) created by ${activity.wallet}`;
      case "vip":
        return `${activity.wallet} became VIP member! 👑`;
      case "premium":
        return `${activity.wallet} joined as Premium member ⭐`;
      case "boost":
        return `Token "${activity.tokenName}" boosted with ${activity.amount} SOL by ${activity.wallet}`;
      case "referral":
        return `${activity.wallet} earned ${activity.amount} SOL from referral`;
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

  const handlePostAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      createdAt: Date.now(),
    };
    
    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({ title: "", content: "" });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950">
        <div className="pt-6 px-6">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">📢 Live Feed</h1>
            <p className="text-gray-500 text-sm">Real-time platform activity and announcements</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Activity Feed */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h2 className="font-semibold text-white">🕒 Live Activity Feed</h2>
                </div>
                <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                  <AnimatePresence>
                    {activities.map((activity) => (
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
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right: Announcements */}
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

              {/* Admin Announcement Form */}
              {isAdmin && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mt-4">
                  <h3 className="font-semibold text-white text-sm mb-3">✏️ Post Announcement</h3>
                  <input
                    type="text"
                    placeholder="Title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-2"
                  />
                  <textarea
                    placeholder="Content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-2"
                  />
                  <button
                    onClick={handlePostAnnouncement}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition"
                  >
                    Post Announcement
                  </button>
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
