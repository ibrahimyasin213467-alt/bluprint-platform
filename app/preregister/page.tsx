"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface Registration {
  wallet: string;
  tier: string;
  registeredAt: string;
  referrals: number;
}

export default function AdminPreregisterPage() {
  const { publicKey, connected } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected && publicKey) {
      const adminWallets = [
        "aJCqEsDgSXhkLUYAnq4tA2T3LfG7rMbfcdJapf9af9x",
        "2WyCLgg2vuvzmExak8WAeF9kBfvfcD4ahcKfm9P18gSc",
      ];
      setIsAdmin(adminWallets.includes(publicKey.toString()));
    }
  }, [connected, publicKey]);

  useEffect(() => {
    if (isAdmin) {
      fetchRegistrations();
    }
  }, [isAdmin]);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/preregister/list");
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!connected || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold">Admin Access Only</h1>
          <p className="text-gray-500 mt-2">You are not authorized to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Preregistration List</h1>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-900 rounded-xl overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3 text-left text-white">#</th>
                <th className="p-3 text-left text-white">Wallet</th>
                <th className="p-3 text-left text-white">Tier</th>
                <th className="p-3 text-left text-white">Date</th>
                <th className="p-3 text-left text-white">Referrals</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, idx) => (
                <tr key={idx} className="border-t border-gray-800">
                  <td className="p-3 text-white">{idx + 1}</td>
                  <td className="p-3 text-gray-300 font-mono text-sm">{reg.wallet.slice(0, 8)}...</td>
                  <td className="p-3">
                    {reg.tier === "vip" ? (
                      <span className="text-yellow-500">👑 VIP</span>
                    ) : (
                      <span className="text-gray-400">⭐ Premium</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-400 text-sm">{new Date(reg.registeredAt).toLocaleDateString()}</td>
                  <td className="p-3 text-gray-400">{reg.referrals || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}