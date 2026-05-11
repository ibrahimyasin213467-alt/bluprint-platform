"use client";

import { useState, useEffect } from "react";
import Footer from "../components/Footer";

export default function TermsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen">
      
      <div className="pt-28 max-w-4xl mx-auto px-4 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Terms of Service
        </h1>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-4 text-gray-700 dark:text-gray-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>By using BluPrint, you agree to these Terms of Service.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">2. Service Description</h2>
          <p>BluPrint provides tools to create and manage Solana tokens. We do not control or manage user-created tokens.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">3. User Responsibility</h2>
          <p>You are solely responsible for the tokens you create, how they are distributed, and any financial or legal consequences.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">4. No Liability for User Actions</h2>
          <p>BluPrint is not responsible for rug pulls, scams, fraudulent tokens, or user misuse of the platform. All responsibility lies with the user.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">5. No Financial Advice</h2>
          <p>BluPrint does not provide investment or financial advice.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">6. Fees</h2>
          <p>All fees paid (e.g., token creation fees) are final and non-refundable.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">7. Platform Availability</h2>
          <p>We aim to provide a stable and secure service, but we do not guarantee uninterrupted operation.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">8. Security</h2>
          <p>We implement strong security measures, but users must also take responsibility for securing their wallets and assets.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">9. Termination</h2>
          <p>We reserve the right to restrict or block access in case of abuse, spam, or malicious activity.</p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">10. Changes</h2>
          <p>We may update these terms at any time. Continued use means acceptance.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
