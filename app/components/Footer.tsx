"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* BluPrint */}
          <div>
            <h3 className="text-white font-bold mb-3">BluPrint</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-blue-400 transition">About Us</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-blue-400 transition">FAQ</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-blue-400 transition">Terms of Service</Link></li>
              <li><Link href="/resources" className="text-gray-400 hover:text-blue-400 transition">Resources</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://raydium.io" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition">
                  Raydium
                </a>
              </li>
              <li>
                <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition">
                  Jupiter
                </a>
              </li>
              <li>
                <a href="https://solscan.io" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition">
                  Solscan
                </a>
              </li>
              <li>
                <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition">
                  Phantom Wallet
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-bold mb-3">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://x.com/BluprintFun" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition">
                  Twitter
                </a>
              </li>
              {/* Telegram şimdilik kapalı
              <li>
                <a href="https://t.me/bluprint" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition">
                  Telegram
                </a>
              </li>
              */}
              <li>
                <a href="https://github.com/bluprint-dev/bluprint-platform" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-blue-400 transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            © 2026 BluPrint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}