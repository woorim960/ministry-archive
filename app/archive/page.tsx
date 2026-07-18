import type { Metadata } from "next";
import { ArchiveExplorer } from "./ArchiveExplorer";

export const metadata: Metadata = {
  title: "전체 기획서",
  description: "구세군 마포영문에서 준비하고 운영한 기독교 콘텐츠 기획서를 검색하고 읽습니다.",
};

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  return (
    <main id="main-content" className="archive-page">
      <section className="archive-hero page-shell">
        <span>기획서 모아보기</span>
        <h1>필요한 기획을<br/>쉽게 찾아보세요.</h1>
        <p>행사를 준비한 맥락과 실제 운영 방법을 한 흐름으로 읽을 수 있습니다.</p>
      </section>
      <ArchiveExplorer initialQuery={params.q}/>
    </main>
  );
}
