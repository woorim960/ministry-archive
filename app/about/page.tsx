import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "아카이브 소개" };

export default function AboutPage() {
  return (
    <main id="main-content" className="about-page">
      <section className="about-hero page-shell">
        <span>아카이브 소개</span>
        <h1>준비한 사람만 알던 경험을,<br/><em>다음 사람이 이어갈 수 있는 기획</em>으로.</h1>
        <p>구세군 마포영문에서 직접 준비하고 운영한 기독교 콘텐츠를 읽기 좋은 문서로 남깁니다. 결과물만 모으지 않고, 왜 시작했고 어떻게 진행했으며 현장에서 무엇을 배웠는지 함께 기록합니다.</p>
      </section>
      <section className="about-principles page-shell">
        <article><span>01</span><h2>맥락부터 기록합니다.</h2><p>어떤 대상과 메시지를 위해 시작한 기획인지 먼저 설명합니다.</p></article>
        <article><span>02</span><h2>현장에서 쓸 수 있게 씁니다.</h2><p>시간, 인원, 준비물, 진행 흐름과 참고 사항을 빠짐없이 담습니다.</p></article>
        <article><span>03</span><h2>읽는 사람을 배려합니다.</h2><p>긴 글도 목차와 이미지, 명확한 제목을 따라 편안하게 읽을 수 있습니다.</p></article>
      </section>
      <section className="about-closing page-shell"><p>이곳의 기록이 누군가의 시작 시간을 줄이고,<br/>더 좋은 사역을 준비할 여유로 이어지길 바랍니다.</p><Link href="/archive">기획서 읽기 <ArrowIcon/></Link></section>
    </main>
  );
}
