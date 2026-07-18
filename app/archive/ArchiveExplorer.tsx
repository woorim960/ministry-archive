"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowIcon, SearchIcon } from "@/components/Icons";
import { archiveSeed } from "@/data/resources";
import type { ResourceSummary } from "@/types/content";

const DEFAULT_DOCUMENT_COVER = "/brand/default-document-cover.svg";

export function ArchiveExplorer({ initialQuery = "", compact = false }: { initialQuery?: string; compact?: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [remote, setRemote] = useState<ResourceSummary[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/resources").then((response) => response.ok ? response.json() as Promise<{ resources?: ResourceSummary[] }> : null).then((data) => {
      if (Array.isArray(data?.resources)) setRemote(data.resources);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo(() => {
    const map = new Map<string, ResourceSummary>();
    [...archiveSeed, ...remote].forEach((item) => map.set(item.slug, item));
    const normalized = query.trim().toLowerCase();
    return [...map.values()].filter((item) => !normalized || `${item.title} ${item.summary} ${item.tags?.join(" ") || ""} ${item.markdown || ""}`.toLowerCase().includes(normalized));
  }, [query, remote]);

  const visible = compact && !query ? items.slice(0, 3) : items;

  return (
    <div className={`archive-explorer ${compact ? "compact" : "page-shell"}`}>
      <div className="archive-tools">
        <label className="search-field"><SearchIcon size={21}/><span className="sr-only">기획서 검색</span><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제목이나 내용으로 찾아보세요"/><kbd>⌘ K</kbd></label>
        <span><b>{items.length}</b>개의 기획서</span>
      </div>
      {visible.length ? <div className="resource-grid">{visible.map((item, index) => (
        <Link href={`/documents/${item.slug}`} className="resource-card" key={item.slug} style={{ "--card-delay": `${index * 55}ms` } as React.CSSProperties}>
          <div className="resource-index"><span>{String(index + 1).padStart(2, "0")}</span><i/>{item.isSample && <b>예시</b>}</div>
          <div className="resource-copy">
            <div className="resource-meta"><span>{item.tags?.slice(0, 2).join(" · ") || item.category}</span><span>약 {item.readMinutes || 3}분</span></div>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <div className="resource-foot"><time dateTime={item.updatedAt}>{formatDate(item.updatedAt)}</time><span>읽기 <ArrowIcon size={17}/></span></div>
          </div>
          <div className={`resource-cover has-image ${item.coverUrl ? "" : "default-cover"}`}><Image src={item.coverUrl || DEFAULT_DOCUMENT_COVER} alt="" fill sizes="132px"/></div>
        </Link>
      ))}</div> : <div className="empty-state"><span>검색 결과 없음</span><h2>찾는 기획서가 아직 없어요.</h2><p>검색어를 줄이거나 다른 표현으로 다시 찾아보세요.</p><button type="button" onClick={() => setQuery("")}>전체 기획서 보기</button></div>}
      {compact && items.length > 3 && <Link href="/archive" className="collection-more">전체 기획서 보기 <ArrowIcon/></Link>}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date);
}
