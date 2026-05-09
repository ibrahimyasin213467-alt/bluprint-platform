"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

// Emojileri ve özel karakterleri temizleyen fonksiyon
const cleanMessage = (msg: string) => {
  return msg
    .replace(/[✅❌🎉🔴⚠️ℹ️💰🎁⚡🔥💎📋🐦💬🌐🔒⭐🚀✨🔗👛🪙💧🏠💰📍📝🖼️🔢📊🔤🏷️🌐🔒⭐🚀✨]/g, '')
    .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();
};

const icons = {
  success: (
    <div className="bg-green-500 rounded-full p-1">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  error: (
    <div className="bg-red-500 rounded-full p-1">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  ),
  info: (
    <div className="bg-blue-500 rounded-full p-1">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
  warning: (
    <div className="bg-yellow-500 rounded-full p-1">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  ),
};

const gradients = {
  success: "from-green-500 to-emerald-600",
  error: "from-red-500 to-rose-600",
  info: "from-blue-500 to-indigo-600",
  warning: "from-yellow-500 to-orange-600",
};

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const cleanedMessage = cleanMessage(message);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradients[type]} rounded-2xl blur-xl opacity-50`} />
        
        <div className={`relative bg-gradient-to-r ${gradients[type]} rounded-2xl shadow-2xl px-5 py-3 min-w-[280px] max-w-[400px]`}>
          <div className="flex items-center gap-3">
            {icons[type]}
            <p className="text-white font-medium text-sm flex-1">{cleanedMessage}</p>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={`absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl`}
          />
        </div>
      </div>
    </motion.div>
  );
}