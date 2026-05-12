"use client";

export default function MarqueeBanner() {
  const items = [
    { name: "BONK", change: "+45%", image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png", link: "/token/1" },
    { name: "WIF", change: "+120%", image: "https://arweave.net/5B4kYp5X7q5Y5q5Y5q5Y5q5Y5q5Y5q5Y5q5Y5q5Y", link: "/token/2" },
    { name: "POPCAT", change: "+67%", image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7xKXtg2CW87d97TXJ7pbjBzuJ6TjLq6Z6Z6Z6Z6Z6Z6/logo.png", link: "/token/3" },
    { name: "MYRO", change: "+23%", image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/8xKXtg2CW87d97TXJ7pbjBzuJ6TjLq6Z6Z6Z6Z6Z6Z6/logo.png", link: "/token/4" },
    { name: "BLUEP", change: "+890%", image: "/favicon.ico", link: "/token/5" },
  ];

  const marqueeItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 border-b border-blue-500/30 py-2 shadow-lg">
      <div className="overflow-hidden whitespace-nowrap">
        <div className="inline-flex animate-marquee gap-6">
          {marqueeItems.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              className="inline-flex items-center gap-2 px-2 hover:opacity-80 transition group"
            >
              {/* Token Resmi */}
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-5 h-5 rounded-full" />
              ) : (
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white">{item.name.charAt(0)}</span>
                </div>
              )}
              <span className="text-white font-semibold text-sm">{item.name}</span>
              <span className="text-green-400 text-sm font-mono">{item.change}</span>
              <span className="text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition">Buy →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}