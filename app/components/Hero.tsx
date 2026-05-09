import { motion } from "framer-motion";

interface HeroProps {
  onScrollToForm: () => void;
}

export default function Hero({ onScrollToForm }: HeroProps) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 shadow-sm">
        🚀 BluPrint Launchpad
      </div>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
        Launch your <span className="text-blue-600">$Solana Meme Coin</span><br />
        in One Click ⚡
      </h1>
      <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10">
        No code. No friction. Just launch.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onScrollToForm}
        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg shadow-blue-500/30 transition-all"
      >
        ✨ CREATE TOKEN
      </motion.button>

      <div className="flex flex-wrap justify-center gap-3 mt-12">
        {["🔒 100% Secure", "⚡ Instant Launch", "🌐 Solana Powered"].map((text) => (
          <div key={text} className="bg-white border border-gray-200 rounded-full px-5 py-2 text-sm text-gray-600 shadow-sm">
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}