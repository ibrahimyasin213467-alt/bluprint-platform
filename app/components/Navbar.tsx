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

  // Cüzdan adresini kısalt (mobil için)
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const isHome = pathname === "/";
  const isCreate = pathname === "/create";
  const isLive = pathname === "/live";
  const isReferral = pathname === "/referral";

  const mobileLinks = [
    { href: "/", label: t('nav_home').toUpperCase(), icon: "🏠", isActive: isHome },
    { href: "/create", label: t('nav_create').toUpperCase(), icon: "🪙", isActive: isCreate },
    { href: "/referral", label: t('nav_refer').toUpperCase(), icon: "💰", isActive: isReferral },
  ];

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
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* ========== 3D PREMIUM BLUPRINT LOGO (BETA YOK) ========== */}
          <Link href="/" className="group relative block flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/50 to-cyan-400/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
            <div 
              className="relative px-5 py-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: "#0a0f1a",
                boxShadow: `
                  inset 0 1px 1px rgba(255, 255, 255, 0.15),
                  inset 0 -2px 1px rgba(0, 0, 0, 0.3),
                  0 4px 8px rgba(0, 0, 0, 0.2)
                `,
              }}
            >
              <div 
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.15) 100%)",
                }}
              />
              <div 
                className="absolute -top-[1px] left-[10%] right-[10%] h-[2px] rounded-full pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                }}
              />
              <div className="relative flex items-baseline font-['Inter',sans-serif] font-extrabold text-xl sm:text-2xl tracking-tight">
                <span 
                  className="relative"
                  style={{
                    color: "#3b82f6",
                    textShadow: "0 1px 2px rgba(0,0,0,0.2), 0 -1px 1px rgba(255,255,255,0.1)",
                  }}
                >
                  Blu
                </span>
                <span 
                  className="relative -ml-0.5"
                  style={{
                    color: "#ffffff",
                    textShadow: "0 1px 2px rgba(0,0,0,0.2), 0 -1px 1px rgba(255,255,255,0.05)",
                  }}
                >
                  Print
                </span>
                <span 
                  className="absolute inset-0 flex items-baseline pointer-events-none opacity-30"
                  style={{
                    transform: "translateY(-0.5px)",
                  }}
                >
                  <span style={{ color: "#60a5fa" }}>Blu</span>
                  <span style={{ color: "#f0f0f0" }}>Print</span>
                </span>
              </div>
              {/* BETA İŞARETİ KALDIRILDI */}
            </div>
          </Link>

          {/* ========== PREMIUM BUTONLAR (DESKTOP) ========== */}
          <div className="hidden md:flex items-center gap-1.5 bg-gray-100/40 dark:bg-gray-800/40 rounded-full p-1 shadow-inner">
            
            <Link
              href="/"
              className={`group relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden ${
                isHome
                  ? "text-white"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {isHome && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-full shadow-lg"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 bg-white/10 blur-sm" />
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="text-base group-hover:scale-110 transition-transform duration-200">🏠</span>
                <span className="hidden xl:inline">{t('nav_home')}</span>
              </span>
            </Link>

            <Link
              href="/create"
              className={`group relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden ${
                isCreate
                  ? "text-white"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {isCreate && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-full shadow-lg"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 bg-white/10 blur-sm" />
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="text-base animate-spin-slow group-hover:scale-110 transition-transform duration-200">🪙</span>
                <span className="hidden xl:inline">{t('nav_create')}</span>
              </span>
            </Link>

            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            
            <a
              href="https://raydium.io/liquidity/"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-3 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center gap-1.5 hover:scale-105"
            >
              <span className="text-base group-hover:scale-110 transition-transform duration-200">💧</span>
              <span className="hidden xl:inline">Raydium</span>
            </a>

            <Link
              href="/referral"
              className={`group px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isReferral
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:scale-105"
              }`}
            >
              <span className="text-base group-hover:scale-110 transition-transform duration-200">💰</span>
              <span className="hidden xl:inline">{t('nav_refer')}</span>
            </Link>
          </div>

          {/* SAĞ BÖLÜM */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            <Link
              href="/live"
              className={`group relative px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isLive 
                  ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25" 
                  : "bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:scale-105"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="hidden sm:inline">{t('nav_live')}</span>
              <span className="sm:hidden text-base">🔴</span>
            </Link>

            <ThemeToggle />
            
            <LanguageSwitcher />

            {mounted && (
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300" />
                <button
                  onClick={handleWalletClick}
                  className="relative bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white rounded-full px-3 sm:px-5 py-1.5 sm:py-2 shadow-md transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm hover:scale-105 touch-manipulation min-h-[36px] sm:min-h-[44px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="sm:w-4 sm:h-4 group-hover:scale-110 transition-transform"
                  >
                    <rect x="2" y="6" width="20" height="16" rx="2" />
                    <path d="M22 12h-6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h6" />
                    <path d="M6 12h.01" />
                  </svg>
                  <span className="hidden xs:inline">
                    {connected && publicKey ? shortenAddress(publicKey.toString()) : (connected ? t('nav_disconnect') : t('nav_connect'))}
                  </span>
                  <span className="xs:hidden">
                    {connected && publicKey ? "🔗" : (connected ? "Exit" : t('nav_connect'))}
                  </span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition relative z-50 hover:scale-105 transition-transform touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-2">
              {mobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 touch-manipulation min-h-[48px] ${
                    link.isActive
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              <a
                href="https://raydium.io/liquidity/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 touch-manipulation min-h-[48px]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-xl">💧</span>
                <span className="font-medium">Raydium</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
          display: inline-block;
        }
        @media (min-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
          .xs\\:hidden {
            display: none;
          }
        }
        @media (max-width: 479px) {
          .xs\\:inline {
            display: none;
          }
          .xs\\:hidden {
            display: inline;
          }
        }
        .touch-manipulation {
          touch-action: manipulation;
        }
      `}</style>
    </motion.div>
  );
}