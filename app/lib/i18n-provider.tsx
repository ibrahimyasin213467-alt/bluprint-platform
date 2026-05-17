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
    
    // Create Page
    "pool_title": "🎁 First 100 Tokens Special Offer! 🎁",
    "pool_first": "Only",
    "pool_tokens": "tokens left",
    "create_title": "✨ Create Your Meme Coin",
    "create_subtitle": "Deploy instantly on Solana",
    "create_name_label": "Token Name",
    "create_name_placeholder": "e.g., My Awesome Coin",
    "create_symbol_label": "Token Symbol",
    "create_symbol_placeholder": "e.g., MAC",
    "create_supply_label": "Total Supply",
    "create_decimals_label": "Decimals",
    "create_logo_label": "Token Logo",
    "create_logo_placeholder": "Click or drag image to upload",
    "create_desc_label": "Description (optional)",
    "create_desc_placeholder": "Describe your token...",
    "create_launch": "⚡ LAUNCH TOKEN ⚡",
    "create_first100": "First 100 Tokens Special",
    "create_secure_label": "Secure Token",
    "create_social_button": "Add Social Links",
    "common_free": "FREE",
    
    // Referral Page
    "ref_title": "💰 Referral Program",
    "ref_desc": "Earn SOL by inviting your friends!",
    "ref_total": "Total Earned",
    "ref_unclaimed": "Unclaimed",
    "ref_per": "per referral",
    "ref_step1": "Share Your Code",
    "ref_step1_desc": "Share your unique promo code with friends",
    "ref_step2": "Friend Creates Token",
    "ref_step2_desc": "When they create a token, you earn 0.05 SOL",
    "ref_step3": "Get Paid",
    "ref_step3_desc": "SOL is sent directly to your wallet instantly",
    "ref_how_title": "How It Works",
    
    // Top Users
    "top_users_title": "🏆 Top Users",
    "top_users_subtitle": "Most active token creators on BluPrint",
    "top_users_all_time": "All Time",
    "top_users_week": "This Week",
    "top_users_month": "This Month",
    "top_users_most_tokens": "Most Tokens",
    "top_users_most_referrals": "Most Referrals",
    "top_users_rank": "Rank",
    "top_users_user": "User",
    "top_users_tokens": "Tokens",
    "top_users_referrals": "Referrals",
    "top_users_joined": "Joined",
    "top_users_you": "You",
    "top_users_your_rank": "Your Rank",
    "top_users_your_tokens": "Your Tokens",
    "top_users_your_referrals": "Your Referrals",
    "top_users_no_users": "No users found",
    
    // New Pairs
    "new_pairs_title": "New Pairs",
    "new_pairs_subtitle": "Discover the latest tokens on Solana",
    
    // Live Feed
    
    "live_empty": "No activity yet",
    "live_waiting": "Waiting for activity...",
    "live_activity_created": "created token",
    "live_activity_referral": "referred a friend",
    "live_activity_vip": "registered for VIP",
    
    // Boost Section
    "boost_title": "🚀 Boost Your Token",
    "boost_subtitle": "Get featured in the BluPrint launch feed and increase visibility instantly.",
    "boost_price": "0.1 SOL for 4 days",
    "boost_button": "Boost Now",
    "boost_featured": "⭐ FEATURED LAUNCH",
    "boost_benefit1": "Featured in Launch Feed",
    "boost_benefit2": "Increased Visibility",
    "boost_benefit3": "More Discoverability",
    "boost_active": "Active Boosts",
    
    // CTA
    "cta_title": "Ready to Launch Your Token?",
    "cta_subtitle": "Join creators who launched their meme coins on BluPrint",
    "cta_button": "Start Creating Now",
    
    // Footer
    "footer_rights": "All rights reserved",
    
    // Common
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
    
    // Featured
    "featured_title": "🔥 Featured Tokens",
    "featured_subtitle": "Trending tokens on BluPrint",
  },
  tr: {
    "nav_home": "Ana Sayfa",
    "nav_create": "Oluştur",
    "nav_new_pairs": "Yeni Pair'ler",
    "nav_refer": "Tavsiye Et",
    "nav_live": "Canlı",
    "nav_top_users": "En İyiler",
    "nav_connect": "Cüzdan Bağla",
    "hero_title": "Solana Meme Coin'ini Oluştur",
    "hero_subtitle": "Saniyeler içinde token'ını başlat. Kod yok. Sadece yaratıcılık.",
    "hero_button": "Token Oluştur",
    "feature_fast_title": "Hızlı Dağıtım",
    "feature_fast_desc": "Çoğu token 30 saniyeden kısa sürede dağıtılır",
    "feature_secure_title": "Güvenli Başlatma",
    "feature_secure_desc": "Oluşturma sırasında yetki kontrolleri dahildir",
    "feature_solana_title": "Solana Destekli",
    "feature_solana_desc": "Doğrudan Solana altyapısı üzerine inşa edilmiştir",
    "why_title": "Neden BluPrint?",
    "why_subtitle": "Solana'da token başlatmanın hızlı ve basit yolu.",
    "why_instant": "Anında Başlatma",
    "why_instant_desc": "Token'ını saniyeler içinde dağıt.",
    "why_security": "Yerleşik Güvenlik",
    "why_security_desc": "Mint ve freeze yetki seçenekleri dahildir.",
    "why_nocode": "Kodsuz Deneyim",
    "why_nocode_desc": "Geliştiriciye gerek yok.",
    "how_title": "Nasıl Çalışır",
    "how_subtitle": "Token'ını üç basit adımda başlat.",
    "how_step1": "Token'ını Seç",
    "how_step1_desc": "Token adı, sembolü ve logosunu belirle.",
    "how_step2": "İşlemi Onayla",
    "how_step2_desc": "Cüzdanın ile işlemi onayla.",
    "how_step3": "Başlat ve Paylaş",
    "how_step3_desc": "Token'ın Solana'da canlı! 🚀",
    "live_title": "Canlı Başlatma Deneyimi",
    "live_subtitle": "BluPrint'te token oluşturmanın ne kadar hızlı olduğunu gör.",
    "live_demo": "⚡ Dağıtım genellikle 30 saniyeden kısa sürer",
    "live_success": "✅ Token başarıyla oluşturuldu",
    "trust_title": "Güvenli Başlatmalar için Tasarlanmıştır",
    "trust_subtitle": "Solana token'larını güvenle başlat.",
    "trust_mint": "Mint Yetki Seçenekleri",
    "trust_freeze": "Freeze Yetki Seçenekleri",
    "trust_metadata": "Metadata Desteği",
    "trust_ipfs": "IPFS Yükleme Dahil",
    "usecase_title": "Her Yaratıcı için Mükemmel",
    "usecase_subtitle": "Ne inşa ediyor olursan ol, BluPrint kolaylaştırır.",
    "usecase_meme": "Meme Coin'ler",
    "usecase_meme_desc": "Viral meme coin'leri dakikalar içinde başlat.",
    "usecase_community": "Topluluk Token'ları",
    "usecase_community_desc": "Topluluk token'ını oluştur ve büyüt.",
    "usecase_exp": "Deneysel Projeler",
    "usecase_exp_desc": "Yeni fikirleri Solana'da anında test et.",
    "pool_title": "🎁 İlk 100 Token'a Özel Fırsat! 🎁",
    "pool_first": "Sadece",
    "pool_tokens": "token kaldı",
    "create_title": "✨ Meme Coin'ini Oluştur",
    "create_subtitle": "Solana'da anında başlat",
    "create_name_label": "Token Adı",
    "create_name_placeholder": "ör: Müthiş Coin",
    "create_symbol_label": "Token Sembolü",
    "create_symbol_placeholder": "ör: MTC",
    "create_supply_label": "Toplam Arz",
    "create_decimals_label": "Ondalık",
    "create_logo_label": "Token Logosu",
    "create_logo_placeholder": "Resim yüklemek için tıkla",
    "create_desc_label": "Açıklama (isteğe bağlı)",
    "create_desc_placeholder": "Token'ını açıkla...",
    "create_launch": "⚡ TOKEN BAŞLAT ⚡",
    "create_first100": "İlk 100 Token'a Özel",
    "create_secure_label": "Güvenli Token",
    "create_social_button": "Sosyal Linkler Ekle",
    "common_free": "ÜCRETSİZ",
    "ref_title": "💰 Tavsiye Programı",
    "ref_desc": "Arkadaşlarını davet ederek SOL kazan!",
    "ref_total": "Toplam Kazanç",
    "ref_unclaimed": "Alınmamış",
    "ref_per": "tavsiye başına",
    "ref_step1": "Kodunu Paylaş",
    "ref_step1_desc": "Benzersiz promosyon kodunu arkadaşlarınla paylaş",
    "ref_step2": "Arkadaşın Token Oluşturur",
    "ref_step2_desc": "Token oluşturduklarında 0.05 SOL kazanırsın",
    "ref_step3": "Ödemeni Al",
    "ref_step3_desc": "SOL anında cüzdanına gönderilir",
    "ref_how_title": "Nasıl Çalışır",
    "top_users_title": "🏆 En İyi Kullanıcılar",
    "top_users_subtitle": "BluPrint'te en çok token oluşturanlar",
    "new_pairs_title": "Yeni Pair'ler",
    "new_pairs_subtitle": "Solana'daki en yeni tokenları keşfet",
    "live_empty": "Henüz aktivite yok",
    "live_waiting": "Aktivite bekleniyor...",
    "live_activity_created": "token oluşturdu",
    "live_activity_referral": "arkadaşını tavsiye etti",
    "live_activity_vip": "VIP kaydı yaptı",
    "boost_title": "🚀 Token'ını Öne Çıkar",
    "boost_subtitle": "Token'ının görünürlüğünü artır",
    "boost_price": "4 gün için 0.1 SOL",
    "boost_button": "Şimdi Boostla",
    "boost_active": "Aktif Boostlar",
    "cta_title": "Token'ını Başlatmaya Hazır Mısın?",
    "cta_subtitle": "BluPrint'te meme coin'ini başlatan binlerce yaratıcıya katıl",
    "cta_button": "Hemen Başlat",
    "featured_title": "🔥 Öne Çıkan Tokenlar",
    "featured_subtitle": "BluPrint'te trend olan tokenlar",
    "footer_rights": "Tüm hakları saklıdır",
    "common_close": "Kapat",
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
    "nav_home": "首页",
    "nav_create": "创建",
    "nav_new_pairs": "新交易对",
    "nav_refer": "推荐",
    "nav_live": "直播",
    "nav_top_users": "顶级用户",
    "nav_connect": "连接钱包",
    "feature_fast_title": "快速部署",
    "feature_fast_desc": "大多数代币在30秒内完成部署",
    "feature_secure_title": "安全启动",
    "feature_secure_desc": "创建过程中包含权限控制",
    "feature_solana_title": "Solana驱动",
    "feature_solana_desc": "直接构建在Solana基础设施上",
    "pool_title": "🎁 前100个代币特别优惠！🎁",
    "pool_first": "仅剩",
    "pool_tokens": "个代币名额",
    "create_title": "✨ 创建您的 Meme 币",
    "create_subtitle": "在 Solana 上即时部署",
    "create_name_label": "代币名称",
    "create_name_placeholder": "例如：我的牛逼币",
    "create_symbol_label": "代币符号",
    "create_symbol_placeholder": "例如：MNBC",
    "create_supply_label": "总供应量",
    "create_decimals_label": "小数位数",
    "create_logo_label": "代币标志",
    "create_logo_placeholder": "点击上传图片",
    "create_desc_label": "描述（可选）",
    "create_desc_placeholder": "描述您的代币...",
    "create_launch": "⚡ 启动代币 ⚡",
    "create_first100": "前100个代币特惠",
    "create_secure_label": "安全代币",
    "create_social_button": "添加社交链接",
    "common_free": "免费",
    "common_close": "关闭",
    "connect_wallet_first": "请先连接您的钱包",
  },
  ru: {
    "nav_home": "Главная",
    "nav_create": "Создать",
    "nav_new_pairs": "Новые пары",
    "nav_refer": "Реферал",
    "nav_live": "Лента",
    "nav_top_users": "Топ пользователей",
    "nav_connect": "Подключить кошелек",
    "feature_fast_title": "Быстрый деплой",
    "feature_fast_desc": "Большинство токенов развертываются менее чем за 30 секунд",
    "feature_secure_title": "Безопасный запуск",
    "feature_secure_desc": "Контроль полномочий включен при создании",
    "feature_solana_title": "На базе Solana",
    "feature_solana_desc": "Построено непосредственно на инфраструктуре Solana",
    "pool_title": "🎁 Спецпредложение для первых 100 токенов! 🎁",
    "pool_first": "Осталось",
    "pool_tokens": "токенов",
    "create_title": "✨ Создайте свою Meme монету",
    "create_subtitle": "Мгновенный запуск на Solana",
    "create_name_label": "Название токена",
    "create_name_placeholder": "например: Мой Классный Токен",
    "create_symbol_label": "Символ токена",
    "create_symbol_placeholder": "например: МКТ",
    "create_supply_label": "Общая эмиссия",
    "create_decimals_label": "Десятичные знаки",
    "create_logo_label": "Логотип токена",
    "create_logo_placeholder": "Нажмите для загрузки изображения",
    "create_desc_label": "Описание (необязательно)",
    "create_desc_placeholder": "Опишите ваш токен...",
    "create_launch": "⚡ ЗАПУСТИТЬ ТОКЕН ⚡",
    "create_first100": "Спецпредложение для первых 100",
    "create_secure_label": "Безопасный токен",
    "create_social_button": "Добавить соцсети",
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