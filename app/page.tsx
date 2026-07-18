import Link from "next/link";
import { ArchiveExplorer } from "@/app/archive/ArchiveExplorer";
import { ArrowIcon, SearchIcon } from "@/components/Icons";

export default function Home() {
  return (
    <main id="main-content" className="home-page">
      <section className="home-intro page-shell">
        <div className="home-intro-grid">
          <div className="intro-copy">
            <div className="intro-kicker"><span className="live-dot"/>구세군 마포영문 기획서 아카이브</div>
            <h1>함께 준비한 기획을,<br/><span>다음 사람에게 이어갑니다.</span></h1>
            <p>구세군 마포영문에서 직접 준비하고 운영한 기독교 콘텐츠 기획을 누구나 쉽게 읽고 참고할 수 있도록 기록합니다.</p>
          </div>
          <div className="planning-board" aria-hidden="true">
            <div className="planning-board-head"><span>PLANNING FLOW</span><b>현장 기획</b><i>LIVE</i></div>
            <ol><li className="complete"><span>01</span><b>목표와 대상</b><i/></li><li className="complete"><span>02</span><b>준비와 역할</b><i/></li><li className="active"><span>03</span><b>진행 흐름</b><i/></li><li><span>04</span><b>현장 기록</b><i/></li></ol>
            <div className="planning-signal"><span/><b>기획이 다음 실행으로 연결됩니다.</b></div>
          </div>
        </div>
        <form className="home-search" action="/archive"><SearchIcon size={22}/><label className="sr-only" htmlFor="home-query">기획서 검색</label><input id="home-query" name="q" placeholder="제목이나 내용으로 찾아보세요"/><button type="submit" aria-label="검색"><ArrowIcon/></button></form>
        <div className="intro-foot"><span>기획의 의도부터 준비물, 진행 흐름, 현장 참고까지</span></div>
      </section>

      <section className="home-documents">
        <div className="page-shell">
          <header className="collection-heading"><div><span>최근 기록</span><h2>전체 기획서</h2></div><p>최근 수정된 순서로 보여드립니다.</p></header>
          <ArchiveExplorer compact/>
        </div>
      </section>

      <section className="home-purpose page-shell">
        <header className="collection-heading">
          <div>
            <span>INTRODUCING ARCHIVE</span>
            <h2>이 아카이브를 만든 이유</h2>
          </div>
          <p>준비한 사람만 알던 경험을, 다음 사람이 이어갈 수 있는 기획서로 남깁니다.</p>
        </header>
        <div className="purpose-grid">
          <div className="purpose-card">
            <span className="card-num">01</span>
            <h3>맥락부터 기록합니다</h3>
            <p>어떤 대상과 메시지를 위해 시작한 기획인지 먼저 설명하고, 단순 결과물만 모으지 않고 기획의 고민을 나눕니다.</p>
          </div>
          <div className="purpose-card">
            <span className="card-num">02</span>
            <h3>현장에서 쓸 수 있게 씁니다</h3>
            <p>시간, 인원, 준비물, 진행 흐름과 진행자 참고 사항을 빠짐없이 담아 누구나 즉시 실행 가능하도록 돕습니다.</p>
          </div>
          <div className="purpose-card">
            <span className="card-num">03</span>
            <h3>읽는 사람을 배려합니다</h3>
            <p>긴 글도 반응형 레이아웃, 목차와 이미지, 가독성 높은 제목을 통해 편안하고 즐겁게 읽을 수 있습니다.</p>
          </div>
        </div>
      </section>

      <section className="home-note page-shell">
        <span>MAPO CORPS · PLANNING ARCHIVE</span>
        <p>한 번의 행사를 위해 쌓은 고민과 노하우가 사라지지 않도록,<br/>다시 실행할 수 있는 읽기 좋은 기획서로 남깁니다.</p>
        <Link href="/archive">모든 기획서 보기 <ArrowIcon size={18}/></Link>
      </section>
    </main>
  );
}
