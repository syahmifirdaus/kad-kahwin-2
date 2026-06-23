import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const coverImage = "/kad%20kahwin%20cover.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kad-kahwin-2.vercel.app"),
  title: "Walimatul Urus Hanis & Syahmi",
  description: "kad-kahwin",
  icons: {
    icon: coverImage,
    shortcut: coverImage,
    apple: coverImage,
  },
  openGraph: {
    title: "Walimatul Urus Hanis & Syahmi",
    description: "kad-kahwin",
    url: "https://kad-kahwin-2.vercel.app",
    siteName: "kad-kahwin",
    images: [
      {
        url: coverImage,
        width: 494,
        height: 766,
        alt: "Walimatul Urus Hanis & Syahmi",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Walimatul Urus Hanis & Syahmi",
    description: "kad-kahwin",
    images: [coverImage],
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
