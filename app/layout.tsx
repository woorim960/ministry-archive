import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://ministry-archive.pikle-plus11.chatgpt.site"),
  title: {
    default: "구세군 마포영문 아카이브",
    template: "%s | 구세군 마포영문 아카이브",
  },
  description:
    "구세군 마포영문의 모든 기록물(기획서, 회의록, 일반 글 등)을 누구나 쉽게 읽고 참고할 수 있도록 기록합니다.",
  keywords: ["교회 행사", "주일학교", "사역 기획", "회의록", "교회 기록물"],
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "구세군 마포영문 아카이브",
    description: "함께 준비한 기록을 남기고 다음 사람에게 이어갑니다.",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/brand/og-brand.png", width: 1200, height: 630, alt: "구세군 마포영문 아카이브" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/og-brand.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <a className="skip-link" href="#main-content">본문으로 바로가기</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
