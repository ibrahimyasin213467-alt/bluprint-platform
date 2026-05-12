"use client";

export default function MarqueeBanner() {
  const items = [
    { name: "BONK", change: "+45%", link: "/token/1" },
    { name: "WIF", change: "+120%", link: "/token/2" },
    { name: "POPCAT", change: "+67%", link: "/token/3" },
    { name: "MYRO", change: "+23%", link: "/token/4" },
    { name: "BLUEP", change: "+890%", link: "/token/5" },
  ];

  // Double the items for seamless loop
  const marqueeItems = [...items, ...items, ...items];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 border-b border-blue-500/30 py-2.5 shadow-lg">
      <div className="overflow-hidden whitespace-nowrap">
        <div className="inline-flex animate-marquee gap-8">
          {marqueeItems.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              className="inline-flex items-center gap-2 px-2 hover:opacity-80 transition"
            >
              <span className="text-yellow-400 text-sm">🔥</span>
              <span className="text-white font-semibold text-sm">{item.name}</span>
              <span className="text-green-400 text-sm font-mono">{item.change}</span>
              <span className="text-blue-400 text-xs ml-1">Buy →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}