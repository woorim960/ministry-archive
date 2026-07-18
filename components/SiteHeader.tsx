"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { CloseIcon, MenuIcon, PlusIcon } from "@/components/Icons";

const links = [
  { href: "/archive", label: "전체 기획서" },
  { href: "/about", label: "아카이브 소개" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname.startsWith("/admin")) return null;

  return <>
    <header className="site-header">
      <div className="header-inner page-shell">
        <Link href="/" className="brand" aria-label="구세군 마포영문 기획서 아카이브 홈">
          <span className="brand-mark"><BrandMark size={30}/></span>
          <span className="brand-type"><b>구세군 마포영문</b><span>기획서 아카이브</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          {links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>{link.label}</Link>)}
          <Link href="/admin" className="write-entry"><PlusIcon size={16}/>기획서 작성</Link>
        </nav>
        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "메뉴 닫기" : "메뉴 열기"}>
          {open ? <CloseIcon/> : <MenuIcon/>}
        </button>
      </div>
      <nav id="mobile-menu" className={`mobile-menu ${open ? "open" : ""}`} aria-label="모바일 메뉴">
        {links.map((link) => <Link onClick={() => setOpen(false)} key={link.href} href={link.href}>{link.label}</Link>)}
        <Link onClick={() => setOpen(false)} href="/admin" className="write-entry"><PlusIcon size={17}/>기획서 작성</Link>
      </nav>
    </header>
    <Link href="/admin" className="mobile-write-entry" aria-label="새 기획서 작성"><PlusIcon size={18}/><span>기획서 작성</span></Link>
  </>;
}
