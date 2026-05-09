"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "../lib/i18n-provider";

interface SuccessModalProps {
  successData: {
    name: string;
    symbol: string;
    supply: number;
    decimals: number;
  };
  mintAddress: string;
  time: number;
  onReset: () => void;
  onHome: () => void;
}

export default function SuccessModal({
  successData,
  mintAddress,
  time,
  onReset,
  onHome,
}: SuccessModalProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const tweetText = `Just launched my token on BluPrint 🚀\n\n💎 ${successData.name} (${successData.symbol})\n🔗 Mint: ${mintAddress}\n\nTry it ↓`;

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🚀</div>
            <h1 className="text-2xl font-bold text-gray-900">{t('success_title') || 'YOUR TOKEN IS LIVE'}</h1>
            <div className="text-sm text-gray-500 mt-1">⚡ {t('success_created_in') || 'Created in'} {time.toFixed(2)} {t('success_seconds') || 'seconds'}</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('tokenNameLabel')}</span>
              <span className="font-medium text-gray-900">{successData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('tokenSymbolLabel')}</span>
              <span className="font-medium text-gray-900">{successData.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('totalSupplyLabel')}</span>
              <span className="font-medium text-gray-900">{successData.supply.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Mint</span>
                <button
                  onClick={handleCopy}
                  className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full hover:bg-gray-100 transition"
                >
                  {copied ? `✅ ${t('toast_copied')}` : "📋 Copy"}
                </button>
              </div>
              <div className="font-mono text-[11px] text-gray-600 break-all mt-1 bg-white p-2 rounded border border-gray-100">
                {mintAddress}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, "_blank")}
              className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <span>🐦</span>
              <span>{t('share_twitter') || 'Share on Twitter'}</span>
            </button>

            <a
              href={`https://solscan.io/token/${mintAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              <span>{t('view_solscan') || 'View on Solscan'}</span>
            </a>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onReset}
              className="flex-1 text-sm bg-white border border-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition"
            >
              ✨ {t('create_another') || 'Create Another'}
            </button>
            <button
              onClick={onHome}
              className="flex-1 text-sm bg-white border border-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition"
            >
              🏠 {t('nav_home')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}