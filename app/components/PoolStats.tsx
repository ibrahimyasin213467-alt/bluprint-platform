"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useI18n } from "../lib/i18n-provider";

export default function PoolStats() {
  const { t } = useI18n();
  const [tokensLeft, setTokensLeft] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/token-stats");
        const data = await res.json();
        if (data.success) {
          setTokensLeft(data.tokensLeft);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return null;

  const progress = ((100 - tokensLeft) / 100) * 100;
  const poolAmount = 50;
  const remainingPool = (tokensLeft / 100) * poolAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-6 mb-8 border border-emerald-200 dark:border-emerald-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💰</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('pool_title')} {poolAmount} SOL</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('pool_first')} 100 {t('pool_tokens')}: 0.15 SOL
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">{remainingPool.toFixed(1)} SOL</div>
          <div className="text-xs text-gray-500">{t('pool_remaining') || 'remaining in pool'}</div>
        </div>
      </div>

      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>🎯 {100 - tokensLeft}/100 {t('pool_tokens')} {t('pool_created') || 'created'}</span>
        <span>⚡ {tokensLeft} {t('pool_spots') || 'spots left'}</span>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 border-t border-emerald-200 dark:border-emerald-800 pt-3">
        ⭐ {t('pool_invite')}
      </div>
    </motion.div>
  );
}