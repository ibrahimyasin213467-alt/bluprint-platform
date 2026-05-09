"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n-provider";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">BluPrint</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><Link href="/about" className="hover:text-blue-600 transition">{t('about_us') || 'About Us'}</Link></li>
              <li><Link href="/faq" className="hover:text-blue-600 transition">{t('faq') || 'FAQ'}</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600 transition">{t('privacy_policy') || 'Privacy Policy'}</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition">{t('terms_service') || 'Terms of Service'}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">{t('resources') || 'Resources'}</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><a href="https://raydium.io/liquidity/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Raydium</a></li>
              <li><a href="https://jup.ag/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Jupiter</a></li>
              <li><a href="https://solscan.io/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Solscan</a></li>
              <li><a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Phantom Wallet</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">{t('community') || 'Community'}</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600 transition">Twitter</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Telegram</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">GitHub</a></li>
            </ul>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
              © 2026 BluPrint. {t('all_rights') || 'All rights reserved.'}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}