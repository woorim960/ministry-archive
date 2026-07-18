ALTER TABLE `resources` ADD `body_markdown` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `tags_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `read_minutes` integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `content_format` text DEFAULT 'markdown-v1' NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `status` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `updated_by_email` text DEFAULT '' NOT NULL;