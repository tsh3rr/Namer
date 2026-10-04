CREATE TABLE `markets` (
	`id` text PRIMARY KEY NOT NULL,
	`pool_id` text NOT NULL,
	`kind` text NOT NULL,
	`question` text NOT NULL,
	`liquidity` real NOT NULL,
	`allow_new_outcomes` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`resolved_outcome_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`pool_id`) REFERENCES `pools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `markets_pool` ON `markets` (`pool_id`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`pool_id` text NOT NULL,
	`device_id` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'player' NOT NULL,
	`balance` real NOT NULL,
	`invited_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`pool_id`) REFERENCES `pools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_pool_device` ON `members` (`pool_id`,`device_id`);--> statement-breakpoint
CREATE INDEX `members_pool` ON `members` (`pool_id`);--> statement-breakpoint
CREATE TABLE `outcomes` (
	`id` text PRIMARY KEY NOT NULL,
	`market_id` text NOT NULL,
	`label` text NOT NULL,
	`label_key` text NOT NULL,
	`shares` real DEFAULT 0 NOT NULL,
	`is_catch_all` integer DEFAULT false NOT NULL,
	`created_by` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `outcomes_market_label` ON `outcomes` (`market_id`,`label_key`);--> statement-breakpoint
CREATE TABLE `pools` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`baby_name` text NOT NULL,
	`parent_names` text,
	`due_date` text,
	`admin_key` text NOT NULL,
	`starting_points` integer DEFAULT 1000 NOT NULL,
	`invite_bonus` integer DEFAULT 100 NOT NULL,
	`stakes` text,
	`theme` text DEFAULT 'blush' NOT NULL,
	`premium` integer DEFAULT false NOT NULL,
	`revealed_name` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pools_slug_unique` ON `pools` (`slug`);--> statement-breakpoint
CREATE TABLE `trades` (
	`id` text PRIMARY KEY NOT NULL,
	`market_id` text NOT NULL,
	`outcome_id` text NOT NULL,
	`member_id` text NOT NULL,
	`shares` real NOT NULL,
	`cost` real NOT NULL,
	`prices_after` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outcome_id`) REFERENCES `outcomes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trades_market` ON `trades` (`market_id`);--> statement-breakpoint
CREATE INDEX `trades_member` ON `trades` (`member_id`);