"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "en" | "tr" | "zh" | "ru";

type Translations = {
  [key: string]: string;
};

const translations: Record<Locale, Translations> = {
  en: {
    // Navigation
    "nav_home": "Home",
    "nav_create": "Create",
    "nav_new_pairs": "New Pairs",
    "nav_refer": "Refer",
    "nav_live": "Live",
    "nav_top_users": "Top Users",
    "nav_connect": "Connect Wallet",
    
    // Hero
    "hero_title": "Create Your Solana Meme Coin",
    "hero_subtitle": "Launch your own token in seconds. No code needed. Just pure creativity.",
    "hero_button": "Create Token Now",
    
    // Feature Cards
    "feature_fast_title": "Fast Deployment",
    "feature_fast_desc": "Most tokens deploy in under 30 seconds",
    "feature_secure_title": "Secure Launch",
    "feature_secure_desc": "Authority controls included during creation",
    "feature_solana_title": "Solana Powered",
    "feature_solana_desc": "Built directly on Solana infrastructure",
    
    // Why BluPrint
    "why_title": "Why BluPrint?",
    "why_subtitle": "A fast and simple way to launch on Solana.",
    "why_instant": "Instant Launch",
    "why_instant_desc": "Deploy your token in seconds.",
    "why_security": "Built-In Security",
    "why_security_desc": "Mint and freeze authority options included.",
    "why_nocode": "No-Code Experience",
    "why_nocode_desc": "No developers needed.",
    
    // How It Works
    "how_title": "How It Works",
    "how_subtitle": "Launch your token in three simple steps.",
    "how_step1": "Choose Your Token",
    "how_step1_desc": "Set your token name, symbol and logo.",
    "how_step2": "Confirm Transaction",
    "how_step2_desc": "Confirm the transaction with your wallet.",
    "how_step3": "Launch & Share",
    "how_step3_desc": "Your token is live on Solana! 🚀",
    
    // Live Experience
    "live_title": "Live Launch Experience",
    "live_subtitle": "See how fast token creation feels on BluPrint.",
    "live_demo": "⚡ Deployment usually completes in under 30 seconds",
    "live_success": "✅ Token successfully created",
    
    // Trust Section
    "trust_title": "Built for Secure Launches",
    "trust_subtitle": "Launch Solana tokens with confidence and control.",
    "trust_mint": "Mint Authority Options",
    "trust_freeze": "Freeze Authority Options",
    "trust_metadata": "Metadata Support",
    "trust_ipfs": "IPFS Upload Included",
    
    // Use Cases
    "usecase_title": "Perfect for Every Creator",
    "usecase_subtitle": "Whatever you're building, BluPrint makes it easy.",
    "usecase_meme": "Meme Coins",
    "usecase_meme_desc": "Launch viral meme coins in minutes.",
    "usecase_community": "Community Tokens",
    "usecase_community_desc": "Build and grow your community token.",
    "usecase_exp": "Experimental Projects",
    "usecase_exp_desc": "Test new ideas instantly on Solana.",
    
    // Boost Section
    "boost_title": "🚀 Boost Your Token",
    "boost_subtitle": "Get featured in the BluPrint launch feed and increase visibility instantly.",
    "boost_price": "0.1 SOL for 4 days",
    "boost_button": "Boost Now",
    "boost_featured": "⭐ FEATURED LAUNCH",
    "boost_benefit1": "Featured in Launch Feed",
    "boost_benefit2": "Increased Visibility",
    "boost_benefit3": "More Discoverability",
    
    // CTA
    "cta_title": "Ready to Launch Your Token?",
    "cta_subtitle": "Join hundreds of creators who launched their meme coins on BluPrint",
    "cta_button": "Start Creating Now",
    
    // Footer
    "footer_rights": "All rights reserved",
    
    // Common
    "common_free": "FREE",
    "common_close": "Close",
    
    // Messages
    "uploading_logo": "Uploading logo...",
    "logo_uploaded": "Logo uploaded!",
    "referral_link_detected": "Referral link detected! You'll save 0.02 SOL",
    "connect_wallet_first": "Please connect your wallet first",
    "token_name_error": "Token name must be 3-32 characters",
    "token_symbol_error": "Token symbol must be 2-8 characters",
    "token_symbol_invalid": "Symbol can only contain letters and numbers",
    "token_supply_error": "Supply must be between 1,000 and 10,000,000,000",
    "token_decimals_error": "Decimals must be between 0 and 9",
    "token_created": "Token created successfully!",
  },
  tr: {
    // Navigation
    "nav_home": "Ana Sayfa",
    "nav_create": "Oluştur",
    "nav_new_pairs": "Yeni Pair'ler",
    "nav_refer": "Tavsiye Et",
    "nav_live": "Canlı",
    "nav_top_users": "En İyiler",
    "nav_connect": "Cüzdan Bağla",
    
    // Hero
    "hero_title": "Solana Meme Coin'ini Oluştur",
    "hero_subtitle": "Saniyeler içinde token'ını başlat. Kod yok. Sadece yaratıcılık.",
    "hero_button": "Token Oluştur",
    
    // Feature Cards
    "feature_fast_title": "Hızlı Dağıtım",
    "feature_fast_desc": "Çoğu token 30 saniyeden kısa sürede dağıtılır",
    "feature_secure_title": "Güvenli Başlatma",
    "feature_secure_desc": "Oluşturma sırasında yetki kontrolleri dahildir",
    "feature_solana_title": "Solana Destekli",
    "feature_solana_desc": "Doğrudan Solana altyapısı üzerine inşa edilmiştir",
    
    // Why BluPrint
    "why_title": "Neden BluPrint?",
    "why_subtitle": "Solana'da token başlatmanın hızlı ve basit yolu.",
    "why_instant": "Anında Başlatma",
    "why_instant_desc": "Token'ını saniyeler içinde dağıt.",
    "why_security": "Yerleşik Güvenlik",
    "why_security_desc": "Mint ve freeze yetki seçenekleri dahildir.",
    "why_nocode": "Kodsuz Deneyim",
    "why_nocode_desc": "Geliştiriciye gerek yok.",
    
    // How It Works
    "how_title": "Nasıl Çalışır",
    "how_subtitle": "Token'ını üç basit adımda başlat.",
    "how_step1": "Token'ını Seç",
    "how_step1_desc": "Token adı, sembolü ve logosunu belirle.",
    "how_step2": "İşlemi Onayla",
    "how_step2_desc": "Cüzdanın ile işlemi onayla.",
    "how_step3": "Başlat ve Paylaş",
    "how_step3_desc": "Token'ın Solana'da canlı! 🚀",
    
    // Live Experience
    "live_title": "Canlı Başlatma Deneyimi",
    "live_subtitle": "BluPrint'te token oluşturmanın ne kadar hızlı olduğunu gör.",
    "live_demo": "⚡ Dağıtım genellikle 30 saniyeden kısa sürer",
    "live_success": "✅ Token başarıyla oluşturuldu",
    
    // Trust Section
    "trust_title": "Güvenli Başlatmalar için Tasarlanmıştır",
    "trust_subtitle": "Solana token'larını güvenle başlat.",
    "trust_mint": "Mint Yetki Seçenekleri",
    "trust_freeze": "Freeze Yetki Seçenekleri",
    "trust_metadata": "Metadata Desteği",
    "trust_ipfs": "IPFS Yükleme Dahil",
    
    // Use Cases
    "usecase_title": "Her Yaratıcı için Mükemmel",
    "usecase_subtitle": "Ne inşa ediyor olursan ol, BluPrint kolaylaştırır.",
    "usecase_meme": "Meme Coin'ler",
    "usecase_meme_desc": "Viral meme coin'leri dakikalar içinde başlat.",
    "usecase_community": "Topluluk Token'ları",
    "usecase_community_desc": "Topluluk token'ını oluştur ve büyüt.",
    "usecase_exp": "Deneysel Projeler",
    "usecase_exp_desc": "Yeni fikirleri Solana'da anında test et.",
    
    // Boost Section
    "boost_title": "🚀 Token'ını Öne Çıkar",
    "boost_subtitle": "BluPrint başlatma akışında öne çık ve anında görünürlük kazan.",
    "boost_price": "4 gün için 0.1 SOL",
    "boost_button": "Şimdi Boostla",
    "boost_featured": "⭐ ÖNE ÇIKAN BAŞLATMA",
    "boost_benefit1": "Başlatma Akışında Öne Çık",
    "boost_benefit2": "Artan Görünürlük",
    "boost_benefit3": "Daha Fazla Keşfedilme",
    
    // CTA
    "cta_title": "Token'ını Başlatmaya Hazır mısın?",
    "cta_subtitle": "BluPrint'te meme coin'ini başlatan binlerce yaratıcıya katıl",
    "cta_button": "Hemen Başlat",
    
    // Footer
    "footer_rights": "Tüm hakları saklıdır",
    
    // Common
    "common_free": "ÜCRETSİZ",
    "common_close": "Kapat",
    
    // Messages
    "uploading_logo": "Logo yükleniyor...",
    "logo_uploaded": "Logo yüklendi!",
    "referral_link_detected": "Tavsiye linki algılandı! 0.02 SOL tasarruf edeceksin",
    "connect_wallet_first": "Lütfen önce cüzdanını bağla",
    "token_name_error": "Token adı 3-32 karakter olmalı",
    "token_symbol_error": "Token sembolü 2-8 karakter olmalı",
    "token_symbol_invalid": "Sembol sadece harf ve rakam içerebilir",
    "token_supply_error": "Arz 1,000 ile 10,000,000,000 arasında olmalı",
    "token_decimals_error": "Ondalık 0-9 arasında olmalı",
    "token_created": "Token başarıyla oluşturuldu!",
  },
  zh: {
    // Navigation
    "nav_home": "首页",
    "nav_create": "创建",
    "nav_new_pairs": "新交易对",
    "nav_refer": "推荐",
    "nav_live": "直播",
    "nav_top_users": "顶级用户",
    "nav_connect": "连接钱包",
    
    // Feature Cards
    "feature_fast_title": "快速部署",
    "feature_fast_desc": "大多数代币在30秒内完成部署",
    "feature_secure_title": "安全启动",
    "feature_secure_desc": "创建过程中包含权限控制",
    "feature_solana_title": "Solana驱动",
    "feature_solana_desc": "直接构建在Solana基础设施上",
    
    // Why BluPrint
    "why_title": "为什么选择 BluPrint？",
    "why_subtitle": "在 Solana 上快速简便地启动代币。",
    "why_instant": "即时启动",
    "why_instant_desc": "几秒内部署您的代币。",
    "why_security": "内置安全",
    "why_security_desc": "包含铸造和冻结权限选项。",
    "why_nocode": "无代码体验",
    "why_nocode_desc": "无需开发人员。",
    
    // How It Works
    "how_title": "如何运作",
    "how_subtitle": "三个简单步骤启动您的代币。",
    "how_step1": "选择您的代币",
    "how_step1_desc": "设置代币名称、符号和标志。",
    "how_step2": "确认交易",
    "how_step2_desc": "用您的钱包确认交易。",
    "how_step3": "启动并分享",
    "how_step3_desc": "您的代币已在 Solana 上线！🚀",
    
    // Boost Section
    "boost_title": "🚀 推广您的代币",
    "boost_subtitle": "在 BluPrint 启动信息流中展示，即时提高可见性。",
    "boost_price": "4天 0.1 SOL",
    "boost_button": "立即推广",
    "boost_featured": "⭐ 精选启动",
    
    // CTA
    "cta_title": "准备好启动您的代币了吗？",
    "cta_subtitle": "加入在 BluPrint 上启动 meme 币的数千名创作者",
    "cta_button": "立即开始创建",
    
    "footer_rights": "保留所有权利",
    "common_free": "免费",
    "common_close": "关闭",
    "connect_wallet_first": "请先连接您的钱包",
  },
  ru: {
    // Navigation
    "nav_home": "Главная",
    "nav_create": "Создать",
    "nav_new_pairs": "Новые пары",
    "nav_refer": "Реферал",
    "nav_live": "Лента",
    "nav_top_users": "Топ пользователей",
    "nav_connect": "Подключить кошелек",
    
    // Feature Cards
    "feature_fast_title": "Быстрый деплой",
    "feature_fast_desc": "Большинство токенов развертываются менее чем за 30 секунд",
    "feature_secure_title": "Безопасный запуск",
    "feature_secure_desc": "Контроль полномочий включен при создании",
    "feature_solana_title": "На базе Solana",
    "feature_solana_desc": "Построено непосредственно на инфраструктуре Solana",
    
    // Why BluPrint
    "why_title": "Почему BluPrint?",
    "why_subtitle": "Быстрый и простой способ запуска на Solana.",
    "why_instant": "Мгновенный запуск",
    "why_instant_desc": "Разверните свой токен за секунды.",
    "why_security": "Встроенная безопасность",
    "why_security_desc": "Опции разрешений на майнинг и заморозку включены.",
    "why_nocode": "Без кода",
    "why_nocode_desc": "Не нужны разработчики.",
    
    // How It Works
    "how_title": "Как это работает",
    "how_subtitle": "Запустите свой токен в три простых шага.",
    "how_step1": "Выберите токен",
    "how_step1_desc": "Укажите название, символ и логотип токена.",
    "how_step2": "Подтвердите транзакцию",
    "how_step2_desc": "Подтвердите транзакцию в кошельке.",
    "how_step3": "Запустите и делитесь",
    "how_step3_desc": "Ваш токен на Solana! 🚀",
    
    // Boost Section
    "boost_title": "🚀 Продвиньте свой токен",
    "boost_subtitle": "Покажите свой токен в ленте запуска BluPrint для мгновенной видимости.",
    "boost_price": "0.1 SOL на 4 дня",
    "boost_button": "Продвинуть",
    "boost_featured": "⭐ ИЗБРАННЫЙ ЗАПУСК",
    
    // CTA
    "cta_title": "Готовы запустить свой токен?",
    "cta_subtitle": "Присоединяйтесь к тысячам создателей, запустивших свои мемкоины на BluPrint",
    "cta_button": "Начать создание",
    
    "footer_rights": "Все права защищены",
    "common_free": "БЕСПЛАТНО",
    "common_close": "Закрыть",
    "connect_wallet_first": "Пожалуйста, сначала подключите кошелек",
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && ["en", "tr", "zh", "ru"].includes(saved)) {
      setLocale(saved);
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export { I18nProvider, useI18n };
export default I18nProvider;