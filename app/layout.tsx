import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Providers from "./providers";
import Background from "./components/Background";
import "./globals.css";

const sora = Sora({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BluPrint | Launch Meme Coins on Solana",
  description: "Create and launch your own Solana meme coin in seconds.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={sora.className}>
        <Providers>
          <Background />
          {children}
        </Providers>
      </body>
    </html>
  );
}