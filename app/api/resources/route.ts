import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { resources } from "@/db/schema";
import { upgradeMarkdownV1 } from "@/lib/markdown";

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.select({
      id: resources.id, slug: resources.slug, title: resources.title, summary: resources.summary,
      category: resources.category, audience: resources.audience, duration: resources.duration,
      participants: resources.participants, difficulty: resources.difficulty, coverUrl: resources.coverUrl,
      tagsJson: resources.tagsJson, bodyMarkdown: resources.bodyMarkdown, readMinutes: resources.readMinutes,
      contentFormat: resources.contentFormat, updatedAt: resources.updatedAt,
    }).from(resources).where(eq(resources.isPublished, true)).orderBy(desc(resources.updatedAt)).limit(100);
    return Response.json({ resources: rows.map((row) => ({
      ...row, tags: safeTags(row.tagsJson), markdown: row.contentFormat === "markdown-v1" ? upgradeMarkdownV1(row.bodyMarkdown) : row.bodyMarkdown, tagsJson: undefined, bodyMarkdown: undefined,
    })) });
  } catch {
    return Response.json({ resources: [], notice: "기본 기획서를 표시합니다." });
  }
}

function safeTags(value: string): string[] {
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; }
}
