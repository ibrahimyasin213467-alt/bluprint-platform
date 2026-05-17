"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function FinalCTA({ onScrollToForm, t }: { onScrollToForm: () => void; t: (key: string) => string }) {
  const [floatingIcons, setFloatingIcons] = useState<{ id: number; x: number; y: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const icons = [];
    for (let i = 0; i < 24; i++) {
      icons.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 10,
      });
    }
    setFloatingIcons(icons);
  }, []);

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Arka plan efektleri */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      
      {/* Uçuşan favicon'lar */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingIcons.map((icon) => (
          <motion.div
            key={icon.id}
            initial={{ 
              x: `${icon.x}%`, 
              y: `${icon.y}%`,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              y: [`${icon.y}%`, `${icon.y - 30}%`, `${icon.y}%`],
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: icon.duration,
              delay: icon.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute"
            style={{ left: `${icon.x}%`, top: `${icon.y}%` }}
          >
            <img 
              src="/favicon.ico" 
              alt="BluPrint" 
              className="w-8 h-8 opacity-20 hover:opacity-50 transition-opacity duration-300"
              style={{ filter: "drop-shadow(0 0 10px rgba(59,130,246,0.2))" }}
            />
          </motion.div>
        ))}
      </div>

      {/* Ana içerik */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Glow efekti */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent mb-4"
        >
          {t("cta_title")}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-400 text-base sm:text-lg mb-10 max-w-2xl mx-auto"
        >
          {t("cta_subtitle")}
        </motion.p>

        {/* Buton ve favicon grubu */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative inline-block"
        >
          {/* Buton glow efekti */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
          
          {/* Ana buton */}
          <button
            onClick={onScrollToForm}
            className="relative px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-2xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/50 flex items-center gap-3 group"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">✨</span>
            <span>{t("cta_button")}</span>
            <span className="text-2xl group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>

          {/* Buton çevresinde dönen favicon'lar */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-12 -right-12 w-24 h-24 pointer-events-none"
          >
            <img src="/favicon.ico" alt="" className="w-8 h-8 absolute top-0 left-1/2 -translate-x-1/2 opacity-40" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-12 -left-12 w-24 h-24 pointer-events-none"
          >
            <img src="/favicon.ico" alt="" className="w-6 h-6 absolute bottom-0 left-1/2 -translate-x-1/2 opacity-40" />
          </motion.div>
        </motion.div>

        {/* Alt kısımda uçuşan favicon'lar - fake yazı yok */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center items-center gap-2 mt-12"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.img
                key={i}
                src="/favicon.ico"
                alt=""
                className="w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 opacity-60"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}