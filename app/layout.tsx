import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PhishGuard | فحص التصيّد الاحترافي",
  description: "نظام ذكي لاكتشاف محاولات التصيّد الإلكتروني بدقة عالية",
};

export const viewport: Viewport = {
  themeColor: "#667eea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${ibmPlexArabic.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
