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
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  const handleWalletClick = () => {
    if (connected) disconnect();
    else setVisible(true);
  };

  const shortenAddress = (address: string) =>
    address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";

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
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          <Link href="/" className="group relative block flex-shrink-0">
            <div
              className="relative px-4 py-2 rounded-full"
              style={{
                backgroundColor: "#0a0f1a",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -2px 1px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              <div className="relative flex items-baseline font-extrabold text-xl tracking-tight">
                <span style={{ color: "#3b82f6" }}>Blu</span>
                <span style={{ color: "#ffffff" }}>Print</span>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 bg-gray-100/40 dark:bg-gray-800/40 rounded-full p-1 shadow-inner">
            <Link
              href="/"
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden ${
                isHome ? "text-white" : "text-gray-700 dark:text-gray-300 hover:text-blue-600"
              }`}
            >
              {isHome && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-lg"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{t("nav_home")}</span>
            </Link>

            <Link
              href="/create"
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden ${
                isCreate ? "text-white" : "text-gray-700 dark:text-gray-300 hover:text-blue-600"
              }`}
            >
              {isCreate && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-lg"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{t("nav_create")}</span>
            </Link>

            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

            
              href="https://raydium.io/liquidity/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-all"
            >
              Raydium
            </a>

            <Link
              href="/referral"
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                isReferral
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-green-600"
              }`}
            >
              {t("nav_refer")}
            </Link>
          </div>

          <div className="flex items-center gap-2">

            <Link
              href="/live"
              className={`hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isLive
                  ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                  : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              {t("nav_live")}
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>

            {mounted && (
              <button
                onClick={handleWalletClick}
                className="bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white rounded-full px-3 sm:px-4 py-2 shadow-md transition-all flex items-center gap-2 text-xs sm:text-sm min-h-[36px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="16" rx="2" />
                  <path d="M22 12h-6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h6" />
                  <path d="M6 12h.01" />
                </svg>
                <span>
                  {connected && publicKey ? shortenAddress(publicKey.toString()) : t("nav_connect")}
                </span>
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
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
              {[
                { href: "/", label: t("nav_home"), active: isHome },
                { href: "/create", label: t("nav_create"), active: isCreate },
                { href: "/referral", label: t("nav_refer"), active: isReferral },
                { href: "/live", label: t("nav_live"), active: isLive },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all min-h-[48px] font-medium ${
                    link.active
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              
                href="https://raydium.io/liquidity/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition min-h-[48px] font-medium"
              >
                Raydium
              </a>

              <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                <span className="text-sm text-gray-500 font-medium">Tema ve Dil</span>
                <div className="flex items-center gap-2 ml-auto">
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
