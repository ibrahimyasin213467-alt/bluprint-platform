import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Providers from "./providers";
import Background from "./components/Background";
import Sidebar from "./components/Sidebar";
import "./globals.css";

const sora = Sora({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BluPrint - Solana Meme Coin Launchpad",
  description: "Create your own Solana meme coin in 10 seconds. No code. Secure token with 3 revokes.",
  keywords: "solana, meme coin, token creator, crypto launchpad, solana token, bluprint",
  authors: [{ name: "BluPrint" }],
  creator: "BluPrint",
  publisher: "BluPrint",
  robots: "index, follow",
  openGraph: {
    title: "BluPrint - Solana Meme Coin Launchpad",
    description: "Create your own Solana meme coin in 10 seconds.",
    url: "https://bluprint.fun",
    siteName: "BluPrint",
    images: [{ url: "https://bluprint.fun/favicon.ico", width: 256, height: 256 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BluPrint - Solana Meme Coin Launchpad",
    description: "Create your own Solana meme coin in 10 seconds.",
    images: ["https://bluprint.fun/favicon.ico"],
    creator: "@bluprint",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={sora.className}>
        <Providers>
          <Background />
          <Sidebar />
          <main className="md:ml-56 pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}