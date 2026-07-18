import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const resources = sqliteTable("resources", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  eyebrow: text("eyebrow").notNull().default("현장 기획안"),
  summary: text("summary").notNull().default(""),
  category: text("category").notNull().default("방탈출"),
  audience: text("audience").notNull().default("주일학교"),
  season: text("season").notNull().default("상시"),
  duration: text("duration").notNull().default(""),
  participants: text("participants").notNull().default(""),
  difficulty: text("difficulty").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  blocksJson: text("blocks_json").notNull().default("[]"),
  bodyMarkdown: text("body_markdown").notNull().default(""),
  tagsJson: text("tags_json").notNull().default("[]"),
  readMinutes: integer("read_minutes").notNull().default(3),
  contentFormat: text("content_format").notNull().default("markdown-v1"),
  status: text("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  authorEmail: text("author_email").notNull(),
  updatedByEmail: text("updated_by_email").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  objectKey: text("object_key").notNull().unique(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  alt: text("alt").notNull().default(""),
  uploaderEmail: text("uploader_email").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
