import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polkax402 - Web3 Micropayments with X402 Protocol",
  description: "Access premium APIs with instant on-chain payments using HTTP 402 Payment Required protocol. Powered by Polkadot and HTTPayer.",
  openGraph: {
    title: "Polkax402 - Web3 Micropayments with X402 Protocol",
    description: "Access premium APIs with instant on-chain payments using HTTP 402 Payment Required protocol. Powered by Polkadot and HTTPayer.",
    url: "https://polkax402.com",
    siteName: "Polkax402",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Polkax402 Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Polkax402 - Web3 Micropayments with X402 Protocol",
    description: "Access premium APIs with instant on-chain payments using HTTP 402 Payment Required protocol. Powered by Polkadot and HTTPayer.",
    images: ["/og-image.png"],
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
