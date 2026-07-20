import type { Metadata } from "next";
import { ArchiveExplorer } from "./ArchiveExplorer";
import { getAdminState } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "전체 아카이브",
  description: "구세군 마포영문에서 보관하고 있는 모든 기획서, 회의록, 일반 글을 검색하고 읽습니다.",
};

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  return (
    <main id="main-content" className="archive-page">
      <section className="archive-hero page-shell">
        <span>구세군 마포영문 아카이브</span>
        <h1>필요한 기록을<br/>쉽게 찾아보세요.</h1>
        <p>기획서, 회의록 등 지난 사역의 모든 기록을 검색할 수 있습니다.</p>
      </section>
      <ArchiveExplorer initialQuery={params.q} isAdmin={(await getAdminState()).isAdmin}/>
    </main>
  );
}
