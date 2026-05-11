"use client";

import { useState, useEffect } from "react";
import Footer from "../components/Footer";

const faqs = [
  { q: "What is BluPrint?", a: "BluPrint is a platform that allows anyone to create Solana tokens instantly without coding." },
  { q: "How long does it take to create a token?", a: "Typically just a few seconds." },
  { q: "What does the fee include?", a: "The fee covers token creation, infrastructure costs, and platform services. Optional security features may increase the fee." },
  { q: "What is 'Secure Token'?", a: "It removes mint and freeze authorities, increasing trust and reducing risk of manipulation." },
  { q: "Do you store my funds?", a: "No. All transactions are executed directly through your wallet. BluPrint never holds user funds." },
  { q: "Is BluPrint safe and legal?", a: "BluPrint is designed with strong security measures and operates as a tool for token creation. Users are responsible for complying with their local laws." },
  { q: "Are you responsible for rug pulls or scams?", a: "No. BluPrint is a neutral tool. Users are fully responsible for the tokens they create and how they are used." },
  { q: "Can I edit my token after creation?", a: "Some parameters cannot be changed after deployment due to blockchain limitations." },
  { q: "Which wallet is supported?", a: "Currently Phantom wallet is supported." },
  { q: "Do you provide support?", a: "Yes. We offer 24/7 support via Telegram and social channels." },
];

export default function FAQPage() {
  const [mounted, setMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen">
      
      <div className="pt-28 max-w-4xl mx-auto px-4 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Frequently Asked Questions
        </h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-6 py-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition flex justify-between items-center"
              >
                <span>{faq.q}</span>
                <span className="text-blue-600">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
