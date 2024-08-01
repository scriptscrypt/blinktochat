import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Twitter } from "next/dist/lib/metadata/types/twitter-types";

const fullUrl = "https://Blinktochat.fun/";
const inter = Inter({ subsets: ["latin"] });

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
        url: "/public/new-banner-x.png",
        width: 1920,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "/public/new-banner-x.png",
    site: "blinktochat.fun",
    creator: "@scriptscrypt",
    title: "Blink to Chat",
    description:
      "Personalized / Gated group chat to only those who blinked you on X.",
    images: ["/public/new-banner-x.png"],
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
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
