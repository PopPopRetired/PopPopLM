CREATE TABLE `source_chunks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`content` text NOT NULL,
	`chunk_index` integer NOT NULL,
	`embedding` F32_BLOB(768) NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
