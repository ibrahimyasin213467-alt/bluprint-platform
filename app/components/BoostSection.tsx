"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { useI18n } from "../lib/i18n-provider";

export default function BoostSection() {
  const { t } = useI18n();
  const { publicKey } = useWallet();
  const [boostMint, setBoostMint] = useState("");
  const [boosting, setBoosting] = useState(false);
  const [message, setMessage] = useState("");
  const [tokensLeft, setTokensLeft] = useState(100);

  useEffect(() => {
    const fetchTokenCount = async () => {
      try {
        const res = await fetch("/api/token-stats");
        const data = await res.json();
        if (data.success) {
          setTokensLeft(data.tokensLeft);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTokenCount();
  }, []);

  const handleBoost = async () => {
    if (!publicKey) {
      setMessage(`🔴 ${t('toast_connect')}`);
      return;
    }
    if (!boostMint || boostMint.length !== 44) {
      setMessage(`🔴 ${t('boost_invalid_address') || 'Enter valid token mint address (44 characters)'}`);
      return;
    }

    setBoosting(true);
    setMessage(`⏳ ${t('ref_processing')}`);

    try {
      const res = await fetch("/api/boost-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mintAddress: boostMint,
          userPublicKey: publicKey.toString(),
          fee: 0.1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${t('boost_success') || 'Token boosted! It will appear in Featured section.'}`);
        setBoostMint("");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setBoosting(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const isFirstHundred = tokensLeft > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-2xl p-6 mb-24 border border-yellow-200 dark:border-yellow-800"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🚀</span>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('boost_title')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('boost_desc')} <span className="font-bold text-yellow-600">0.1 SOL</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={boostMint}
          onChange={(e) => setBoostMint(e.target.value)}
          placeholder={t('boost_placeholder') || "Enter your token mint address"}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
        />
        <button
          onClick={handleBoost}
          disabled={boosting || !publicKey}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap"
        >
          {boosting ? t('ref_processing') : t('boost_button')}
        </button>
      </div>

      {message && (
        <div className="mt-3 text-sm text-center text-gray-600 dark:text-gray-400">
          {message}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 text-center border-t border-yellow-200 dark:border-yellow-800 pt-3">
        ⭐ {t('boost_info') || 'Boosted tokens appear in Featured section for 7 days'} • {isFirstHundred && (
          <span className="font-bold text-yellow-600">{t('boost_discount')}</span>
        )}
      </div>
    </motion.div>
  );
}