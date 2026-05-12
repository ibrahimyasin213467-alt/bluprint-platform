import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Providers from "./providers";
import Background from "./components/Background";
import Sidebar from "./components/Sidebar";
import MarqueeBanner from "./components/MarqueeBanner";
import "./globals.css";

const sora = Sora({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BluPrint - Solana Meme Coin Launchpad",
  description: "Create your own Solana meme coin in 10 seconds.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={sora.className}>
        <Providers>
          <Background />
          <div className="flex flex-col">
            {/* Banner - sabit ama sidebar'ın altında kalacak */}
            <div className="fixed top-0 left-0 right-0 z-30">
              <MarqueeBanner />
            </div>
            {/* Sidebar - banner'ın altından başlayacak */}
            <div className="fixed top-10 left-0 bottom-0 z-40">
              <Sidebar />
            </div>
            {/* Ana içerik - banner + sidebar kadar boşluk */}
            <main className="md:ml-56 mt-10 min-h-screen">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}