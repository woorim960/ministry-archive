import { LockIcon } from "@/components/Icons";
import { loginAction } from "./actions.ts";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ return_to?: string; error?: string }> }) {
  const params = await searchParams;
  const returnTo = params.return_to || "/";
  const error = params.error;

  return (
    <main id="main-content" className="admin-gate page-shell">
      <div className="admin-gate-mark"><LockIcon size={36}/></div>
      <p className="eyebrow">기획서 관리</p>
      <h1>관리자 로그인</h1>
      <p>운영자 비밀번호를 입력해 주세요.</p>
      
      <form action={loginAction} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem", width: "100%", maxWidth: "300px" }}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input 
          type="password" 
          name="password" 
          placeholder="비밀번호" 
          required 
          autoFocus
          style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "1rem", background: "var(--bg-layer)" }}
        />
        {error && <p style={{ color: "var(--red)", fontSize: "0.875rem", margin: 0 }}>비밀번호가 일치하지 않습니다.</p>}
        <button type="submit" style={{ padding: "0.75rem", borderRadius: "8px", background: "var(--fg)", color: "var(--bg)", border: "none", fontSize: "1rem", cursor: "pointer", fontWeight: 600 }}>
          로그인
        </button>
      </form>
    </main>
  );
}
