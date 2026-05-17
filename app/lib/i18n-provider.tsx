"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "en" | "tr" | "zh" | "ru";

type Translations = {
  [key: string]: string;
};

const translations: Record<Locale, Translations> = {
  en: {
    // ==================== NAVIGATION ====================
    "nav_home": "Home",
    "nav_create": "Create",
    "nav_new_pairs": "New Pairs",
    "nav_refer": "Refer",
    "nav_live": "Live",
    "nav_top_users": "Top Users",
    "nav_connect": "Connect Wallet",

    // ==================== HERO SECTION ====================
    "hero_title": "Launch Your Meme Coin",
    "hero_title_highlight": "in Seconds ⚡",
    "hero_subtitle": "No code. No friction. Just launch.",
    "hero_button": "Create Token",

    // ==================== FEATURE CARDS ====================
    "feature_fast_title": "Fast Deployment",
    "feature_fast_desc": "Most tokens deploy in under 30 seconds",
    "feature_secure_title": "Secure Launch",
    "feature_secure_desc": "Authority controls included during creation",
    "feature_solana_title": "Solana Powered",
    "feature_solana_desc": "Built directly on Solana infrastructure",

    // ==================== WHY BLUPRINT ====================
    "why_title": "Why BluPrint?",
    "why_subtitle": "The simplest way to launch your Solana token",
    "why_instant": "Instant Launch",
    "why_instant_desc": "Deploy your token in seconds.",
    "why_security": "Built-In Security",
    "why_security_desc": "Mint and freeze authority options included.",
    "why_nocode": "No-Code Experience",
    "why_nocode_desc": "No developers needed.",

    // ==================== HOW IT WORKS ====================
    "how_title": "How It Works",
    "how_subtitle": "Launch your token in three simple steps.",
    "how_step1": "Choose Your Token",
    "how_step1_desc": "Set your token name, symbol and logo.",
    "how_step2": "Confirm Transaction",
    "how_step2_desc": "Confirm the transaction with your wallet.",
    "how_step3": "Launch & Share",
    "how_step3_desc": "Your token is live on Solana! 🚀",

    // ==================== LIVE EXPERIENCE ====================
    "live_title": "Live Launch Experience",
    "live_subtitle": "See how fast token creation feels on BluPrint.",
    "live_demo": "⚡ Deployment usually completes in under 30 seconds",
    "live_success": "✅ Token successfully created",

    // ==================== TRUST SECTION ====================
    "trust_title": "Built for Secure Launches",
    "trust_subtitle": "Launch Solana tokens with confidence and control.",
    "trust_mint": "Mint Authority Options",
    "trust_freeze": "Freeze Authority Options",
    "trust_metadata": "Metadata Support",
    "trust_ipfs": "IPFS Upload Included",

    // ==================== USE CASES ====================
    "usecase_title": "Perfect for Every Creator",
    "usecase_subtitle": "Whatever you're building, BluPrint makes it easy.",
    "usecase_meme": "Meme Coins",
    "usecase_meme_desc": "Launch viral meme coins in minutes.",
    "usecase_community": "Community Tokens",
    "usecase_community_desc": "Build and grow your community token.",
    "usecase_exp": "Experimental Projects",
    "usecase_exp_desc": "Test new ideas instantly on Solana.",

    // ==================== CREATE PAGE ====================
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
    "create_twitter": "Twitter/X URL",
    "create_telegram": "Telegram URL",
    "create_website": "Website URL",
    "create_deploying": "Deploying...",
    "create_button": "Create Token",

    // ==================== SUCCESS MODAL ====================
    "success_title": "🎉 Token Created Successfully!",
    "success_mint": "Token Address:",
    "success_view": "View on Solscan",
    "success_create_another": "Create Another Token",
    "success_go_home": "Go Home",

    // ==================== REFERRAL PAGE ====================
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
    "ref_milestone_title": "🏆 Milestone Bonuses",
    "ref_milestone_desc": "Reach these milestones and earn automatic SOL bonuses!",
    "ref_bronze": "Bronze",
    "ref_silver": "Silver",
    "ref_gold": "Gold",
    "ref_diamond": "Diamond",
    "ref_refs": "refs",
    "ref_left": "left",
    "ref_next_milestone": "🎯 Next milestone:",
    "ref_more_to_unlock": "more referrals to unlock next bonus!",
    "ref_your_code": "🎁 Your Referral Code",
    "ref_share_desc": "Share your code or link — earn 0.05 SOL for every token created!",
    "ref_promo_code": "PROMO CODE",
    "ref_referral_link": "REFERRAL LINK",
    "ref_copy": "Copy",
    "ref_share": "SHARE & EARN",
    "ref_twitter": "Twitter",
    "ref_telegram": "Telegram",
    "ref_whatsapp": "WhatsApp",
    "ref_info": "💡 Every person who creates a token with your code = 0.05 SOL for you!",

    // ==================== TOP USERS PAGE ====================
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

    // ==================== NEW PAIRS PAGE ====================
    "new_pairs_title": "New Pairs",
    "new_pairs_subtitle": "Discover the latest tokens on Solana",
    "new_pairs_bluprint": "BluPrint Origin",
    "new_pairs_jupiter": "Jupiter Recent",
    "new_pairs_source": "Source",
    "new_pairs_liquidity": "Liquidity",
    "new_pairs_volume": "Volume 24h",
    "new_pairs_price": "24h %",
    "new_pairs_created": "Created",
    "new_pairs_holders": "Holders",
    "new_pairs_no_tokens": "No tokens found",
    "new_pairs_retry": "Retry",
    "new_pairs_refresh": "Refresh",

    // ==================== LIVE FEED PAGE ====================
    "live_feed_title": "📢 Live Activity Feed",
    "live_feed_subtitle": "Watch token creations and referrals in real-time",
    "live_feed_empty": "No activity yet",
    "live_feed_waiting": "Waiting for activity...",
    "live_feed_created": "created token",
    "live_feed_referral": "referred a friend",
    "live_feed_vip": "registered for VIP",
    "live_feed_boost": "boosted their token",

    // ==================== BOOST SECTION ====================
    "boost_title": "🚀 Boost Your Token",
    "boost_subtitle": "Get featured in the BluPrint launch feed and increase visibility instantly.",
    "boost_price": "0.1 SOL for 4 days",
    "boost_button": "Boost Now",
    "boost_featured": "⭐ FEATURED LAUNCH",
    "boost_benefit1": "Featured in Launch Feed",
    "boost_benefit2": "Increased Visibility",
    "boost_benefit3": "More Discoverability",
    "boost_active": "Active Boosts",
    "boost_select_token": "Select a token from your wallet to boost:",
    "boost_no_tokens": "⚠️ No tokens found in your wallet.",
    "boost_create_first": "Create a token first or add tokens to your wallet to boost them!",
    "boost_scanning": "Scanning your wallet...",
    "boost_processing": "Processing...",
    "boost_connect": "Connect Wallet",
    "boost_select": "Select a Token",

    // ==================== FEATURED TOKENS ====================
    "featured_title": "🔥 Featured Tokens",
    "featured_subtitle": "Trending tokens on BluPrint",

    // ==================== FINAL CTA ====================
    "cta_title": "Ready to Launch Your Token?",
    "cta_subtitle": "Join creators who launched their meme coins on BluPrint",
    "cta_button": "Start Creating Now",

    // ==================== FOOTER ====================
    "footer_bluprint": "BluPrint",
    "footer_about": "About Us",
    "footer_faq": "FAQ",
    "footer_privacy": "Privacy Policy",
    "footer_terms": "Terms of Service",
    "footer_resources": "Resources",
    "footer_raydium": "Raydium",
    "footer_jupiter": "Jupiter",
    "footer_solscan": "Solscan",
    "footer_phantom": "Phantom Wallet",
    "footer_community": "Community",
    "footer_twitter": "Twitter",
    "footer_telegram": "Telegram",
    "footer_github": "GitHub",
    "footer_legal": "Legal",
    "footer_rights": "All rights reserved",

    // ==================== COMMON ====================
    "common_free": "FREE",
    "common_close": "Close",
    "common_copy": "Copy",
    "common_copied": "Copied!",
    "common_loading": "Loading...",
    "common_error": "Error",
    "common_success": "Success",
    "common_warning": "Warning",
    "common_info": "Info",

    // ==================== MESSAGES ====================
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
    "boost_success": "Token boosted successfully! Now on the banner.",
    "boost_failed": "Boost failed",
    "insufficient_balance": "Insufficient SOL balance",
    "transaction_rejected": "Transaction rejected",
    "transaction_failed": "Transaction failed",
  },
  tr: {
    // ==================== NAVIGATION ====================
    "nav_home": "Ana Sayfa",
    "nav_create": "Oluştur",
    "nav_new_pairs": "Yeni Pair'ler",
    "nav_refer": "Tavsiye Et",
    "nav_live": "Canlı",
    "nav_top_users": "En İyiler",
    "nav_connect": "Cüzdan Bağla",

    // ==================== HERO SECTION ====================
    "hero_title": "Meme Coin'ini Başlat",
    "hero_title_highlight": "Saniyeler İçinde ⚡",
    "hero_subtitle": "Kod yok. Zorluk yok. Sadece başlat.",
    "hero_button": "Token Oluştur",

    // ==================== FEATURE CARDS ====================
    "feature_fast_title": "Hızlı Dağıtım",
    "feature_fast_desc": "Çoğu token 30 saniyeden kısa sürede dağıtılır",
    "feature_secure_title": "Güvenli Başlatma",
    "feature_secure_desc": "Oluşturma sırasında yetki kontrolleri dahildir",
    "feature_solana_title": "Solana Destekli",
    "feature_solana_desc": "Doğrudan Solana altyapısı üzerine inşa edilmiştir",

    // ==================== WHY BLUPRINT ====================
    "why_title": "Neden BluPrint?",
    "why_subtitle": "Solana token'ını başlatmanın en kolay yolu",
    "why_instant": "Anında Başlatma",
    "why_instant_desc": "Token'ını saniyeler içinde dağıt.",
    "why_security": "Yerleşik Güvenlik",
    "why_security_desc": "Mint ve freeze yetki seçenekleri dahildir.",
    "why_nocode": "Kodsuz Deneyim",
    "why_nocode_desc": "Geliştiriciye gerek yok.",

    // ==================== HOW IT WORKS ====================
    "how_title": "Nasıl Çalışır",
    "how_subtitle": "Token'ını üç basit adımda başlat.",
    "how_step1": "Token'ını Seç",
    "how_step1_desc": "Token adı, sembolü ve logosunu belirle.",
    "how_step2": "İşlemi Onayla",
    "how_step2_desc": "Cüzdanın ile işlemi onayla.",
    "how_step3": "Başlat ve Paylaş",
    "how_step3_desc": "Token'ın Solana'da canlı! 🚀",

    // ==================== LIVE EXPERIENCE ====================
    "live_title": "Canlı Başlatma Deneyimi",
    "live_subtitle": "BluPrint'te token oluşturmanın ne kadar hızlı olduğunu gör.",
    "live_demo": "⚡ Dağıtım genellikle 30 saniyeden kısa sürer",
    "live_success": "✅ Token başarıyla oluşturuldu",

    // ==================== TRUST SECTION ====================
    "trust_title": "Güvenli Başlatmalar için Tasarlanmıştır",
    "trust_subtitle": "Solana token'larını güvenle başlat.",
    "trust_mint": "Mint Yetki Seçenekleri",
    "trust_freeze": "Freeze Yetki Seçenekleri",
    "trust_metadata": "Metadata Desteği",
    "trust_ipfs": "IPFS Yükleme Dahil",

    // ==================== USE CASES ====================
    "usecase_title": "Her Yaratıcı için Mükemmel",
    "usecase_subtitle": "Ne inşa ediyor olursan ol, BluPrint kolaylaştırır.",
    "usecase_meme": "Meme Coin'ler",
    "usecase_meme_desc": "Viral meme coin'leri dakikalar içinde başlat.",
    "usecase_community": "Topluluk Token'ları",
    "usecase_community_desc": "Topluluk token'ını oluştur ve büyüt.",
    "usecase_exp": "Deneysel Projeler",
    "usecase_exp_desc": "Yeni fikirleri Solana'da anında test et.",

    // ==================== CREATE PAGE ====================
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
    "create_twitter": "Twitter/X URL",
    "create_telegram": "Telegram URL",
    "create_website": "Website URL",
    "create_deploying": "Başlatılıyor...",
    "create_button": "Token Oluştur",

    // ==================== SUCCESS MODAL ====================
    "success_title": "🎉 Token Başarıyla Oluşturuldu!",
    "success_mint": "Token Adresi:",
    "success_view": "Solscan'da Gör",
    "success_create_another": "Yeni Token Oluştur",
    "success_go_home": "Ana Sayfaya Dön",

    // ==================== REFERRAL PAGE ====================
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
    "ref_milestone_title": "🏆 Hedef Bonusları",
    "ref_milestone_desc": "Bu hedeflere ulaş ve otomatik SOL bonusları kazan!",
    "ref_bronze": "Bronz",
    "ref_silver": "Gümüş",
    "ref_gold": "Altın",
    "ref_diamond": "Elmas",
    "ref_refs": "tavsiye",
    "ref_left": "kaldı",
    "ref_next_milestone": "🎯 Sonraki hedef:",
    "ref_more_to_unlock": "daha fazla tavsiye ile sonraki bonusun kilidini aç!",
    "ref_your_code": "🎁 Senin Tavsiye Kodun",
    "ref_share_desc": "Kodunu veya linkini paylaş — oluşturulan her token için 0.05 SOL kazan!",
    "ref_promo_code": "PROMO KODU",
    "ref_referral_link": "TAVSİYE LİNKİ",
    "ref_copy": "Kopyala",
    "ref_share": "PAYLAŞ & KAZAN",
    "ref_twitter": "Twitter",
    "ref_telegram": "Telegram",
    "ref_whatsapp": "WhatsApp",
    "ref_info": "💡 Kodu ile token oluşturan her kişi = senin için 0.05 SOL!",

    // ==================== TOP USERS PAGE ====================
    "top_users_title": "🏆 En İyi Kullanıcılar",
    "top_users_subtitle": "BluPrint'te en çok token oluşturanlar",
    "top_users_all_time": "Tüm Zamanlar",
    "top_users_week": "Bu Hafta",
    "top_users_month": "Bu Ay",
    "top_users_most_tokens": "En Çok Token",
    "top_users_most_referrals": "En Çok Tavsiye",
    "top_users_rank": "Sıra",
    "top_users_user": "Kullanıcı",
    "top_users_tokens": "Token",
    "top_users_referrals": "Tavsiye",
    "top_users_joined": "Katılım",
    "top_users_you": "Sen",
    "top_users_your_rank": "Senin Sıran",
    "top_users_your_tokens": "Senin Token'ların",
    "top_users_your_referrals": "Senin Tavsiyelerin",
    "top_users_no_users": "Kullanıcı bulunamadı",

    // ==================== NEW PAIRS PAGE ====================
    "new_pairs_title": "Yeni Pair'ler",
    "new_pairs_subtitle": "Solana'daki en yeni tokenları keşfet",
    "new_pairs_bluprint": "BluPrint Origin",
    "new_pairs_jupiter": "Jupiter Güncel",
    "new_pairs_source": "Kaynak",
    "new_pairs_liquidity": "Likidite",
    "new_pairs_volume": "24s Hacim",
    "new_pairs_price": "24s %",
    "new_pairs_created": "Oluşturulma",
    "new_pairs_holders": "Sahip",
    "new_pairs_no_tokens": "Token bulunamadı",
    "new_pairs_retry": "Tekrar Dene",
    "new_pairs_refresh": "Yenile",

    // ==================== LIVE FEED PAGE ====================
    "live_feed_title": "📢 Canlı Aktivite Akışı",
    "live_feed_subtitle": "Token oluşturmaları ve tavsiyeleri anlık izle",
    "live_feed_empty": "Henüz aktivite yok",
    "live_feed_waiting": "Aktivite bekleniyor...",
    "live_feed_created": "token oluşturdu",
    "live_feed_referral": "arkadaşını tavsiye etti",
    "live_feed_vip": "VIP kaydı yaptı",
    "live_feed_boost": "token'ını boostladı",

    // ==================== BOOST SECTION ====================
    "boost_title": "🚀 Token'ını Öne Çıkar",
    "boost_subtitle": "BluPrint başlatma akışında öne çık ve anında görünürlük kazan.",
    "boost_price": "4 gün için 0.1 SOL",
    "boost_button": "Şimdi Boostla",
    "boost_featured": "⭐ ÖNE ÇIKAN BAŞLATMA",
    "boost_benefit1": "Başlatma Akışında Öne Çık",
    "boost_benefit2": "Artan Görünürlük",
    "boost_benefit3": "Daha Fazla Keşfedilme",
    "boost_active": "Aktif Boostlar",
    "boost_select_token": "Cüzdanından boostlamak için bir token seç:",
    "boost_no_tokens": "⚠️ Cüzdanında token bulunamadı.",
    "boost_create_first": "Önce bir token oluştur veya cüzdanına token ekle!",
    "boost_scanning": "Cüzdan taranıyor...",
    "boost_processing": "İşleniyor...",
    "boost_connect": "Cüzdan Bağla",
    "boost_select": "Token Seç",

    // ==================== FEATURED TOKENS ====================
    "featured_title": "🔥 Öne Çıkan Tokenlar",
    "featured_subtitle": "BluPrint'te trend olan tokenlar",

    // ==================== FINAL CTA ====================
    "cta_title": "Token'ını Başlatmaya Hazır Mısın?",
    "cta_subtitle": "BluPrint'te meme coin'ini başlatan yaratıcılara katıl",
    "cta_button": "Hemen Başlat",

    // ==================== FOOTER ====================
    "footer_bluprint": "BluPrint",
    "footer_about": "Hakkımızda",
    "footer_faq": "SSS",
    "footer_privacy": "Gizlilik Politikası",
    "footer_terms": "Kullanım Şartları",
    "footer_resources": "Kaynaklar",
    "footer_raydium": "Raydium",
    "footer_jupiter": "Jupiter",
    "footer_solscan": "Solscan",
    "footer_phantom": "Phantom Cüzdan",
    "footer_community": "Topluluk",
    "footer_twitter": "Twitter",
    "footer_telegram": "Telegram",
    "footer_github": "GitHub",
    "footer_legal": "Yasal",
    "footer_rights": "Tüm hakları saklıdır",

    // ==================== COMMON ====================
    "common_free": "ÜCRETSİZ",
    "common_close": "Kapat",
    "common_copy": "Kopyala",
    "common_copied": "Kopyalandı!",
    "common_loading": "Yükleniyor...",
    "common_error": "Hata",
    "common_success": "Başarılı",
    "common_warning": "Uyarı",
    "common_info": "Bilgi",

    // ==================== MESSAGES ====================
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
    "boost_success": "Token başarıyla boostlandı! Artık banner'da.",
    "boost_failed": "Boost başarısız oldu",
    "insufficient_balance": "Yetersiz SOL bakiyesi",
    "transaction_rejected": "İşlem reddedildi",
    "transaction_failed": "İşlem başarısız oldu",
  },
  zh: {
    // ==================== NAVIGATION ====================
    "nav_home": "首页",
    "nav_create": "创建",
    "nav_new_pairs": "新交易对",
    "nav_refer": "推荐",
    "nav_live": "直播",
    "nav_top_users": "顶级用户",
    "nav_connect": "连接钱包",

    // ==================== HERO SECTION ====================
    "hero_title": "启动你的Meme币",
    "hero_title_highlight": "几秒内 ⚡",
    "hero_subtitle": "无需代码。无需繁琐。只需启动。",
    "hero_button": "创建代币",

    // ==================== FEATURE CARDS ====================
    "feature_fast_title": "快速部署",
    "feature_fast_desc": "大多数代币在30秒内完成部署",
    "feature_secure_title": "安全启动",
    "feature_secure_desc": "创建过程中包含权限控制",
    "feature_solana_title": "Solana驱动",
    "feature_solana_desc": "直接构建在Solana基础设施上",

    // ==================== WHY BLUPRINT ====================
    "why_title": "为什么选择BluPrint？",
    "why_subtitle": "启动Solana代币的最简单方式",
    "why_instant": "即时启动",
    "why_instant_desc": "几秒内部署你的代币。",
    "why_security": "内置安全",
    "why_security_desc": "包含铸造和冻结权限选项。",
    "why_nocode": "无代码体验",
    "why_nocode_desc": "无需开发人员。",

    // ==================== HOW IT WORKS ====================
    "how_title": "如何运作",
    "how_subtitle": "三个简单步骤启动你的代币。",
    "how_step1": "选择代币",
    "how_step1_desc": "设置代币名称、符号和标志。",
    "how_step2": "确认交易",
    "how_step2_desc": "用你的钱包确认交易。",
    "how_step3": "启动并分享",
    "how_step3_desc": "你的代币已在Solana上线！🚀",

    // ==================== CREATE PAGE ====================
    "pool_title": "🎁 前100个代币特别优惠！🎁",
    "pool_first": "仅剩",
    "pool_tokens": "个代币名额",
    "create_title": "✨ 创建你的Meme币",
    "create_subtitle": "在Solana上即时部署",
    "create_name_label": "代币名称",
    "create_name_placeholder": "例如：我的牛逼币",
    "create_symbol_label": "代币符号",
    "create_symbol_placeholder": "例如：MNBC",
    "create_supply_label": "总供应量",
    "create_decimals_label": "小数位数",
    "create_logo_label": "代币标志",
    "create_logo_placeholder": "点击上传图片",
    "create_desc_label": "描述（可选）",
    "create_desc_placeholder": "描述你的代币...",
    "create_launch": "⚡ 启动代币 ⚡",
    "create_first100": "前100个代币特惠",
    "create_secure_label": "安全代币",
    "create_social_button": "添加社交链接",
    "create_deploying": "部署中...",
    "create_button": "创建代币",

    // ==================== REFERRAL PAGE ====================
    "ref_title": "💰 推荐计划",
    "ref_desc": "邀请朋友赚取SOL！",
    "ref_total": "总收益",
    "ref_unclaimed": "未领取",
    "ref_per": "每次推荐",
    "ref_step1": "分享你的代码",
    "ref_step1_desc": "与朋友分享你的专属促销代码",
    "ref_step2": "朋友创建代币",
    "ref_step2_desc": "当他们创建代币时，你赚取0.05 SOL",
    "ref_step3": "获得报酬",
    "ref_step3_desc": "SOL直接发送到你的钱包",
    "ref_how_title": "如何运作",
    "ref_milestone_title": "🏆 里程碑奖励",
    "ref_milestone_desc": "达到这些里程碑，自动获得SOL奖励！",
    "ref_bronze": "青铜",
    "ref_silver": "白银",
    "ref_gold": "黄金",
    "ref_diamond": "钻石",
    "ref_refs": "个推荐",
    "ref_left": "剩余",
    "ref_next_milestone": "🎯 下一个里程碑：",
    "ref_more_to_unlock": "还需要更多推荐解锁下一个奖励！",
    "ref_your_code": "🎁 你的推荐码",
    "ref_share_desc": "分享你的代码或链接 — 每创建一个代币赚0.05 SOL！",
    "ref_promo_code": "促销代码",
    "ref_referral_link": "推荐链接",
    "ref_copy": "复制",
    "ref_share": "分享并赚取",
    "ref_twitter": "Twitter",
    "ref_telegram": "Telegram",
    "ref_whatsapp": "WhatsApp",
    "ref_info": "💡 使用你的代码创建代币的每个人 = 你赚0.05 SOL！",

    // ==================== TOP USERS PAGE ====================
    "top_users_title": "🏆 顶级用户",
    "top_users_subtitle": "BluPrint上最活跃的代币创建者",
    "top_users_rank": "排名",
    "top_users_user": "用户",
    "top_users_tokens": "代币数",
    "top_users_referrals": "推荐数",
    "top_users_no_users": "未找到用户",

    // ==================== NEW PAIRS PAGE ====================
    "new_pairs_title": "新交易对",
    "new_pairs_subtitle": "发现Solana上的最新代币",
    "new_pairs_source": "来源",
    "new_pairs_liquidity": "流动性",
    "new_pairs_volume": "24小时交易量",
    "new_pairs_price": "24小时%",
    "new_pairs_no_tokens": "未找到代币",
    "new_pairs_retry": "重试",

    // ==================== LIVE FEED PAGE ====================
    "live_feed_title": "📢 实时活动推送",
    "live_feed_subtitle": "实时观看代币创建和推荐",
    "live_feed_empty": "暂无活动",
    "live_feed_waiting": "等待活动...",
    "live_feed_created": "创建了代币",
    "live_feed_referral": "推荐了朋友",

    // ==================== BOOST SECTION ====================
    "boost_title": "🚀 推广你的代币",
    "boost_subtitle": "在BluPrint启动推送中获得推荐，立即提高知名度。",
    "boost_price": "4天 0.1 SOL",
    "boost_button": "立即推广",
    "boost_featured": "⭐ 精选启动",
    "boost_benefit1": "在启动推送中推荐",
    "boost_benefit2": "提高知名度",
    "boost_benefit3": "更容易被发现",
    "boost_select_token": "从你的钱包中选择代币进行推广：",
    "boost_no_tokens": "⚠️ 钱包中未找到代币。",
    "boost_scanning": "扫描钱包中...",
    "boost_processing": "处理中...",
    "boost_connect": "连接钱包",
    "boost_select": "选择代币",

    // ==================== FEATURED TOKENS ====================
    "featured_title": "🔥 精选代币",
    "featured_subtitle": "BluPrint上的趋势代币",

    // ==================== FINAL CTA ====================
    "cta_title": "准备好启动你的代币了吗？",
    "cta_subtitle": "加入在BluPrint上启动meme币的创作者",
    "cta_button": "立即开始创建",

    // ==================== FOOTER ====================
    "footer_bluprint": "BluPrint",
    "footer_about": "关于我们",
    "footer_faq": "常见问题",
    "footer_privacy": "隐私政策",
    "footer_terms": "服务条款",
    "footer_resources": "资源",
    "footer_raydium": "Raydium",
    "footer_jupiter": "Jupiter",
    "footer_solscan": "Solscan",
    "footer_phantom": "Phantom钱包",
    "footer_community": "社区",
    "footer_twitter": "Twitter",
    "footer_telegram": "Telegram",
    "footer_github": "GitHub",
    "footer_legal": "法律",
    "footer_rights": "保留所有权利",

    // ==================== COMMON ====================
    "common_free": "免费",
    "common_close": "关闭",
    "common_copy": "复制",
    "common_copied": "已复制！",
    "common_loading": "加载中...",
    "common_error": "错误",
    "common_success": "成功",
    "common_warning": "警告",

    // ==================== MESSAGES ====================
    "connect_wallet_first": "请先连接你的钱包",
    "token_created": "代币创建成功！",
  },
  ru: {
    // ==================== NAVIGATION ====================
    "nav_home": "Главная",
    "nav_create": "Создать",
    "nav_new_pairs": "Новые пары",
    "nav_refer": "Реферал",
    "nav_live": "Лента",
    "nav_top_users": "Топ пользователей",
    "nav_connect": "Подключить кошелек",

    // ==================== HERO SECTION ====================
    "hero_title": "Запусти свою Meme монету",
    "hero_title_highlight": "за секунды ⚡",
    "hero_subtitle": "Никакого кода. Никаких сложностей. Просто запуск.",
    "hero_button": "Создать токен",

    // ==================== FEATURE CARDS ====================
    "feature_fast_title": "Быстрый деплой",
    "feature_fast_desc": "Большинство токенов развертываются менее чем за 30 секунд",
    "feature_secure_title": "Безопасный запуск",
    "feature_secure_desc": "Контроль полномочий включен при создании",
    "feature_solana_title": "На базе Solana",
    "feature_solana_desc": "Построено непосредственно на инфраструктуре Solana",

    // ==================== WHY BLUPRINT ====================
    "why_title": "Почему BluPrint?",
    "why_subtitle": "Самый простой способ запустить токен на Solana",
    "why_instant": "Мгновенный запуск",
    "why_instant_desc": "Разверните свой токен за секунды.",
    "why_security": "Встроенная безопасность",
    "why_security_desc": "Опции разрешений на майнинг и заморозку включены.",
    "why_nocode": "Без кода",
    "why_nocode_desc": "Не нужны разработчики.",

    // ==================== HOW IT WORKS ====================
    "how_title": "Как это работает",
    "how_subtitle": "Запустите свой токен в три простых шага.",
    "how_step1": "Выберите токен",
    "how_step1_desc": "Укажите название, символ и логотип токена.",
    "how_step2": "Подтвердите транзакцию",
    "how_step2_desc": "Подтвердите транзакцию в кошельке.",
    "how_step3": "Запустите и делитесь",
    "how_step3_desc": "Ваш токен на Solana! 🚀",

    // ==================== CREATE PAGE ====================
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
    "create_deploying": "Развертывание...",
    "create_button": "Создать токен",

    // ==================== REFERRAL PAGE ====================
    "ref_title": "💰 Реферальная программа",
    "ref_desc": "Зарабатывайте SOL, приглашая друзей!",
    "ref_total": "Всего заработано",
    "ref_unclaimed": "Не получено",
    "ref_per": "за реферала",
    "ref_step1": "Поделись кодом",
    "ref_step1_desc": "Поделись уникальным промокодом с друзьями",
    "ref_step2": "Друг создает токен",
    "ref_step2_desc": "Когда они создают токен, ты получаешь 0.05 SOL",
    "ref_step3": "Получи оплату",
    "ref_step3_desc": "SOL отправляется прямо в твой кошелек",
    "ref_how_title": "Как это работает",
    "ref_milestone_title": "🏆 Бонусы за достижения",
    "ref_milestone_desc": "Достигни этих целей и получи автоматические SOL бонусы!",
    "ref_bronze": "Бронза",
    "ref_silver": "Серебро",
    "ref_gold": "Золото",
    "ref_diamond": "Алмаз",
    "ref_refs": "рефералов",
    "ref_left": "осталось",
    "ref_next_milestone": "🎯 Следующая цель:",
    "ref_more_to_unlock": "еще рефералов для разблокировки следующего бонуса!",
    "ref_your_code": "🎁 Твой реферальный код",
    "ref_share_desc": "Поделись кодом или ссылкой — зарабатывай 0.05 SOL за каждый созданный токен!",
    "ref_promo_code": "ПРОМОКОД",
    "ref_referral_link": "РЕФЕРАЛЬНАЯ ССЫЛКА",
    "ref_copy": "Копировать",
    "ref_share": "ПОДЕЛИСЬ И ЗАРАБАТЫВАЙ",
    "ref_twitter": "Twitter",
    "ref_telegram": "Telegram",
    "ref_whatsapp": "WhatsApp",
    "ref_info": "💡 Каждый, кто создаст токен по твоему коду = 0.05 SOL для тебя!",

    // ==================== TOP USERS PAGE ====================
    "top_users_title": "🏆 Топ пользователей",
    "top_users_subtitle": "Самые активные создатели токенов на BluPrint",
    "top_users_rank": "Место",
    "top_users_user": "Пользователь",
    "top_users_tokens": "Токенов",
    "top_users_referrals": "Рефералов",
    "top_users_no_users": "Пользователи не найдены",

    // ==================== NEW PAIRS PAGE ====================
    "new_pairs_title": "Новые пары",
    "new_pairs_subtitle": "Откройте новейшие токены на Solana",
    "new_pairs_source": "Источник",
    "new_pairs_liquidity": "Ликвидность",
    "new_pairs_volume": "Объем 24ч",
    "new_pairs_price": "24ч %",
    "new_pairs_no_tokens": "Токены не найдены",
    "new_pairs_retry": "Повторить",

    // ==================== LIVE FEED PAGE ====================
    "live_feed_title": "📢 Живая лента активности",
    "live_feed_subtitle": "Смотрите создания токенов и рефералов в реальном времени",
    "live_feed_empty": "Пока нет активности",
    "live_feed_waiting": "Ожидание активности...",
    "live_feed_created": "создал токен",
    "live_feed_referral": "пригласил друга",

    // ==================== BOOST SECTION ====================
    "boost_title": "🚀 Продвинь свой токен",
    "boost_subtitle": "Покажи свой токен в ленте запуска BluPrint для мгновенной видимости.",
    "boost_price": "0.1 SOL на 4 дня",
    "boost_button": "Продвинуть",
    "boost_featured": "⭐ ИЗБРАННЫЙ ЗАПУСК",
    "boost_benefit1": "В ленте запуска",
    "boost_benefit2": "Повышенная видимость",
    "boost_benefit3": "Больше обнаружений",
    "boost_select_token": "Выбери токен из кошелька для продвижения:",
    "boost_no_tokens": "⚠️ В кошельке не найдено токенов.",
    "boost_scanning": "Сканирование кошелька...",
    "boost_processing": "Обработка...",
    "boost_connect": "Подключить кошелек",
    "boost_select": "Выбрать токен",

    // ==================== FEATURED TOKENS ====================
    "featured_title": "🔥 Избранные токены",
    "featured_subtitle": "Трендовые токены на BluPrint",

    // ==================== FINAL CTA ====================
    "cta_title": "Готов запустить свой токен?",
    "cta_subtitle": "Присоединяйся к создателям, запустившим свои мемкоины на BluPrint",
    "cta_button": "Начать создание",

    // ==================== FOOTER ====================
    "footer_bluprint": "BluPrint",
    "footer_about": "О нас",
    "footer_faq": "FAQ",
    "footer_privacy": "Политика конфиденциальности",
    "footer_terms": "Условия использования",
    "footer_resources": "Ресурсы",
    "footer_raydium": "Raydium",
    "footer_jupiter": "Jupiter",
    "footer_solscan": "Solscan",
    "footer_phantom": "Phantom Кошелек",
    "footer_community": "Сообщество",
    "footer_twitter": "Twitter",
    "footer_telegram": "Telegram",
    "footer_github": "GitHub",
    "footer_legal": "Юридическая информация",
    "footer_rights": "Все права защищены",

    // ==================== COMMON ====================
    "common_free": "БЕСПЛАТНО",
    "common_close": "Закрыть",
    "common_copy": "Копировать",
    "common_copied": "Скопировано!",
    "common_loading": "Загрузка...",
    "common_error": "Ошибка",
    "common_success": "Успешно",
    "common_warning": "Предупреждение",

    // ==================== MESSAGES ====================
    "connect_wallet_first": "Пожалуйста, сначала подключи кошелек",
    "token_created": "Токен успешно создан!",
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
    const translation = translations[locale]?.[key];
    if (translation === undefined) {
      console.warn(`Missing translation for key: "${key}" in locale: ${locale}`);
      return key;
    }
    return translation;
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