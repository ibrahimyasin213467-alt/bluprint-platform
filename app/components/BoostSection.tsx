"use client";

import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "./ToastProvider";
import { useState, useEffect } from "react";
import { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  balance?: number;
}

export default function BoostSection({ t }: { t: (key: string) => string }) {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { showToast } = useToast();
  const [hasToken, setHasToken] = useState(false);
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);

  const PLATFORM_WALLET = new PublicKey("FPLcpDVhRTMTMGquiyeK3AwNtCaQQgNp6UwHPTcWDS2n");
  const BOOST_PRICE = 0.1 * LAMPORTS_PER_SOL;

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserTokens();
    } else {
      setHasToken(false);
      setUserTokens([]);
      setSelectedToken(null);
    }
  }, [connected, publicKey]);

  const fetchUserTokens = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user-tokens?wallet=${publicKey?.toString()}`);
      const data = await res.json();
      if (data.success && data.tokens && data.tokens.length > 0) {
        setHasToken(true);
        setUserTokens(data.tokens);
      } else {
        setHasToken(false);
        setUserTokens([]);
      }
    } catch (err) {
      console.error("Failed to fetch user tokens:", err);
      setHasToken(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBoost = async () => {
    if (!connected) {
      showToast(t("connect_wallet_first"), "warning");
      return;
    }
    if (!hasToken || userTokens.length === 0) {
      showToast("You don't have any tokens in your wallet!", "warning");
      return;
    }
    if (!selectedToken) {
      showToast("Please select a token to boost", "warning");
      return;
    }

    setIsBoosting(true);
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey!,
          toPubkey: PLATFORM_WALLET,
          lamports: BOOST_PRICE,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      const boostRes = await fetch("/api/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mint: selectedToken.mint,
          symbol: selectedToken.symbol,
          name: selectedToken.name,
          image: selectedToken.image || "",
          userWallet: publicKey?.toString(),
          signature,
        }),
      });

      const boostData = await boostRes.json();
      if (boostData.success) {
        showToast(`✅ ${selectedToken.symbol} boosted successfully!`, "success");
        setSelectedToken(null);
        window.dispatchEvent(new Event("boost-updated"));
      } else {
        throw new Error(boostData.error || "Boost failed");
      }
    } catch (error: any) {
      console.error("Boost error:", error);
      showToast(`❌ Boost failed: ${error.message}`, "error");
    } finally {
      setIsBoosting(false);
    }
  };

  const benefits = [
    { icon: "📢", textKey: "boost_benefit1" },
    { icon: "👁️", textKey: "boost_benefit2" },
    { icon: "🎯", textKey: "boost_benefit3" },
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
          <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-black/95 backdrop-blur-xl rounded-2xl border border-blue-500/30 overflow-hidden">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
            <div className="absolute -top-4 -right-4 opacity-20 group-hover:opacity-40 transition duration-500">
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl">🚀</motion.div>
            </div>
            <div className="p-8 sm:p-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md animate-pulse" />
                  <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                    </span>
                    <span className="text-xs font-semibold text-blue-400 tracking-wide">{t("boost_featured")}</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-3">{t("boost_title")}</h2>
                <p className="text-gray-400 text-sm sm:text-base">{t("boost_subtitle")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div key={index} className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                    <span className="text-sm">{benefit.icon}</span>
                    <span className="text-xs text-gray-300 font-medium">{t(benefit.textKey)}</span>
                  </motion.div>
                ))}
              </div>

              {loading && connected && (
                <div className="mb-6 text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Scanning your wallet...</p>
                </div>
              )}

              {!loading && connected && hasToken && userTokens.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-3 text-center">Select a token from your wallet to boost:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto px-1">
                    {userTokens.map((token) => (
                      <button key={token.mint} onClick={() => setSelectedToken(token)} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${selectedToken?.mint === token.mint ? "bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/25" : "bg-gray-800/50 border-gray-700 hover:border-blue-500/50"}`}>
                        {token.image ? <img src={token.image} alt={token.symbol} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm text-white">{token.symbol?.charAt(0) || "?"}</div>}
                        <div className="text-left flex-1">
                          <div className="font-semibold text-white text-sm">{token.name}</div>
                          <div className="text-xs text-gray-400">{token.symbol}</div>
                        </div>
                        {selectedToken?.mint === token.mint && <div className="text-blue-400 text-sm ml-2">✓</div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && connected && !hasToken && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                  <p className="text-yellow-400 text-sm">⚠️ No tokens found in your wallet.</p>
                  <p className="text-gray-400 text-xs mt-1">Create a token first or add tokens to your wallet to boost them!</p>
                </div>
              )}

              <div className="text-center">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">0.1 SOL</span>
                  <span className="text-gray-500 text-sm ml-2">for 4 days</span>
                </div>

                <button onClick={handleBoost} disabled={!connected || !hasToken || !selectedToken || isBoosting || loading} className="relative group/btn disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-0 group-hover/btn:opacity-100 transition duration-300" />
                  <div className="relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                    {isBoosting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>{!connected ? "Connect Wallet" : loading ? "Scanning..." : !hasToken ? "No Tokens Found" : !selectedToken ? "Select a Token" : t("boost_button")}</span>
                      </>
                    )}
                  </div>
                </button>
                <p className="text-[11px] text-gray-600 mt-4">Get 4 days of premium visibility • Global banner placement • Click to Solscan</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}