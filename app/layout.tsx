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
  title: "Walimatul Urus Hanis & Syahmi",
  description: "kad-kahwin",
  icons: {
    icon: "/preview.png",
    shortcut: "/preview.png",
    apple: "/preview.png",
  },
  openGraph: {
    title: "Walimatul Urus Hanis & Syahmi",
    description: "kad-kahwin",
    images: ["/preview.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Walimatul Urus Hanis & Syahmi",
    description: "kad-kahwin",
    images: ["/preview.png"],
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
