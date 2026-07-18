"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="site-footer">
      <div className="footer-main page-shell">
        <div className="footer-brand"><BrandMark size={28} variant="reverse"/><p><b>구세군 마포영문</b><span>함께 준비한 기획을 기록하고 나눕니다.</span></p></div>
        <nav aria-label="하단 메뉴"><Link href="/archive">전체 기획서</Link><Link href="/admin">기획서 작성</Link></nav>
      </div>
      <div className="footer-bottom page-shell"><span>© 2026 The Salvation Army Mapo Corps</span><span>좋은 기획이 다음 사역으로 이어지도록.</span></div>
    </footer>
  );
}
