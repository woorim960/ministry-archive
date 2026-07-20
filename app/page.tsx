import Link from "next/link";
import { ArchiveExplorer } from "@/app/archive/ArchiveExplorer";
import { ArrowIcon, SearchIcon } from "@/components/Icons";

export default function Home() {
  return (
    <main id="main-content" className="home-page">
      <section className="home-intro page-shell">
        <div className="home-intro-grid">
          <div className="intro-copy">
            <div className="intro-kicker"><span className="live-dot"/>구세군 마포영문 아카이브</div>
            <h1>함께 남긴 기록을,<br/><span>다음 사람에게 이어갑니다.</span></h1>
            <p>구세군 마포영문에서 준비한 기획서, 회의록, 일반 글 등 모든 사역의 과정을 누구나 쉽게 참고할 수 있도록 기록합니다.</p>
          </div>
          <div className="planning-board" aria-hidden="true">
            <div className="planning-board-head"><span>ARCHIVE FLOW</span><b>사역 기록</b><i>LIVE</i></div>
            <ol><li className="complete"><span>01</span><b>목표와 대상</b><i/></li><li className="complete"><span>02</span><b>준비와 역할</b><i/></li><li className="active"><span>03</span><b>진행 흐름</b><i/></li><li><span>04</span><b>현장 기록</b><i/></li></ol>
            <div className="planning-signal"><span/><b>기록이 다음 실행으로 연결됩니다.</b></div>
          </div>
        </div>
        <form className="home-search" action="/archive"><SearchIcon size={22}/><label className="sr-only" htmlFor="home-query">기록 검색</label><input id="home-query" name="q" placeholder="제목이나 내용으로 찾아보세요"/><button type="submit" aria-label="검색"><ArrowIcon/></button></form>
      </section>

      <section className="home-documents">
        <div className="page-shell">
          <header className="collection-heading"><div><span>최근 기록</span><h2>최신 아카이브</h2></div><p>최근 수정된 순서로 보여드립니다.</p></header>
          <ArchiveExplorer compact/>
        </div>
      </section>

      <section className="home-note page-shell">
        <span>MAPO CORPS · MINISTRY ARCHIVE</span>
        <p>우리가 함께한 모든 고민과 노하우가 사라지지 않도록,<br/>언제든 다시 찾아볼 수 있는 읽기 좋은 기록으로 남깁니다.</p>
        <Link href="/archive">모든 기록 보기 <ArrowIcon size={18}/></Link>
      </section>
    </main>
  );
}
