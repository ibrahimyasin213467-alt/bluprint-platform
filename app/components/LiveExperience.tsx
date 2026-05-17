"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function LiveExperience({ t }: { t: (key: string) => string }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDisplayText(t("live_demo"));
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setDisplayText(t("live_success"));
        setSuccess(true);
        setTimeout(() => {
          setDisplayText(t("live_demo"));
          setSuccess(false);
          setIsAnimating(false);
        }, 2000);
      }, 1500);
    }, 6000);

    return () => clearInterval(interval);
  }, [t]);

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <motion.h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
          {t("live_title")}
        </motion.h2>
        <motion.p className="text-gray-400 mt-3">{t("live_subtitle")}</motion.p>
      </div>
      <motion.div className="max-w-2xl mx-auto">
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6 shadow-xl shadow-blue-500/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500 ml-2">terminal.bluprint</span>
          </div>
          <div className="font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-400">$</span>
              <span className="text-gray-400">create token --name "MyCoin" --symbol "MYC"</span>
            </div>
            <motion.div animate={{ opacity: isAnimating ? [1, 0.5, 1] : 1 }} transition={{ duration: 0.5 }} className="mt-3">
              <div className={`flex items-center gap-2 ${success ? 'text-green-400' : 'text-blue-400'}`}>
                <span>{success ? '✅' : '⚡'}</span>
                <span>{displayText}</span>
              </div>
            </motion.div>
            {success && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-xs text-gray-500">
                Transaction confirmed • Mint: B4uMev...NYgLzs
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}