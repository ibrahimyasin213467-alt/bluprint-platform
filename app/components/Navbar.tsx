"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../lib/i18n-provider";

export default function Navbar({ mounted }: { mounted: boolean }) {
  const { connected, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleWalletClick = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const isHome = pathname === "/";
  const isCreate = pathname === "/create";
  const isLive = pathname === "/live";
  const isReferral = pathname === "/referral";

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
          : "bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30"
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* LOGO - favicon eklendi */}
          <Link href="/" className="group relative block flex-shrink-0">
            <div 
              className="relative px-3 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all duration-300 flex items-center gap-2"
              style={{
                backgroundColor: "#0a0f1a",
                boxShadow: `inset 0 1px 1px rgba(255, 255, 255, 0.15), inset 0 -2px 1px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)`,
              }}
            >
              {/* FAVICON LOGO - SOLDAA */}
              <img 
                src="/favicon.ico" 
                alt="BluPrint" 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md"
              />
              
              {/* YAZI LOGO - SAĞINDA */}
              <div className="relative flex items-baseline font-['Inter',sans-serif] font-extrabold text-sm sm:text-xl md:text-2xl tracking-tight">
                <span style={{ color: "#3b82f6" }}>Blu</span>
                <span style={{ color: "#ffffff" }}>Print</span>
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS - sadece md ve üzeri */}
          <div className="hidden md:flex items-center gap-1.5 bg-gray-100/40 dark:bg-gray-800/40 rounded-full p-1 shadow-inner">
            
            <Link href="/" className={`group relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden ${isHome ? "text-white" : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"}`}>
              {isHome && <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-full shadow-lg" transition={{ type: "spring", duration: 0.4 }} />}
              <span className="relative z-10 flex items-center gap-1.5">🏠 {t('nav_home')}</span>
            </Link>

            <Link href="/create" className={`group relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden ${isCreate ? "text-white" : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"}`}>
              {isCreate && <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-full shadow-lg" transition={{ type: "spring", duration: 0.4 }} />}
              <span className="relative z-10 flex items-center gap-1.5">🪙 {t('nav_create')}</span>
            </Link>

            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            
            <a href="https://raydium.io/liquidity/" target="_blank" rel="noopener noreferrer" className="group px-3 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center gap-1.5 hover:scale-105">
              💧 Raydium
            </a>

            <Link href="/referral" className={`group px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${isReferral ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg" : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:scale-105"}`}>
              💰 {t('nav_refer')}
            </Link>
          </div>

          {/* RIGHT SECTION - mobilde daha kompakt */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            <Link href="/live" className={`group relative px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 ${isLive ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25" : "bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:scale-105"}`}>
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
              </span>
              <span className="hidden xs:inline text-xs">{t('nav_live')}</span>
              <span className="xs:hidden text-sm">🔴</span>
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>

            {mounted && (
              <button onClick={handleWalletClick} className="relative bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white rounded-full px-2 sm:px-4 py-1 sm:py-1.5 shadow-md transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:scale-105 touch-manipulation min-h-[32px] sm:min-h-[36px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-3 sm:h-3"><rect x="2" y="6" width="20" height="16" rx="2" /><path d="M22 12h-6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h6" /><path d="M6 12h.01" /></svg>
                <span className="hidden xs:inline">{connected && publicKey ? shortenAddress(publicKey.toString()) : (connected ? t('nav_disconnect') : t('nav_connect'))}</span>
                <span className="xs:hidden">{connected && publicKey ? "🔗" : "🔌"}</span>
              </button>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition hover:scale-105 touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Menu">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-1 sm:mt-2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* MOBILE MENU - daha düzenli */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="flex flex-col p-3 space-y-1">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 touch-manipulation min-h-[44px] ${isHome ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                <span className="text-lg">🏠</span>
                <span className="font-medium text-sm">{t('nav_home')}</span>
              </Link>
              <Link href="/create" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 touch-manipulation min-h-[44px] ${isCreate ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                <span className="text-lg">🪙</span>
                <span className="font-medium text-sm">{t('nav_create')}</span>
              </Link>
              <Link href="/referral" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 touch-manipulation min-h-[44px] ${isReferral ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                <span className="text-lg">💰</span>
                <span className="font-medium text-sm">{t('nav_refer')}</span>
              </Link>
              <Link href="/live" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 touch-manipulation min-h-[44px] ${isLive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                <span className="text-lg">🔴</span>
                <span className="font-medium text-sm">{t('nav_live')}</span>
              </Link>
              <a href="https://raydium.io/liquidity/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 touch-manipulation min-h-[44px]">
                <span className="text-lg">💧</span>
                <span className="font-medium text-sm">Raydium</span>
              </a>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 mt-1">
                <span className="text-xs text-gray-500">Tema ve Dil</span>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}