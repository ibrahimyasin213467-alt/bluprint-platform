import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Providers from "./providers";
import Background from "./components/Background";
import Sidebar from "./components/Sidebar";
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
          <Sidebar />
          <main className="md:ml-56 min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}