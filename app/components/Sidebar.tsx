"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const menuItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/create", label: "Create", icon: "🪙" },
  { href: "/new-pairs", label: "New Pairs", icon: "🔥" },
  { href: "/referral", label: "Refer", icon: "💰" },
  { href: "/live", label: "Live", icon: "📢" },
  { href: "/top-users", label: "Top Users", icon: "🏆" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-48 bg-gray-950/95 backdrop-blur-sm border-r border-gray-800 z-40">
      <div className="flex flex-col h-full py-6">
        {/* Logo */}
        <div className="px-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BP</span>
            </div>
            <span className="text-white font-bold text-lg">BluPrint</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeSidebar"
                    className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                    transition={{ type: "spring", duration: 0.3 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 mt-auto pt-4 border-t border-gray-800">
          <div className="text-xs text-gray-600 text-center">
            <p>v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}