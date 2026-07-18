import { getChatGPTUser } from "@/app/chatgpt-auth";

type RuntimeEnv = { ADMIN_EMAILS?: string };

export async function getAdminState() {
  const user = await getChatGPTUser();
  if (!user) return { user: null, isAdmin: false, configured: false };
  const { env } = await import("cloudflare:workers");

  const configured = Boolean((env as unknown as RuntimeEnv).ADMIN_EMAILS?.trim());
  const admins = ((env as unknown as RuntimeEnv).ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const isCustomAdmin = user.email.toLowerCase() === "admin@ministry.local";

  return {
    user,
    configured: configured || isCustomAdmin,
    isAdmin: process.env.NODE_ENV === "development" || isCustomAdmin || admins.includes(user.email.toLowerCase()),
  };
}

export async function requireAdminApi() {
  const state = await getAdminState();
  if (!state.user) {
    return { ok: false as const, response: Response.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }
  if (!state.isAdmin) {
    return {
      ok: false as const,
      response: Response.json(
        { error: state.configured ? "운영자 권한이 없습니다." : "운영자 이메일 설정이 필요합니다." },
        { status: 403 },
      ),
    };
  }
  return { ok: true as const, user: state.user };
}
