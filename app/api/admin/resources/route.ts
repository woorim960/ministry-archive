import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { resources } from "@/db/schema";
import { requireAdminApi } from "@/lib/admin-auth";
import { slugify } from "@/lib/format";
import { upgradeMarkdownV1 } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const db = await getDb();
    const rows = await db.select().from(resources).orderBy(desc(resources.updatedAt)).limit(100);
    return Response.json({ resources: rows.map(toResource) });
  } catch {
    return Response.json({ error: "기획서를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json() as Record<string, unknown>;
    const requestedId = typeof body.id === "string" ? body.id.trim() : "";
    const id = requestedId || crypto.randomUUID();
    const title = String(body.title ?? "").trim();
    const summary = String(body.summary ?? "").trim();
    const markdown = String(body.markdown ?? "");
    const isPublished = Boolean(body.isPublished);
    let slug = slugify(String(body.slug ?? "").trim() || title);
    if (!slug) slug = `draft-${id.slice(0, 8)}`;
    if (isPublished && (!title || !summary || !markdown.trim())) return Response.json({ error: "공개하려면 제목, 한 줄 소개와 본문을 모두 입력해 주세요." }, { status: 400 });
    if (markdown.length > 250_000) return Response.json({ error: "본문이 250KB를 넘었습니다. 이미지는 파일로 업로드해 주세요." }, { status: 413 });
    if (isPublished && /!\[\s*\]\(/.test(markdown)) return Response.json({ error: "공개하기 전에 모든 이미지에 설명을 입력해 주세요." }, { status: 400 });
    const tags = normalizeTags(body.tags);
    const docType = String(body.docType ?? "general");
    const eyebrow = docType === "proposal" ? "기획서" : docType === "meeting" ? "회의록" : "일반 글";
    const db = await getDb();
    const [slugOwner] = await db.select().from(resources).where(eq(resources.slug, slug)).limit(1);
    if (slugOwner && slugOwner.id !== requestedId && !(slugOwner.id === "" && requestedId === "")) return Response.json({ error: "같은 주소를 사용하는 기획서가 있습니다. 추가 정보에서 문서 주소를 바꿔 주세요." }, { status: 409 });
    const [requestedExisting] = requestedId ? await db.select().from(resources).where(eq(resources.id, requestedId)).limit(1) : [];
    const existing = requestedExisting || (slugOwner?.id === "" && requestedId === "" ? slugOwner : undefined);
    const now = new Date().toISOString();
    
    let customMetaJson = "{}";
    let validMeta: Array<{label: string, value: string}> = [];
    if (Array.isArray(body.customMeta)) {
      validMeta = body.customMeta.map(m => {
        if (typeof m === 'object' && m !== null) {
          const item = m as Record<string, unknown>;
          return { label: String(item.label || "").trim().slice(0, 50), value: String(item.value || "").trim().slice(0, 200) };
        }
        return null;
      }).filter(m => m && m.label && m.value) as Array<{label: string, value: string}>;
    }
    const blocksData = {
      customMeta: validMeta,
      date: String(body.date ?? "").slice(0, 50),
      location: String(body.location ?? "").slice(0, 50)
    };
    customMetaJson = JSON.stringify(blocksData);

    const values = {
      slug, title, summary, eyebrow,
      category: String(body.category ?? "기독교 콘텐츠").slice(0, 50),
      audience: String(body.audience ?? "").slice(0, 50),
      duration: String(body.duration ?? "").slice(0, 50),
      participants: String(body.participants ?? "").slice(0, 50),
      difficulty: String(body.difficulty ?? "").slice(0, 50),
      coverUrl: String(body.coverUrl ?? "").slice(0, 500),
      bodyMarkdown: markdown,
      tagsJson: JSON.stringify(tags),
      readMinutes: Math.max(1, Math.min(120, Number(body.readMinutes) || estimateReadingTime(markdown))),
      contentFormat: "markdown-v2",
      blocksJson: customMetaJson,
      status: isPublished ? "published" : "draft",
      isPublished,
      updatedByEmail: auth.user.email,
      updatedAt: now,
    };

    if (existing) {
      await db.update(resources).set({ ...values, id, version: existing.version + 1 }).where(eq(resources.id, existing.id));
    } else {
      await db.insert(resources).values({ id, ...values, season: "상시", authorEmail: auth.user.email, createdAt: now, version: 1 });
    }
    const [saved] = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
    return Response.json({ resource: toResource(saved) }, { status: existing ? 200 : 201 });
  } catch {
    return Response.json({ error: "저장하지 못했습니다. 작성 내용은 이 화면에 그대로 보관되어 있습니다." }, { status: 500 });
  }
}

function toResource(row: typeof resources.$inferSelect) {
  const docType = row.eyebrow === "회의록" ? "meeting" : row.eyebrow === "기획서" ? "proposal" : "general";
  let customMeta: Array<{label: string, value: string}> = [];
  let date = "";
  let location = "";
  try { 
    const parsed = JSON.parse(row.blocksJson || "{}");
    if (Array.isArray(parsed)) {
      customMeta = parsed;
    } else if (parsed && typeof parsed === "object") {
      customMeta = Array.isArray(parsed.customMeta) ? parsed.customMeta : [];
      date = parsed.date || "";
      location = parsed.location || "";
    }
  } catch {}
  return { ...row, docType, customMeta, date, location, markdown: row.contentFormat === "markdown-v1" ? upgradeMarkdownV1(row.bodyMarkdown) : row.bodyMarkdown, tags: safeTags(row.tagsJson), bodyMarkdown: undefined, tagsJson: undefined, blocksJson: undefined };
}

function safeTags(value: string): string[] {
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; }
}

function estimateReadingTime(markdown: string) { return Math.max(1, Math.ceil(markdown.replace(/[#>*_`|\[\]()!-]/g, "").length / 650)); }

function normalizeTags(value: unknown) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const unique = new Map<string, string>();
  source.map(String).map((tag) => tag.replace(/^#+/, "").trim().replace(/\s+/g, " ").slice(0, 20)).filter(Boolean).forEach((tag) => {
    const key = tag.toLocaleLowerCase("ko-KR");
    if (!unique.has(key) && unique.size < 5) unique.set(key, tag);
  });
  return [...unique.values()];
}
