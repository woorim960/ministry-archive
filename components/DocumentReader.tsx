"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowIcon, ClockIcon, PeopleIcon } from "@/components/Icons";
import { headingId, parseMarkdown } from "@/lib/markdown";
import type { ResourceSummary } from "@/types/content";
import { MarkdownDocument } from "@/components/MarkdownDocument";

export function DocumentReader({ document, preview = false, related = [], isAdmin = false }: {
  document: ResourceSummary;
  preview?: boolean;
  related?: ResourceSummary[];
  isAdmin?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeId, setActiveId] = useState("");
  const router = useRouter();
  const headings = useMemo(() => parseMarkdown(document.markdown || "").filter((block) => block.type === "heading" && block.level === 2), [document.markdown]);

  useEffect(() => {
    if (preview) return;
    const onScroll = () => {
      const root = window.document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      setProgress(max > 0 ? Math.min(100, (root.scrollTop / max) * 100) : 0);
      let current = "";
      headings.forEach((heading) => {
        const element = window.document.getElementById(headingId(heading.text || ""));
        if (element && element.getBoundingClientRect().top < 180) current = element.id;
      });
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings, preview]);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function handleDelete() {
    if (!window.confirm("이 문서를 정말 삭제하시겠습니까? (영구 삭제됩니다)")) return;
    try {
      const res = await fetch(`/api/admin/resources/${document.slug}`, { method: "DELETE" });
      if (res.ok) {
        alert("문서가 삭제되었습니다.");
        router.replace("/archive");
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    }
  }

  return (
    <article className={`document-reader ${preview ? "document-preview" : ""}`}>
      {!preview && <div className="reading-progress" style={{ transform: `scaleX(${progress / 100})` }}/>} 
      <header className="document-header page-shell">
        {!preview && <Link href="/archive" className="document-back">← 전체 아카이브</Link>}
        <div className="document-labels">
          {document.isSample && <span className="sample-label">예시 {document.docType === "proposal" ? "기획서" : document.docType === "meeting" ? "회의록" : "글"}</span>}
          <span>{document.docType === "proposal" ? "기획서" : document.docType === "meeting" ? "회의록" : "일반 글"}{!document.tags?.length && document.category ? ` · ${document.category}` : ""}</span>
          {document.tags?.map((tag) => <Link key={tag} href={`/archive?q=${encodeURIComponent(tag)}`} className="document-tag">#{tag}</Link>)}
        </div>
        <h1>{document.title || "제목 없는 글"}</h1>
        <p className="document-summary">{document.summary || "한 줄 소개를 입력하면 이 위치에 표시됩니다."}</p>
        <dl className="document-facts">
          {(!document.docType || document.docType === "proposal") && (
            <>
              {document.audience && <div><dt>대상</dt><dd>{document.audience}</dd></div>}
              {document.duration && <div><dt><ClockIcon size={17}/>진행 시간</dt><dd>{document.duration}</dd></div>}
              {document.participants && <div><dt><PeopleIcon size={17}/>권장 인원</dt><dd>{document.participants}</dd></div>}
              {document.difficulty && <div><dt>난이도</dt><dd>{document.difficulty}</dd></div>}
            </>
          )}
          {document.docType === "meeting" && (
            <>
              {document.date && <div><dt><ClockIcon size={17}/>일시</dt><dd>{document.date}</dd></div>}
              {document.location && <div><dt>장소</dt><dd>{document.location}</dd></div>}
              {document.participants && <div><dt><PeopleIcon size={17}/>참석자</dt><dd>{document.participants}</dd></div>}
            </>
          )}
          <div><dt>읽는 시간</dt><dd>약 {document.readMinutes || 3}분</dd></div>
        </dl>
      </header>

      {document.coverUrl && <figure className="document-cover page-shell"><Image src={document.coverUrl} alt={`${document.title || "문서"} 대표 이미지`} width={1600} height={900} priority={!preview} sizes="(max-width: 760px) 100vw, 1180px" unoptimized={document.coverUrl.startsWith("/api/media/")}/></figure>}

      <div className="document-body page-shell">
        {headings.length > 0 && <aside className="document-toc">
          <details open><summary>이 글의 목차</summary><nav>{headings.map((heading) => {
            const id = headingId(heading.text || "");
            return <a key={id} className={activeId === id ? "active" : ""} href={`#${id}`}>{heading.text}</a>;
          })}</nav></details>
        </aside>}
        <div className="document-content">
          <MarkdownDocument markdown={document.markdown || ""} editable={preview}/>
          {!preview && <footer className="document-end"><div><span>마지막 수정</span><time dateTime={document.updatedAt}>{formatDate(document.updatedAt)}</time></div><div style={{ display: 'flex', alignItems: 'center' }}>{isAdmin && !document.isSample && <button type="button" onClick={handleDelete} style={{ color: 'var(--red)', background: 'transparent', border: 'none', marginRight: '16px', fontWeight: 'bold' }}>이 기록 삭제하기</button>}<button type="button" onClick={copyLink}>{copied ? "링크를 복사했어요" : "링크 복사"}</button></div></footer>}
        </div>
      </div>

      {!preview && related.length > 0 && <section className="related-section page-shell"><span>이어서 참고할 글</span><div>{related.slice(0, 2).map((item) => <Link href={`/documents/${item.slug}`} key={item.slug}><small>{item.isSample ? "예시 · " : ""}약 {item.readMinutes}분</small><h2>{item.title}</h2><p>{item.summary}</p><span>읽기 <ArrowIcon size={17}/></span></Link>)}</div></section>}
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date);
}
