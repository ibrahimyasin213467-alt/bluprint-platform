"use client";

export default function MarqueeBanner() {
  const items = [
    { name: "BONK", change: "+45%", color: "text-green-400" },
    { name: "WIF", change: "+120%", color: "text-green-400" },
    { name: "POPCAT", change: "+67%", color: "text-green-400" },
    { name: "MYRO", change: "+23%", color: "text-green-400" },
    { name: "BLUEP", change: "+890%", color: "text-green-400" },
    { name: "BONK", change: "+45%", color: "text-green-400" },
    { name: "WIF", change: "+120%", color: "text-green-400" },
    { name: "POPCAT", change: "+67%", color: "text-green-400" },
    { name: "MYRO", change: "+23%", color: "text-green-400" },
    { name: "BLUEP", change: "+890%", color: "text-green-400" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900/95 to-purple-900/95 backdrop-blur-md border-b border-blue-500/30 py-2">
      <div className="overflow-hidden whitespace-nowrap">
        <div className="inline-flex animate-marquee gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-2 px-2">
              <span className="text-yellow-400 text-sm">🔥</span>
              <span className="text-white font-semibold text-sm">{item.name}</span>
              <span className={`${item.color} text-sm font-mono`}>{item.change}</span>
              <button className="text-blue-400 hover:text-blue-300 text-xs underline ml-1">
                Buy →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}