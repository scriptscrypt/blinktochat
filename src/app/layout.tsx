import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Twitter } from "next/dist/lib/metadata/types/twitter-types";
const fullUrl = "https://Blinktochat.fun";
const inter = Inter({ subsets: ["latin"] });

import Script from "next/script";

export const metadata: Metadata = {
  title: "Blinktochat.fun",
  description:
    "Personalized / Gated group chat to only those who blinked you on X.",
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#ffffff",
  openGraph: {
    title: "Blinktochat.fun",
    description:
      "Personalized / Gated group chat to only those who blinked you on X.",
    url: fullUrl,
    siteName: "Blinktochat.fun",
    images: [
      {
        url: "/new-banner-2.png",
        width: 1920,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@0xsrinivasa",
    creator: "@0xsrinivasa",
    title: "Blink to Chat",
    description:
      "Personalized / Gated group chat to only those who blinked you on X.",
    image: `${fullUrl}/new-banner-2.png`,
  } as Twitter,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
