"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen">
      <Navbar mounted={mounted} />
      <div className="pt-28 max-w-4xl mx-auto px-4 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Privacy Policy
        </h1>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-4 text-gray-700 dark:text-gray-300">
          <p><strong>Effective Date:</strong> May 1, 2026</p>
          <p>BluPrint (“we”, “our”, “us”) provides tools to create and manage Solana tokens. This Privacy Policy explains how we collect, use, and protect your information.</p>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Wallet address (when you connect Phantom or other wallets)</li>
            <li>Transaction data (token creation, fees)</li>
            <li>Basic analytics (page visits, usage patterns)</li>
            <li>Optional data (token name, symbol, description, logo uploads)</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide token creation services</li>
            <li>To process transactions and fees</li>
            <li>To improve platform performance and security</li>
            <li>To prevent fraud, abuse, and malicious activity</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">Data Security</h2>
          <p>We implement strong industry-standard security practices to protect user data and ensure a safe experience.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">Third-Party Services</h2>
          <p>We may use trusted third-party providers such as RPC endpoints, IPFS (Pinata), and analytics tools to deliver our services.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">User Responsibility</h2>
          <p>Users are fully responsible for how they use the platform and the tokens they create.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">Your Control</h2>
          <p>You control your wallet and transactions at all times. BluPrint never has access to your private keys or funds.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">Changes</h2>
          <p>We may update this policy periodically. Continued use of the platform means you accept these changes.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}