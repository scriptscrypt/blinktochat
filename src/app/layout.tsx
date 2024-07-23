import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";

const headersList = headers();
const fullUrl = headersList.get("referer") || "";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tg Blink",
  description:
    "Personalized / Gated group chat to only those who blinked you on X.",
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#ffffff",
  openGraph: {
    title: "Tg Blink",
    description:
      "Personalized / Gated group chat to only those who blinked you on X.",
    url: fullUrl,
    siteName: "Tg Blink",
    images: [
      {
        url: fullUrl,
        width: 1920,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
