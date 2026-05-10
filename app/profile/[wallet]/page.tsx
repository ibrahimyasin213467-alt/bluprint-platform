"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PageTransition from "@/app/components/PageTransition";

interface UserData {
  wallet: string;
  totalTokens: number;
  totalReferrals: number;
  totalEarned: number;
  pendingEarnings: number;
  promoCode: string | null;
  hasCreatedToken: boolean;
  tokens: Array<{
    mint: string;
    name: string;
    symbol: string;
    createdAt: string;
    image: string;
  }>;
  bio: string | null;
  avatar: string | null;
}

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  const walletAddress = params.wallet as string;
  const isOwnProfile = publicKey ? walletAddress === publicKey.toString() : false;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!walletAddress) return;
    
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/user/${walletAddress}`);
        const data = await res.json();
        if (data.success) {
          setUserData(data.user);
          setBioInput(data.user.bio || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [walletAddress]);

  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const copyPromoCode = () => {
    if (userData?.promoCode) {
      navigator.clipboard.writeText(userData.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveBio = async () => {
    if (!publicKey) return;
    setSavingBio(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toString(),
          bio: bioInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUserData(prev => prev ? { ...prev, bio: data.profile.bio } : prev);
        setEditingBio(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingBio(false);
    }
  };

  if (!mounted) return null;

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <Navbar mounted={mounted} />
        <div className="pt-28 max-w-4xl mx-auto px-4 pb-16">
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : !userData ? (
            // KULLANICI BULUNAMADI (API hatası)
            <div className="text-center py-16">
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-xl font-bold dark:text-white">Kullanıcı bulunamadı</h2>
              <p className="text-gray-500 mt-2">Bir hata oluştu. Lütfen daha sonra tekrar dene.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* PROFİL BAŞLIK */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                    {userData.avatar ? (
                      <img src={userData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {shortenAddress(userData.wallet)}
                    </h1>
                    
                    {/* BİYOGRAFİ */}
                    {isOwnProfile ? (
                      editingBio ? (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <input
                            type="text"
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value)}
                            placeholder="Kendini tanıt..."
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 w-full sm:w-64"
                            maxLength={100}
                          />
                          <button
                            onClick={saveBio}
                            disabled={savingBio}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            {savingBio ? "..." : "Kaydet"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingBio(false);
                              setBioInput(userData.bio || "");
                            }}
                            className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                          >
                            İptal
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {userData.bio || "Henüz bir biyografi eklenmemiş."}
                          </p>
                          <button
                            onClick={() => setEditingBio(true)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            ✏️ Düzenle
                          </button>
                        </div>
                      )
                    ) : (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {userData.bio || "Henüz bir biyografi eklenmemiş."}
                      </p>
                    )}
                    
                    {/* PROMO CODE - SADECE TOKEN OLUŞTURMUŞ KULLANICI GÖRÜR */}
                    {isOwnProfile && userData.hasCreatedToken && userData.promoCode && (
                      <button
                        onClick={copyPromoCode}
                        className="mt-2 inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800/30 transition"
                      >
                        <span>🎫</span>
                        <span className="font-mono">{userData.promoCode}</span>
                        <span>{copied ? "✅" : "📋"}</span>
                      </button>
                    )}
                    
                    {isOwnProfile && !userData.hasCreatedToken && (
                      <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-full text-sm">
                        <span>🔒</span>
                        <span>Token oluşturunca promo kod alacaksın</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* İSTATİSTİKLER - Kullanıcı token oluşturmamışsa farklı göster */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
                  <div className="text-2xl mb-1">🪙</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{userData.totalTokens}</div>
                  <div className="text-xs text-gray-500">Token oluşturuldu</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{userData.totalReferrals}</div>
                  <div className="text-xs text-gray-500">Referans</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="text-xl font-bold text-green-600">{userData.totalEarned.toFixed(4)} SOL</div>
                  <div className="text-xs text-gray-500">Kazanılan</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
                  <div className="text-2xl mb-1">⏳</div>
                  <div className="text-xl font-bold text-blue-600">{userData.pendingEarnings.toFixed(4)} SOL</div>
                  <div className="text-xs text-gray-500">Bekleyen</div>
                </div>
              </div>
              
              {/* TOKEN LİSTESİ - SADECE TOKEN VARSA GÖSTER */}
              {userData.tokens.length > 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>🪙</span> Oluşturduğu Token&apos;lar
                  </h2>
                  <div className="space-y-3">
                    {userData.tokens.map((token) => (
                      <Link
                        key={token.mint}
                        href={`/token/${token.mint}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{token.name}</div>
                            <div className="text-xs text-gray-500">{token.symbol}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">{formatDate(token.createdAt)}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : isOwnProfile ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                  <div className="text-4xl mb-2">🪙</div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Henüz token oluşturmadın</h2>
                  <p className="text-sm text-gray-500 mb-4">İlk token'ını oluşturmak ister misin?</p>
                  <Link href="/create" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
                    Token Oluştur
                  </Link>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                  <div className="text-4xl mb-2">🪙</div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Henüz token oluşturulmamış</h2>
                  <p className="text-sm text-gray-500">Bu kullanıcı henüz bir token oluşturmadı.</p>
                </div>
              )}
              
            </div>
          )}
          
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}