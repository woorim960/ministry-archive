import type { Metadata } from "next";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { getAdminState } from "@/lib/admin-auth";
import { AdminStudio } from "./AdminStudio";
import { BrandMark } from "@/components/BrandMark";
import { LockIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "기획서 관리" };

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const state = await getAdminState();
  if (!state.isAdmin) {
    return (
      <main id="main-content" className="admin-gate page-shell">
        <div className="admin-gate-mark"><LockIcon size={36}/></div>
        <p className="eyebrow">기획서 관리</p><h1>운영자 권한을<br/>확인할 수 없습니다.</h1>
        <p>{state.configured ? `${user.email} 계정은 편집 권한 목록에 없습니다.` : "서비스 환경의 ADMIN_EMAILS에 운영자 이메일을 등록하면 관리 화면이 열립니다."}</p>
        <div className="admin-gate-user"><BrandMark/><span>현재 로그인</span><b>{user.email}</b></div>
        <a className="text-link" href={chatGPTSignOutPath("/admin")}>다른 계정으로 로그인 ↗</a>
      </main>
    );
  }
  return <AdminStudio userName={user.displayName} userEmail={user.email}/>;
}
