"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PageTransition from "@/app/components/PageTransition";

interface TokenData {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  createdAt: string;
  createdBy: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export default function TokenPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  const mintAddress = params.mint as string;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mintAddress) return;
    
    const fetchToken = async () => {
      try {
        const res = await fetch(`/api/token/${mintAddress}`);
        const data = await res.json();
        if (data.success) {
          setToken(data.token);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchToken();
  }, [mintAddress]);

  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
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
          ) : !token ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🪙</div>
              <h2 className="text-xl font-bold dark:text-white">Token bulunamadı</h2>
              <p className="text-gray-500 mt-2">Bu token mevcut değil veya silinmiş.</p>
              <Link href="/live" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-xl">
                Token Listesine Dön
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TOKEN BAŞLIK */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <img src={token.image} alt={token.name} className="w-20 h-20 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{token.name}</h1>
                    <div className="text-gray-500 dark:text-gray-400">{token.symbol}</div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Link href={`/profile/${token.createdBy}`} className="text-sm text-blue-600 hover:underline">
                        👤 {shortenAddress(token.createdBy)}
                      </Link>
                      <span className="text-xs text-gray-400">• {formatDate(token.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AÇIKLAMA */}
              {token.description && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">📝 Hakkında</h2>
                  <p className="text-gray-700 dark:text-gray-300">{token.description}</p>
                </div>
              )}
              
              {/* SOSYAL LİNKLER */}
              {(token.twitter || token.telegram || token.website) && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🔗 Bağlantılar</h2>
                  <div className="flex gap-3 flex-wrap">
                    {token.twitter && (
                      <a href={token.twitter} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-4 py-2 rounded-xl text-sm hover:opacity-80">
                        🐦 Twitter
                      </a>
                    )}
                    {token.telegram && (
                      <a href={token.telegram} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm hover:opacity-80">
                        💬 Telegram
                      </a>
                    )}
                    {token.website && (
                      <a href={token.website} target="_blank" rel="noopener noreferrer" className="bg-gray-600 text-white px-4 py-2 rounded-xl text-sm hover:opacity-80">
                        🌐 Website
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* SOLSCAN LİNKİ */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🔍 Blockchain'de Gör</h2>
                <a 
                  href={`https://solscan.io/token/${token.mint}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-purple-700 transition"
                >
                  🔎 Solscan'da Aç
                </a>
              </div>
              
            </div>
          )}
          
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}