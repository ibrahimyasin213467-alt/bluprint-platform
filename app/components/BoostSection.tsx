"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "./ToastProvider";

export default function BoostSection() {
  const router = useRouter();
  const { connected } = useWallet();
  const { showToast } = useToast();

  const handleBoostClick = () => {
    if (!connected) {
      showToast("Please connect your wallet first", "warning");
      return;
    }
    router.push("/create");
  };

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-8"
        >
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Boost Your Token
          </h2>
          <p className="text-gray-400 mb-4">
            Feature your token in the BluPrint launch feed for extra visibility.
          </p>
          <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 font-semibold text-sm mb-6">
            ⚡ 0.1 SOL for 4 days
          </div>
          <div>
            <button
              onClick={handleBoostClick}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Boost Now
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            ⭐ Get featured in the global banner • 4-day visibility
          </p>
        </motion.div>
      </div>
    </section>
  );
}