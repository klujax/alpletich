import type { Metadata, Viewport } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sportaly - Fitness Platformu",
  description: "Kişiselleştirilmiş antrenman programları ve profesyonel koç desteği",
  manifest: '/manifest.json',
  icons: {
    icon: '/shark-logo.jpg',
    apple: '/shark-logo.jpg',
  },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 0.8,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
