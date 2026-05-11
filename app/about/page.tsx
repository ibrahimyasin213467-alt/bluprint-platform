"use client";

import { useState, useEffect } from "react";
import Footer from "../components/Footer";

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen">
      
      <div className="pt-28 max-w-4xl mx-auto px-4 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          About Us
        </h1>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            <strong className="text-blue-600">BluPrint</strong> is a launchpad platform that allows you to create meme coins
            on the Solana blockchain in seconds.
          </p>
          <p>
            Designed for everyone, even without coding knowledge. Just fill out a form, connect your wallet, and launch your token.
          </p>
          <p>
            Our platform focuses on <strong>security</strong> and <strong>speed</strong>. 
            The Secure Token feature automatically revokes mint and freeze authorities, making your token safer.
          </p>
          <p>
            BluPrint officially launched on May 1, 2026. Over 1,000 tokens have been successfully created since launch.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
