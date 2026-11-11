-- Migration 003: Search Tracking & Analytics System
-- Compatible with MariaDB / MySQL 5.7+ / 8.0+ and SQLite 3

CREATE TABLE IF NOT EXISTS `search_logs` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `search_term` VARCHAR(255) NOT NULL,
  `normalized_term` VARCHAR(255) NOT NULL,
  `matched_product_id` VARCHAR(64) NULL,
  `result_count` INT NOT NULL DEFAULT 0,
  `ip_hash` VARCHAR(64) NULL,
  `session_id` VARCHAR(100) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`matched_product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_search_normalized_term ON search_logs(normalized_term);
CREATE INDEX IF NOT EXISTS idx_search_created_at ON search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_matched_prod ON search_logs(matched_product_id);
CREATE INDEX IF NOT EXISTS idx_search_rate_limit ON search_logs(ip_hash, normalized_term, created_at);
