CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`alt` text DEFAULT '' NOT NULL,
	`uploader_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_object_key_unique` ON `media` (`object_key`);--> statement-breakpoint
CREATE TABLE `resources` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`eyebrow` text DEFAULT '현장 기획안' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`category` text DEFAULT '방탈출' NOT NULL,
	`audience` text DEFAULT '주일학교' NOT NULL,
	`season` text DEFAULT '상시' NOT NULL,
	`duration` text DEFAULT '' NOT NULL,
	`participants` text DEFAULT '' NOT NULL,
	`difficulty` text DEFAULT '' NOT NULL,
	`cover_url` text DEFAULT '' NOT NULL,
	`blocks_json` text DEFAULT '[]' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`author_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resources_slug_unique` ON `resources` (`slug`);