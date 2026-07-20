import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { DocumentReader } from "@/components/DocumentReader";
import { archiveSeed, getSeedResource } from "@/data/resources";
import { getDb } from "@/db";
import { resources } from "@/db/schema";
import type { ResourceSummary } from "@/types/content";
import { upgradeMarkdownV1 } from "@/lib/markdown";
import { getAdminState } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function getResource(slug: string): Promise<ResourceSummary | null> {
  const seed = getSeedResource(slug);
  if (seed) return seed;
  try {
    const db = await getDb();
    const decodedSlug = decodeURIComponent(slug);
    let [row] = await db.select().from(resources).where(eq(resources.slug, slug)).limit(1);
    if (!row && decodedSlug !== slug) {
      const result = await db.select().from(resources).where(eq(resources.slug, decodedSlug)).limit(1);
      row = result[0];
    }
    if (!row?.isPublished) return null;
    const docType = row.eyebrow === "회의록" ? "meeting" : row.eyebrow === "기획서" ? "proposal" : "general";
    let customMeta = [];
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
    
    return {
      id: row.id, slug: row.slug, title: row.title, summary: row.summary, category: row.category,
      docType, customMeta, date, location,
      audience: row.audience, duration: row.duration, participants: row.participants,
      difficulty: row.difficulty, coverUrl: row.coverUrl, tags: safeTags(row.tagsJson),
      markdown: row.contentFormat === "markdown-v1" ? upgradeMarkdownV1(row.bodyMarkdown) : row.bodyMarkdown,
      contentFormat: "markdown-v2", version: row.version, isPublished: true, updatedAt: row.updatedAt,
      readMinutes: row.readMinutes || estimateReadingTime(row.bodyMarkdown),
    };
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const resource = await getResource(decodedSlug);
  return resource ? { title: resource.title, description: resource.summary } : { title: "기획서를 찾을 수 없습니다" };
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const resource = await getResource(decodedSlug);
  if (!resource) notFound();
  const related = archiveSeed.filter((item) => item.slug !== decodedSlug).slice(0, 2);
  const state = await getAdminState();
  return <main id="main-content"><DocumentReader document={resource} related={related} isAdmin={state.isAdmin} /></main>;
}

function safeTags(value: string): string[] {
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; }
}

function estimateReadingTime(markdown: string) { return Math.max(1, Math.ceil(markdown.replace(/[#>*_`|\[\]()!-]/g, "").length / 650)); }
