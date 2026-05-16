"use client";

import { motion } from "framer-motion";
import { useToast } from "./ToastProvider";

export default function SuccessModal({
  successData,
  mintAddress,
  time,
  onReset,
  onHome,
}: {
  successData: any;
  mintAddress: string;
  time: number;
  onReset: () => void;
  onHome: () => void;
}) {
  const { showToast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl max-w-md w-full mx-4 p-6 border border-gray-700 shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-2">YOUR TOKEN IS LIVE!</h2>
          <p className="text-green-400 text-sm mb-4">⚡ Created in {time.toFixed(2)} seconds</p>
          <p className="text-yellow-400 text-xs mt-2">✨ Metadata (name, logo, symbol) coming soon!</p>
        </div>

        <div className="space-y-3 bg-gray-800/50 rounded-xl p-4 mb-6 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Token Name:</span>
            <span className="text-white font-semibold">{successData.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Symbol:</span>
            <span className="text-white font-semibold">{successData.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Supply:</span>
            <span className="text-white font-semibold">{successData.supply.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Mint:</span>
            <div className="flex gap-2">
              <code className="text-xs text-blue-400 truncate max-w-[150px]">{mintAddress.slice(0, 8)}...{mintAddress.slice(-6)}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(mintAddress);
                  showToast("Mint address copied!", "success");
                }}
                className="text-gray-400 hover:text-white text-xs"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.open(`https://solscan.io/token/${mintAddress}`, "_blank")}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-xl transition text-sm"
          >
            🔍 View on Solscan
          </button>
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=I just created a token on BluPrint! 🚀%0aName: ${successData.name} ($${successData.symbol})%0aMint: ${mintAddress}%0aCreate yours at https://bluprint.fun`, "_blank")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition text-sm"
          >
            🐦 Share on Twitter
          </button>
        </div>

        <div className="flex gap-3 mt-3">
          <button onClick={onReset} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition text-sm">
            ✨ Create Another
          </button>
          <button onClick={onHome} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-xl transition text-sm">
            🏠 Home
          </button>
        </div>
      </div>
    </motion.div>
  );
}